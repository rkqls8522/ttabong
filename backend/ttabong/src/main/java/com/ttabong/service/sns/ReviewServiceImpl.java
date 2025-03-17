package com.ttabong.service.sns;

import com.ttabong.dto.sns.request.ReviewCreateRequestDto;
import com.ttabong.dto.sns.request.ReviewEditRequestDto;
import com.ttabong.dto.sns.request.ReviewVisibilitySettingRequestDto;
import com.ttabong.dto.sns.response.*;
import com.ttabong.dto.user.AuthDto;
import com.ttabong.entity.recruit.*;
import com.ttabong.entity.sns.Review;
import com.ttabong.entity.sns.ReviewImage;
import com.ttabong.entity.user.Organization;
import com.ttabong.entity.user.User;
import com.ttabong.exception.*;
import com.ttabong.repository.recruit.ApplicationRepository;
import com.ttabong.repository.recruit.RecruitRepository;
import com.ttabong.repository.sns.ReviewCommentRepository;
import com.ttabong.repository.sns.ReviewImageRepository;
import com.ttabong.repository.sns.ReviewRepository;
import com.ttabong.repository.user.OrganizationRepository;
import com.ttabong.repository.user.UserRepository;
import com.ttabong.util.CacheUtil;
import com.ttabong.util.ImageUtil;
import io.minio.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.util.*;
import java.util.stream.Collectors;
import java.util.stream.IntStream;
import java.util.stream.Stream;

@Slf4j
@Service
@Transactional
@RequiredArgsConstructor
public class ReviewServiceImpl implements ReviewService {

    private final ReviewRepository reviewRepository;
    private final OrganizationRepository organizationRepository;
    private final UserRepository userRepository;
    private final RecruitRepository recruitRepository;
    private final ApplicationRepository applicationRepository;
    private final ReviewImageRepository reviewImageRepository;
    private final ReviewCommentRepository reviewCommentRepository;
    private final CacheUtil cacheUtil;
    private final ImageUtil imageUtil;
    private final MinioClient minioClient;

    public void checkToken(AuthDto authDto) {
        if (authDto == null || authDto.getUserId() == null) {
            throw new UnauthorizedException("로그인이 필요합니다.");
        }
    }

    // TODO: 기관이 후기 생성시, 봉사자가 해당 공고에 관해 쓴 후기들에 대해서 parentid값 설정 필요
    @Override
    public ReviewCreateResponseDto createReview(AuthDto authDto, ReviewCreateRequestDto requestDto) {

        checkToken(authDto);

        final User writer = userRepository.findById(authDto.getUserId())
                .orElseThrow(() -> new NotFoundException("작성자 없음"));

        final Recruit recruit = recruitRepository.findById(requestDto.getRecruitId())
                .orElseThrow(() -> new NotFoundException("해당 공고 없음"));

        final Template template = recruit.getTemplate();
        final Integer groupId = template.getGroup().getId();

        boolean alreadyReviewed = reviewRepository.existsByWriterAndRecruit(writer.getId(), recruit.getId());
        if (alreadyReviewed) {
            throw new ConflictException("이미 해당 모집 공고에 대한 후기를 작성하였습니다.");
        }

        Organization organization;
        Review parentReview = null;

        if (organizationRepository.existsByUserId(authDto.getUserId())) {
            organization = organizationRepository.findByUserId(authDto.getUserId())
                    .orElseThrow(() -> new NotFoundException("기관 정보 없음"));

            if (!template.getOrg().getUser().getId().equals(authDto.getUserId())) {
                throw new ForbiddenException("해당 기관의 리뷰만 작성할 수 없습니다.");
            }

        } else {
            boolean isApplicant = applicationRepository.existsByVolunteerUserIdAndRecruitId(writer.getId(), recruit.getId());
            if (!isApplicant) {
                throw new ForbiddenException("해당 봉사 모집 공고에 참여한 사용자만 리뷰를 작성할 수 있습니다.");
            }

            organization = template.getOrg();
            parentReview = reviewRepository.findFirstByOrgWriterAndRecruit(recruit.getId()).orElse(null);
        }

        final Review review = Review.builder()
                .recruit(recruit)
                .org(organization)
                .writer(writer)
                .groupId(groupId)
                .title(requestDto.getTitle())
                .content(requestDto.getContent())
                .isPublic(requestDto.getIsPublic())
                .imgCount(requestDto.getImageCount())
                .createdAt(Instant.now())
                .updatedAt(Instant.now())
                .parentReview(parentReview)
                .isDeleted(false)
                .build();

        reviewRepository.save(review);

        List<String> uploadedPaths = uploadImagesToMinio(requestDto.getUploadedImages());

        List<String> verifiedPaths = new ArrayList<>();
        for (String imagePath : uploadedPaths) {
            try {
                minioClient.statObject(
                        StatObjectArgs.builder()
                                .bucket("ttabong-bucket")
                                .object(imagePath)
                                .build()
                );
                verifiedPaths.add(imagePath);
            } catch (Exception e) {
                throw new ImageProcessException("MinIO에 이미지 저장 실패: " + imagePath, e);
            }
        }

        List<ReviewImage> imageSlots = IntStream.range(0, verifiedPaths.size())
                .mapToObj(i -> ReviewImage.builder()
                        .review(review)
                        .template(template)
                        .imageUrl(verifiedPaths.get(i))
                        .isThumbnail(i == 0)
                        .isDeleted(false)
                        .createdAt(Instant.now())
                        .build())
                .collect(Collectors.toList());

        reviewImageRepository.saveAll(imageSlots);

        return ReviewCreateResponseDto.builder()
                .message("리뷰가 생성되었습니다.")
                .uploadedImages(verifiedPaths)
                .build();
    }


    public List<String> uploadImagesToMinio(List<String> uploadedImages) {

        List<String> uploadedPaths = new ArrayList<>();

        for (String presignedUrl : uploadedImages) {
            final String objectPath = cacheUtil.findObjectPath(presignedUrl);
            if (objectPath == null) {
                throw new ImageProcessException("유효하지 않은 presigned URL입니다.");
            }
            uploadedPaths.add(objectPath);
        }

        return uploadedPaths;
    }


    @Override
    public ReviewEditStartResponseDto startReviewEdit(Integer reviewId, AuthDto authDto) {

        checkToken(authDto);

        Review review = reviewRepository.findById(reviewId)
                .orElseThrow(() -> new NotFoundException("해당 리뷰가 없습니다"));

        List<String> existingImages = reviewImageRepository.findByReviewId(reviewId).stream()
                .filter(image -> image.getImageUrl() != null)
                .map(image -> {
                    try {
                        return imageUtil.getPresignedDownloadUrl(image.getImageUrl());
                    } catch (Exception e) {
                        throw new ImageProcessException("presigned URL 생성에 실패", e);
                    }
                })
                .collect(Collectors.toList());

        List<String> newPresignedUrls = IntStream.range(0, 10)
                .mapToObj(i -> {
                    String objectName = "review-images/" + UUID.randomUUID() + ".webp";
                    String presignedUrl = imageUtil.getPresignedUploadUrl(objectName);
                    cacheUtil.mapTempPresignedUrlwithObjectPath(presignedUrl, objectName);
                    return presignedUrl;
                })
                .collect(Collectors.toList());

        Integer cacheId = UUID.randomUUID().hashCode();

        return ReviewEditStartResponseDto.builder()
                .cacheId(cacheId)
                .writerId(review.getWriter().getId())
                .title(review.getTitle())
                .content(review.getContent())
                .isPublic(review.getIsPublic())
                .getImages(existingImages)
                .presignedUrl(newPresignedUrls)
                .build();
    }

    @Override
    public ReviewEditResponseDto updateReview(Integer reviewId, ReviewEditRequestDto requestDto, AuthDto authDto) {

        checkToken(authDto);

        Review review = reviewRepository.findByIdAndIsDeletedFalse(reviewId)
                .orElseThrow(() -> new NotFoundException("해당 리뷰를 찾을 수 없습니다. reviewId: " + reviewId));

        if (!review.getWriter().getId().equals(authDto.getUserId())) {
            throw new ForbiddenException("본인이 작성한 후기만 수정할 수 있습니다.");
        }

        if (cacheUtil.isProcessedCacheId(requestDto.getCacheId())) {
            throw new ImageProcessException("이미 처리된 요청입니다. 중복 요청을 방지합니다.");
        }
        cacheUtil.markCacheIdAsProcessed(requestDto.getCacheId());

        boolean isNoInput = (requestDto.getTitle() == null || requestDto.getTitle().isBlank()) &&
                (requestDto.getContent() == null || requestDto.getContent().isBlank()) &&
                requestDto.getIsPublic() == null &&
                (requestDto.getPresignedUrl() == null || requestDto.getPresignedUrl().isEmpty()) &&
                (requestDto.getImages() == null || requestDto.getImages().isEmpty());

        if (isNoInput) {
            throw new BadRequestException("입력값이 없습니다.");
        }

        Review updatedReview = review.toBuilder()
                .title(requestDto.getTitle() != null && !requestDto.getTitle().isBlank() ? requestDto.getTitle() : review.getTitle())
                .content(requestDto.getContent() != null && !requestDto.getContent().isBlank() ? requestDto.getContent() : review.getContent())
                .isPublic(requestDto.getIsPublic() != null ? requestDto.getIsPublic() : review.getIsPublic())
                .updatedAt(Instant.now())
                .build();

        reviewRepository.save(updatedReview);

        List<ReviewImage> existingImages = reviewImageRepository.findByReviewIdOrderByIdAsc(reviewId);
        List<String> selectedExistingImages = new ArrayList<>();
        List<String> tempCopyPaths = new ArrayList<>();

        if (requestDto.getImages() != null) {
            for (String imageUrl : requestDto.getImages()) {
                String objectPath = ImageUtil.extractObjectPath(imageUrl);
                if (objectPath != null && !objectPath.isBlank()) {
                    selectedExistingImages.add(objectPath);
                }
            }
        }

        int imageIndex = 1;

        for (String oldObjectPath : selectedExistingImages) {
            String tempCopyPath = "copy_" + oldObjectPath;

            try {
                minioClient.copyObject(
                        CopyObjectArgs.builder()
                                .bucket("ttabong-bucket")
                                .source(CopySource.builder()
                                        .bucket("ttabong-bucket")
                                        .object(oldObjectPath)
                                        .build())
                                .object(tempCopyPath)
                                .build()
                );
                tempCopyPaths.add(tempCopyPath);
            } catch (Exception e) {
                throw new ImageProcessException("MinIO에서 파일 복사 실패: " + oldObjectPath, e);
            }
            imageIndex++;
        }

        for (ReviewImage image : existingImages) {
            if (image.getImageUrl() != null && !image.getImageUrl().isBlank()) {
                try {
                    minioClient.removeObject(
                            RemoveObjectArgs.builder()
                                    .bucket("ttabong-bucket")
                                    .object(image.getImageUrl())
                                    .build()
                    );
                } catch (Exception e) {
                    System.err.println("MinIO에서 기존 이미지 삭제 실패: " + image.getImageUrl());
                }
            }
        }

        imageIndex = 1;
        List<String> finalObjectPaths = new ArrayList<>();
        for (String tempCopyPath : tempCopyPaths) {
            String newObjectPath = reviewId + "_" + imageIndex + ".webp";

            try {
                minioClient.copyObject(
                        CopyObjectArgs.builder()
                                .bucket("ttabong-bucket")
                                .source(CopySource.builder()
                                        .bucket("ttabong-bucket")
                                        .object(tempCopyPath)
                                        .build())
                                .object(newObjectPath)
                                .build()
                );

                try {
                    minioClient.statObject(
                            StatObjectArgs.builder()
                                    .bucket("ttabong-bucket")
                                    .object(newObjectPath)
                                    .build()
                    );
                } catch (Exception e) {
                    throw new ImageProcessException("MinIO에서 저장된 파일을 찾을 수 없음: " + newObjectPath, e);
                }

                minioClient.removeObject(
                        RemoveObjectArgs.builder()
                                .bucket("ttabong-bucket")
                                .object(tempCopyPath)
                                .build()
                );

            } catch (Exception e) {
                throw new ImageProcessException("MinIO에서 파일 이동 실패", e);
            }

            finalObjectPaths.add(newObjectPath);
            imageIndex++;
        }

        if (requestDto.getPresignedUrl() != null) {
            for (String presignedUrl : requestDto.getPresignedUrl()) {
                String objectPath = cacheUtil.findObjectPath(presignedUrl);
                if (objectPath == null) {
                    throw new ImageProcessException("유효하지 않은 presigned URL입니다.");
                }
                String newObjectPath = reviewId + "_" + imageIndex + ".webp";

                finalObjectPaths.add(newObjectPath);
                imageIndex++;
            }
        }

        while (finalObjectPaths.size() < 10) {
            finalObjectPaths.add(null);
        }

        List<ReviewImage> updatedImages = new ArrayList<>();
        for (int i = 0; i < 10; i++) {
            updatedImages.add(ReviewImage.builder()
                    .review(updatedReview)
                    .imageUrl(finalObjectPaths.get(i))
                    .isThumbnail(i == 0)
                    .isDeleted(false)
                    .createdAt(Instant.now())
                    .build());
        }

        reviewImageRepository.deleteByReviewId(reviewId);
        reviewImageRepository.saveAll(updatedImages);

        long finalImageCount = reviewImageRepository.countByReviewIdAndImageUrlIsNotNull(reviewId);

        List<String> responseImages = Stream.concat(
                Optional.ofNullable(requestDto.getImages()).orElse(new ArrayList<>()).stream(),
                Optional.ofNullable(requestDto.getPresignedUrl()).orElse(new ArrayList<>()).stream()
        ).collect(Collectors.toList());

        return ReviewEditResponseDto.builder()
                .cacheId(requestDto.getCacheId())
                .title(updatedReview.getTitle())
                .content(updatedReview.getContent())
                .isPublic(updatedReview.getIsPublic())
                .imageCount((int) finalImageCount)
                .images(responseImages)
                .build();
    }

    @Override
    public ReviewDeleteResponseDto deleteReview(Integer reviewId, AuthDto authDto) {

        checkToken(authDto);

        Review review = reviewRepository.findByIdAndIsDeletedFalse(reviewId)
                .orElseThrow(() -> new NotFoundException("해당 후기를 찾을 수 없습니다. reviewId: " + reviewId));

        if (!review.getWriter().getId().equals(authDto.getUserId())) {
            throw new ForbiddenException("본인이 작성한 후기만 삭제할 수 있습니다.");
        }

        review.markDeleted();

        reviewRepository.save(review);

        return new ReviewDeleteResponseDto("삭제 성공하였습니다.", review.getId(), review.getTitle(), review.getContent());
    }


    @Override
    @Transactional
    public ReviewVisibilitySettingResponseDto updateVisibility(Integer reviewId, ReviewVisibilitySettingRequestDto requestDto, AuthDto authDto) {

        checkToken(authDto);

        Review review = reviewRepository.findByIdAndIsDeletedFalse(reviewId)
                .orElseThrow(() -> new NotFoundException("해당 후기를 찾을 수 없습니다. id: " + reviewId));

        if (!review.getWriter().getId().equals(authDto.getUserId())) {
            throw new ForbiddenException("본인이 작성한 후기만 수정할 수 있습니다.");
        }

        reviewRepository.toggleReviewVisibility(reviewId);

        return new ReviewVisibilitySettingResponseDto(
                "공개 여부를 수정했습니다",
                reviewId,
                !review.getIsPublic(),
                LocalDateTime.now()
        );
    }



    @Override
    @Transactional(readOnly = true)
    public List<AllReviewPreviewResponseDto> readAllReviews(Integer cursor, Integer limit) {
        List<Review> reviews = reviewRepository.findAllReviews(cursor, PageRequest.of(0, limit));

        return reviews.stream()
                .map(review -> {
                    String objectPath = reviewImageRepository
                            .findThumbnailImageByReviewId(review.getId(), PageRequest.of(0, 1))
                            .stream().findFirst().orElse(null);

                    String thumbnailUrl;
                    try {
                        thumbnailUrl = (objectPath != null) ? imageUtil.getPresignedDownloadUrl(objectPath) : null;
                    } catch (Exception e) {
                        throw new RuntimeException(e);
                    }

                    return AllReviewPreviewResponseDto.builder()
                            .review(AllReviewPreviewResponseDto.ReviewDto.builder()
                                    .reviewId(review.getId())
                                    .recruitId(Optional.ofNullable(review.getRecruit()).map(Recruit::getId).orElse(null))
                                    .title(review.getTitle())
                                    .content(review.getContent())
                                    .isDeleted(review.getIsDeleted())
                                    .updatedAt(Optional.ofNullable(review.getUpdatedAt())
                                            .map(updatedAt -> updatedAt.atZone(ZoneId.of("Asia/Seoul")).toLocalDateTime())
                                            .orElse(LocalDateTime.now()))
                                    .createdAt(Optional.ofNullable(review.getCreatedAt())
                                            .map(createdAt -> createdAt.atZone(ZoneId.of("Asia/Seoul")).toLocalDateTime())
                                            .orElse(LocalDateTime.now()))
                                    .build())
                            .writer(Optional.ofNullable(review.getWriter())
                                    .map(writer -> AllReviewPreviewResponseDto.WriterDto.builder()
                                            .writerId(writer.getId())
                                            .name(writer.getName())
                                            .build())
                                    .orElse(null))
                            .group(Optional.ofNullable(review.getRecruit())
                                    .map(recruit -> recruit.getTemplate())
                                    .map(template -> template.getGroup())
                                    .map(group -> AllReviewPreviewResponseDto.GroupDto.builder()
                                            .groupId(group.getId())
                                            .groupName(group.getGroupName())
                                            .build())
                                    .orElse(null))
                            .organization(Optional.ofNullable(review.getOrg())
                                    .map(org -> AllReviewPreviewResponseDto.OrganizationDto.builder()
                                            .orgId(org.getId())
                                            .orgName(org.getOrgName())
                                            .build())
                                    .orElse(null))
                            .images(thumbnailUrl)
                            .build();
                })
                .collect(Collectors.toList());
    }


    @Override
    @Transactional(readOnly = true)
    public List<MyAllReviewPreviewResponseDto> readMyAllReviews(AuthDto authDto) {

        checkToken(authDto);

        List<Review> reviews = reviewRepository.findDistinctByWriterId(authDto.getUserId(), PageRequest.of(0, 10));

        if (reviews.isEmpty()) {
            throw new NotFoundException("작성한 리뷰가 없습니다.");
        }

        return reviews.stream()
                .filter(review -> !review.getIsDeleted())
                .map(review -> {
                    String objectPath = reviewImageRepository
                            .findThumbnailImageByReviewId(review.getId(), PageRequest.of(0, 1))
                            .stream().findFirst().orElse(null);

                    String presignedUrl = null;
                    if (objectPath != null) {
                        try {
                            presignedUrl = imageUtil.getPresignedDownloadUrl(objectPath);
                        } catch (Exception e) {
                            presignedUrl = null;
                        }
                    }

                    Recruit recruit = review.getRecruit();
                    Template template = (recruit != null) ? recruit.getTemplate() : null;
                    TemplateGroup group = (template != null) ? template.getGroup() : null;
                    Organization org = review.getOrg();

                    return MyAllReviewPreviewResponseDto.builder()
                            .review(MyAllReviewPreviewResponseDto.ReviewDto.builder()
                                    .reviewId(review.getId())
                                    .recruitId((recruit != null) ? recruit.getId() : null)
                                    .title(review.getTitle())
                                    .content(review.getContent())
                                    .isDeleted(review.getIsDeleted())
                                    .updatedAt(review.getUpdatedAt().atZone(ZoneId.of("Asia/Seoul")).toLocalDateTime())
                                    .createdAt(review.getCreatedAt().atZone(ZoneId.of("Asia/Seoul")).toLocalDateTime())
                                    .build()
                            )
                            .group(MyAllReviewPreviewResponseDto.GroupDto.builder()
                                    .groupId((group != null) ? group.getId() : null)
                                    .groupName((group != null) ? group.getGroupName() : "N/A")
                                    .build()
                            )
                            .organization(MyAllReviewPreviewResponseDto.OrganizationDto.builder()
                                    .orgId((org != null) ? org.getId() : null)
                                    .orgName((org != null) ? org.getOrgName() : "N/A")
                                    .build()
                            )
                            .images(presignedUrl)
                            .build();
                })
                .collect(Collectors.toList());
    }


    @Override
    @Transactional(readOnly = true)
    public ReviewDetailResponseDto detailReview(Integer reviewId) {

        Review review = reviewRepository.findByIdAndIsDeletedFalse(reviewId)
                .orElseThrow(() -> new NotFoundException("해당 후기를 찾을 수 없습니다. reviewId: " + reviewId));

        User writer = review.getWriter();
        Recruit recruit = review.getRecruit();
        Template template = Optional.ofNullable(recruit).map(Recruit::getTemplate).orElse(null);
        TemplateGroup group = Optional.ofNullable(template).map(Template::getGroup).orElse(null);
        Category category = Optional.ofNullable(template).map(Template::getCategory).orElse(null);
        Organization organization = review.getOrg();

        List<String> objectPaths = Optional.ofNullable(reviewImageRepository.findAllImagesByReviewId(review.getId()))
                .orElse(Collections.emptyList())
                .stream()
                .filter(Objects::nonNull)
                .toList();

        List<String> imageUrls = Optional.ofNullable(objectPaths)
                .orElse(Collections.emptyList())
                .stream()
                .map(path -> {
                    try {
                        return (path != null && !path.isEmpty()) ? imageUtil.getPresignedDownloadUrl(path) : null;
                    } catch (Exception e) {
                        return null;
                    }
                })
                .filter(Objects::nonNull)
                .collect(Collectors.toList());


        String profileImageUrl = null;
        if (writer.getProfileImage() != null) {
            try {
                profileImageUrl = imageUtil.getPresignedDownloadUrl(writer.getProfileImage());
            } catch (Exception e) {
                profileImageUrl = null;
            }
        }

        List<ReviewDetailResponseDto.CommentDto> comments = Optional
                .ofNullable(reviewCommentRepository.findByReviewIdAndIsDeletedFalseOrderByCreatedAt(review.getId()))
                .orElse(Collections.emptyList())
                .stream()
                .map(comment -> ReviewDetailResponseDto.CommentDto.builder()
                        .commentId(comment.getId())
                        .writerId(comment.getWriter() != null ? comment.getWriter().getId() : null)
                        .writerName(comment.getWriter() != null ? comment.getWriter().getName() : "알 수 없음")
                        .content(comment.getContent())
                        .createdAt(comment.getCreatedAt() != null
                                ? comment.getCreatedAt().atZone(ZoneId.of("Asia/Seoul")).toLocalDateTime()
                                : null)
                        .build())
                .collect(Collectors.toList());

        return ReviewDetailResponseDto.builder()
                .reviewId(review.getId())
                .title(review.getTitle())
                .content(review.getContent())
                .isPublic(review.getIsPublic())
                .attended(true)
                .createdAt(review.getCreatedAt().atZone(ZoneId.of("Asia/Seoul")).toLocalDateTime())
                .images(imageUrls)
                .recruit(Optional.ofNullable(recruit).map(r -> ReviewDetailResponseDto.RecruitDto.builder()
                        .recruitId(r.getId())
                        .activityDate(r.getActivityDate().toInstant().atZone(ZoneId.of("Asia/Seoul")).toLocalDate())
                        .activityStart(r.getActivityStart().doubleValue())
                        .activityEnd(r.getActivityEnd().doubleValue())
                        .status(r.getStatus())
                        .build()).orElse(null))
                .category(Optional.ofNullable(category).map(c -> ReviewDetailResponseDto.CategoryDto.builder()
                        .categoryId(c.getId())
                        .name(c.getName())
                        .build()).orElse(null))
                .writer(ReviewDetailResponseDto.WriterDto.builder()
                        .writerId(writer.getId())
                        .writerName(writer.getName())
                        .writerEmail(writer.getEmail())
                        .writerProfileImage(profileImageUrl)
                        .build())
                .template(Optional.ofNullable(template).map(t -> ReviewDetailResponseDto.TemplateDto.builder()
                        .templateId(t.getId())
                        .title(t.getTitle())
                        .activityLocation(t.getActivityLocation())
                        .status(t.getStatus())
                        .group(Optional.ofNullable(group).map(g -> ReviewDetailResponseDto.GroupDto.builder()
                                .groupId(g.getId())
                                .groupName(g.getGroupName())
                                .build()).orElse(null))
                        .build()).orElse(null))
                .organization(Optional.ofNullable(organization).map(o -> ReviewDetailResponseDto.OrganizationDto.builder()
                        .orgId(o.getId())
                        .orgName(o.getOrgName())
                        .build()).orElse(null))
                .parentReviewId(Optional.ofNullable(review.getParentReview()).map(Review::getId).orElse(null))
                .comments(comments)
                .build();
    }

    @Override
    @Transactional(readOnly = true)
    public List<RecruitReviewResponseDto> recruitReview(Integer recruitId) {

        recruitRepository.findByIdAndIsDeletedFalse(recruitId)
                .orElseThrow(() -> new NotFoundException("해당 모집 공고를 찾을 수 없습니다. recruitId: " + recruitId));

        List<Review> reviews = reviewRepository.findByRecruitIdAndIsDeletedFalse(recruitId);

        if (reviews.isEmpty()) {
            throw new NotFoundException("해당 모집 공고에 대한 리뷰가 없습니다.");
        }

        return reviews.stream()
                .map(review -> {
                    String objectPath = reviewImageRepository
                            .findThumbnailImageByReviewId(review.getId(), PageRequest.of(0, 1))
                            .stream().findFirst().orElse(null);

                    String thumbnailUrl = null;
                    if (objectPath != null) {
                        try {
                            thumbnailUrl = imageUtil.getPresignedDownloadUrl(objectPath);
                        } catch (Exception e) {
                            thumbnailUrl = null;
                        }
                    }

                    Recruit recruit = review.getRecruit();
                    Template template = (recruit != null) ? recruit.getTemplate() : null;
                    TemplateGroup group = (template != null) ? template.getGroup() : null;
                    Organization org = review.getOrg();

                    return RecruitReviewResponseDto.builder()
                            .review(RecruitReviewResponseDto.ReviewDto.builder()
                                    .reviewId(review.getId())
                                    .recruitId((recruit != null) ? recruit.getId() : null)
                                    .title(review.getTitle())
                                    .content(review.getContent())
                                    .isDeleted(review.getIsDeleted())
                                    .updatedAt(review.getUpdatedAt().atZone(ZoneId.of("Asia/Seoul")).toLocalDateTime())
                                    .createdAt(review.getCreatedAt().atZone(ZoneId.of("Asia/Seoul")).toLocalDateTime())
                                    .build()
                            )
                            .writer(RecruitReviewResponseDto.WriterDto.builder()
                                    .name((review.getWriter() != null) ? review.getWriter().getName() : "Unknown")
                                    .build()
                            )
                            .group((group != null) ? RecruitReviewResponseDto.GroupDto.builder()
                                    .groupId(group.getId())
                                    .groupName(group.getGroupName())
                                    .build() : null
                            )
                            .organization(RecruitReviewResponseDto.OrganizationDto.builder()
                                    .orgId((org != null) ? org.getId() : null)
                                    .orgName((org != null) ? org.getOrgName() : "N/A")
                                    .build()
                            )
                            .images(thumbnailUrl)
                            .build();
                })
                .collect(Collectors.toList());
    }

    @Override
    public void createReviewAfterSchedule(int recruitId) {
        log.info("봉사가 끝나서 관련 게시글을 생성합니다");
        Optional<Recruit> recruit = recruitRepository.findById(recruitId);
        if(recruit.isEmpty()) {
            log.info("스케쥴러를 통해 리뷰를 생성하기 위한 공고가 없습니다");
            throw new NotFoundException("해당하는 공고가 없습니다");
        }
        List<Application> applications = applicationRepository.findByRecruitIdAndStatus(recruitId, "APPROVED");
        List<Review> reviews = new ArrayList<>();
        Review parentReview = reviewRepository.save(Review.buildRecruitParentReview(recruit.get()));
        //reviews.add(parentReview);
        reviews.addAll(applications.stream().map(application ->{
            return Review.buildRecruitVolunteerReview(recruit.get(), application, parentReview);
        }).toList());
        reviewRepository.saveAll(reviews);
    }

}

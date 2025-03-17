package com.ttabong.util.service;

import com.ttabong.entity.recruit.Template;
import com.ttabong.entity.sns.ReviewImage;
import com.ttabong.exception.ImageProcessException;
import com.ttabong.exception.NotFoundException;
import com.ttabong.repository.recruit.TemplateRepository;
import com.ttabong.repository.sns.ReviewImageRepository;
import com.ttabong.repository.sns.ReviewRepository;
import com.ttabong.util.CacheUtil;
import com.ttabong.util.ImageUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.Objects;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ImageServiceImpl implements ImageService{

    private final ReviewImageRepository reviewImageRepository;
    private final TemplateRepository templateRepository;
    private final ReviewRepository reviewRepository;
    private final CacheUtil cacheUtil;
    private final ImageUtil imageUtil;

    @Override
    public List<String> uploadTemplateImages(Integer templateId, List<String> uploadedImages) {
        List<String> objectPaths = new ArrayList<>();

        List<ReviewImage> imageEntities = new ArrayList<>();
        for (int i = 0; i < uploadedImages.size(); i++) {
            final String objectPath = cacheUtil.findObjectPath(uploadedImages.get(i));
            if (objectPath == null) {
                throw new ImageProcessException("유효하지 않은 presigned URL입니다.");
            }

            objectPaths.add(objectPath);

            Template template = templateRepository.findById(templateId)
                    .orElseThrow(() -> new NotFoundException("해당 템플릿이 존재하지 않습니다."));

            imageEntities.add(ReviewImage.builder()
                    .template(template)
                    .imageUrl(objectPath)
                    .isThumbnail(i == 0)
                    .isDeleted(false)
                    .createdAt(Instant.now())
                    .build());
        }

        reviewImageRepository.saveAll(imageEntities);

        return objectPaths;
    }

    @Override
    @Transactional
    public void updateThumbnailImage(Integer entityId, boolean isTemplate) {
        List<ReviewImage> thumbnails = isTemplate
                ? reviewImageRepository.findByTemplateIdAndIsThumbnailTrue(entityId)
                : reviewImageRepository.findByReviewIdAndIsThumbnailTrue(entityId);

        // 모든 기존 대표 이미지 초기화
        thumbnails.forEach(image -> image.setThumbnail(false));
        reviewImageRepository.saveAll(thumbnails);

        // 새로운 대표 이미지 설정
        Optional<ReviewImage> firstImage = isTemplate
                ? reviewImageRepository.findFirstByTemplateIdOrderByIdAsc(entityId)
                : reviewImageRepository.findFirstByReviewIdOrderByIdAsc(entityId);

        firstImage.ifPresent(image -> {
            image.setThumbnail(true);
            reviewImageRepository.save(image);
        });
    }

    public List<String> getImageUrls(Integer entityId, boolean isTemplate) {
        return (isTemplate ? reviewImageRepository.findByTemplateId(entityId)
                : reviewImageRepository.findByReviewId(entityId))
                .stream()
                .filter(image -> !image.getIsDeleted()) // 삭제된 이미지 제외
                .map(ReviewImage::getImageUrl)
                .filter(Objects::nonNull)
                .map(imageUrl -> {
                    try {
                        return imageUtil.getPresignedDownloadUrl(imageUrl);
                    } catch (Exception e) {
                        throw new RuntimeException("MinIO Presigned URL 생성 중 오류 발생", e);
                    }
                })
                .collect(Collectors.toList());
    }

}

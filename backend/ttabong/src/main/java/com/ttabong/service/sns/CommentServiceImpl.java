package com.ttabong.service.sns;

import com.ttabong.dto.sns.request.CommentCreateAndUpdateRequestDto;
import com.ttabong.dto.sns.response.CommentCreateAndUpdateResponseDto;
import com.ttabong.dto.sns.response.CommentDeleteResponseDto;
import com.ttabong.dto.user.AuthDto;
import com.ttabong.entity.sns.Review;
import com.ttabong.entity.sns.ReviewComment;
import com.ttabong.entity.user.User;
import com.ttabong.exception.ForbiddenException;
import com.ttabong.exception.ImageProcessException;
import com.ttabong.exception.NotFoundException;
import com.ttabong.exception.UnauthorizedException;
import com.ttabong.repository.sns.CommentRepository;
import com.ttabong.repository.sns.ReviewCommentRepository;
import com.ttabong.repository.sns.ReviewRepository;
import com.ttabong.repository.user.UserRepository;
import com.ttabong.util.DateTimeUtil;
import com.ttabong.util.ImageUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;

@Service
@RequiredArgsConstructor
@Transactional
public class CommentServiceImpl implements CommentService {

    private final CommentRepository commentRepository;
    private final ReviewRepository reviewRepository;
    private final ReviewCommentRepository reviewCommentRepository;
    private final UserRepository userRepository;
    private final ImageUtil imageUtil;

    public void checkToken(AuthDto authDto) {
        if (authDto == null || authDto.getUserId() == null) {
            throw new UnauthorizedException("로그인이 필요합니다.");
        }
    }

    @Override
    public CommentCreateAndUpdateResponseDto createComment(AuthDto authDto, Integer reviewId, CommentCreateAndUpdateRequestDto requestDto) {

        checkToken(authDto);

        Review review = reviewRepository.findByIdAndIsDeletedFalse(reviewId)
                .orElseThrow(() -> new NotFoundException("해당 후기를 찾을 수 없습니다. id: " + reviewId));

        User writer = userRepository.findById(authDto.getUserId())
                .orElseThrow(() -> new NotFoundException("사용자를 찾을 수 없습니다. id: " + authDto.getUserId()));

        ReviewComment comment = ReviewComment.builder()
                .review(review)
                .writer(writer)
                .content(requestDto.getContent().trim())
                .updatedAt(Instant.now())
                .createdAt(Instant.now())
                .isDeleted(false)
                .build();

        commentRepository.save(comment);

        String profileImageUrl = null;
        if (writer.getProfileImage() != null) {
            try {
                profileImageUrl = imageUtil.getPresignedDownloadUrl(writer.getProfileImage());
            } catch (Exception e) {
                throw new ImageProcessException("프로필 이미지 Presigned URL 생성 실패", e);
            }
        }

        return CommentCreateAndUpdateResponseDto.builder()
                .commentId(comment.getId())
                .reviewId(review.getId())
                .writer(CommentCreateAndUpdateResponseDto.WriterDto.builder()
                        .writerId(writer.getId())
                        .writerName(writer.getName())
                        .writerProfileImage(profileImageUrl)
                        .build())
                .content(comment.getContent())
                .updatedAt(DateTimeUtil.convertToLocalDateTime(comment.getUpdatedAt()))
                .build();
    }

    @Override
    public CommentCreateAndUpdateResponseDto updateComment(AuthDto authDto, Integer commentId, CommentCreateAndUpdateRequestDto requestDto) {

        checkToken(authDto);

        ReviewComment existingComment = reviewCommentRepository.findByIdAndIsDeletedFalse(commentId)
                .orElseThrow(() -> new NotFoundException("해당 댓글을 찾을 수 없습니다. id: " + commentId));

        if (!existingComment.getWriter().getId().equals(authDto.getUserId())) {
            throw new ForbiddenException("댓글을 수정할 권한이 없습니다.");
        }

        existingComment.updateContent(requestDto.getContent());

        String profileImageUrl = null;
        if (existingComment.getWriter().getProfileImage() != null) {
            try {
                profileImageUrl = imageUtil.getPresignedDownloadUrl(existingComment.getWriter().getProfileImage());
            } catch (Exception e) {
                throw new ImageProcessException("프로필 이미지 Presigned URL 생성 실패", e);
            }
        }

        return CommentCreateAndUpdateResponseDto.builder()
                .commentId(existingComment.getId())
                .reviewId(existingComment.getReview().getId())
                .writer(CommentCreateAndUpdateResponseDto.WriterDto.builder()
                        .writerId(existingComment.getWriter().getId())
                        .writerName(existingComment.getWriter().getName())
                        .writerProfileImage(profileImageUrl)
                        .build())
                .content(existingComment.getContent())
                .updatedAt(DateTimeUtil.convertToLocalDateTime(existingComment.getUpdatedAt()))
                .build();
    }

    @Override
    public CommentDeleteResponseDto deleteComment(AuthDto authDto, Integer commentId) {

        checkToken(authDto);

        ReviewComment existingComment = reviewCommentRepository.findByIdAndIsDeletedFalse(commentId)
                .orElseThrow(() -> new NotFoundException("댓글 없음"));

        if (!existingComment.getWriter().getId().equals(authDto.getUserId())) {
            throw new ForbiddenException("댓글 삭제 권한 없습니다");
        }

        existingComment.markDeleted();
        reviewCommentRepository.save(existingComment);

        return CommentDeleteResponseDto.builder()
                .message("댓글 삭제 성공")
                .commentId(existingComment.getId())
                .build();
    }

}

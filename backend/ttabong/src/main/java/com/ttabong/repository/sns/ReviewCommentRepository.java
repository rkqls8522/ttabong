package com.ttabong.repository.sns;

import com.ttabong.entity.sns.ReviewComment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ReviewCommentRepository extends JpaRepository<ReviewComment, Integer> {
    Optional<ReviewComment> findByIdAndIsDeletedFalse(Integer commentId);
    List<ReviewComment> findByReviewIdAndIsDeletedFalseOrderByCreatedAt(Integer reviewId);
}

package com.ttabong.repositoryjpa.sns;

import com.ttabong.entity.sns.ReviewComment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface ReviewCommentRepositoryJpa extends JpaRepository<ReviewComment, Integer> {
    Optional<ReviewComment> findByIdAndIsDeletedFalse(Integer commentId);
}

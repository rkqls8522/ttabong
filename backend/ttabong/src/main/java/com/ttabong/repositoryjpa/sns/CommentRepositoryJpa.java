package com.ttabong.repositoryjpa.sns;

import com.ttabong.entity.sns.ReviewComment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface CommentRepositoryJpa extends JpaRepository<ReviewComment, Integer> {
}

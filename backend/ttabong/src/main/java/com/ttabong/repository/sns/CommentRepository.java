package com.ttabong.repository.sns;

import com.ttabong.entity.sns.ReviewComment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface CommentRepository extends JpaRepository<ReviewComment, Integer> {
}

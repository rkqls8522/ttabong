package com.ttabong.test;

import com.ttabong.entity.sns.Review;
import org.springframework.data.jpa.repository.JpaRepository;

public interface TestRepository extends JpaRepository<Review, Integer> {
}

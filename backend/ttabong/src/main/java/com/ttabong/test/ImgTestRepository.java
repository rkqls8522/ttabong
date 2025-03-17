package com.ttabong.test;

import com.ttabong.entity.sns.ReviewImage;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ImgTestRepository extends JpaRepository<ReviewImage, Integer> {
}

package com.ttabong.dto.sns;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Getter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ReviewImageDto {
    private Integer imageId;
    private Integer reviewId;
    private String imageUrl;
    private Boolean isDeleted;
    private LocalDateTime createdAt;
    private Integer nextImageId; // 다음 이미지 ID
}

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
public class ReviewDto {
    private Integer reviewId;         // 후기 ID
    private Integer parentReviewId;   // 자기참조 (부모 리뷰 ID)
    private Integer groupId;          // 그룹 ID
    private Integer recruitId;        // 공고 ID
    private Integer orgId;            // 작성하는 기관 ID
    private Integer writerId;         // 작성자 ID
    private String title;          // 후기 제목
    private String content;        // 후기 내용
    private Boolean isDeleted;     // 삭제 여부
    private Boolean isPublic;      // 공개 여부
    private Long thumbnailImg;     // 썸네일 이미지 ID
    private Integer imgCount;      // 이미지 개수
    private LocalDateTime updatedAt; // 수정 시각
    private LocalDateTime createdAt; // 생성 일시
}

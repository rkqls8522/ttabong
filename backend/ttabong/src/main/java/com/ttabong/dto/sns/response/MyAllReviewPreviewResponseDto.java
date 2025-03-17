package com.ttabong.dto.sns.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Getter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MyAllReviewPreviewResponseDto {
    private ReviewDto review;
    //    private WriterDto writer;
    private GroupDto group;
    private OrganizationDto organization;
    //    private List<String> images;
    private String images;

    @Getter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class ReviewDto {
        private Integer reviewId;
        private Integer recruitId;
        private String title;
        private String content;
        private Boolean isDeleted;
        private LocalDateTime updatedAt;
        private LocalDateTime createdAt;
    }

//    @Getter
//    @NoArgsConstructor
//    @AllArgsConstructor
//    @Builder
//    public static class WriterDto {
//        private Integer writerId;
//        private String name;
//    }

    @Getter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class GroupDto {
        private Integer groupId;
        private String groupName;
    }

    @Getter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class OrganizationDto {
        private Integer orgId;
        private String orgName;
    }
}

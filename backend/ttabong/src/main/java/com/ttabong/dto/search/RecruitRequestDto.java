package com.ttabong.dto.search;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.util.Date;

@Getter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RecruitRequestDto {

    private String templateTitle;

    private SearchConditions searchConditions;

    @Getter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class SearchConditions {
        private String organizationName;
        private String status;
        private ActivityDate activityDate;
        private String region;

        @Getter
        @NoArgsConstructor
        @AllArgsConstructor
        @Builder
        public static class ActivityDate {
            private Date start;
            private Date end;
        }
    }
}

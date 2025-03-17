package com.ttabong.dto.recruit.responseDto.org;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.Date;
import java.util.List;

@Getter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ReadMyRecruitsResponseDto {
    private List<RecruitDetail> recruits;

    @Getter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class RecruitDetail {
        private Group group;
        private Template template;
        private Recruit recruit;
    }

    @Getter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class Group {
        private Integer groupId;
        private String groupName;
    }

    @Getter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class Template {
        private Integer templateId;
        private String title;
    }

    @Getter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class Recruit {
        private Integer recruitId;
        private String status;
        private Integer maxVolunteer;
        private Integer participateVolCount;
        private Date activityDate;
        private BigDecimal activityStart;
        private BigDecimal activityEnd;
        private LocalDateTime deadline;
        private LocalDateTime createdAt;
    }
}

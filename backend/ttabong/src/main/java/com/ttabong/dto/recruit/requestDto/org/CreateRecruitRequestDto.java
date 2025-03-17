package com.ttabong.dto.recruit.requestDto.org;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.Date;

@Getter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CreateRecruitRequestDto {
    private Integer templateId;
    private LocalDateTime deadline;
    private Date activityDate;
    private BigDecimal activityStart;
    private BigDecimal activityEnd;
    private Integer maxVolunteer;
}

package com.ttabong.dto.recruit.responseDto.org;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class EvaluateApplicationsResponseDto {
    private Integer volunteerId;
    private String status;
    private String recommendationStatus;
}

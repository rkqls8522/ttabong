package com.ttabong.dto.recruit.requestDto.org;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UpdateApplicationsRequestDto {
    private Integer recruitId;
    private Integer volunteerId;
    private Integer applicationId;
    private Boolean accept;
}
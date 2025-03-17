package com.ttabong.dto.recruit.responseDto.vol;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ApplyRecruitResponseDto {
    private String message;
    private Application application;

    @Getter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class Application {
        private Integer applicationId;
        private String status;
    }
}

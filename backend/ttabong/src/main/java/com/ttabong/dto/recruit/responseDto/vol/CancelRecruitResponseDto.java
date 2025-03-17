package com.ttabong.dto.recruit.responseDto.vol;

import com.ttabong.entity.recruit.Application;
import lombok.*;

@Getter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CancelRecruitResponseDto {
    private String message;
    private ApplicationDto application;

    @Getter
    @Setter
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ApplicationDto {
        private Integer applicationId;
        private Boolean isDeleted;


        public static ApplicationDto fromEntity(Application application) {
            return ApplicationDto.builder()
                    .applicationId(application.getId())
                    .isDeleted(application.getIsDeleted())
                    .build();
        }
    }
}

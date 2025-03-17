package com.ttabong.dto.recruit.responseDto.vol;

import com.ttabong.entity.recruit.Recruit;
import lombok.*;

import java.math.BigDecimal;
import java.time.Instant;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RecruitDto {
    private Integer recruitId;
    private Instant deadline;
    private Instant activityDate;
    private BigDecimal activityStart;
    private BigDecimal activityEnd;
    private Integer maxVolunteer;
    private Integer participateVolCount;
    private String status;
    private Instant updatedAt;
    private Instant createdAt;

    public static RecruitDto from(Recruit recruit) {
        return RecruitDto.builder()
                .recruitId(recruit.getId())
                .deadline(recruit.getDeadline())
                .activityDate(recruit.getActivityDate().toInstant())
                .activityStart(recruit.getActivityStart())
                .activityEnd(recruit.getActivityEnd())
                .maxVolunteer(recruit.getMaxVolunteer())
                .participateVolCount(recruit.getParticipateVolCount())
                .status(recruit.getStatus())
                .updatedAt(recruit.getUpdatedAt())
                .createdAt(recruit.getCreatedAt())
                .build();
    }
}

package com.ttabong.dto.recruit.responseDto.vol;

import com.ttabong.entity.recruit.Recruit;
import lombok.*;
import java.math.BigDecimal;
import java.time.Instant;
import java.util.Date;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ReactionRecruitDto {
    private Integer recruitId;
    private Integer templateId;
    private Instant deadline;
    private Date activityDate;
    private BigDecimal activityStart;
    private BigDecimal activityEnd;
    private Integer maxVolunteer;
    private Integer participateVolCount;
    private String status;

    public static ReactionRecruitDto fromRecruit(Recruit recruit) {
        return ReactionRecruitDto.builder()
                .recruitId(recruit.getId())
                .templateId(recruit.getTemplate().getId())
                .deadline(recruit.getDeadline())
                .activityDate(recruit.getActivityDate())
                .activityStart(recruit.getActivityStart())
                .activityEnd(recruit.getActivityEnd())
                .maxVolunteer(recruit.getMaxVolunteer())
                .participateVolCount(recruit.getParticipateVolCount())
                .status(recruit.getStatus())
                .build();
    }
}

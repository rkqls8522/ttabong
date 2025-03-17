package com.ttabong.dto.recruit.responseDto.vol;

import lombok.*;
import java.time.Instant;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class LikedRecruitDto {
    private Integer reactionId;
    private Instant reactionCreatedAt;
    private ReactionRecruitDto recruit;
}

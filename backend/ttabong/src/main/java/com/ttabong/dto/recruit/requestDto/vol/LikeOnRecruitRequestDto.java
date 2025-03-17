package com.ttabong.dto.recruit.requestDto.vol;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class LikeOnRecruitRequestDto {
    Integer templateId;
    Boolean isLike;
}

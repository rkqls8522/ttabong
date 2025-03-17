package com.ttabong.dto.recruit.responseDto.vol;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.util.List;

@Getter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class LikeOnRecruitResponseDto {
    private List<Integer> relationId;
    private Boolean isLike;
}

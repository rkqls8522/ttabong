package com.ttabong.dto.recruit.requestDto.vol;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.util.List;

@Getter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DeleteLikesRequestDto {
    List<Integer> reactionIds;
}

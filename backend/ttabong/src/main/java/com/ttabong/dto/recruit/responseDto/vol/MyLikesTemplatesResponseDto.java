package com.ttabong.dto.recruit.responseDto.vol;

import lombok.*;

import java.util.ArrayList;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MyLikesTemplatesResponseDto {
    private Integer templateId;
    private String title;
    private List<MyLikesTemplatesRecruitsResponseDto> recruits = new ArrayList<>();

    public MyLikesTemplatesResponseDto(Integer templateId, String title) {
        this.templateId = templateId;
        this.title = title;
        this.recruits = new ArrayList<>(); // 🔥 recruits 리스트 초기화
    }
}

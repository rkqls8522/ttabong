package com.ttabong.dto.sns.response;

import lombok.Builder;
import lombok.Getter;

import java.util.List;

@Getter
@Builder
public class ReviewEditResponseDto {
    private Integer cacheId;
    private String title;
    private String content;
    private Boolean isPublic;
    private List<String> images;
    private Integer imageCount;
}

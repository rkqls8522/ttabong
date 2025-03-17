package com.ttabong.dto.sns.response;

import lombok.Builder;
import lombok.Getter;

import java.util.List;

@Getter
@Builder
public class ReviewEditStartResponseDto {
    private Integer cacheId;
    private Integer writerId;
    private String title;
    private String content;
    private Boolean isPublic;
    private List<String> getImages;
    private List<String> presignedUrl;
}

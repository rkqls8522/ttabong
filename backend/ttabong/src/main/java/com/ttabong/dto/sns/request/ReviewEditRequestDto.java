package com.ttabong.dto.sns.request;

import lombok.Getter;

import java.util.List;

@Getter
public class ReviewEditRequestDto {
    private Integer cacheId;
    private String title;
    private String content;
    private Boolean isPublic;
    private List<String> presignedUrl;
    private List<String> images;
}
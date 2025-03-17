package com.ttabong.test.dto;

import lombok.Builder;
import lombok.Getter;

import java.util.List;

@Builder
@Getter
public class CreatePostResponseDto {
    Integer postingId;
    Integer orgId;
    Integer writerId;
    String content;
    Boolean isPublic;
    List<String> images; //presingedUrl

}

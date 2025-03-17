package com.ttabong.dto.sns.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.util.List;

@Getter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ReviewCreateRequestDto {
    @NotNull
    private Integer recruitId;
    @NotNull
    private Integer orgId;
    //    @NotNull
//    private Integer writerId;
    @NotBlank
    private String title;
    @NotBlank
    private String content;
    @NotNull
    private Boolean isPublic;
    private List<String> uploadedImages;

    public int getImageCount() {
        return (uploadedImages != null) ? uploadedImages.size() : 0;
    }
}

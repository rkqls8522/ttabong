package com.ttabong.dto.sns.request;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CommentCreateAndUpdateRequestDto {
    @NotBlank(message = "내용은 필수 입력 값입니다.")
    private String content;
}

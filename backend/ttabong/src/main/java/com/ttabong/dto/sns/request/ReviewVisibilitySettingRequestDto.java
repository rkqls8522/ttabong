package com.ttabong.dto.sns.request;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ReviewVisibilitySettingRequestDto {
    private Boolean isPublic; // 현재 상태 전달 (백엔드에서 반대로 변경)
}

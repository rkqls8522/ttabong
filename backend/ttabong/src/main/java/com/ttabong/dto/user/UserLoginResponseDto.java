package com.ttabong.dto.user;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class UserLoginResponseDto {
    private int status;   // 들어갈 HTTP 상태 코드 3종류 : (200, 401, 403)
    private String message;
    private Integer userId;
    private String name;
    private String email;
}

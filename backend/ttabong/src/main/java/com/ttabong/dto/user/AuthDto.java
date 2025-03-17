package com.ttabong.dto.user;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class AuthDto {
    private Integer userId;
    private String userType;

    public AuthDto(Integer userId, String role) {
        this.userId = userId;
        this.userType = role;
    }

}
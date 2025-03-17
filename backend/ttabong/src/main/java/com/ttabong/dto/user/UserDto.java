package com.ttabong.dto.user;

import lombok.*;

import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UserDto {
    private Integer userId;
    private String email;
    private String name;
    private String password;
    private String phone;
    private Long total_volunteer_hours;
    private String profileImage;
    private Boolean isDeleted;
    private LocalDateTime createdAt;
}

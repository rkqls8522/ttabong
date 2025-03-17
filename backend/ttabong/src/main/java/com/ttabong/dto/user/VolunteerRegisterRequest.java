package com.ttabong.dto.user;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Data
@NoArgsConstructor
@AllArgsConstructor

public class VolunteerRegisterRequest {
    // 공통 User 정보
    private String email;
    private String name;
    private String password;
    private String phone;
    private String profileImage; // 선택사항

    // 봉사자 전용 정보
    private String preferredTime;
    private String interestTheme;
    private String durationTime;
    private String region;
    private LocalDate birthDate;
    private Character gender;
}

package com.ttabong.dto.user;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class OrganizationRegisterRequest {
    // 공통 User 정보
    private String email;
    private String name;
    private String password;
    private String phone;
    private String profileImage; // 선택사항

    // 기관 전용 정보
    private String businessRegNumber;
    private String orgName;
    private String representativeName;
    private String orgAddress;
}

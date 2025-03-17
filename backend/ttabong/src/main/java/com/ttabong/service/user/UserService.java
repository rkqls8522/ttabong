package com.ttabong.service.user;

import com.ttabong.dto.user.LoginRequest;
import com.ttabong.dto.user.OrganizationRegisterRequest;
import com.ttabong.dto.user.UserLoginResponseDto;
import com.ttabong.dto.user.VolunteerRegisterRequest;

public interface UserService {
    UserLoginResponseDto login(LoginRequest loginRequest);

    boolean registerVolunteer(VolunteerRegisterRequest request);

    boolean registerOrganization(OrganizationRegisterRequest request);

    boolean checkEmail(String email, String type);
}

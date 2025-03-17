package com.ttabong.servicejpa.user;

import com.ttabong.dto.user.LoginRequest;
import com.ttabong.dto.user.OrganizationRegisterRequest;
import com.ttabong.dto.user.UserLoginResponseDto;
import com.ttabong.dto.user.VolunteerRegisterRequest;

public interface UserService {
    UserLoginResponseDto login(LoginRequest loginRequest);

    String registerVolunteer(VolunteerRegisterRequest request);

    String registerOrganization(OrganizationRegisterRequest request);

    boolean checkEmail(String email, String type);
}

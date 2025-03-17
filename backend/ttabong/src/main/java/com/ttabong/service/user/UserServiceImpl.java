package com.ttabong.service.user;

import com.ttabong.dto.user.*;
import com.ttabong.entity.user.Organization;
import com.ttabong.entity.user.User;
import com.ttabong.entity.user.Volunteer;
import com.ttabong.repository.user.OrganizationRepository;
import com.ttabong.repository.user.UserRepository;
import com.ttabong.repository.user.VolunteerRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.Optional;

@Service
public class UserServiceImpl implements UserService {

    private final UserRepository userRepository;
    private final VolunteerRepository volunteerRepository;
    private final OrganizationRepository organizationRepository;
    private final BCryptPasswordEncoder passwordEncoder;

    @Autowired
    public UserServiceImpl(UserRepository userRepository,
                           VolunteerRepository volunteerRepository,
                           OrganizationRepository organizationRepository,
                           BCryptPasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.volunteerRepository = volunteerRepository;
        this.organizationRepository = organizationRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public UserLoginResponseDto login(LoginRequest loginRequest) {
        UserLoginProjection user = userRepository.findByEmailAndIsDeletedFalse(loginRequest.getEmail());

        if (user == null || !passwordEncoder.matches(loginRequest.getPassword(), user.getPassword())) {
            return UserLoginResponseDto.builder()
                    .status(401)
                    .message("이메일 또는 비밀번호가 일치하지 않습니다.")
                    .build();
        }

        boolean isUserTypeValid = false;
        if ("volunteer".equals(loginRequest.getUserType())) {
            isUserTypeValid = volunteerRepository.existsByUserIdAndUserIsDeletedFalse(user.getId());
        } else if ("organization".equals(loginRequest.getUserType())) {
            isUserTypeValid = organizationRepository.existsByUserIdAndUserIsDeletedFalse(user.getId());
        }

        if (!isUserTypeValid) {
            String userType = loginRequest.getUserType().equalsIgnoreCase("volunteer")? "봉사자" : "봉사기관";
            return UserLoginResponseDto.builder()
                    .status(403)
                    .message("해당 계정은 " + userType + " 계정이 아닙니다.")
                    .build();
        }

        return UserLoginResponseDto.builder()
                .status(200)
                .message("로그인 성공")
                .userId(user.getId())
                .name(user.getName())
                .email(user.getEmail())
                .build();
    }



    @Override
    public boolean registerVolunteer(VolunteerRegisterRequest request) {
        if (userRepository.existsByEmailAndIsDeletedFalse(request.getEmail())) {
            return false;
        }

        User user = User.builder()
                .email(request.getEmail())
                .name(request.getName())
                .password(passwordEncoder.encode(request.getPassword()))
                .phone(request.getPhone())
                .profileImage(request.getProfileImage())
                .createdAt(Instant.now())
                .isDeleted(false)
                .totalVolunteerHours(BigDecimal.valueOf(0))
                .build();
        user = userRepository.save(user);

        Volunteer volunteer = Volunteer.builder()
                .user(user)
                .preferredTime(request.getPreferredTime())
                .interestTheme(request.getInterestTheme())
                .durationTime(request.getDurationTime())
                .region(request.getRegion())
                .birthDate(request.getBirthDate())
                .gender(request.getGender())
                .recommendedCount(0)
                .notRecommendedCount(0)
                .build();
        volunteerRepository.save(volunteer);

        return true;
    }

    @Override
    public boolean registerOrganization(OrganizationRegisterRequest request) {
        if (userRepository.existsByEmailAndIsDeletedFalse(request.getEmail())) {
            return false;
        }

        User user = User.builder()
                .email(request.getEmail())
                .name(request.getName())
                .password(passwordEncoder.encode(request.getPassword()))
                .phone(request.getPhone())
                .profileImage(request.getProfileImage())
                .createdAt(Instant.now())
                .isDeleted(false)
                .totalVolunteerHours(BigDecimal.valueOf(0))
                .build();
        user = userRepository.save(user);

        Organization organization = Organization.builder()
                .user(user)
                .businessRegNumber(request.getBusinessRegNumber())
                .orgName(request.getOrgName())
                .representativeName(request.getRepresentativeName())
                .orgAddress(request.getOrgAddress())
                .build();
        organizationRepository.save(organization);

        return true;
    }

    @Override
    public boolean checkEmail(String email, String type) {
        //이메일이 있다면 true, 없다면 false를 반환하는데, 이를 상황에 따라 어떻게 응답할 지는 컨트롤러에서 정할 것임.
        return userRepository.existsByEmailAndIsDeletedFalse(email);
    }
}

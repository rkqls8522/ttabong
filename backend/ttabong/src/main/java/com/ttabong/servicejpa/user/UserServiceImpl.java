package com.ttabong.servicejpa.user;

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

//@Service
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

        if (user == null) {
            return null; // 혹은 Optional<UserLoginResponseDto>로 감싸서 반환 가능
        }

        if (!passwordEncoder.matches(loginRequest.getPassword(), user.getPassword())) {
            return null;
        }

        return UserLoginResponseDto.builder()
                .userId(user.getId())
                .name(user.getName())
                .email(user.getEmail())
                .build();
    }


    @Override
    public String registerVolunteer(VolunteerRegisterRequest request) {
        if (userRepository.existsByEmailAndIsDeletedFalse(request.getEmail())) {
            return "failed : user already exists";
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

        return "";
    }

    @Override
    public String registerOrganization(OrganizationRegisterRequest request) {
        if (userRepository.existsByEmailAndIsDeletedFalse(request.getEmail())) {
            return "failed : user already exists";
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

        return "";
    }

    @Override
    public boolean checkEmail(String email, String type) {
        //이메일이 있다면 true, 없다면 false를 반환하는데, 이를 상황에 따라 어떻게 응답할 지는 컨트롤러에서 정할 것임.
        return userRepository.existsByEmailAndIsDeletedFalse(email);
    }
}

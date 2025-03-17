package com.ttabong.controller.user;

import com.ttabong.config.LoggerConfig;
import com.ttabong.dto.user.*;
import com.ttabong.jwt.JwtProvider;
import com.ttabong.service.user.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Set;

@RestController
@RequestMapping("") //자동 기본값이 /api
public class UserController extends LoggerConfig {

    private final UserService userService;
    private final JwtProvider jwtProvider;

    @Autowired
    public UserController(UserService userService, JwtProvider jwtProvider) {
        this.userService = userService;
        this.jwtProvider = jwtProvider;
    }

    @PostMapping("/user/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest loginRequest) {
        logger.info("1. 유저로그인, <POST> \"/user/login\"");

        if (!Set.of("volunteer", "organization").contains(loginRequest.getUserType())) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(new LoginResponse(400, "잘못된 회원 타입입니다.", null, null, null));
        }


        UserLoginResponseDto loginResult = userService.login(loginRequest);

        if (loginResult.getStatus() != 200) {
            return ResponseEntity.status(loginResult.getStatus())
                    .body(new LoginResponse(
                            loginResult.getStatus(),
                            loginResult.getMessage(),
                            null, null, null
                    ));
        }

        String accessToken = jwtProvider.createToken(loginResult.getUserId().toString(), loginRequest.getUserType());

        return ResponseEntity.ok(new LoginResponse(
                200, "로그인 성공", accessToken, loginResult.getName(), loginResult.getEmail()
        ));
    }


    @PostMapping("/volunteer/register")
    public ResponseEntity<?> registerVolunteer(@RequestBody VolunteerRegisterRequest request) {
        logger.info("2. 봉사자 회원가입, <POST> \"volunteer/register\"");
        boolean isRegistered = userService.registerVolunteer(request);

        if (isRegistered) {
            return ResponseEntity.status(HttpStatus.CREATED).body(new RegisterResponse(201, "봉사자 회원가입이 완료되었습니다."));
        }

        return ResponseEntity.badRequest().body(new RegisterResponse(409, "이미 계정이 존재합니다."));
    }

    @PostMapping("/org/register")
    public ResponseEntity<?> registerOrganization(@RequestBody OrganizationRegisterRequest request) {
        logger.info("3. 기관 회원가입 <POST> \"/org/register\"");
        boolean isRegistered = userService.registerOrganization(request);

        if (isRegistered) {
            return ResponseEntity.status(HttpStatus.CREATED).body(new RegisterResponse(201, "기관 회원가입이 완료되었습니다."));
        }

        return ResponseEntity.badRequest().body(new RegisterResponse(409, "이미 계정이 존재합니다."));
    }

    @GetMapping("/user/check-email")
    public ResponseEntity<EmailCheckResponse> checkEmail(@RequestParam String email, @RequestParam String type) {
        logger.info("4. 이메일 중복가입 <GET> \"/user/check-email\"");
        boolean exists = userService.checkEmail(email, type);
        String message;

        if ("find".equalsIgnoreCase(type)) {
            message = exists ? "해당 이메일이 존재합니다." : "해당 이메일을 찾을 수 없습니다.";
            return ResponseEntity.status(exists ? HttpStatus.OK : HttpStatus.NOT_FOUND)
                    .body(new EmailCheckResponse(exists ? 200 : 404, exists, message));
        } else if ("register".equalsIgnoreCase(type)) {
            message = exists ? "이미 사용 중인 이메일입니다." : "사용 가능한 이메일입니다.";
            return ResponseEntity.status(exists ? HttpStatus.CONFLICT : HttpStatus.OK)
                    .body(new EmailCheckResponse(exists ? 409 : 200, exists, message));
        } else {
            return ResponseEntity.badRequest().body(new EmailCheckResponse(400, false, "잘못된 타입입니다."));
        }
    }


}

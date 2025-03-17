package com.ttabong.test;

import com.ttabong.config.LoggerConfig;
import com.ttabong.dto.user.AuthDto;
import com.ttabong.test.dto.CreatePostRequestDto;
import com.ttabong.test.dto.CreatePostResponseDto;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("test")
@RequiredArgsConstructor
public class TestController extends LoggerConfig {

    private final TestService testService;

    @PostMapping("/startPost/{userId}")
    public ResponseEntity<?> startPost(@PathVariable Integer userId) throws Exception {

        CreatePostResponseDto responseDto = testService.startPostCache(userId);
        return ResponseEntity.ok().body(responseDto);
    }

    @PatchMapping("/endPost/{userId}")
    public ResponseEntity<?> endPost(@PathVariable Integer userId, @RequestBody CreatePostRequestDto createPostRequestDto) throws Exception {

        testService.endPost(createPostRequestDto);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/getImg/{imgId}")
    public ResponseEntity<?> getImg(@PathVariable String imgId) throws Exception {

        return ResponseEntity.ok().body(testService.getImgUrl(imgId));
    }

    @GetMapping("/token")
    public ResponseEntity<?> getToken(@AuthenticationPrincipal AuthDto authDto) throws Exception {

        logger.info(authDto.getUserType() + "유저타입의" + authDto.getUserId() + "유저ID가 토큰을 사용했습니다");

        return ResponseEntity.ok().build();
    }

    @GetMapping("/redis/{time}")
    public ResponseEntity<?> getRedis(@PathVariable Integer time) throws Exception {
        testService.addRedisTTL(time);
        testService.addRedisTTL(time + 10);
        return ResponseEntity.ok().build();
    }
}

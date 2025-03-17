package com.ttabong.controller.recruit;

import com.ttabong.dto.recruit.requestDto.vol.ApplyRecruitRequestDto;
import com.ttabong.dto.recruit.requestDto.vol.DeleteLikesRequestDto;
import com.ttabong.dto.recruit.requestDto.vol.LikeOnRecruitRequestDto;
import com.ttabong.dto.recruit.responseDto.vol.*;
import com.ttabong.dto.user.AuthDto;
import com.ttabong.entity.recruit.Application;
import com.ttabong.service.recruit.VolRecruitService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@Slf4j
@RestController
@RequestMapping("/vol")
public class VolRecruitController {

    private final VolRecruitService volRecruitService;

    @Autowired
    public VolRecruitController(VolRecruitService volRecruitService) {
        this.volRecruitService = volRecruitService;
    }

    // 1. 모집 공고 리스트 조회
    @GetMapping("/templates")
    public ResponseEntity<ReadVolRecruitsListResponseDto> listRecruits(
            @RequestParam(defaultValue = "0") Integer cursor,
            @RequestParam(defaultValue = "10") Integer limit) {
        log.info("1. 모집 공고 리스트 조회 <GET> \"/templates\"");

        ReadVolRecruitsListResponseDto responseDto = volRecruitService.getTemplates(cursor, limit);
        return ResponseEntity.ok().body(responseDto);
    }

    // 2. 특정 모집 공고 상세 조회
    @GetMapping("/templates/{templateId}")
    public ResponseEntity<ReadRecruitDetailResponseDto> recruitsDetail(@PathVariable Integer templateId) {
        log.info("2. 특정 모집 공고 상세 조회 <GET> \"//templates/{templateId}\"");
        ReadRecruitDetailResponseDto responseDto = volRecruitService.getTemplateById(templateId);
        return ResponseEntity.ok(responseDto);
    }

    // 3. 모집 공고 신청
    @PostMapping("/applications")
    public ResponseEntity<ApplyRecruitResponseDto> applyRecruit(
            @RequestBody ApplyRecruitRequestDto applyRecruitRequest) {
        log.info("3. 모집 공고 신청 <POST> \"/applications\"");

        AuthDto authDto = (AuthDto) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        int userId = authDto.getUserId();

        Application application = volRecruitService.applyRecruit(userId, applyRecruitRequest.getRecruitId());

        ApplyRecruitResponseDto responseDto = ApplyRecruitResponseDto.builder()
                .message("신청 완료")
                .application(new ApplyRecruitResponseDto.Application(application.getId(), application.getStatus()))
                .build();

        return ResponseEntity.status(HttpStatus.CREATED).body(responseDto);
    }

    // 4. 공고 신청 취소
    @PatchMapping("/applications/{applicationId}")
    public ResponseEntity<CancelRecruitResponseDto> cancelRecruit(@PathVariable Integer applicationId) {
        log.info("4. 공고 신청 취소 <PATCH> \"//applications/{applicationsId}\"");

        Application application = volRecruitService.cancelRecruitApplication(applicationId);

        CancelRecruitResponseDto responseDto = CancelRecruitResponseDto.builder()
                .message("신청 취소 완료")
                .application(CancelRecruitResponseDto.ApplicationDto.fromEntity(application))
                .build();

        return ResponseEntity.ok().body(responseDto);
    }



    // 5. 신청한 공고 목록 조회
    @GetMapping("/applications/recruits")
    public ResponseEntity<List<MyApplicationsResponseDto>> myApplications(
            @RequestParam(defaultValue = "0") Integer cursor,
            @RequestParam(defaultValue = "10") Integer limit) {
        log.info("5. 신청한 공고 목록 조회 <GET> \"/applications/recruits\"");
        AuthDto authDto = (AuthDto) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        int userId = authDto.getUserId();

        List<MyApplicationsResponseDto> responseDto = volRecruitService.getMyApplications(userId, cursor, limit);
        return ResponseEntity.ok().body(responseDto);
    }

    // 6. 특정 공고 상세 조회
    @GetMapping("/recruits/{recruitId}")
    public ResponseEntity<MyApplicationDetailResponseDto> myApplicationsDetail(@PathVariable Integer recruitId) {
        log.info("6. 특정공고 상세 조회 <GET> \"/recruits/{recruitId}\"");
        AuthDto authDto = (AuthDto) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        int userId = authDto.getUserId();

        return volRecruitService.getRecruitDetail(userId, recruitId)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    // 7. "좋아요"한 템플릿 목록 조회
    @GetMapping("/volunteer-reactions/likes")
    public ResponseEntity<List<LikedRecruitDto>> myLikesOnRecruits(
            @RequestParam(defaultValue = "0") Integer cursor,
            @RequestParam(defaultValue = "10") Integer limit) {
        log.info("7. \"좋아요\"한 템플릿 목록 조회 <GET> \"/volunteer-reactions/likes\"");
        AuthDto authDto = (AuthDto) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        int userId = authDto.getUserId();

        List<LikedRecruitDto> likedRecruits = volRecruitService.getLikedRecruits(userId, cursor, limit);
        return ResponseEntity.ok(likedRecruits);
    }

    // 8. 특정 템플릿 "좋아요" 혹은 "싫어요"하기
    @PostMapping("/volunteer-reactions")
    public ResponseEntity<LikeOnRecruitResponseDto> likeOnRecruit(@RequestBody LikeOnRecruitRequestDto request) {
        log.info("8. 특정 템플릿 \"좋아요\" 혹은 \"싫어요\"하기 <POST> \"volunteer_reactions\"");
        AuthDto authDto = (AuthDto) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        int userId = authDto.getUserId();

        List<Integer> reactionIds = volRecruitService.saveReaction(userId, request.getTemplateId(), request.getIsLike());

        return ResponseEntity.status(HttpStatus.CREATED)
                .body(new LikeOnRecruitResponseDto(reactionIds, request.getIsLike()));
    }

    // 9. "좋아요" 취소
    @PatchMapping("/volunteer-reactions/cancel")
    public ResponseEntity<?> deleteRecruitFromLike(@RequestBody DeleteLikesRequestDto request) {
        volRecruitService.deleteReactions(request.getReactionIds());
        log.info("9. 특 \"좋아요\"목록에서 특정 템플릿 \"좋아요\"취소 <PATCH> \"/volunteer_reactions/cancel\"");
        return ResponseEntity.noContent().build();
    }
}

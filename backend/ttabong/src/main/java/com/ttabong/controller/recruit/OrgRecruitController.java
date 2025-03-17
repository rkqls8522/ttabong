package com.ttabong.controller.recruit;

import com.ttabong.dto.recruit.requestDto.org.*;
import com.ttabong.dto.recruit.responseDto.org.*;
import com.ttabong.dto.user.AuthDto;
import com.ttabong.exception.*;
import com.ttabong.servicejpa.recruit.OrgRecruitService;
import com.ttabong.util.service.CacheService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatusCode;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/org")
@RequiredArgsConstructor
@Slf4j
public class OrgRecruitController {

    private final OrgRecruitService orgRecruitService;
    private final CacheService cacheService;

    @GetMapping("/templates/available")
    public ResponseEntity<ReadAvailableRecruitsResponseDto> readAvailableRecruits(
            @RequestParam(required = false, name = "templateId") Integer cursor,
            @RequestParam(defaultValue = "10", name = "limit") Integer limit,
            @AuthenticationPrincipal AuthDto authDto) {

        log.info("1. 메인페이지 <GET> \"/templates/available\"");
        ReadAvailableRecruitsResponseDto response = orgRecruitService.readAvailableRecruits(cursor, limit, authDto);

        return ResponseEntity.ok().body(response);
    }

    @GetMapping("/recruits")
    public ResponseEntity<ReadMyRecruitsResponseDto> readRecruits(
            @RequestParam(required = false, name = "recruitId") Integer cursor,
            @RequestParam(defaultValue = "10", name = "limit") Integer limit,
            @AuthenticationPrincipal AuthDto authDto) {

        log.info("2. 공고_전체 조회 <GET> \"/recruits\"");
        ReadMyRecruitsResponseDto response = orgRecruitService.readMyRecruits(cursor, limit, authDto);

        return ResponseEntity.ok(response);
    }

    @PatchMapping("/recruits/delete")
    public ResponseEntity<DeleteRecruitsResponseDto> deleteRecruits(
            @RequestBody DeleteRecruitsRequestDto deleteRecruitDto,
            @AuthenticationPrincipal AuthDto authDto) {

        log.info("3. 공고_공고 삭제 <PATCH> \"/recruits/delete\"");
        DeleteRecruitsResponseDto response = orgRecruitService.deleteRecruits(deleteRecruitDto, authDto);

        return ResponseEntity.ok(response);
    }

    @PatchMapping("/recruits/{recruitId}")
    public ResponseEntity<UpdateRecruitsResponseDto> updateRecruit(
            @PathVariable(name = "recruitId") Integer recruitId,
            @RequestBody UpdateRecruitsRequestDto requestDto,
            @AuthenticationPrincipal AuthDto authDto) {

        log.info("4. 공고 _ 공고 수정 <PATCH> \"/recruits/{recruitId}\"");
        UpdateRecruitsResponseDto response = orgRecruitService.updateRecruit(recruitId, requestDto, authDto);

        return ResponseEntity.ok(response);
    }

    @PatchMapping("/recruits/close")
    public ResponseEntity<CloseRecruitResponseDto> closeRecruit(
            @RequestBody CloseRecruitRequestDto closeRecruitDto,
            @AuthenticationPrincipal AuthDto authDto) {

        log.info("5 공고 _ 공고 마감 <PATCH> \"/recruits/{recruitId}\"");
        CloseRecruitResponseDto response = orgRecruitService.closeRecruit(closeRecruitDto, authDto);

        return ResponseEntity.ok().body(response);
    }

    @PatchMapping("/groups")
    public ResponseEntity<UpdateGroupResponseDto> updateGroup(
            @RequestBody UpdateGroupRequestDto updateGroupDto,
            @AuthenticationPrincipal AuthDto authDto) {

        log.info("6 공고 _ 그룹명 수정 <PATCH> \"/groups\"");
        UpdateGroupResponseDto response = orgRecruitService.updateGroup(updateGroupDto, authDto);

        return ResponseEntity.ok().body(response);
    }

    @PostMapping("/templates")
    public ResponseEntity<UpdateTemplateResponse> updateTemplate(
            @RequestBody UpdateTemplateRequestDto updateTemplateDto,
            @AuthenticationPrincipal AuthDto authDto) {

        log.info("7 공고 _ 템플릿 수정 <PATCH> \"/templates\"");
        UpdateTemplateResponse response = orgRecruitService.updateTemplate(updateTemplateDto, authDto);

        return ResponseEntity.ok().body(response);
    }

    @PatchMapping("/templates/delete")
    public ResponseEntity<DeleteTemplatesResponseDto> deleteTemplates(
            @RequestBody DeleteTemplatesRequestDto deleteTemplatesDto,
            @AuthenticationPrincipal AuthDto authDto) {

        log.info("8. 공고 _ 템플릿 삭제 <PATCH> \"/templates/delete\"");
        DeleteTemplatesResponseDto response = orgRecruitService.deleteTemplates(deleteTemplatesDto, authDto);

        return ResponseEntity.ok().body(response);
    }

    @PatchMapping("/groups/delete")
    public ResponseEntity<DeleteGroupResponseDto> deleteGroup(
            @RequestBody DeleteGroupDto deleteGroupDto,
            @AuthenticationPrincipal AuthDto authDto) {

        log.info("9. 공고 _ 그룹 삭제 <PATCH> \"/groups/delete\"");
        DeleteGroupResponseDto response = orgRecruitService.deleteGroup(deleteGroupDto, authDto);

        return ResponseEntity.ok().body(response);
    }

    @GetMapping("/templates")
    public ResponseEntity<ReadTemplatesResponseDto> readTemplates(
            @RequestParam(defaultValue = "0") int cursor,
            @RequestParam(defaultValue = "10") int limit,
            @AuthenticationPrincipal AuthDto authDto) {

        log.info("10 공고 _ 그룹+템플릿 조회 <GET> \"/templates\"");
        ReadTemplatesResponseDto responseDto = orgRecruitService.readTemplatesByGroup(cursor, limit, authDto);

        return ResponseEntity.ok().body(responseDto);
    }

    /*
    @PostMapping(value = "/templates", consumes = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<CreateTemplateResponseDto> createTemplate(
            @RequestBody CreateTemplateRequestDto createTemplateDto,
            @AuthenticationPrincipal AuthDto authDto) {

        logger.info("11 공고 _ 템플릿 생성 <POST> \"/templates\"");
        CreateTemplateResponseDto response = orgRecruitService.createTemplate(createTemplateDto, authDto);

        return ResponseEntity.ok().body(response);
    }
    */
    @GetMapping("/templates/presigned")
    public ResponseEntity<CreateTemplateResponseDto> generatePresignedUrls(@AuthenticationPrincipal AuthDto authDto) {

        log.info("11-1 minio Presigned URL 발급 API <GET> \"/templates/presigned\"");
        List<String> presignedUrls = cacheService.generatePresignedUrlsForTemplate(authDto);

        CreateTemplateResponseDto response = CreateTemplateResponseDto.builder()
                .message("Presigned URL 생성 완료")
                .images(presignedUrls)
                .build();

        return ResponseEntity.ok().body(response);
    }

    @PostMapping("/groups")
    public ResponseEntity<CreateGroupResponseDto> createGroup(
            @RequestBody CreateGroupRequestDto createGroupDto,
            @AuthenticationPrincipal AuthDto authDto) {

        log.info("12. 공고 _ 그룹 생성 <POST> \"/groups\"");
        CreateGroupResponseDto response = orgRecruitService.createGroup(createGroupDto, authDto);

        return ResponseEntity.ok().body(response);
    }

    @PostMapping("/recruits")
    public ResponseEntity<CreateRecruitResponseDto> createRecruit(
            @RequestBody CreateRecruitRequestDto createRecruitDto,
            @AuthenticationPrincipal AuthDto authDto) {

        log.info("13. 공고 _ 공고 생성 <POST> \"/recruits\"");
        CreateRecruitResponseDto response = orgRecruitService.createRecruit(createRecruitDto, authDto);

        return ResponseEntity.ok().body(response);
    }

    @GetMapping("/recruits/{recruitId}")
    public ResponseEntity<ReadRecruitResponseDto> readRecruit(
            @PathVariable(name = "recruitId") Integer recruitId,
            @AuthenticationPrincipal AuthDto authDto) {

        log.info("14. 공고_상세조회 <POST> \"/recruits/{recruitId}\"");
        ReadRecruitResponseDto response = orgRecruitService.readRecruit(recruitId, authDto);

        return ResponseEntity.ok().body(response);
    }

    @GetMapping("/recruits/{recruitId}/applications")
    public ResponseEntity<ReadApplicationsResponseDto> readApplications(
            @PathVariable(name = "recruitId") Integer recruitId,
            @AuthenticationPrincipal AuthDto authDto) {

        log.info("15. 공고, 봉사자 관리_지원자 조회 <GET> \"/recruits/{recruitId}/applications\"");
        ReadApplicationsResponseDto response = orgRecruitService.readApplications(recruitId, authDto);

        return ResponseEntity.ok().body(response);
    }

    @PatchMapping("/applications/status")
    public ResponseEntity<UpdateApplicationsResponseDto> updateStatuses(
            @RequestBody UpdateApplicationsRequestDto updateApplicationDto,
            @AuthenticationPrincipal AuthDto authDto) {

        log.info("16. 봉사자 관리 _ 봉사자 수락/거절 <PATCH> \"/applications/status\"");
        UpdateApplicationsResponseDto response = orgRecruitService.updateStatuses(updateApplicationDto, authDto);

        return ResponseEntity.ok().body(response);
    }

    @PatchMapping("/recruits/{recruitId}/applications/evaluate")
    public ResponseEntity<List<EvaluateApplicationsResponseDto>> evaluateApplicants(
            @PathVariable(name = "recruitId") Integer recruitId,
            @RequestBody List<EvaluateApplicationsRequestDto> evaluateApplicationDtoList,
            @AuthenticationPrincipal AuthDto authDto) {

        log.info("17. 봉사자 관리 _ 봉사자 수락/거절 <PATCH> \"/recruits/{recruitId}/applications/evaluate\"");
        List<EvaluateApplicationsResponseDto> response = orgRecruitService.evaluateApplicants(recruitId, evaluateApplicationDtoList, authDto);

        return ResponseEntity.ok().body(response);
    }

    @ExceptionHandler(UnauthorizedException.class)
    public ResponseEntity<String> handleUnauthorizedException(UnauthorizedException e) {
        return ResponseEntity.status(HttpStatusCode.valueOf(403)).body(e.getMessage());
    }

    @ExceptionHandler(NotFoundException.class)
    public ResponseEntity<String> handleNotFoundException(NotFoundException e) {
        return ResponseEntity.status(HttpStatusCode.valueOf(404)).body(e.getMessage());
    }

    @ExceptionHandler(BadRequestException.class)
    public ResponseEntity<String> handleBadRequestException(BadRequestException e) {
        return ResponseEntity.status(HttpStatusCode.valueOf(400)).body(e.getMessage());
    }

    @ExceptionHandler(ImageProcessException.class)
    public ResponseEntity<String> handleImageProcessException(ImageProcessException e) {
        return ResponseEntity.status(HttpStatusCode.valueOf(555)).body(e.getMessage());
    }

    @ExceptionHandler(ForbiddenException.class)
    public ResponseEntity<String> handleForbiddenException(ForbiddenException e) {
        return ResponseEntity.status(HttpStatusCode.valueOf(403)).body(e.getMessage());
    }
}

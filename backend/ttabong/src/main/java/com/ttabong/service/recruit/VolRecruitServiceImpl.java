package com.ttabong.service.recruit;

import com.ttabong.dto.recruit.responseDto.vol.*;
import com.ttabong.dto.user.OrganizationDto;
import com.ttabong.entity.recruit.Application;
import com.ttabong.entity.recruit.Recruit;
import com.ttabong.entity.recruit.Template;
import com.ttabong.entity.recruit.VolunteerReaction;
import com.ttabong.entity.user.Volunteer;
import com.ttabong.exception.ConflictException;
import com.ttabong.exception.NotFoundException;
import com.ttabong.repository.recruit.ApplicationRepository;
import com.ttabong.repository.recruit.RecruitRepository;
import com.ttabong.repository.recruit.TemplateRepository;
import com.ttabong.repository.recruit.VolunteerReactionRepository;
import com.ttabong.repository.user.VolunteerRepository;
import com.ttabong.util.ImageUtil;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.*;
import java.util.stream.Collectors;

@RequiredArgsConstructor
@Service
@Slf4j
public class VolRecruitServiceImpl implements VolRecruitService {

    private final RecruitRepository recruitRepository;
    private final TemplateRepository templateRepository;
    private final VolunteerRepository volunteerRepository;
    private final ApplicationRepository applicationRepository;
    private final VolunteerReactionRepository volunteerReactionRepository;
    private final ImageUtil imageUtil;


    // 1. 모집 공고 리스트 조회
    @Override
    public ReadVolRecruitsListResponseDto getTemplates(Integer cursor, Integer limit) {
        List<Template> templates = templateRepository.findTemplatesAfterCursor(cursor, limit);

        List<ReadVolRecruitsListResponseDto.TemplateWrapper> templateDetails = templates.stream()
                .map(template -> {
                    TemplatePreviewDto previewDto = TemplatePreviewDto.from(template);
                    if (previewDto.getImageId() != null) {
                        try {
                            previewDto.setImageId(imageUtil.getPresignedDownloadUrl(previewDto.getImageId()));
                        } catch (Exception e) {
                            log.info("이미지 다운로드 링크 생성 오류 발생");
                            throw new RuntimeException("이미지 URL 생성 오류", e);
                        }
                    }
                    return new ReadVolRecruitsListResponseDto.TemplateWrapper(
                            previewDto,
                            GroupDto.from(template.getGroup()),
                            template.getOrg() != null ? OrganizationDto.from(template.getOrg()) : null
                    );
                })
                .collect(Collectors.toList());

        return new ReadVolRecruitsListResponseDto(templateDetails);
    }

    // 2. 특정 모집 템플릿 상세 조회
    @Override
    public ReadRecruitDetailResponseDto getTemplateById(Integer templateId) {
        ReadRecruitDetailResponseDto dto = templateRepository.findByIdAndIsDeletedFalse(templateId)
                .map(ReadRecruitDetailResponseDto::from)
                .orElseThrow(() -> new NotFoundException("해당 템플릿을 찾을 수 없습니다."));

        List<String> updatedImages = dto.getTemplate().getImages().stream()
                .map(url -> {
                    try {
                        return imageUtil.getPresignedDownloadUrl(url);
                    } catch (Exception e) {
                        log.info("이미지 다운로드 링크 생성 오류 발생");
                        throw new RuntimeException("이미지 URL 생성 오류", e);
                    }
                })
                .collect(Collectors.toList());
        dto.getTemplate().setImages(updatedImages);

        return dto;
    }

    // 3. 모집 공고 신청
    @Override
    public Application applyRecruit(int userId, int recruitId) {

        if (applicationRepository.existsByVolunteerUserIdAndRecruitId(userId, recruitId)) {
            throw new ConflictException("이미 신청한 모집 공고입니다.");
        }

        Volunteer volunteer = volunteerRepository.findByUserIdAndUserIsDeletedFalse(userId)
                .orElseThrow(() -> new NotFoundException("봉사자를 찾을 수 없습니다."));

        Recruit recruit = recruitRepository.findByIdAndIsDeletedFalse(recruitId)
                .orElseThrow(() -> new NotFoundException("봉사 공고를 찾을 수 없습니다."));


        Application application = Application.builder()
                .volunteer(volunteer)
                .recruit(recruit)
                .status("PENDING")
                .evaluationDone(false)
                .isDeleted(false)
                .createdAt(Instant.now())
                .build();

        return applicationRepository.save(application);
    }

    // 4. 공고 신청 취소
    @Override
    public Application cancelRecruitApplication(Integer applicationId) {
        Application application = applicationRepository.findByIdAndIsDeletedFalse(applicationId)
                .orElseThrow(() -> new NotFoundException("신청 내역을 찾을 수 없습니다."));

        if (!"PENDING".equals(application.getStatus())) {
            throw new ConflictException("신청 취소는 PENDING 상태에서만 가능합니다.");
        }

        application.setIsDeleted(true);
        applicationRepository.save(application);
        return application;
    }

    // 5. 신청한 공고 목록 조회
    @Override
    public List<MyApplicationsResponseDto> getMyApplications(Integer userId, Integer cursor, Integer limit) {
        List<Application> applications = applicationRepository.findApplicationsByUserId(userId, cursor, limit);

        List<MyApplicationsResponseDto> dtos = applications.stream()
                .map(MyApplicationsResponseDto::from)
                .collect(Collectors.toList());

        dtos.forEach(dto -> {
            if (dto.getTemplate() != null && dto.getTemplate().getImageId() != null) {
                try {
                    dto.getTemplate().setImageId(imageUtil.getPresignedDownloadUrl(dto.getTemplate().getImageId()));
                } catch (Exception e) {
                    log.info("이미지 다운로드 링크 생성 오류 발생");
                    throw new RuntimeException("이미지 URL 생성 오류", e);
                }
            }
        });
        return dtos;
    }

    // 6. 특정 공고 상세 조회 : 이미지 최신순으로 리스트로 반환
    @Override
    public Optional<MyApplicationDetailResponseDto> getRecruitDetail(Integer userId, Integer recruitId) {
        Recruit recruit = recruitRepository.findByIdAndIsDeletedFalse(recruitId)
                .orElseThrow(() -> new NotFoundException("해당 봉사 공고를 찾을 수 없습니다."));

        Optional<Application> application = applicationRepository.findApplicationByRecruitAndUser(recruitId, userId);

        MyApplicationDetailResponseDto detailDto = MyApplicationDetailResponseDto.from(recruit, application.orElse(null));

        List<String> updatedImages = detailDto.getTemplate().getImages().stream()
                .map(imageUrl -> {
                    try {
                        return imageUtil.getPresignedDownloadUrl(imageUrl);
                    } catch (Exception e) {
                        log.info("이미지 다운로드 링크 생성 오류 발생");
                        throw new RuntimeException("이미지 URL 생성 오류", e);
                    }
                })
                .collect(Collectors.toList());
        detailDto.getTemplate().setImages(updatedImages);

        return Optional.of(detailDto);
    }


    // 7. "좋아요"한 공고 목록 조회.(템플릿 조회에서 공고 조회로 변경)
    // cursor는 volunteer_reaction테이블에 적용하고, limit은 template기준으로 적용함.
    @Override
    public List<LikedRecruitDto> getLikedRecruits(Integer userId, Integer cursor, Integer limit) {
        // 봉사자 정보 조회
        Volunteer volunteer = volunteerRepository.findByUserIdAndUserIsDeletedFalse(userId)
                .orElseThrow(() -> new NotFoundException("봉사자를 찾을 수 없습니다."));


        // VolunteerReaction 테이블에서 좋아요한 기록 조회 (내림차순, cursor 적용)
        List<VolunteerReaction> likedReactions = volunteerReactionRepository.findLikedReactions(volunteer, cursor, limit);

        return likedReactions.stream()
                .map(vr -> new LikedRecruitDto(
                        vr.getId(),
                        vr.getCreatedAt(),
                        ReactionRecruitDto.fromRecruit(vr.getRecruit())
                ))
                .collect(Collectors.toList());
    }



    // 8. 특정 템플릿 "좋아요" 혹은 "싫어요"하기
    @Override
    public List<Integer> saveReaction(Integer userId, Integer templateId, Boolean isLike) {
        Volunteer volunteer = volunteerRepository.findByUserIdAndUserIsDeletedFalse(userId)
                .orElseThrow(() -> new NotFoundException("봉사자를 찾을 수 없습니다."));

        Template template = templateRepository.findByIdAndIsDeletedFalse(templateId)
                .orElseThrow(() -> new NotFoundException("해당 템플릿이 존재하지 않습니다."));

        List<Recruit> recruits = recruitRepository.findByTemplateAndIsDeletedFalse(template);

        // 해당 템플릿을 참조하는 공고가 없으면 아무 작업도 하지 않음.
        if (recruits.isEmpty()) {
            return Collections.emptyList();
        }

        //기존에 리액션을 했었는가?
        boolean exists = volunteerReactionRepository.existsByVolunteerAndRecruitTemplate(volunteer, template);
        if (exists) { //그렇다면 소프트삭제
            volunteerReactionRepository.softDeleteByVolunteerAndTemplate(volunteer, template);
        }

        List<VolunteerReaction> newReactions = recruits.stream()
                .map(recruit -> VolunteerReaction.builder()
                        .volunteer(volunteer)
                        .recruit(recruit)
                        .isLike(isLike)
                        .isDeleted(false)
                        .createdAt(Instant.now())
                        .build())
                .toList();

        return volunteerReactionRepository.saveAll(newReactions).stream()
                .map(VolunteerReaction::getId)
                .toList();
    }


    // 9. "좋아요" 취소
    @Override
    public void deleteReactions(List<Integer> reactionIds) {
        if (reactionIds != null && !reactionIds.isEmpty()) {
            int updatedCount = volunteerReactionRepository.softDeleteByIds(reactionIds);
            if (updatedCount == 0) {
                throw new NotFoundException("해당 ID의 좋아요가 존재하지 않습니다.");
            }
        }
    }

}

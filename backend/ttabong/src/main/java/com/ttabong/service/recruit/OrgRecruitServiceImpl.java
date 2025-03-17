package com.ttabong.service.recruit;

import com.ttabong.dto.recruit.requestDto.org.*;
import com.ttabong.dto.recruit.responseDto.org.*;
import com.ttabong.dto.user.AuthDto;
import com.ttabong.entity.recruit.*;
import com.ttabong.entity.user.Organization;
import com.ttabong.exception.*;
import com.ttabong.repository.recruit.*;
import com.ttabong.repository.user.OrganizationRepository;
import com.ttabong.repository.user.VolunteerRepository;
import com.ttabong.servicejpa.recruit.OrgRecruitService;
import com.ttabong.util.CacheUtil;
import com.ttabong.util.DateTimeUtil;
import com.ttabong.util.ImageUtil;
import com.ttabong.util.service.ImageService;
import io.minio.MinioClient;
import io.minio.StatObjectArgs;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.time.temporal.ChronoUnit;
import java.util.*;
import java.util.stream.Collectors;

@RequiredArgsConstructor
@Transactional
@Slf4j
public class OrgRecruitServiceImpl implements OrgRecruitService {

    private final RecruitRepository recruitRepository;
    private final TemplateRepository templateRepository;
    private final TemplateGroupRepository templateGroupRepository;
    private final OrganizationRepository organizationRepository;
    private final CategoryRepository categoryRepository;
    private final ApplicationRepository applicationRepository;
    private final VolunteerRepository volunteerRepository;
    private final ImageService imageService;
    private final ImageUtil imageUtil;
    private final CacheUtil cacheUtil;
    private final MinioClient minioClient;

    public void checkOrgToken(AuthDto authDto) {
        if (authDto == null || authDto.getUserId() == null) {
            throw new UnauthorizedException("로그인이 필요합니다.");
        } else if (!"organization".equalsIgnoreCase(authDto.getUserType())) {
            throw new ForbiddenException("기관 계정으로 로그인을 해야 합니다.");
        }
    }

    @Transactional(readOnly = true)
    public ReadAvailableRecruitsResponseDto readAvailableRecruits(Integer cursor, Integer limit, AuthDto authDto) {

        checkOrgToken(authDto);

        try {

            if (cursor == null || cursor == 0) {
                cursor = Integer.MAX_VALUE;
            }
            if (limit == null || limit == 0) {
                limit = 10;
            }

            List<Template> templates = templateRepository.findAvailableTemplates(cursor, authDto.getUserId(), PageRequest.of(0, limit));

            if (templates.isEmpty()) {
                return ReadAvailableRecruitsResponseDto.builder()
                        .templates(List.of())
                        .build();
            }

            Map<Integer, List<Recruit>> recruitMap = templates.stream()
                    .collect(Collectors.toMap(
                            Template::getId,
                            template -> {
                                try {
                                    List<Recruit> recruits = recruitRepository.findByTemplateId(template.getId());
                                    return recruits;
                                } catch (Exception e) {
                                    return List.of();
                                }
                            }
                    ));

            List<ReadAvailableRecruitsResponseDto.TemplateDetail> templateDetails = templates.stream().map(template -> {
                ReadAvailableRecruitsResponseDto.Group groupInfo = template.getGroup() != null ?
                        new ReadAvailableRecruitsResponseDto.Group(
                                template.getGroup().getId(),
                                template.getGroup().getGroupName()
                        ) : new ReadAvailableRecruitsResponseDto.Group(1, "봉사");

                List<Recruit> recruitEntities = recruitMap.getOrDefault(template.getId(), List.of());
                List<ReadAvailableRecruitsResponseDto.Recruit> recruits = recruitEntities.stream()
                        .map(recruit -> ReadAvailableRecruitsResponseDto.Recruit.builder()
                                .recruitId(recruit.getId())
                                .deadline(Optional.ofNullable(recruit.getDeadline())
                                        .map(d -> d.atZone(ZoneId.systemDefault()).toLocalDateTime())
                                        .orElse(null))
                                .activityDate(Optional.ofNullable(recruit.getActivityDate())
                                        .orElse(new Date()))
                                .activityStart(recruit.getActivityStart() != null ? recruit.getActivityStart() : BigDecimal.valueOf(10.00))
                                .activityEnd(recruit.getActivityEnd() != null ? recruit.getActivityEnd() : BigDecimal.valueOf(12.00))
                                .maxVolunteer(recruit.getMaxVolunteer())
                                .participateVolCount(applicationRepository.countByRecruitIdAndStatusNotInAndIsDeletedFalse(
                                        recruit.getId(), List.of("PENDING", "REJECTED")
                                ))
                                .status(recruit.getStatus())
                                .updatedAt(Optional.ofNullable(recruit.getUpdatedAt())
                                        .map(d -> d.atZone(ZoneId.systemDefault()).toLocalDateTime())
                                        .orElse(LocalDateTime.now()))
                                .createdAt(Optional.ofNullable(recruit.getCreatedAt())
                                        .map(d -> d.atZone(ZoneId.systemDefault()).toLocalDateTime())
                                        .orElse(LocalDateTime.now()))
                                .build())
                        .collect(Collectors.toList());

                return ReadAvailableRecruitsResponseDto.TemplateDetail.builder()
                        .template(ReadAvailableRecruitsResponseDto.Template.builder()
                                .templateId(template.getId())
                                .categoryId(template.getCategory() != null ? template.getCategory().getId() : null)
                                .title(template.getTitle())
                                .activityLocation(template.getActivityLocation())
                                .status(template.getStatus())
                                .imageUrl(imageService.getImageUrls(template.getId(), true).get(0))
                                .contactName(template.getContactName())
                                .contactPhone(template.getContactPhone())
                                .description(template.getDescription())
                                .createdAt(DateTimeUtil.convertToLocalDateTime(template.getCreatedAt()))
                                .build())
                        .group(groupInfo)
                        .recruits(recruits)
                        .build();
            }).toList();

            return ReadAvailableRecruitsResponseDto.builder()
                    .templates(templateDetails)
                    .build();
        } catch (NotFoundException e) {
            throw e;
        } catch (Exception e) {
            throw new IllegalStateException("토큰이 올바르지 않습니다", e);
        }
    }

    @Override
    @Transactional(readOnly = true)
    public ReadMyRecruitsResponseDto readMyRecruits(Integer cursor, Integer limit, AuthDto authDto) {

        checkOrgToken(authDto);

        if (cursor == null) {
            cursor = Integer.MAX_VALUE;
        }

        Pageable pageable = PageRequest.of(0, limit, Sort.by(Sort.Direction.DESC, "id"));

        List<Recruit> recruits = recruitRepository.findAvailableRecruits(cursor, authDto.getUserId(), pageable);

        if (recruits.isEmpty()) {
            throw new NotFoundException("활성화된 모집 공고가 없습니다.");
        }

        List<ReadMyRecruitsResponseDto.RecruitDetail> recruitDetails = recruits.stream().map(recruit -> {
            Template template = recruit.getTemplate();
            TemplateGroup templateGroup = template.getGroup();

            ReadMyRecruitsResponseDto.Group group = templateGroup != null ?
                    ReadMyRecruitsResponseDto.Group.builder()
                            .groupId(templateGroup.getId())
                            .groupName(templateGroup.getGroupName())
                            .build()
                    : null;

            ReadMyRecruitsResponseDto.Template dtoTemplate = ReadMyRecruitsResponseDto.Template.builder()
                    .templateId(template.getId())
                    .title(template.getTitle())
                    .build();

            ReadMyRecruitsResponseDto.Recruit dtoRecruit = ReadMyRecruitsResponseDto.Recruit.builder()
                    .recruitId(recruit.getId())
                    .status(recruit.getStatus())
                    .maxVolunteer(recruit.getMaxVolunteer())
                    .participateVolCount(applicationRepository.countByRecruitIdAndStatusNotInAndIsDeletedFalse(
                            recruit.getId(), List.of("PENDING", "REJECTED")
                    ))
                    .activityDate(recruit.getActivityDate() != null ? recruit.getActivityDate() : new Date())
                    .activityStart(recruit.getActivityStart() != null ? recruit.getActivityStart() : BigDecimal.valueOf(10.00))
                    .activityEnd(recruit.getActivityEnd() != null ? recruit.getActivityEnd() : BigDecimal.valueOf(12.00))
                    .deadline(recruit.getDeadline() != null ?
                            recruit.getDeadline().atZone(ZoneId.systemDefault()).toLocalDateTime()
                            : LocalDateTime.now())
                    .createdAt(recruit.getCreatedAt() != null ?
                            recruit.getCreatedAt().atZone(ZoneId.systemDefault()).toLocalDateTime()
                            : LocalDateTime.now())
                    .build();

            return ReadMyRecruitsResponseDto.RecruitDetail.builder()
                    .group(group)
                    .template(dtoTemplate)
                    .recruit(dtoRecruit)
                    .build();
        }).collect(Collectors.toList());

        return ReadMyRecruitsResponseDto.builder()
                .recruits(recruitDetails)
                .build();
    }

    @Override
    public DeleteRecruitsResponseDto deleteRecruits(DeleteRecruitsRequestDto deleteRecruitDto, AuthDto authDto) {

        checkOrgToken(authDto);

        List<Integer> recruitIds = deleteRecruitDto.getDeletedRecruits();

        int deletedCount = recruitRepository.markAsDeleted(recruitIds, authDto.getUserId());

        if (deletedCount == 0) {
            throw new NotFoundException("삭제할 수 있는 공고가 없습니다. 이미 삭제되었거나 권한이 없습니다.");
        }

        return DeleteRecruitsResponseDto.builder()
                .message("공고 삭제 완료")
                .deletedRecruits(recruitIds)
                .build();
    }

    @Override
    public UpdateRecruitsResponseDto updateRecruit(Integer recruitId, UpdateRecruitsRequestDto requestDto, AuthDto authDto) {

        checkOrgToken(authDto);

        Recruit recruit = recruitRepository.findByIdAndIsDeletedFalse(recruitId)
                .orElseThrow(() -> new NotFoundException("해당 공고가 존재하지 않습니다. recruitId: " + recruitId));

        if (Boolean.TRUE.equals(recruit.getIsDeleted())) {
            throw new NotFoundException("해당 공고는 삭제되었습니다. recruitId: " + recruitId);
        }

        Instant deadlineInstant = requestDto.getDeadline() != null
                ? requestDto.getDeadline().atZone(ZoneId.systemDefault()).toInstant()
                : Instant.now();

        Date activityDate = requestDto.getActivityDate() != null
                ? new java.sql.Date(requestDto.getActivityDate().getTime())
                : new java.sql.Date(System.currentTimeMillis());

        recruit = recruitRepository.updateRecruit(
                recruitId,
                deadlineInstant,
                activityDate,
                requestDto.getActivityStart() != null ? requestDto.getActivityStart() : BigDecimal.valueOf(10.00),
                requestDto.getActivityEnd() != null ? requestDto.getActivityEnd() : BigDecimal.valueOf(12.00),
                requestDto.getMaxVolunteer()
        );

        cacheUtil.addCompleteEventScheduler(recruitId, getMinutesToCompleteEvent(recruit));
        cacheUtil.addDeadlineEventScheduler(recruitId, getMinutesToDeadlineEvent(recruit));

        return UpdateRecruitsResponseDto.builder()
                .message("공고 수정 완료")
                .recruitId(recruitId)
                .build();
    }


    @Override
    public CloseRecruitResponseDto closeRecruit(CloseRecruitRequestDto closeRecruitDto, AuthDto authDto) {

        checkOrgToken(authDto);

        Integer recruitId = closeRecruitDto.getRecruitId();

        Optional<Recruit> optionalRecruit = recruitRepository.findById(recruitId);

        if (optionalRecruit.isEmpty()) {
            throw new NotFoundException("해당 공고를 찾을 수 없습니다.");
        }

        Recruit recruit = optionalRecruit.get();

        Integer recruitOrgId = recruit.getTemplate().getOrg().getId();
        Integer userOrgId = organizationRepository.findByUserId(authDto.getUserId())
                .orElseThrow(() -> new NotFoundException("해당 사용자의 기관 정보를 찾을 수 없습니다."))
                .getId();

        if (!recruitOrgId.equals(userOrgId)) {
            throw new ForbiddenException("해당 공고를 마감할 권한이 없습니다.");
        }
        recruitRepository.closeRecruit(recruitId);
        cacheUtil.removeDeadlineSchedule(recruitId);

        return CloseRecruitResponseDto.builder()
                .message("공고 마감 완료")
                .recruitId(recruitId)
                .build();
    }

    @Override
    public UpdateGroupResponseDto updateGroup(UpdateGroupRequestDto updateGroupDto, AuthDto authDto) {

        checkOrgToken(authDto);

        Organization userOrg = organizationRepository.findByUserId(authDto.getUserId())
                .orElseThrow(() -> new NotFoundException("해당 사용자의 기관 정보를 찾을 수 없습니다."));

        TemplateGroup templateGroup = templateGroupRepository.findByIdAndIsDeletedFalse(updateGroupDto.getGroupId())
                .orElseThrow(() -> new NotFoundException("해당 그룹을 찾을 수 없습니다."));

        if (!templateGroup.getOrg().getId().equals(userOrg.getId())) {
            throw new UnauthorizedException("이 그룹을 수정할 권한이 없습니다.");
        }

        if (!templateGroup.getGroupName().equals(updateGroupDto.getGroupName())) {
            boolean exists = templateGroupRepository.existsByOrgAndGroupNameAndIsDeletedFalse(userOrg, updateGroupDto.getGroupName());
            if (exists) {
                throw new NotFoundException("이미 존재하는 그룹명입니다: " + updateGroupDto.getGroupName());
            }
        }

        templateGroupRepository.updateGroup(updateGroupDto.getGroupId(), userOrg.getId(), updateGroupDto.getGroupName());

        return UpdateGroupResponseDto.builder()
                .message("수정 성공")
                .groupId(updateGroupDto.getGroupId())
                .orgId(userOrg.getId())
                .build();
    }


    @Override
    public UpdateTemplateResponse updateTemplate(UpdateTemplateRequestDto updateTemplateDto, AuthDto authDto) {

        checkOrgToken(authDto);

        Organization userOrg = organizationRepository.findByUserId(authDto.getUserId())
                .orElseThrow(() -> new NotFoundException("해당 사용자의 기관 정보를 찾을 수 없습니다."));
        Template template = templateRepository.findById(updateTemplateDto.getTemplateId())
                .orElseThrow(() -> new NotFoundException("해당 템플릿을 찾을 수 없습니다."));

        if (!template.getOrg().getId().equals(userOrg.getId())) {
            throw new UnauthorizedException("이 템플릿을 수정할 권한이 없습니다.");
        }

        templateRepository.updateTemplate(updateTemplateDto.getTemplateId(), userOrg.getId(),
                updateTemplateDto.getTitle(), updateTemplateDto.getDescription(),
                updateTemplateDto.getActivityLocation(), updateTemplateDto.getContactName(),
                updateTemplateDto.getContactPhone());

        return UpdateTemplateResponse.builder()
                .message("템플릿 수정 성공")
                .templateId(updateTemplateDto.getTemplateId())
                .orgId(userOrg.getId())
                .build();
    }

    @Override
    public DeleteTemplatesResponseDto deleteTemplates(DeleteTemplatesRequestDto deleteTemplatesDto, AuthDto authDto) {

        checkOrgToken(authDto);

        Organization userOrg = organizationRepository.findByUserId(authDto.getUserId())
                .orElseThrow(() -> new NotFoundException("해당 사용자의 기관 정보를 찾을 수 없습니다."));

        List<Integer> deleteTemplateIds = deleteTemplatesDto.getDeletedTemplates();
        List<Template> templatesToDelete = templateRepository.findByIdsAndOrgId(deleteTemplateIds, userOrg.getId());

        if (templatesToDelete.isEmpty()) {
            throw new NotFoundException("삭제할 수 있는 템플릿이 없습니다.");
        }

        templateRepository.deleteTemplates(templatesToDelete.stream().map(Template::getId).toList(), authDto.getUserId());

        return DeleteTemplatesResponseDto.builder()
                .message("템플릿 삭제 성공")
                .deletedTemplates(templatesToDelete.stream().map(Template::getId).toList())
                .build();
    }

    @Override
    public DeleteGroupResponseDto deleteGroup(DeleteGroupDto deleteGroupDto, AuthDto authDto) {

        checkOrgToken(authDto);

        Organization userOrg = organizationRepository.findByUserId(authDto.getUserId())
                .orElseThrow(() -> new NotFoundException("해당 기관이 없습니다."));

        Integer groupId = deleteGroupDto.getGroupId();

        TemplateGroup groupToDelete = templateGroupRepository.findById(groupId)
                .orElseThrow(() -> new NotFoundException("해당 그룹을 찾을 수 없습니다. groupId: " + groupId));

        if (Boolean.TRUE.equals(groupToDelete.getIsDeleted())) {
            throw new NotFoundException("해당 그룹은 이미 삭제되었습니다. groupId: " + groupId);
        }

        if (!groupToDelete.getOrg().getId().equals(userOrg.getId())) {
            throw new ForbiddenException("해당 그룹을 삭제할 권한이 없습니다. groupId: " + groupId);
        }

        groupToDelete.markDeleted();
        templateGroupRepository.save(groupToDelete);

        return DeleteGroupResponseDto.builder()
                .message("삭제 성공")
                .groupId(groupId)
                .orgId(userOrg.getId())
                .build();
    }

    @Transactional(readOnly = true)
    public ReadTemplatesResponseDto readTemplatesByGroup(Integer cursor, Integer limit, AuthDto authDto) {

        Pageable pageable = PageRequest.of(cursor, limit);
        List<TemplateGroup> groups = templateGroupRepository.findGroups(pageable);

        List<ReadTemplatesResponseDto.GroupDto> groupDtos = groups.stream()
                .map(group -> ReadTemplatesResponseDto.GroupDto.builder()
                        .groupId(group.getId())
                        .groupName(group.getGroupName())
                        .templates(
                                templateRepository.findTemplatesByGroupId(group.getId()).stream()
                                        .map(template -> {
                                            List<String> imageUrls = imageService.getImageUrls(template.getId(), true);

                                            return ReadTemplatesResponseDto.TemplateDto.builder()
                                                    .templateId(template.getId())
                                                    .orgId(template.getOrg().getId())
                                                    .categoryId(template.getCategory() != null ? template.getCategory().getId() : null)
                                                    .title(template.getTitle())
                                                    .activityLocation(template.getActivityLocation())
                                                    .status(template.getStatus())
                                                    .images(imageUrls)
                                                    .contactName(template.getContactName())
                                                    .contactPhone(template.getContactPhone())
                                                    .description(template.getDescription())
                                                    .createdAt(template.getCreatedAt() != null
                                                            ? LocalDateTime.ofInstant(template.getCreatedAt(), ZoneId.systemDefault())
                                                            : LocalDateTime.now())
                                                    .build();
                                        }).collect(Collectors.toList())
                        )
                        .build()
                ).collect(Collectors.toList());

        return ReadTemplatesResponseDto.builder()
                .groups(groupDtos)
                .build();
    }


    //@Override
    public CreateTemplateResponseDto createTemplate(CreateTemplateRequestDto createTemplateDto, AuthDto authDto) {

        checkOrgToken(authDto);

        if (createTemplateDto.getImageCount() != null && createTemplateDto.getImageCount() > 10) {
            throw new ImageProcessException("최대 개수를 초과했습니다. 최대 " + 10 + "개까지 업로드할 수 있습니다.");
        }

        Organization organization = organizationRepository.findByUserId(authDto.getUserId())
                .orElseThrow(() -> new NotFoundException("해당 유저의 기관 정보 없음"));
        TemplateGroup group = templateGroupRepository.findByIdAndIsDeletedFalse(createTemplateDto.getGroupId())
                .orElseThrow(() -> new NotFoundException("해당 그룹 없음"));
        Category category = categoryRepository.findById(createTemplateDto.getCategoryId())
                .orElseThrow(() -> new NotFoundException("해당 카테고리 없음"));

        Template savedTemplate = templateRepository.save(Template.builder()
                .group(group)
                .org(organization)
                .category(category)
                .title(createTemplateDto.getTitle())
                .activityLocation(createTemplateDto.getActivityLocation())
                .status(createTemplateDto.getStatus())
                .contactName(createTemplateDto.getContactName())
                .contactPhone(createTemplateDto.getContactPhone())
                .description(createTemplateDto.getDescription())
                .isDeleted(false)
                .createdAt(Instant.now())
                .build());

        List<String> uploadedPaths = new ArrayList<>();
        if (createTemplateDto.getImages() != null && !createTemplateDto.getImages().isEmpty()) {
            uploadedPaths = imageService.uploadTemplateImages(savedTemplate.getId(), createTemplateDto.getImages());
        }

        List<String> verifiedPaths = new ArrayList<>();
        for (String imagePath : uploadedPaths) {
            try {
                minioClient.statObject(
                        StatObjectArgs.builder()
                                .bucket("ttabong-bucket")
                                .object(imagePath)
                                .build()
                );
                verifiedPaths.add(imagePath);
            } catch (Exception e) {
                throw new ImageProcessException("MinIO에 이미지 저장 실패(해당 파일 없음): " + imagePath, e);
            }
        }

        if (!verifiedPaths.isEmpty()) {
            imageService.updateThumbnailImage(savedTemplate.getId(), true);
        }

        List<String> presignedUrls = verifiedPaths.stream()
                .map(imagePath -> {
                    try {
                        return imageUtil.getPresignedDownloadUrl(imagePath);
                    } catch (Exception e) {
                        System.err.println("Presigned URL 생성 실패: " + imagePath);
                        return null;
                    }
                })
                .filter(Objects::nonNull)
                .collect(Collectors.toList());


        return CreateTemplateResponseDto.builder()
                .message("템플릿 생성 성공")
                .templateId(savedTemplate.getId())
                .imageUrl(presignedUrls.stream().findFirst().orElse(null))
                .images(presignedUrls)
                .build();
    }


    // TODO: 봉사 그룹의 디폴트 이름을 봉사 그룹 개수를 세어서 만들어보자(중복되지 않도록)
    @Override
    public CreateGroupResponseDto createGroup(CreateGroupRequestDto createGroupDto, AuthDto authDto) {

        checkOrgToken(authDto);

        Organization org = organizationRepository.findByUserId(authDto.getUserId())
                .orElseThrow(() -> new NotFoundException("기관 정보가 존재하지 않습니다."));

        String groupName = Optional.ofNullable(createGroupDto.getGroupName()).orElse("봉사");

        if (templateGroupRepository.existsByOrgAndGroupNameAndIsDeletedFalse(org, groupName)) {
            throw new ConflictException("이미 존재하는 그룹명입니다: " + groupName);
        }

        TemplateGroup newGroup = TemplateGroup.builder()
                .org(org)
                .groupName(groupName)
                .isDeleted(false)
                .build();

        TemplateGroup savedGroup = templateGroupRepository.save(newGroup);

        return CreateGroupResponseDto.builder()
                .message("그룹 생성 성공")
                .groupId(savedGroup.getId())
                .build();
    }

    @Override
    public CreateRecruitResponseDto createRecruit(CreateRecruitRequestDto createRecruitDto, AuthDto authDto) {

        checkOrgToken(authDto);

        Organization org = organizationRepository.findByUserId(authDto.getUserId())
                .orElseThrow(() -> new NotFoundException("해당 유저의 기관 정보 없음"));

        Template template = templateRepository.findById(createRecruitDto.getTemplateId())
                .orElseThrow(() -> new NotFoundException("해당 템플릿이 존재하지 않습니다."));

        if (!template.getOrg().getId().equals(org.getId())) {
            throw new ForbiddenException("해당 템플릿에 대한 권한이 없습니다.");
        }

        Instant deadlineInstant = Optional.ofNullable(createRecruitDto.getDeadline())
                .map(deadline -> deadline.atZone(ZoneId.systemDefault()).toInstant())
                .orElse(Instant.now());

        Recruit recruit = recruitRepository.save(Recruit.builder()
                .template(template)
                .deadline(deadlineInstant)
                .activityDate(Optional.ofNullable(createRecruitDto.getActivityDate()).orElse(new Date()))
                .activityStart(Optional.ofNullable(createRecruitDto.getActivityStart()).orElse(BigDecimal.valueOf(10.00)))
                .activityEnd(Optional.ofNullable(createRecruitDto.getActivityEnd()).orElse(BigDecimal.valueOf(12.00)))
                .maxVolunteer(Optional.ofNullable(createRecruitDto.getMaxVolunteer()).orElse(1))
                .status("RECRUITING")
                .isDeleted(false)
                .createdAt(Instant.now())
                .updatedAt(Instant.now())
                .build());

        cacheUtil.addDeadlineEventScheduler(recruit.getId(), getMinutesToDeadlineEvent(recruit));
        cacheUtil.addCompleteEventScheduler(recruit.getId(), getMinutesToCompleteEvent(recruit));

        return CreateRecruitResponseDto.builder()
                .message("공고 생성 완료")
                .recruitId(recruit.getId())
                .build();
    }

    @Override
    @Transactional(readOnly = true)
    public ReadRecruitResponseDto readRecruit(Integer recruitId, AuthDto authDto) {

        Recruit recruit = recruitRepository.findByRecruitId(recruitId)
                .orElseThrow(() -> new NotFoundException("해당 공고가 없거나 삭제되었습니다."));

        LocalDateTime deadlineLocalDateTime = recruit.getDeadline() != null
                ? LocalDateTime.ofInstant(recruit.getDeadline(), ZoneId.systemDefault())
                : null;

        LocalDateTime updatedAtLocalDateTime = recruit.getUpdatedAt() != null
                ? LocalDateTime.ofInstant(recruit.getUpdatedAt(), ZoneId.systemDefault())
                : LocalDateTime.now();

        LocalDateTime createdAtLocalDateTime = recruit.getCreatedAt() != null
                ? LocalDateTime.ofInstant(recruit.getCreatedAt(), ZoneId.systemDefault())
                : LocalDateTime.now();

        Date activityDate = recruit.getActivityDate() != null ? recruit.getActivityDate() : new Date();

        ReadRecruitResponseDto.Recruit recruitDto = ReadRecruitResponseDto.Recruit.builder()
                .recruitId(recruit.getId())
                .deadline(deadlineLocalDateTime)
                .activityDate(activityDate)
                .activityStart(recruit.getActivityStart() != null ? recruit.getActivityStart() : BigDecimal.valueOf(10.00))
                .activityEnd(recruit.getActivityEnd() != null ? recruit.getActivityEnd() : BigDecimal.valueOf(12.00))
                .maxVolunteer(recruit.getMaxVolunteer())
                .participateVolCount(applicationRepository.countByRecruitIdAndStatusNotInAndIsDeletedFalse(
                        recruit.getId(), List.of("PENDING", "REJECTED")
                ))
                .status(recruit.getStatus())
                .updatedAt(updatedAtLocalDateTime)
                .createdAt(createdAtLocalDateTime)
                .build();

        ReadRecruitResponseDto.Group groupDto = new ReadRecruitResponseDto.Group(
                recruit.getTemplate().getGroup().getId(),
                recruit.getTemplate().getGroup().getGroupName()
        );

        LocalDateTime templateCreatedAt = recruit.getTemplate().getCreatedAt() != null
                ? LocalDateTime.ofInstant(recruit.getTemplate().getCreatedAt(), ZoneId.systemDefault())
                : LocalDateTime.now();

        List<String> imageUrls = imageService.getImageUrls(recruit.getTemplate().getId(), true);

        ReadRecruitResponseDto.Template templateDto = ReadRecruitResponseDto.Template.builder()
                .templateId(recruit.getTemplate().getId())
                .categoryId(recruit.getTemplate().getCategory() != null ? recruit.getTemplate().getCategory().getId() : null)
                .title(recruit.getTemplate().getTitle())
                .activityLocation(recruit.getTemplate().getActivityLocation())
                .status(recruit.getTemplate().getStatus())
                .images(imageUrls)
                .contactName(recruit.getTemplate().getContactName())
                .contactPhone(recruit.getTemplate().getContactPhone())
                .description(recruit.getTemplate().getDescription())
                .createdAt(templateCreatedAt)
                .build();

        ReadRecruitResponseDto.Organization orgDto = new ReadRecruitResponseDto.Organization(
                recruit.getTemplate().getOrg().getId(),
                recruit.getTemplate().getOrg().getOrgName()
        );

        return ReadRecruitResponseDto.builder()
                .group(groupDto)
                .template(templateDto)
                .recruit(recruitDto)
                .organization(orgDto)
                .build();
    }

    @Override
    @Transactional(readOnly = true)
    public ReadApplicationsResponseDto readApplications(Integer recruitId, AuthDto authDto) {

        checkOrgToken(authDto);

        Organization org = organizationRepository.findByUserId(authDto.getUserId())
                .orElseThrow(() -> new ForbiddenException("해당 기관을 찾을 수 없습니다."));

        Integer recruitOrgId = recruitRepository.findOrgIdByRecruitId(recruitId)
                .orElseThrow(() -> new NotFoundException("해당 모집 공고를 찾을 수 없습니다."));

        if (!org.getId().equals(recruitOrgId)) {
            throw new ForbiddenException("이 모집 공고의 신청 내역을 조회할 권한이 없습니다.");
        }

        List<Application> applications = applicationRepository.findByRecruitIdWithUser(recruitId);

        List<ReadApplicationsResponseDto.ApplicationDetail> applicationDetails = applications.stream()
                .map(application -> {
                    String profileImagePath = application.getVolunteer().getUser().getProfileImage();

                    String profileImageUrl;
                    try {
                        profileImageUrl = (profileImagePath != null) ? imageUtil.getPresignedDownloadUrl(profileImagePath) : null;
                    } catch (Exception e) {
                        throw new ImageProcessException("프로필 이미지 URL 생성 중 오류 발생", e);
                    }

                    return ReadApplicationsResponseDto.ApplicationDetail.builder()
                            .user(ReadApplicationsResponseDto.User.builder()
                                    .userId(application.getVolunteer().getUser().getId())
                                    .email(application.getVolunteer().getUser().getEmail())
                                    .name(application.getVolunteer().getUser().getName())
                                    .profileImage(profileImageUrl)
                                    .build())
                            .volunteer(ReadApplicationsResponseDto.Volunteer.builder()
                                    .volunteerId(application.getVolunteer().getId())
                                    .recommendedCount(application.getVolunteer().getRecommendedCount())
                                    .totalVolunteerHours(
                                            application.getVolunteer().getUser().getTotalVolunteerHours() != null
                                                    ? application.getVolunteer().getUser().getTotalVolunteerHours().intValue()
                                                    : 0
                                    )
                                    .build())
                            .application(ReadApplicationsResponseDto.Application.builder()
                                    .applicationId(application.getId())
                                    .recruitId(application.getRecruit().getId())
                                    .status(application.getStatus())
                                    .createdAt(application.getCreatedAt() != null
                                            ? LocalDateTime.ofInstant(application.getCreatedAt(), ZoneId.systemDefault())
                                            : LocalDateTime.now())
                                    .build())
                            .build();
                })
                .collect(Collectors.toList());

        return ReadApplicationsResponseDto.builder()
                .recruitId(recruitId)
                .applications(applicationDetails)
                .build();
    }

    @Override
    public UpdateApplicationsResponseDto updateStatuses(UpdateApplicationsRequestDto updateApplicationDto, AuthDto authDto) {

        checkOrgToken(authDto);

        Integer applicationId = updateApplicationDto.getApplicationId();
        Integer recruitId = updateApplicationDto.getRecruitId();
        Integer volunteerId = updateApplicationDto.getVolunteerId();
        Boolean accept = updateApplicationDto.getAccept();
        String status = accept ? "APPROVED" : "REJECTED";

        applicationRepository.findByRecruitIdAndVolunteerId(recruitId, volunteerId)
                .orElseThrow(() -> new NotFoundException("관련 데이터 없음"));

        Organization org = organizationRepository.findByUserId(authDto.getUserId())
                .orElseThrow(() -> new NotFoundException("해당 기관을 찾을 수 없습니다."));

        Integer recruitOrgId = applicationRepository.findOrgIdByApplicationId(applicationId)
                .orElseThrow(() -> new NotFoundException("해당 신청 내역을 찾을 수 없습니다."));

        if (!org.getId().equals(recruitOrgId)) {
            throw new ForbiddenException("해당 모집 공고의 신청 상태를 변경할 권한이 없습니다.");
        }

        applicationRepository.updateApplicationStatus(applicationId, status);

        return UpdateApplicationsResponseDto.builder()
                .message("신청 상태 변경 완료")
                .application(UpdateApplicationsResponseDto.Application.builder()
                        .applicationId(applicationId)
                        .recruitId(recruitId)
                        .status(status)
                        .createdAt(LocalDateTime.now())
                        .build())
                .build();
    }

    @Override
    public List<EvaluateApplicationsResponseDto> evaluateApplicants(
            Integer recruitId,
            List<EvaluateApplicationsRequestDto> evaluateApplicationDtoList,
            AuthDto authDto) {

        checkOrgToken(authDto);

        Organization org = organizationRepository.findByUserId(authDto.getUserId())
                .orElseThrow(() -> new ForbiddenException("해당 기관을 찾을 수 없습니다."));

        Integer recruitOrgId = recruitRepository.findOrgIdByRecruitId(recruitId)
                .orElseThrow(() -> new NotFoundException("해당 모집 공고를 찾을 수 없습니다."));

        if (!org.getId().equals(recruitOrgId)) {
            throw new ForbiddenException("이 모집 공고의 신청자를 평가할 권한이 없습니다.");
        }

        return evaluateApplicationDtoList.stream().map(dto -> {
            Integer volunteerId = dto.getVolunteerId();
            String recommendationStatus = dto.getRecommendationStatus();

            Application application = applicationRepository.findByRecruitIdAndVolunteerId(recruitId, volunteerId)
                    .filter(a -> !a.getEvaluationDone())
                    .orElseThrow(() -> new NotFoundException("해당 봉사자가 신청하지 않았거나 이미 평가 완료되었습니다. volunteerId: " + volunteerId));

            Integer applicationId = application.getId();

            if ("RECOMMEND".equalsIgnoreCase(recommendationStatus)) {
                volunteerRepository.incrementRecommendation(volunteerId);
            } else if ("NOTRECOMMEND".equalsIgnoreCase(recommendationStatus)) {
                volunteerRepository.incrementNotRecommendation(volunteerId);
            }

            applicationRepository.markEvaluationAsDone(applicationId);

            return EvaluateApplicationsResponseDto.builder()
                    .volunteerId(volunteerId)
                    .recommendationStatus(recommendationStatus)
                    .build();
        }).collect(Collectors.toList());
    }

    @Override
    public void updateCompleteRecruitStatus(int recruitId) {
        Recruit activityCompleted = recruitRepository.save(
                Recruit.builder()
                        .id(recruitId)
                        .status("ACTIVITY_COMPLETED")
                        .build());
        return;
    }

    @Override
    public void updateDeadlineRecruitStatus(int recruitId) {
        Recruit deadLinePass = recruitRepository.save(
                Recruit.builder()
                        .id(recruitId)
                        .status("RECRUITMENT_CLOSED")
                        .build());
        return;
    }

    public int getMinutesToDeadlineEvent(Recruit recruit) {
        LocalDateTime recruitDeadline = recruit.getDeadline()
                .atZone(ZoneId.of("Asia/Seoul"))
                .toLocalDateTime()
                .plusDays(1)
                .truncatedTo(ChronoUnit.DAYS);
        LocalDateTime now = LocalDateTime.now();
        return (int) ChronoUnit.MINUTES.between(now, recruitDeadline);
    }

    public int getMinutesToCompleteEvent(Recruit recruit) {
        Date activityDate = recruit.getActivityDate();
        BigDecimal activityEnd = recruit.getActivityEnd();

        LocalDateTime activityDateTime = activityDate.toInstant()
                .atZone(ZoneId.of("Asia/Seoul"))
                .toLocalDateTime();

        LocalDateTime activityEndTime = activityDateTime
                .withHour(activityEnd.intValue())
                .withMinute(activityEnd.remainder(BigDecimal.ONE).multiply(BigDecimal.valueOf(100)).intValue())
                .withSecond(0);

        LocalDateTime now = LocalDateTime.now();

        return (int) ChronoUnit.MINUTES.between(now, activityEndTime);
    }
}

package com.ttabong.service.search;

import com.ttabong.dto.search.RecruitRequestDto;
import com.ttabong.dto.search.RecruitResponseDto;
import com.ttabong.entity.recruit.Recruit;
import com.ttabong.repository.recruit.RecruitRepository;
import com.ttabong.util.DateTimeUtil;
import com.ttabong.util.ImageUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class SearchServiceImpl implements SearchService {

    private final RecruitRepository recruitRepository;
    private final ImageUtil imageUtil;

    @Override
    public RecruitResponseDto searchTemplates(RecruitRequestDto requestDto, Integer cursor, Integer limit) {
        int pageSize = (limit == null) ? 10 : limit;

        List<Recruit> recruits = recruitRepository.searchRecruits(
                requestDto.getTemplateTitle(),
                requestDto.getSearchConditions().getOrganizationName(),
                requestDto.getSearchConditions().getStatus(),
                requestDto.getSearchConditions().getActivityDate() != null
                        ? requestDto.getSearchConditions().getActivityDate().getStart() : null,
                requestDto.getSearchConditions().getActivityDate() != null
                        ? requestDto.getSearchConditions().getActivityDate().getEnd() : null,
                requestDto.getSearchConditions().getRegion(),
                cursor,
                PageRequest.of(0, pageSize)
        );

        Map<Integer, RecruitResponseDto.TemplateDto> templateMap = new LinkedHashMap<>();

        for (Recruit recruit : recruits) {
            var template = recruit.getTemplate();
            var group = template.getGroup();
            var org = template.getOrg();

            if (templateMap.containsKey(template.getId())) {
                List<RecruitResponseDto.RecruitDto> existingRecruits = templateMap.get(template.getId()).getRecruits();

                existingRecruits.add(
                        RecruitResponseDto.RecruitDto.builder()
                                .recruitId(recruit.getId())
                                .activityDate(recruit.getActivityDate())
                                .deadline(recruit.getDeadline())
                                .activityStart(recruit.getActivityStart())
                                .activityEnd(recruit.getActivityEnd())
                                .maxVolunteer(recruit.getMaxVolunteer())
                                .participateVolCount(recruit.getParticipateVolCount())
                                .status(recruit.getStatus())
                                .updatedAt(DateTimeUtil.convertToLocalDateTime(recruit.getUpdatedAt()))
                                .createdAt(DateTimeUtil.convertToLocalDateTime(recruit.getCreatedAt()))
                                .build()
                );

                existingRecruits.sort((r1, r2) -> r2.getActivityDate().compareTo(r1.getActivityDate()));

            } else {
                List<RecruitResponseDto.RecruitDto> recruitDtos = new ArrayList<>();
                recruitDtos.add(
                        RecruitResponseDto.RecruitDto.builder()
                                .recruitId(recruit.getId())
                                .activityDate(recruit.getActivityDate())
                                .deadline(recruit.getDeadline())
                                .activityStart(recruit.getActivityStart())
                                .activityEnd(recruit.getActivityEnd())
                                .maxVolunteer(recruit.getMaxVolunteer())
                                .participateVolCount(recruit.getParticipateVolCount())
                                .status(recruit.getStatus())
                                .updatedAt(DateTimeUtil.convertToLocalDateTime(recruit.getUpdatedAt()))
                                .createdAt(DateTimeUtil.convertToLocalDateTime(recruit.getCreatedAt()))
                                .build()
                );

                String imageUrl = Optional.ofNullable(template.getThumbnailImage())
                        .map(image -> {
                            try {
                                return imageUtil.getPresignedDownloadUrl(image.getImageUrl());
                            } catch (Exception e) {
                                return null;
                            }
                        })
                        .orElse(null);

                RecruitResponseDto.TemplateDto templateDto = RecruitResponseDto.TemplateDto.builder()
                        .templateId(template.getId())
                        .categoryId(template.getCategory() != null ? template.getCategory().getId() : null)
                        .title(template.getTitle())
                        .activityLocation(template.getActivityLocation())
                        .status(recruit.getStatus())
                        .imageUrl(imageUrl)
                        .contactName(template.getContactName())
                        .contactPhone(template.getContactPhone())
                        .description(template.getDescription())
                        .createdAt(DateTimeUtil.convertToLocalDateTime(template.getCreatedAt()))
                        .organization(RecruitResponseDto.OrganizationDto.builder()
                                .orgId(org != null ? org.getId() : null)
                                .orgName(org != null ? org.getOrgName() : null)
                                .build())
                        .group(RecruitResponseDto.GroupDto.builder()
                                .groupId(group.getId())
                                .groupName(group.getGroupName())
                                .build())
                        .recruits(recruitDtos)
                        .build();

                templateMap.put(template.getId(), templateDto);
            }
        }

        List<RecruitResponseDto.TemplateDto> templates = new ArrayList<>(templateMap.values());

        templates.forEach(t -> t.getRecruits().sort((r1, r2) -> r2.getActivityDate().compareTo(r1.getActivityDate())));

        templates.sort((t1, t2) ->
                t2.getRecruits().get(0).getActivityDate().compareTo(t1.getRecruits().get(0).getActivityDate())
        );


        Integer nextCursor = templates.isEmpty() ? null : templates.get(templates.size() - 1).getTemplateId();

        return RecruitResponseDto.builder()
                .templates(templates)
                .nextCursor(nextCursor)
                .build();
    }

}

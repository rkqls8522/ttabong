package com.ttabong.service.recruit;

import com.ttabong.dto.recruit.requestDto.org.*;
import com.ttabong.dto.recruit.responseDto.org.*;
import com.ttabong.dto.user.AuthDto;

import java.util.List;

public interface OrgRecruitServiceNone {

    ReadAvailableRecruitsResponseDto readAvailableRecruits(Integer cursor, Integer limit, AuthDto authDto);

    ReadMyRecruitsResponseDto readMyRecruits(Integer cursor, Integer limit, AuthDto authDto);

    DeleteRecruitsResponseDto deleteRecruits(DeleteRecruitsRequestDto deleteRecruitDto, AuthDto authDto);

    UpdateRecruitsResponseDto updateRecruit(Integer recruitId, UpdateRecruitsRequestDto requestDto, AuthDto authDto);

    CloseRecruitResponseDto closeRecruit(CloseRecruitRequestDto closeRecruitDto, AuthDto authDto);

    UpdateGroupResponseDto updateGroup(UpdateGroupRequestDto updateGroupDto, AuthDto authDto);

    UpdateTemplateResponse updateTemplate(UpdateTemplateRequestDto updateTemplateDto, AuthDto authDto);

    DeleteTemplatesResponseDto deleteTemplates(DeleteTemplatesRequestDto deleteTemplatesDto, AuthDto authDto);

    DeleteGroupResponseDto deleteGroup(DeleteGroupDto deleteGroupDto, AuthDto authDto);

    ReadTemplatesResponseDto readTemplates(Integer cursor, Integer limit, AuthDto authDto);

    CreateTemplateResponseDto createTemplate(CreateTemplateRequestDto createTemplateDto, AuthDto authDto);

    CreateGroupResponseDto createGroup(CreateGroupRequestDto createGroupDto, AuthDto authDto);

    CreateRecruitResponseDto createRecruit(CreateRecruitRequestDto createRecruitDto, AuthDto authDto);

    ReadRecruitResponseDto readRecruit(Integer recruitId, AuthDto authDto);

    ReadApplicationsResponseDto readApplications(Integer recruitId, AuthDto authDto);

    UpdateApplicationsResponseDto updateStatuses(UpdateApplicationsRequestDto updateApplicationDto, AuthDto authDto);

    List<EvaluateApplicationsResponseDto> evaluateApplicants(Integer recruitId, List<EvaluateApplicationsRequestDto> evaluateApplicationDtoList, AuthDto authDto);

    Boolean updateCompleteRecruitStatus(int recruitId);

    Boolean updateDeadlineRecruitStatus(int recruitId);
}

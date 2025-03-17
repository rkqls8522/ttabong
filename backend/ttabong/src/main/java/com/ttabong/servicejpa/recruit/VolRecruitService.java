package com.ttabong.servicejpa.recruit;

import com.ttabong.dto.recruit.responseDto.vol.MyApplicationDetailResponseDto;
import com.ttabong.dto.recruit.responseDto.vol.MyApplicationsResponseDto;
import com.ttabong.dto.recruit.responseDto.vol.ReadRecruitDetailResponseDto;
import com.ttabong.dto.recruit.responseDto.vol.ReadVolRecruitsListResponseDto;
import com.ttabong.entity.recruit.Application;

import java.util.List;
import java.util.Map;
import java.util.Optional;

public interface VolRecruitService {
    ReadVolRecruitsListResponseDto getTemplates(Integer cursor, Integer limit);

    Optional<ReadRecruitDetailResponseDto> getTemplateById(Integer templateId);

    Application applyRecruit(int userId, int recruitId);

    Application cancelRecruitApplication(Integer applicationId);

    List<MyApplicationsResponseDto> getMyApplications(Integer userId, Integer cursor, Integer limit);

    Optional<MyApplicationDetailResponseDto> getRecruitDetail(Integer userId, Integer recruitId);

    Map<String, Object> getLikedTemplates(Integer userId, Integer cursor, Integer limit);

    Integer saveReaction(Integer userId, Integer templateId, Boolean isLike);

    void deleteReactions(List<Integer> reactionIds);
}

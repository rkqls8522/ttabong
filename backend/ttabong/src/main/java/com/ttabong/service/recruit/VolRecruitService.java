package com.ttabong.service.recruit;

import com.ttabong.dto.recruit.responseDto.vol.*;
import com.ttabong.entity.recruit.Application;

import java.util.List;
import java.util.Map;
import java.util.Optional;

public interface VolRecruitService {
    ReadVolRecruitsListResponseDto getTemplates(Integer cursor, Integer limit);

    ReadRecruitDetailResponseDto getTemplateById(Integer templateId);

    Application applyRecruit(int userId, int recruitId);

    Application cancelRecruitApplication(Integer applicationId);

    List<MyApplicationsResponseDto> getMyApplications(Integer userId, Integer cursor, Integer limit);

    Optional<MyApplicationDetailResponseDto> getRecruitDetail(Integer userId, Integer recruitId);

    List<LikedRecruitDto> getLikedRecruits(Integer userId, Integer cursor, Integer limit);

    List<Integer> saveReaction(Integer userId, Integer templateId, Boolean isLike);

    void deleteReactions(List<Integer> reactionIds);
}

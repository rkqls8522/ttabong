package com.ttabong.dto.recruit.responseDto.vol;

import com.ttabong.entity.recruit.VolunteerReaction;
import lombok.*;

import java.time.Instant;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MyLikesRecruitsResponseDto {
    private Integer templateId;
    private String thumbnailImg;
    private String activityLocation;
    private String title;
    private RecruitDto recruit;
    private GroupDto group;

    public static MyLikesRecruitsResponseDto from(VolunteerReaction reaction) {
        return MyLikesRecruitsResponseDto.builder()
                .templateId(reaction.getRecruit().getTemplate().getId())
                .thumbnailImg(reaction.getRecruit().getTemplate().getThumbnailImage() != null ?
                        reaction.getRecruit().getTemplate().getThumbnailImage().getImageUrl() : null)
                .activityLocation(reaction.getRecruit().getTemplate().getActivityLocation())
                .title(reaction.getRecruit().getTemplate().getTitle())
                .recruit(new RecruitDto(reaction.getRecruit().getDeadline()))
                .group(new GroupDto(reaction.getRecruit().getTemplate().getGroup().getId(),
                        reaction.getRecruit().getTemplate().getGroup().getGroupName()))
                .build();
    }

    @Getter
    @Setter
    @AllArgsConstructor
    public static class RecruitDto {
        private Instant deadline;
    }

    @Getter
    @Setter
    @AllArgsConstructor
    public static class GroupDto {
        private Integer groupId;
        private String groupName;
    }
}

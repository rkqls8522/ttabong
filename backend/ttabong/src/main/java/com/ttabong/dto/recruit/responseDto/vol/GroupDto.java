package com.ttabong.dto.recruit.responseDto.vol;

import com.ttabong.entity.recruit.TemplateGroup;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class GroupDto {
    private Integer groupId;
    private String groupName;

    public static GroupDto from(TemplateGroup group) {
        if (group == null) {
            return null;
        }
        return GroupDto.builder()
                .groupId(group.getId())
                .groupName(group.getGroupName())
                .build();
    }
}

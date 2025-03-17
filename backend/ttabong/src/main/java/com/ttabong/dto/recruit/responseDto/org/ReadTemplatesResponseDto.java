package com.ttabong.dto.recruit.responseDto.org;

import com.ttabong.entity.recruit.Template;
import com.ttabong.entity.recruit.TemplateGroup;
import com.ttabong.util.TimeUtil;
import lombok.*;

import java.time.LocalDateTime;
import java.time.ZoneId;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ReadTemplatesResponseDto {
    private List<GroupDto> groups;

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class GroupDto {
        private Integer groupId;
        private String groupName;
        private List<TemplateDto> templates;
    }

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class TemplateDto {
        private Integer templateId;
        private Integer orgId;
        private Integer categoryId;
        private String title;
        private String activityLocation;
        private String status;
        private List<String> images;
        private String contactName;
        private String contactPhone;
        private String description;
        private LocalDateTime createdAt;
    }

    public static TemplateDto createTemplateDto(Template template, TemplateGroup templateGroup, List<String> images) {
        return TemplateDto.builder()
                .templateId(template.getId())
                .orgId(templateGroup.getId())
                .categoryId(template.getCategory().getId())
                .title(template.getTitle())
                .activityLocation(template.getActivityLocation())
                .status(template.getStatus())
                .images(images)
                .contactName(template.getContactName())
                .contactPhone(template.getContactPhone())
                .description(template.getDescription())
                .createdAt(TimeUtil.toLocalDateTime(template.getCreatedAt()))
                .build();
    }
}

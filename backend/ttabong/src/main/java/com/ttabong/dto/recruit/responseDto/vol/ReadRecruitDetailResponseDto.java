package com.ttabong.dto.recruit.responseDto.vol;

import com.ttabong.dto.user.OrganizationDto;
import com.ttabong.entity.recruit.Template;
import lombok.*;

import java.util.List;
import java.util.stream.Collectors;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ReadRecruitDetailResponseDto {
    private TemplateDto template;
    private GroupDto group;
    private CategoryDto category;
    private OrganizationDto organization;
    private List<RecruitDto> recruits;

    public static ReadRecruitDetailResponseDto from(Template template) {
        return ReadRecruitDetailResponseDto.builder()
                .template(TemplateDto.from(template))
                .group(GroupDto.from(template.getGroup()))
                .category(CategoryDto.from(template.getCategory()))
                .organization(template.getOrg() != null ? OrganizationDto.from(template.getOrg()) : null)
                .recruits(template.getRecruits().stream()
                        .filter(recruit -> !Boolean.TRUE.equals(recruit.getIsDeleted()))
                        .map(RecruitDto::from)
                        .collect(Collectors.toList()))
                .build();
    }
}

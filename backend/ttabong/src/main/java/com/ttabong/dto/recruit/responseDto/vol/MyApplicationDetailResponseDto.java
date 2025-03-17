package com.ttabong.dto.recruit.responseDto.vol;

import com.ttabong.entity.recruit.Application;
import com.ttabong.entity.recruit.Recruit;
import lombok.*;

import java.time.Instant;
import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

@Getter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MyApplicationDetailResponseDto {

    private GroupDto group;
    private TemplateDto template;
    private RecruitDto recruit;
    private OrganizationDto organization;
    private ApplicationDto application;

    public static MyApplicationDetailResponseDto from(Recruit recruit, Application application) {
        return MyApplicationDetailResponseDto.builder()
                .group(GroupDto.from(recruit.getTemplate().getGroup()))
                .template(TemplateDto.from(recruit.getTemplate()))
                .recruit(RecruitDto.from(recruit))
                .organization(recruit.getTemplate().getOrg() != null
                        ? OrganizationDto.from(recruit.getTemplate().getOrg())
                        : null)
                .application(application != null ? ApplicationDto.from(application) : null)
                .build();
    }


    @Getter
    @Setter
    @Builder
    public static class GroupDto {
        private Integer groupId;
        private String groupName;

        public static GroupDto from(com.ttabong.entity.recruit.TemplateGroup group) {
            return GroupDto.builder()
                    .groupId(group.getId())
                    .groupName(group.getGroupName())
                    .build();
        }
    }

    @Getter
    @Setter
    @Builder
    public static class TemplateDto {
        private Integer templateId;
        private Integer categoryId;
        private String title;
        private String activityLocation;
        private String status;
        private List<String> images;
        private String contactName;
        private String contactPhone;
        private String description;
        private Instant createdAt;

        public static TemplateDto from(com.ttabong.entity.recruit.Template template) {
            return TemplateDto.builder()
                    .templateId(template.getId())
                    .categoryId(template.getCategory() != null ? template.getCategory().getId() : null)
                    .title(template.getTitle())
                    .activityLocation(template.getActivityLocation())
                    .status(template.getStatus())
                    .images(template.getImages() != null
                            ?  template.getImages().stream().map(image -> image.getImageUrl()).collect(Collectors.toList())
                            : List.of())
                    .contactName(template.getContactName())
                    .contactPhone(template.getContactPhone())
                    .description(template.getDescription())
                    .createdAt(template.getCreatedAt())
                    .build();
        }
    }

    @Getter
    @Setter
    @Builder
    public static class RecruitDto {
        private int recruitId;
        private Instant deadline;
        private LocalDate activityDate;
        private Integer activityStart;
        private Integer activityEnd;
        private Integer maxVolunteer;
        private Integer participateVolCount;
        private String status;
        private Instant updatedAt;
        private Instant createdAt;

        public static RecruitDto from(Recruit recruit) {
            return RecruitDto.builder()
                    .recruitId(recruit.getId())
                    .deadline(recruit.getDeadline())
                    .activityDate(recruit.getActivityDate().toInstant().atZone(java.time.ZoneId.systemDefault()).toLocalDate())
                    .activityStart(recruit.getActivityStart().intValue())
                    .activityEnd(recruit.getActivityEnd().intValue())
                    .maxVolunteer(recruit.getMaxVolunteer())
                    .participateVolCount(recruit.getParticipateVolCount())
                    .status(recruit.getStatus())
                    .updatedAt(recruit.getUpdatedAt())
                    .createdAt(recruit.getCreatedAt())
                    .build();
        }
    }

    @Getter
    @Setter
    @Builder
    public static class OrganizationDto {
        private Integer orgId;
        private String name;

        public static OrganizationDto from(com.ttabong.entity.user.Organization organization) {
            return OrganizationDto.builder()
                    .orgId(organization.getId())
                    .name(organization.getOrgName())
                    .build();
        }
    }

    @Getter
    @Setter
    @Builder
    public static class ApplicationDto {
        private Integer applicationId;
        private String name;
        private String status;

        public static ApplicationDto from(com.ttabong.entity.recruit.Application application) {
            return ApplicationDto.builder()
                    .applicationId(application.getId())
                    .name(application.getVolunteer().getUser().getName()) // `getVolunteerName()` 메서드는 예제이므로 실제 엔티티에 맞게 수정
                    .status(application.getStatus())
                    .build();
        }
    }
}

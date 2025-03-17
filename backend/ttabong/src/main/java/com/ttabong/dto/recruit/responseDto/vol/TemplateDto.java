package com.ttabong.dto.recruit.responseDto.vol;

import com.ttabong.entity.recruit.Template;
import com.ttabong.entity.sns.ReviewImage;
import lombok.*;

import java.time.Instant;
import java.util.Comparator;
import java.util.List;
import java.util.stream.Collectors;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TemplateDto {
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

    public static TemplateDto from(Template template) {
        return TemplateDto.builder()
                .templateId(template.getId())
                .categoryId(template.getCategory() != null ? template.getCategory().getId() : null)
                .title(template.getTitle())
                .activityLocation(template.getActivityLocation())
                .status(template.getStatus())
                .images(template.getImages().stream()
                        .filter(img -> !Boolean.TRUE.equals(img.getIsDeleted()))
                        .sorted(Comparator.comparing(ReviewImage::getId).reversed())
                        .map(ReviewImage::getImageUrl)
                        .collect(Collectors.toList()))
                .contactName(template.getContactName())
                .contactPhone(template.getContactPhone())
                .description(template.getDescription())
                .createdAt(template.getCreatedAt())
                .build();
    }
}

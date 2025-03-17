package com.ttabong.dto.recruit.responseDto.vol;

import com.ttabong.entity.recruit.Template;
import com.ttabong.entity.sns.ReviewImage;
import lombok.*;

import java.time.Instant;
import java.util.Comparator;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TemplatePreviewDto {
    private Integer templateId;
    private Integer categoryId;
    private String title;
    private String activityLocation;
    private String status;
    private String imageId;
    private String contactName;
    private String contactPhone;
    private String description;
    private Instant createdAt;

    public static TemplatePreviewDto from(Template template) {
        return TemplatePreviewDto.builder()
                .templateId(template.getId())
                .categoryId(template.getCategory() != null ? template.getCategory().getId() : null)
                .title(template.getTitle())
                .activityLocation(template.getActivityLocation())
                .status(template.getStatus())
                .imageId(template.getImages().stream()
                        .filter(img -> !Boolean.TRUE.equals(img.getIsDeleted()))
                        .sorted(Comparator.comparing(ReviewImage::getId).reversed())
                        .map(ReviewImage::getImageUrl)
                        .findFirst()
                        .orElse(null))
                .contactName(template.getContactName())
                .contactPhone(template.getContactPhone())
                .description(template.getDescription())
                .createdAt(template.getCreatedAt())
                .build();
    }
}

package com.ttabong.dto.recruit.responseDto.vol;

import com.ttabong.entity.recruit.Application;
import com.ttabong.entity.sns.Review;
import lombok.*;

import java.time.Instant;
import java.util.Optional;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MyApplicationsResponseDto {
    private Integer applicationId;
    private String status;
    private Boolean evaluationDone;
    private Instant createdAt;
    private TemplatePreviewDto template;
    private GroupDto group;
    private RecruitDto recruit;
    private Integer reviewId;

    public static MyApplicationsResponseDto from(Application application) {
        Integer reviewId = null;
        if ("COMPLETED".equals(application.getStatus())
                && application.getRecruit() != null
                && application.getRecruit().getReviews() != null) {
            Optional<Review> reviewOpt = application.getRecruit().getReviews().stream()
                    .filter(review -> review.getWriter() != null
                            && review.getWriter().getId().equals(application.getVolunteer().getUser().getId()))
                    .findFirst();
            if (reviewOpt.isPresent()) {
                reviewId = reviewOpt.get().getId();
            }
        }

        return MyApplicationsResponseDto.builder()
                .applicationId(application.getId())
                .status(application.getStatus())
                .evaluationDone(application.getEvaluationDone())
                .createdAt(application.getCreatedAt())
                .template(TemplatePreviewDto.from(application.getRecruit().getTemplate()))
                .group(GroupDto.from(application.getRecruit().getTemplate().getGroup()))
                .recruit(RecruitDto.from(application.getRecruit()))
                .reviewId(reviewId)
                .build();
    }
}

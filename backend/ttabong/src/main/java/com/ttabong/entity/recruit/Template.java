package com.ttabong.entity.recruit;

import com.ttabong.dto.recruit.requestDto.org.UpdateTemplateRequestDto;
import com.ttabong.entity.sns.ReviewImage;
import com.ttabong.entity.user.Organization;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.ColumnDefault;
import org.hibernate.annotations.OnDelete;
import org.hibernate.annotations.OnDeleteAction;

import java.time.Instant;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Set;

@Entity
@Getter
@Setter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor(access = AccessLevel.PRIVATE)
@Builder
@Table(name = "Template")
public class Template {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "template_id", nullable = false)
    private Integer id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "group_id", nullable = false)
    private TemplateGroup group;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "org_id")
    private Organization org;

    @ManyToOne(fetch = FetchType.LAZY)
    @OnDelete(action = OnDeleteAction.SET_NULL)
    @JoinColumn(name = "category_id")
    private Category category;

    @Column(name = "title", length = 255)
    private String title;

    @Column(name = "activity_location", nullable = false, length = 255)
    private String activityLocation;

    @Column(name = "status", nullable = false, columnDefinition = "ENUM('ALL', 'YOUTH', 'ADULT') DEFAULT 'ALL'")
    private String status;

    @Column(name = "contact_name", length = 50)
    private String contactName;

    @Column(name = "contact_phone", length = 20)
    private String contactPhone;

    @Column(name = "description", length = 500)
    private String description;

    @ColumnDefault("0")
    @Column(name = "is_deleted")
    private Boolean isDeleted;

    @ColumnDefault("CURRENT_TIMESTAMP")
    @Column(name = "created_at", nullable = false)
    private Instant createdAt;

    @OneToMany(mappedBy = "template")
    private Set<Recruit> recruits = new LinkedHashSet<>();

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "template_id", referencedColumnName = "template_id", insertable = false, updatable = false)
    private ReviewImage thumbnailImage;

    @OneToMany(mappedBy = "template", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<ReviewImage> images;

    public Template(Integer id) {
        this.id = id;
    }

    public void deleteTemplate() {
        this.isDeleted = true;
    }

    public static Template updateTemplate(UpdateTemplateRequestDto dto, TemplateGroup group, Organization org, Category category) {
        return Template.builder()
                .group(group)
                .org(org)
                .category(category)
                .title(dto.getTitle())
                .activityLocation(dto.getActivityLocation())
                .status(dto.getStatus())
                .contactName(dto.getContactName())
                .contactPhone(dto.getContactPhone())
                .description(dto.getDescription())
                .isDeleted(false)
                .createdAt(Instant.now())
                .build();


    }

}

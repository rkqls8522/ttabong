package com.ttabong.entity.user;

import com.ttabong.entity.recruit.Template;
import com.ttabong.entity.recruit.TemplateGroup;
import com.ttabong.entity.sns.Review;
import jakarta.persistence.*;
import lombok.*;

import java.util.LinkedHashSet;
import java.util.Set;

@Entity
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED) // 외부에서 new User() 막기
@AllArgsConstructor(access = AccessLevel.PRIVATE) // Builder에서만 생성 가능
@Builder
@Table(name = "Organization")
public class Organization {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "org_id", nullable = false)
    private Integer id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(name = "business_reg_number", nullable = false, length = 30)
    private String businessRegNumber;

    @Column(name = "org_name", nullable = false, length = 100)
    private String orgName;

    @Column(name = "representative_name", nullable = false, length = 80)
    private String representativeName;

    @Column(name = "org_address", nullable = false, length = 200)
    private String orgAddress;

    @OneToMany(mappedBy = "org")
    private Set<Review> reviews = new LinkedHashSet<>();

    @OneToMany(mappedBy = "org")
    private Set<Template> templates = new LinkedHashSet<>();

    @OneToMany(mappedBy = "org")
    private Set<TemplateGroup> templateGroups = new LinkedHashSet<>();

}

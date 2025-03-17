package com.ttabong.entity.user;

import com.ttabong.entity.recruit.Application;
import com.ttabong.entity.recruit.VolunteerReaction;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.ColumnDefault;

import java.time.LocalDate;
import java.util.LinkedHashSet;
import java.util.Set;

@Entity
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED) // 외부에서 new User() 막기
@AllArgsConstructor(access = AccessLevel.PRIVATE) // Builder에서만 생성 가능
@Builder
@Table(name = "Volunteer")
public class Volunteer {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "volunteer_id", nullable = false)
    private Integer id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(name = "preferred_time", length = 100)
    private String preferredTime;

    @Column(name = "interest_theme", length = 100)
    private String interestTheme;

    @Column(name = "duration_time", length = 100)
    private String durationTime;

    @Column(name = "region", length = 30)
    private String region;

    @Column(name = "birth_date")
    private LocalDate birthDate;

    @Column(name = "gender")
    private Character gender;

    @ColumnDefault("0")
    @Column(name = "recommended_count")
    private Integer recommendedCount;

    @ColumnDefault("0")
    @Column(name = "not_recommended_count")
    private Integer notRecommendedCount;

    @OneToMany(mappedBy = "volunteer")
    private Set<Application> applications = new LinkedHashSet<>();

    @OneToMany(mappedBy = "volunteer")
    private Set<VolunteerReaction> volunteerReactions = new LinkedHashSet<>();

    public void incrementRecommendedCount() {
        this.recommendedCount++;
    }
    public void incrementNotRecommendedCount() {
        this.notRecommendedCount++;
    }

}

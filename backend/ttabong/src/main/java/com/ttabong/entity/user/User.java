package com.ttabong.entity.user;

import com.ttabong.entity.sns.Review;
import com.ttabong.entity.sns.ReviewComment;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.ColumnDefault;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.LinkedHashSet;
import java.util.Set;

@Entity
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED) // 외부에서 new User() 막기
@AllArgsConstructor(access = AccessLevel.PRIVATE) // Builder에서만 생성 가능
@Builder
@Table(name = "User")
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "user_id", nullable = false)
    private Integer id;

    @Column(name = "email", nullable = false, length = 80)
    private String email;

    @Column(name = "name", nullable = false, length = 50)
    private String name;

    @Column(name = "password", nullable = false, length = 256)
    private String password;

    @Column(name = "phone", nullable = false, length = 20)
    private String phone;

    @Column(name = "profile_image", length = 200)
    private String profileImage;

    @ColumnDefault("0")
    @Column(name = "is_deleted")
    private Boolean isDeleted;

    @ColumnDefault("CURRENT_TIMESTAMP")
    @Column(name = "created_at", nullable = false, insertable = false, updatable = false)
    private Instant createdAt;

    @OneToMany(mappedBy = "user")
    private Set<Organization> organizations = new LinkedHashSet<>();

    @OneToMany(mappedBy = "writer")
    private Set<Review> reviews = new LinkedHashSet<>();

    @OneToMany(mappedBy = "writer")
    private Set<ReviewComment> reviewComments = new LinkedHashSet<>();

    @OneToMany(mappedBy = "user")
    private Set<Volunteer> volunteers = new LinkedHashSet<>();

    @ColumnDefault("0.00")
    @Column(name = "total_volunteer_hours", nullable = false, precision = 7, scale = 2)
    private BigDecimal totalVolunteerHours;

}

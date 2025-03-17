package com.ttabong.entity.sns;

import com.ttabong.entity.recruit.Template;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.ColumnDefault;

import java.time.Instant;

@Entity
@Getter
@Setter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor(access = AccessLevel.PRIVATE)
@Builder(toBuilder = true)
@Table(name = "Review_image")
public class ReviewImage {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "image_id", nullable = false)
    private Integer id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "template_id", foreignKey = @ForeignKey(name = "fk_review_image_template"))
    private Template template;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "review_id", foreignKey = @ForeignKey(name = "fk_review_image_review"))
    private Review review;

    @Column(name = "image_url", length = 500)
    private String imageUrl;

    @ColumnDefault("false")
    @Column(name = "is_thumbnail", nullable = false)
    private Boolean isThumbnail;

    @ColumnDefault("false")
    @Column(name = "is_deleted", nullable = false)
    private Boolean isDeleted;

    @ColumnDefault("CURRENT_TIMESTAMP")
    @Column(name = "created_at", nullable = false)
    private Instant createdAt;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "next_image_id", foreignKey = @ForeignKey(name = "fk_next_image_id"))
    private ReviewImage nextImage;

    public void setThumbnail(Boolean isThumbnail) {
        this.isThumbnail = isThumbnail;
    }
}

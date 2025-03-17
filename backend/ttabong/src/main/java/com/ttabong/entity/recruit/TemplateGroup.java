package com.ttabong.entity.recruit;

import com.ttabong.entity.user.Organization;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.ColumnDefault;

import java.util.LinkedHashSet;
import java.util.Set;

@Entity
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor(access = AccessLevel.PRIVATE)
@Builder
@Table(name = "Template_group")
public class TemplateGroup {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "group_id", nullable = false)
    private Integer id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "org_id", nullable = false)
    private Organization org;

    @ColumnDefault("'봉사'")
    @Column(name = "group_name", nullable = false, length = 100)
    private String groupName;

    @ColumnDefault("0")
    @Column(name = "is_deleted")
    private Boolean isDeleted;

    @OneToMany(mappedBy = "group")
    private Set<Template> templates = new LinkedHashSet<>();

    public void markDeleted() {
        this.isDeleted = true;
    }
    public void updateName(String name){
        this.groupName = name;
    }
}

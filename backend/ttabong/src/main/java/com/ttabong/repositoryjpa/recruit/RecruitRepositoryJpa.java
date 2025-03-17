package com.ttabong.repositoryjpa.recruit;

import com.ttabong.entity.recruit.Recruit;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface RecruitRepositoryJpa extends JpaRepository<Recruit, Integer> {


    @Query("SELECT r FROM Recruit r " +
            "JOIN FETCH r.template t " +
            "JOIN FETCH t.org o " +
            "WHERE (:cursor IS NULL OR r.id < :cursor) " +
            "AND o.user.id = :userId " +
            "AND r.isDeleted = false " +
            "ORDER BY r.id DESC")
    List<Recruit> findAvailableRecruits(@Param("cursor") Integer cursor, @Param("userId") Integer userId, Pageable pageable);

    @EntityGraph(attributePaths = {"template", "org.user"})
    List<Recruit> findRecruitByTemplateOrgIdAndIsDeletedFalse(Integer template_org_id, Pageable pageable);

    @EntityGraph(attributePaths = {"template.group", "template.org.user"})
    Optional<Recruit> findRecruitByIdAndIsDeletedFalse(Integer id);

    @EntityGraph(attributePaths = {"template.group", "template.org.user"})
    List<Recruit> findRecruitByIdInAndIsDeletedFalse(List<Integer> recruitIds);

    @Query("SELECT r FROM Recruit r WHERE r.id = :recruitId AND r.isDeleted = false")
    Optional<Recruit> findByRecruitId(@Param("recruitId") Integer recruitId);

    Optional<Recruit> findByIdAndIsDeletedFalse(Integer recruitId);

}

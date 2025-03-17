package com.ttabong.repository.recruit;

import com.ttabong.entity.recruit.Recruit;
import com.ttabong.entity.recruit.Template;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.Date;
import java.util.List;
import java.util.Optional;

@Repository
public interface RecruitRepository extends JpaRepository<Recruit, Integer> {

    @Query("SELECT r FROM Recruit r " +
            "WHERE r.template.id = :templateId " +
            "AND r.isDeleted = false " +
            "AND r.status = 'RECRUITING' " +
            "ORDER BY r.deadline ASC")
    List<Recruit> findByTemplateId(@Param("templateId") Integer templateId);

    @Query("SELECT t.org.id FROM Recruit r JOIN r.template t WHERE r.id = :recruitId AND r.isDeleted=false")
    Optional<Integer> findOrgIdByRecruitId(@Param("recruitId") Integer recruitId);

    @Query("SELECT r FROM Recruit r " +
            "JOIN FETCH r.template t " +
            "JOIN FETCH t.org o " +
            "WHERE (:cursor IS NULL OR r.id < :cursor) " +
            "AND o.user.id = :userId " +
            "AND r.isDeleted = false " +
            "ORDER BY r.id DESC")
    List<Recruit> findAvailableRecruits(@Param("cursor") Integer cursor, @Param("userId") Integer userId, Pageable pageable);

    @Modifying
    @Query("UPDATE Recruit r " +
            "SET r.isDeleted = true " +
            "WHERE r.id IN :deleteIds " +
            "AND EXISTS ( " +
            "    SELECT t FROM Template t " +
            "    WHERE t.id = r.template.id " +
            "    AND t.org.user.id = :userId " +
            ") " +
            "AND r.isDeleted = false")
    int markAsDeleted(@Param("deleteIds") List<Integer> deleteIds, @Param("userId") Integer userId);

    @Modifying
    @Query("UPDATE Recruit r " +
            "SET r.deadline = :deadline, " +
            "r.activityDate = :activityDate, " +
            "r.activityStart = :activityStart, " +
            "r.activityEnd = :activityEnd, " +
            "r.maxVolunteer = :maxVolunteer, " +
            "r.updatedAt = CURRENT_TIMESTAMP " +
            "WHERE r.id = :recruitId")
    Recruit updateRecruit(
            @Param("recruitId") Integer recruitId,
            @Param("deadline") Instant deadline,
            @Param("activityDate") Date activityDate,
            @Param("activityStart") BigDecimal activityStart,
            @Param("activityEnd") BigDecimal activityEnd,
            @Param("maxVolunteer") Integer maxVolunteer
    );

    @Modifying
    @Query("UPDATE Recruit r SET r.status = 'RECRUITMENT_CLOSED' WHERE r.id = :closeId")
    Recruit closeRecruit(@Param("closeId") Integer closeId);


    @Query("SELECT r FROM Recruit r WHERE r.id = :recruitId AND r.isDeleted = false")
    Optional<Recruit> findByRecruitId(@Param("recruitId") Integer recruitId);

    @Query("""
                SELECT r FROM Recruit r
                JOIN FETCH r.template t
                JOIN FETCH t.org o
                JOIN FETCH t.group g
                WHERE
                    (:templateTitle IS NULL OR t.title LIKE %:templateTitle%)
                    AND (:organizationName IS NULL OR o.orgName LIKE %:organizationName%)
                    AND (:status IS NULL OR r.status = :status)
                    AND ((:startDate IS NULL OR :endDate IS NULL) OR (r.activityDate BETWEEN :startDate AND :endDate))
                    AND (:region IS NULL OR t.activityLocation LIKE %:region%)
                    AND (:cursor IS NULL OR t.id > :cursor)
                    AND r.isDeleted = false
                    AND t.isDeleted = false
                ORDER BY t.id DESC, r.createdAt DESC
            """)
    List<Recruit> searchRecruits(
            @Param("templateTitle") String templateTitle,
            @Param("organizationName") String organizationName,
            @Param("status") String status,
            @Param("startDate") Date startDate,
            @Param("endDate") Date endDate,
            @Param("region") String region,
            @Param("cursor") Integer cursor,
            Pageable pageable
    );

    // VolRecruit---------------------------------------------------------

    // 특정 모집 공고 조회
    Optional<Recruit> findByIdAndIsDeletedFalse(Integer recruitId);

    //해당 템플릿을 참조하는 공고가 있느냐?
    List<Recruit> findByTemplateAndIsDeletedFalse(Template template);

}

package com.ttabong.repository.recruit;

import com.ttabong.entity.recruit.Application;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Repository
public interface ApplicationRepository extends JpaRepository<Application, Integer> {

    int countByRecruitIdAndStatusNotInAndIsDeletedFalse(Integer recruitId, List<String> status);

    @Query("SELECT a FROM Application a JOIN FETCH a.volunteer v JOIN FETCH v.user u WHERE a.recruit.id = :recruitId")
    List<Application> findByRecruitIdWithUser(@Param("recruitId") Integer recruitId);

    @Modifying
    @Transactional
    @Query("UPDATE Application a SET a.status = :status WHERE a.id = :applicationId")
    void updateApplicationStatus(@Param("applicationId") Integer applicationId, @Param("status") String status);

    @Query("SELECT r.template.org.id FROM Application a JOIN a.recruit r JOIN r.template t WHERE a.id = :applicationId AND a.isDeleted = false")
    Optional<Integer> findOrgIdByApplicationId(@Param("applicationId") Integer applicationId);

    @Query("SELECT a FROM Application a WHERE a.recruit.id = :recruitId AND a.volunteer.id = :volunteerId")
    Optional<Application> findByRecruitIdAndVolunteerId(@Param("recruitId") Integer recruitId, @Param("volunteerId") Integer volunteerId);

    @Modifying
    @Transactional
    @Query("UPDATE Application a SET a.evaluationDone = true WHERE a.id = :applicationId")
    void markEvaluationAsDone(@Param("applicationId") Integer applicationId);

    // review part
    @Query("""
                SELECT COUNT(a) > 0 FROM Application a
                WHERE a.volunteer.user.id = :userId
                AND a.recruit.id = :recruitId
                AND a.isDeleted = false
            """)
    boolean existsByVolunteerUserIdAndRecruitId(@Param("userId") Integer userId,
                                                @Param("recruitId") Integer recruitId);

    // for VolRecruit -------------------------------------------
    // 사용자가 신청한 모집 공고 목록 조회
    @Query("SELECT a FROM Application a WHERE a.volunteer.id = (SELECT v.id FROM Volunteer v WHERE v.user.id = :userId) AND (:cursor = 0 OR a.id < :cursor) AND a.isDeleted = FALSE ORDER BY a.id DESC Limit :limit")
    List<Application> findApplicationsByUserId(@Param("userId") Integer userId, @Param("cursor") Integer cursor, @Param("limit") Integer limit);

    // 해당 봉사자가 해당 공고를 신청했는지 확인
    @Query("SELECT a FROM Application a WHERE a.recruit.id = :recruitId AND a.volunteer.user.id = :userId AND a.isDeleted = FALSE")
    Optional<Application> findApplicationByRecruitAndUser(@Param("recruitId") Integer recruitId, @Param("userId") Integer userId);


    List<Application> findByRecruitIdAndStatus(int recruitId, String status);
    Optional<Application> findByIdAndIsDeletedFalse(Integer applicationId);
}

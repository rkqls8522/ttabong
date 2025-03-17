package com.ttabong.repositoryjpa.user;

import com.ttabong.entity.user.Volunteer;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;

@Repository
public interface VolunteerRepositoryJpa extends JpaRepository<Volunteer, Integer> {

    @Transactional
    @Modifying
    @Query("UPDATE Volunteer v SET v.recommendedCount = v.recommendedCount + 1 WHERE v.id = :volunteerId")
    void incrementRecommendation(@Param("volunteerId") Integer volunteerId);

    @Transactional
    @Modifying
    @Query("UPDATE Volunteer v SET v.notRecommendedCount = v.notRecommendedCount + 1 WHERE v.id = :volunteerId")
    void incrementNotRecommendation(@Param("volunteerId") Integer volunteerId);

    // 봉사자 쿼리메소드 적기
    // userId로 volunteer(봉사자) 정보 가져오기
    Optional<Volunteer> findByUserId(@Param("userId") Integer userId);
}

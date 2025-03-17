package com.ttabong.repository.user;

import com.ttabong.entity.user.Volunteer;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;

@Repository
public interface VolunteerRepository extends JpaRepository<Volunteer, Integer> {

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
    @Query("SELECT v FROM Volunteer v WHERE v.user.id = :userId AND v.user.isDeleted = false")
    Optional<Volunteer> findByUserIdAndUserIsDeletedFalse(@Param("userId") int userId);

    @Query("SELECT COUNT(v) > 0 FROM Volunteer v JOIN v.user u WHERE u.id = :userId AND u.isDeleted = FALSE")
    boolean existsByUserIdAndUserIsDeletedFalse(Integer userId);

}

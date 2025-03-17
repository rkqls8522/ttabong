package com.ttabong.repositoryjpa.sns;

import com.ttabong.entity.sns.Review;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ReviewRepositoryJpa extends JpaRepository<Review, Integer> {

    @Query("""
                SELECT r FROM Review r
                WHERE r.id = :reviewId AND r.isDeleted = false
            """)
    Optional<Review> findByIdAndIsDeletedFalse(@Param("reviewId") Integer reviewId);


    @Query("""
                SELECT r FROM Review r
                LEFT JOIN FETCH r.writer w
                LEFT JOIN FETCH r.org o
                LEFT JOIN FETCH r.recruit rec
                LEFT JOIN FETCH rec.template t
                LEFT JOIN FETCH t.group g
                WHERE (:cursor IS NULL OR r.id < :cursor)
                AND r.isDeleted = false
                ORDER BY r.id DESC
            """)
    List<Review> findAllReviews(@Param("cursor") Integer cursor, Pageable pageable);

    @Query("""
                SELECT r FROM Review r
                LEFT JOIN FETCH r.writer w
                LEFT JOIN FETCH r.org o
                LEFT JOIN FETCH r.recruit rec
                LEFT JOIN FETCH rec.template t
                LEFT JOIN FETCH t.group g
                WHERE rec.id = :recruitId
                AND r.isDeleted = false
                ORDER BY r.createdAt DESC
            """)
    List<Review> findByRecruitId(@Param("recruitId") Integer recruitId);

    @Query("""
                SELECT r FROM Review r
                WHERE r.org.id = r.writer.id
                AND r.recruit.id = :recruitId
                ORDER BY r.createdAt DESC
                LIMIT 1
            """)
    Optional<Review> findFirstByOrgWriterAndRecruit(@Param("recruitId") Integer recruitId);

    @Query("""
                SELECT COUNT(r) > 0 FROM Review r
                WHERE r.recruit.id = :recruitId
                AND r.writer.id = :userId
                AND r.isDeleted = false
            """)
    boolean existsByWriterAndRecruit(@Param("userId") Integer userId, @Param("recruitId") Integer recruitId);

    @Query("""
                SELECT DISTINCT r FROM Review r
                WHERE r.writer.id = :userId
                AND r.isDeleted = false
                ORDER BY r.createdAt DESC
            """)
    List<Review> findDistinctByWriterId(@Param("userId") Integer userId, Pageable pageable);


    @Query("""
                SELECT r FROM Review r
                WHERE r.recruit.id = :recruitId
                AND r.isDeleted = false
                ORDER BY r.createdAt DESC
            """)
    List<Review> findByRecruitIdAndIsDeletedFalse(@Param("recruitId") Integer recruitId);

    @Modifying
    @Query("""
                UPDATE Review r
                SET r.isPublic = CASE WHEN r.isPublic = true THEN false ELSE true END,
                    r.updatedAt = CURRENT_TIMESTAMP
                WHERE r.id = :reviewId
            """)
    void toggleReviewVisibility(@Param("reviewId") Integer reviewId);


}

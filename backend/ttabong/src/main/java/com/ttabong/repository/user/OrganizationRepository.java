package com.ttabong.repository.user;

import com.ttabong.entity.user.Organization;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface OrganizationRepository extends JpaRepository<Organization, Integer> {

    boolean existsByUserId(Integer userId);

    Optional<Organization> findByUserId(Integer userId);

    @Query("SELECT COUNT(o) > 0 FROM Organization o JOIN o.user u WHERE u.id = :userId AND u.isDeleted = FALSE")
    boolean existsByUserIdAndUserIsDeletedFalse(Integer userId);
}

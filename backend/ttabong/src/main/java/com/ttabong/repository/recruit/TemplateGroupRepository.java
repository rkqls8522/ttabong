package com.ttabong.repository.recruit;

import com.ttabong.entity.recruit.TemplateGroup;
import com.ttabong.entity.user.Organization;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface TemplateGroupRepository extends JpaRepository<TemplateGroup, Integer> {

    @Modifying
    @Query("UPDATE TemplateGroup tg SET tg.groupName = :groupName WHERE tg.id = :groupId AND tg.org.id = :orgId AND tg.isDeleted = false AND tg.groupName <> :groupName")
    void updateGroup(@Param("groupId") Integer groupId, @Param("orgId") Integer orgId, @Param("groupName") String groupName);

    @Query("SELECT tg FROM TemplateGroup tg WHERE tg.isDeleted = false ORDER BY tg.id DESC")
    List<TemplateGroup> findGroups(Pageable pageable);

    boolean existsByOrgAndGroupNameAndIsDeletedFalse(Organization org, String groupName);

    Optional<TemplateGroup> findByIdAndIsDeletedFalse(Integer groupId);

}

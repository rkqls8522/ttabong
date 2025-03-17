package com.ttabong.repositoryjpa.recruit;

import com.ttabong.entity.recruit.TemplateGroup;
import com.ttabong.entity.user.Organization;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface TemplateGroupRepositoryJpa extends JpaRepository<TemplateGroup, Integer> {

    @EntityGraph(attributePaths = {"org.user"})
    Optional<TemplateGroup> findByIdAndIsDeletedFalse(Integer groupId);

    @EntityGraph(attributePaths = {})
    Optional<TemplateGroup> findByOrgIdAndGroupNameAndIsDeletedFalse(Integer orgId, String groupName);

    @EntityGraph(attributePaths = {"templates.images"})
    List<TemplateGroup> findByOrgAndIsDeletedFalseAndIdGreaterThan(Organization org, Integer id, Pageable pageable);
}

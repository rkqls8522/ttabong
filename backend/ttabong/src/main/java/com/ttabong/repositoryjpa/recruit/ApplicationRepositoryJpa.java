package com.ttabong.repositoryjpa.recruit;

import com.ttabong.entity.recruit.Application;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

@Repository
public interface ApplicationRepositoryJpa extends JpaRepository<Application, Integer> {

    int countByRecruitIdAndStatusNotInAndIsDeletedFalse(Integer recruitId, List<String> status);

    @EntityGraph(attributePaths = {"volunteer.user"})
    List<Application> findByRecruitId(Integer recruitId);

    @EntityGraph(attributePaths = {"volunteer.user"})
    Optional<Application> findById(Integer id);

    default Map<Integer, Application> findByRecruitIdMap(Integer recruitId){
        return findByRecruitId(recruitId).stream().collect(Collectors.toMap(application -> application.getVolunteer().getId(), application -> application));
    }
}

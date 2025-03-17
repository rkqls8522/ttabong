package com.ttabong.repositoryjpa.recruit;

import com.ttabong.entity.recruit.Category;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface CategoryRepositoryJpa extends JpaRepository<Category, Integer> {
}

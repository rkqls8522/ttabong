package com.ttabong.repositoryjpa.user;

import com.ttabong.dto.user.UserLoginProjection;
import com.ttabong.entity.user.User;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface UserRepositoryJpa extends JpaRepository<User, Integer> {

    //로그인 할 때 사용
    UserLoginProjection findByEmailAndIsDeletedFalse(String email);

    @EntityGraph(attributePaths = {"org"})
    Optional<User> findByIdAndIsDeletedFalse(Integer userId);

    //이메일 중복확인이나 계정찾기처럼 간단히 조회할 때 사용
    boolean existsByEmailAndIsDeletedFalse(String email);


}

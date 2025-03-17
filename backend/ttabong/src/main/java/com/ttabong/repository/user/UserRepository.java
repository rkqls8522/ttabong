package com.ttabong.repository.user;

import com.ttabong.dto.user.UserLoginProjection;
import com.ttabong.entity.user.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface UserRepository extends JpaRepository<User, Integer> {

    //로그인 할 때 사용
    UserLoginProjection findByEmailAndIsDeletedFalse(String email);

    //이메일 중복확인이나 계정찾기처럼 간단히 조회할 때 사용
    boolean existsByEmailAndIsDeletedFalse(String email);


}

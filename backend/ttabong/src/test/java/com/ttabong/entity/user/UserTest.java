package com.ttabong.entity.user;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.*;

class UserTest {
    private User user;

    @BeforeEach
    void setUp() {
        user = User.builder()
                .email("test@email.com")
                .name("김싸피")
                .password("testpw")
                .phone("010-1234-5678")
                .profileImage("이미지url")
                .build();
    }

    @Test
    @DisplayName("user 객체 생성 테스트")
    void createUserTest() {
        assertNotNull(user);
        assertEquals("test@email.com", user.getEmail());
        assertEquals("김싸피", user.getName());
        assertEquals("testpw", user.getPassword());
        assertEquals("010-1234-5678", user.getPhone());
        assertEquals("이미지url", user.getProfileImage());
    }

//    @Test
//    @DisplayName("같은 필드값을 가진 객체가 동일한지 검사")
//    void testUserEquality() {
//        User user2 = User.builder()
//                .email("test@email.com")
//                .name("김싸피")
//                .password("testpw")
//                .phone("010-1234-5678")
//                .profileImage("이미지url")
//                .build();
//
//        assertEquals(user, user2);
//        assertEquals(user.hashCode(), user2.hashCode());
//    }
}

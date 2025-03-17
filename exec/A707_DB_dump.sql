SET NAMES utf8mb4;
SET character_set_client = utf8mb4;
SET character_set_connection = utf8mb4;
SET character_set_results = utf8mb4;

DROP DATABASE IF EXISTS volunteer_service;
CREATE DATABASE IF NOT EXISTS volunteer_service DEFAULT CHARACTER SET utf8 COLLATE utf8_general_ci;
USE volunteer_service;

DROP TABLE IF EXISTS User;
CREATE TABLE User (
                      user_id        INT AUTO_INCREMENT PRIMARY KEY COMMENT '유저 ID',
                      email          VARCHAR(80) NOT NULL COMMENT '유저 이메일 (로그인 ID)',
                      name           VARCHAR(50)  NOT NULL COMMENT '유저 이름',
                      password       VARCHAR(256) NOT NULL COMMENT '비밀번호(해시로 바꾸고 넣어야 함)',
                      phone          VARCHAR(20)  NOT NULL COMMENT '전화번호',
                      total_volunteer_hours DECIMAL(7,2) DEFAULT 0.00 NOT NULL,
                      profile_image  VARCHAR(200) COMMENT '프로필 사진 경로',
                      is_deleted     BOOLEAN DEFAULT FALSE COMMENT '삭제 여부',
                      created_at     DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '가입 일시'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='전체 유저 정보 테이블';

DROP TABLE IF EXISTS Volunteer;
CREATE TABLE Volunteer(
                          volunteer_id    INT AUTO_INCREMENT NOT NULL COMMENT '봉사자 아이디_자동증가값 받는 최소성 고유키',
                          user_id         INT NOT NULL COMMENT 'User(user_id) 참조',
                          preferred_time  VARCHAR(100) COMMENT '봉사 선호 시간',
                          interest_theme  VARCHAR(100) COMMENT '관심 봉사 테마',
                          duration_time   VARCHAR(100) COMMENT '봉사 선호 소요시간',
                          region          VARCHAR(30)  COMMENT '지역',
                          birth_date      DATE         COMMENT '생년월일',
                          gender          CHAR(1)      COMMENT '성별(M/F)',
                          recommended_count   INT     DEFAULT 0 COMMENT '추천 횟수',
                          not_recommended_count INT   DEFAULT 0 COMMENT '비추천 횟수',
                          PRIMARY KEY (volunteer_id),
                          CONSTRAINT fk_volunteer_extra_user
                              FOREIGN KEY (user_id) REFERENCES User(user_id)
                                  ON UPDATE CASCADE ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='봉사자 추가 정보 테이블';

DROP TABLE IF EXISTS Organization;
CREATE TABLE Organization (
                              org_id               INT AUTO_INCREMENT PRIMARY KEY COMMENT '기관 ID_ 지금은 쓸 일이 없지만 테이블별로 관리할 기본키가 있어야 하기 때문에 생성함!',
                              user_id              INT NOT NULL COMMENT 'User(user_id) 참조',
                              business_reg_number  VARCHAR(30)  NOT NULL COMMENT '사업자등록번호',
                              org_name             VARCHAR(100) NOT NULL COMMENT '회사/점포명',
                              representative_name  VARCHAR(80)  NOT NULL COMMENT '대표 담당자명',
                              org_address          VARCHAR(200) NOT NULL COMMENT '주소',
                              created_at           DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '가입 일시',
                              CONSTRAINT fk_organization_user
                                  FOREIGN KEY (user_id) REFERENCES User(user_id)
                                      ON UPDATE CASCADE ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='봉사기관 기본 정보';

DROP TABLE IF EXISTS Category;
CREATE TABLE Category (
                          category_id INT AUTO_INCREMENT PRIMARY KEY COMMENT 'category PK',
                          name        VARCHAR(50) NOT NULL COMMENT '카테고리 이름',
                          parent_id   INT NULL COMMENT '부모 카테고리 ID, NULL이면 대분류',
                          CONSTRAINT  fk_category_parent
                              FOREIGN KEY (parent_id) REFERENCES Category(category_id)
                                  ON UPDATE CASCADE ON DELETE CASCADE
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4;

DROP TABLE IF EXISTS Template_group;
CREATE TABLE IF NOT EXISTS Template_group (
                                              group_id INT AUTO_INCREMENT PRIMARY KEY COMMENT '템플릿그룹 id',
                                              org_id INT NOT NULL COMMENT '해당 그룹을 관리 및 이용 중인 기관ID',
                                              group_name VARCHAR(100) NOT NULL DEFAULT '봉사' COMMENT '그룹명(사용자가 입력할 수 있음_기본은 "봉사")',
    is_deleted     BOOLEAN DEFAULT FALSE COMMENT '삭제 여부',
    CONSTRAINT fk_group_org
    FOREIGN KEY (org_id) REFERENCES Organization(org_id)
    ON UPDATE CASCADE ON DELETE CASCADE
    ) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4;

CREATE TABLE IF NOT EXISTS Template (
                                        template_id INT AUTO_INCREMENT PRIMARY KEY COMMENT '개별 템플릿 id',
                                        group_id INT NOT NULL COMMENT '그룹id',
                                        org_id INT COMMENT '관련 기관 id',
                                        category_id INT COMMENT '봉사 분류',
                                        title VARCHAR(255) COMMENT '공고 제목(봉사 제목)',
    activity_location VARCHAR(255) NOT NULL COMMENT '봉사 활동 장소(재택 또는 도로명주소)',
    status ENUM('ALL', 'YOUTH', 'ADULT') NOT NULL DEFAULT 'ALL' COMMENT '봉사자 유형',
    contact_name VARCHAR(50) COMMENT '담당자명',
    contact_phone VARCHAR(20) COMMENT '담당자 연락처',
    description VARCHAR(500) COMMENT '봉사활동 상세 내용',
    is_deleted BOOLEAN DEFAULT FALSE COMMENT '삭제 여부',
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '템플릿 생성 일시',
    CONSTRAINT fk_template_group
    FOREIGN KEY (group_id) REFERENCES Template_group(group_id)
    ON UPDATE CASCADE ON DELETE CASCADE,
    CONSTRAINT fk_template_org
    FOREIGN KEY (org_id) REFERENCES Organization(org_id)
    ON UPDATE CASCADE ON DELETE CASCADE,
    CONSTRAINT fk_template_category
    FOREIGN KEY (category_id) REFERENCES Category(category_id)
    ON UPDATE CASCADE ON DELETE SET NULL
    ) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4;

DROP TABLE IF EXISTS Recruit;
CREATE TABLE IF NOT EXISTS Recruit (
                                       recruit_id INT PRIMARY KEY AUTO_INCREMENT COMMENT '봉사공고 ID',
                                       template_id INT NOT NULL COMMENT '개별 템플릿 id',
                                       deadline DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '공고 마감일 (디폴트는 오늘 날짜)',
                                       activity_date DATETIME NOT NULL COMMENT '봉사활동 날짜',
                                       activity_start DECIMAL(7,2) DEFAULT 0.00 NOT NULL COMMENT '봉사 시작시간',
    activity_end DECIMAL(7,2) DEFAULT 0.00 NOT NULL COMMENT '봉사 종료시간',
    max_volunteer INT DEFAULT 0 COMMENT '모집할 봉사자 수',
    participate_vol_count INT DEFAULT 0 COMMENT '참여한 봉사자 수',
    status ENUM('RECRUITING', 'RECRUITMENT_CLOSED', 'ACTIVITY_COMPLETED')
    NOT NULL DEFAULT 'RECRUITING' COMMENT '공고 모집 상태',
    is_deleted     BOOLEAN DEFAULT FALSE COMMENT '삭제 여부',
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '수정 시각',
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '공고 등록 일시',
    CONSTRAINT fk_recruit_template_id
    FOREIGN KEY (template_id) REFERENCES Template (template_id)
    ON UPDATE CASCADE ON DELETE CASCADE
    ) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4;

DROP TABLE IF EXISTS Application;
CREATE TABLE Application (
                             application_id     INT AUTO_INCREMENT PRIMARY KEY COMMENT '신청 ID',
                             volunteer_id INT NOT NULL COMMENT '신청한 봉사자',
                             recruit_id   INT NOT NULL COMMENT '신청 대상 공고',
                             status ENUM('PENDING', 'APPROVED', 'REJECTED', 'COMPLETED', 'AUTO_CANCEL', 'NO_SHOW') NOT NULL DEFAULT 'PENDING' COMMENT '신청 상태',
                             evaluation_done BOOLEAN DEFAULT FALSE COMMENT '평가 여부',
                             is_deleted     BOOLEAN DEFAULT FALSE COMMENT '삭제 여부',
                             created_at   DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '신청 일시',
                             updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '상태 변경 일시',
                             CONSTRAINT fk_application_volunteer
                                 FOREIGN KEY (volunteer_id) REFERENCES Volunteer(volunteer_id)
                                     ON UPDATE CASCADE ON DELETE CASCADE,
                             CONSTRAINT fk_application_recruit
                                 FOREIGN KEY (recruit_id) REFERENCES Recruit(recruit_id)
                                     ON UPDATE CASCADE ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='봉사공고 신청 상태 관리 테이블';

DROP TABLE IF EXISTS Review;
CREATE TABLE Review (
                        review_id      INT AUTO_INCREMENT PRIMARY KEY COMMENT '후기 ID',
                        parent_review_id INT NULL DEFAULT NULL COMMENT '자기참조 (FK)',
                        group_id INT NULL DEFAULT NULL COMMENT '비슷한 것을 거르기 위해 생성',
                        recruit_id INT NULL DEFAULT NULL COMMENT '어느 공고에 대한 글인가? (FK)',
                        org_id     	   INT NOT NULL COMMENT '작성하는 기관 (FK)',
                        writer_id INT NULL DEFAULT NULL COMMENT '작성자 ID(FK)',
                        title	VARCHAR(255) COMMENT '후기 제목 부분',
                        content        VARCHAR(500) NOT NULL COMMENT '후기 내용',
                        is_deleted     BOOLEAN DEFAULT FALSE COMMENT '삭제 여부',
                        is_public 	   BOOLEAN DEFAULT TRUE COMMENT '공개 여부',
                        img_count INT NULL DEFAULT NULL COMMENT '몇 개 이미지를 올렸는가?',
                        updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '수정 시각',
                        created_at     DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '기록 생성 일시',
                        CONSTRAINT fk_parent_review_id
                            FOREIGN KEY (parent_review_id) REFERENCES Review (review_id),
                        CONSTRAINT fk_group_id
                            FOREIGN KEY (group_id) REFERENCES Template_group (group_id),
                        CONSTRAINT fk_review_recruit
                            FOREIGN KEY (recruit_id) REFERENCES Recruit(recruit_id)
                                ON UPDATE CASCADE ON DELETE CASCADE,
                        CONSTRAINT fk_review_org
                            FOREIGN KEY (org_id) REFERENCES Organization(org_id)
                                ON UPDATE CASCADE ON DELETE CASCADE,
                        CONSTRAINT fk_writer_id
                            FOREIGN KEY (writer_id) REFERENCES User (user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='후기 테이블';

DROP TABLE IF EXISTS Review_image;
CREATE TABLE IF NOT EXISTS Review_image (
                                            image_id INT PRIMARY KEY AUTO_INCREMENT COMMENT '이미지 id',
                                            template_id INT NULL COMMENT '해당 이미지가 속한 템플릿 ID (Review와 연관된 Template)',
                                            review_id INT NULL COMMENT '해당 이미지가 속한 리뷰 ID',
                                            image_url VARCHAR(500) COMMENT '이미지 url',
    is_deleted BOOLEAN DEFAULT FALSE COMMENT '삭제 여부',
    is_thumbnail BOOLEAN DEFAULT FALSE COMMENT '대표 이미지 여부',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '이미지 생성시간',
    next_image_id INT NULL DEFAULT NULL COMMENT '다음에 올 이미지 id',

    CONSTRAINT fk_next_image_id
    FOREIGN KEY (next_image_id) REFERENCES Review_image(image_id),
    CONSTRAINT fk_review_image_review
    FOREIGN KEY (review_id) REFERENCES Review(review_id)
    ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT fk_review_image_template
    FOREIGN KEY (template_id) REFERENCES Template(template_id)
    ON DELETE SET NULL ON UPDATE CASCADE
    ) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4;

DROP TABLE IF EXISTS Review_comment;
CREATE TABLE Review_comment (
                                comment_id    INT AUTO_INCREMENT PRIMARY KEY COMMENT '댓글 ID',
                                writer_id     INT NOT NULL COMMENT '작성자(User(user_id)) (FK)',
                                review_id     INT NOT NULL COMMENT '어느 봉사자 후기에 대한 댓글인지 (FK)',
                                content       VARCHAR(500) NOT NULL COMMENT '댓글 내용',
                                is_deleted     BOOLEAN DEFAULT FALSE COMMENT '삭제 여부',
                                updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '수정 시각', -- 새로 추가한 컬럼
                                created_at    DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '댓글 작성 일시',
                                CONSTRAINT fk_comment_writer
                                    FOREIGN KEY (writer_id) REFERENCES User(user_id)
                                        ON UPDATE CASCADE ON DELETE CASCADE,
                                CONSTRAINT fk_comment_review
                                    FOREIGN KEY (review_id) REFERENCES Review(review_id)
                                        ON UPDATE CASCADE ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='후기에 대한 댓글 테이블';

DROP TABLE IF EXISTS Volunteer_reaction;
CREATE TABLE Volunteer_reaction (
                                    reaction_id   INT AUTO_INCREMENT PRIMARY KEY COMMENT '봉사자의 반응 ID',
                                    volunteer_id  INT NOT NULL COMMENT '봉사자 ID (FK)',
                                    recruit_id    INT NOT NULL COMMENT '반응한 대상 봉사공고 (FK)',
                                    is_like      BOOLEAN NOT NULL COMMENT '리액션종류가 좋아요인가? TRUE(1) : 좋아요, FALSE(0) : 싫어요',
                                    is_deleted     BOOLEAN DEFAULT FALSE COMMENT '삭제 여부',
                                    created_at     DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '좋아요 or 싫어요 반응 누른 일시',
                                    CONSTRAINT fk_reaction_volunteer
                                        FOREIGN KEY (volunteer_id) REFERENCES Volunteer(volunteer_id)
                                            ON UPDATE CASCADE ON DELETE CASCADE,
                                    CONSTRAINT fk_reaction_recruit
                                        FOREIGN KEY (recruit_id) REFERENCES Recruit(recruit_id)
                                            ON UPDATE CASCADE ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='봉사자가 좋아요한 공고 정보';

-- ddl part//////////////////////////

INSERT INTO Category (name, parent_id) VALUES ('활동보조', 1), ('이동지원', 1), ('청결지도', 1), ('급식지원', 1), ('식사·반찬지원', 1), ('기타', 1);
INSERT INTO Category (name, parent_id) VALUES ('주거개선', 2), ('마을공동체활동', 2), ('기타', 2);
INSERT INTO Category (name, parent_id) VALUES ('말벗·상담', 3), ('전문상담', 3), ('기타', 3);
INSERT INTO Category (name, parent_id) VALUES ('방과후 교육', 4), ('학습지도 교육', 4), ('특수교육', 4), ('평생교육', 4), ('전문교육', 4), ('진로체험지도', 4), ('기타', 4);
INSERT INTO Category (name, parent_id) VALUES ('간호·간병', 5), ('의료지원', 5), ('헌혈', 5), ('기타', 5);
INSERT INTO Category (name, parent_id) VALUES ('일손지원', 6), ('기타', 6);
INSERT INTO Category (name, parent_id) VALUES ('행사보조', 7), ('공연활동', 7), ('캠페인', 7), ('관광안내', 7), ('사진촬영', 7), ('기타', 7);
INSERT INTO Category (name, parent_id) VALUES ('환경정화', 8), ('환경감시', 8), ('기타', 8);
INSERT INTO Category (name, parent_id) VALUES ('사무지원', 9), ('업무지원', 9), ('기타', 9);
INSERT INTO Category (name, parent_id) VALUES ('어린이 안전', 10), ('청소년 안전', 10), ('취약계층 안전', 10), ('안전신고·활동', 10), ('기타', 10);
INSERT INTO Category (name, parent_id) VALUES ('인권개선', 11), ('공익보호', 11), ('기타', 11);
INSERT INTO Category (name, parent_id) VALUES ('긴급구조', 12), ('예방접종지원', 12), ('기타', 12);
INSERT INTO Category (name, parent_id) VALUES ('해외봉사', 13), ('국제행사단체지원', 13), ('통·번역', 13), ('기타', 13);
INSERT INTO Category (name, parent_id) VALUES ('멘토링', 14), ('학습지도 교육', 14), ('진로적성', 14), ('취업', 14), ('창업', 14), ('기타', 14);
INSERT INTO Category (name, parent_id) VALUES ('기타', 15);

INSERT INTO User (email, name, password, phone, total_volunteer_hours, profile_image, is_deleted, created_at)
VALUES
    ('vol1@ssafy.com', '김철수', '$2a$10$1lk5DL4n4jMV1cRhH4fsFemVHLcibKI7OHGBx5GJEACL.UOfneut6', '010-1234-5678', 12.5, '1_1.webp', FALSE, NOW()),
    ('vol2@ssafy.com', '이영희', '$2a$10$1lk5DL4n4jMV1cRhH4fsFemVHLcibKI7OHGBx5GJEACL.UOfneut6', '010-2345-6789', 30.0, '2_1.webp', FALSE, NOW()),
    ('vol3@ssafy.com', '박민수', '$2a$10$1lk5DL4n4jMV1cRhH4fsFemVHLcibKI7OHGBx5GJEACL.UOfneut6', '010-3456-7890', 5.0, '3_1.webp', FALSE, NOW()),
    ('org1@ssafy.com', '굿네이버스', '$2a$10$1lk5DL4n4jMV1cRhH4fsFemVHLcibKI7OHGBx5GJEACL.UOfneut6', '010-4567-8901', 0.0, '4_1.webp', FALSE, NOW()),
    ('org2@ssafy.com', '초록우산어린이재단', '$2a$10$1lk5DL4n4jMV1cRhH4fsFemVHLcibKI7OHGBx5GJEACL.UOfneut6', '010-5678-9012', 0.0, '5_1.webp', FALSE, NOW());

INSERT INTO Volunteer (user_id, preferred_time, interest_theme, duration_time, region, birth_date, gender, recommended_count, not_recommended_count)
VALUES
    (1, '주말 오후', '환경 보호', '2시간', '서울', '1995-06-15', 'M', 5, 0),
    (2, '평일 저녁', '교육 봉사', '3시간', '부산', '1998-09-22', 'F', 10, 1),
    (3, '주말 오전', '동물 보호', '1시간', '대전', '2000-01-10', 'M', 3, 0);

INSERT INTO Organization (user_id, business_reg_number, org_name, representative_name, org_address, created_at)
VALUES
    (4, '123-45-67890', '굿네이버스', '김기관', '서울특별시 강남구 테헤란로 123', NOW()),
    (5, '987-65-43210', '초록우산어린이재단', '이재단', '서울특별시 종로구 종로 456', NOW());

INSERT INTO Template_group (org_id, group_name, is_deleted)
VALUES
    (1, '환경 보호 캠페인', FALSE),
    (1, '아동 교육 지원', FALSE),
    (2, '노인 돌봄 활동', FALSE),
    (2, '동물 보호 봉사', FALSE);

INSERT INTO Template (group_id, org_id, category_id, title, activity_location, status, contact_name, contact_phone, description, is_deleted, created_at)
VALUES
    (1, 1, 1, '하천 정화 활동', '서울 강남구 청담천', 'ALL', '김담당', '010-1111-1111', '하천 주변의 쓰레기를 정리하는 봉사입니다.', FALSE, NOW()),
    (1, 1, 2, '도시 숲 가꾸기', '서울 강남구 양재 시민의 숲', 'ALL', '박책임', '010-2222-2222', '도시 내 숲을 가꾸고 보호하는 활동입니다.', FALSE, NOW()),
    -- 굿네이버스(기관 1번)의 두 번째 그룹(아동 교육 지원)
    (2, 1, 3, '초등학생 학습 멘토링', '서울 종로구 어린이도서관', 'YOUTH', '이강사', '010-3333-3333', '초등학생 대상 학습 지도 및 멘토링.', FALSE, NOW()),
    (2, 1, 4, '저소득층 아동 영어 교육', '서울 동대문구 청소년센터', 'YOUTH', '최관리', '010-4444-4444', '경제적 어려움을 겪는 아동을 위한 영어 수업 지원.', FALSE, NOW()),
    -- 초록우산어린이재단(기관 2번)의 두 번째 그룹(동물 보호 봉사)
    (4, 2, 7, '유기견 보호소 봉사', '대전 유기견 보호소', 'ALL', '김보호', '010-7777-7777', '유기견 보호소에서 강아지 돌봄 봉사.', FALSE, NOW()),
    (4, 2, 8, '길고양이 급식소 운영', '대전 중앙시장', 'ALL', '이집사', '010-8888-8888', '길고양이 급식소를 운영하며 보살피는 활동.', FALSE, NOW()),
    -- 초록우산어린이재단(기관 2번)의 첫 번째 그룹(노인 돌봄 활동)
    (3, 2, 5, '경로당 청소 및 식사 지원', '부산 수영구 경로당', 'ADULT', '장센터', '010-5555-5555', '노인을 위한 청소 및 식사 제공 봉사.', FALSE, NOW()),
    (3, 2, 6, '독거노인 말벗 봉사', '부산 해운대구 독거노인 센터', 'ADULT', '홍담당', '010-6666-6666', '혼자 사시는 노인분들과 대화 및 산책 봉사.', FALSE, NOW());


INSERT INTO Recruit (template_id, deadline, activity_date, activity_start, activity_end, max_volunteer, participate_vol_count, status, is_deleted, updated_at, created_at)
VALUES
    (1, NOW() + INTERVAL 5 DAY, NOW() + INTERVAL 7 DAY, 9.00, 12.00, 20, 0, 'ACTIVITY_COMPLETED', FALSE, NOW(), NOW()),
    (1, NOW() + INTERVAL 10 DAY, NOW() + INTERVAL 14 DAY, 14.00, 17.00, 15, 0, 'ACTIVITY_COMPLETED', FALSE, NOW(), NOW()),
    (2, NOW() + INTERVAL 3 DAY, NOW() + INTERVAL 6 DAY, 10.00, 13.00, 25, 0, 'ACTIVITY_COMPLETED', FALSE, NOW(), NOW()),
    (2, NOW() + INTERVAL 8 DAY, NOW() + INTERVAL 12 DAY, 13.00, 16.00, 30, 0, 'ACTIVITY_COMPLETED', FALSE, NOW(), NOW()),
    (3, NOW() + INTERVAL 7 DAY, NOW() + INTERVAL 10 DAY, 15.00, 18.00, 10, 0, 'ACTIVITY_COMPLETED', FALSE, NOW(), NOW()),
    (3, NOW() + INTERVAL 12 DAY, NOW() + INTERVAL 15 DAY, 16.00, 19.00, 12, 0, 'ACTIVITY_COMPLETED', FALSE, NOW(), NOW()),
    (4, NOW() + INTERVAL 4 DAY, NOW() + INTERVAL 9 DAY, 17.00, 19.00, 10, 0, 'ACTIVITY_COMPLETED', FALSE, NOW(), NOW()),
    (4, NOW() + INTERVAL 9 DAY, NOW() + INTERVAL 13 DAY, 14.00, 17.00, 15, 0, 'ACTIVITY_COMPLETED', FALSE, NOW(), NOW()),
    (5, NOW() + INTERVAL 6 DAY, NOW() + INTERVAL 11 DAY, 8.00, 11.00, 20, 0, 'ACTIVITY_COMPLETED', FALSE, NOW(), NOW()),
    (5, NOW() + INTERVAL 10 DAY, NOW() + INTERVAL 14 DAY, 9.00, 12.00, 18, 0, 'RECRUITING', FALSE, NOW(), NOW()),
    (6, NOW() + INTERVAL 5 DAY, NOW() + INTERVAL 10 DAY, 14.00, 17.00, 10, 0, 'RECRUITING', FALSE, NOW(), NOW()),
    (6, NOW() + INTERVAL 10 DAY, NOW() + INTERVAL 15 DAY, 15.00, 18.00, 12, 0, 'RECRUITING', FALSE, NOW(), NOW()),
    (7, NOW() + INTERVAL 3 DAY, NOW() + INTERVAL 6 DAY, 10.00, 13.00, 15, 0, 'RECRUITING', FALSE, NOW(), NOW()),
    (7, NOW() + INTERVAL 8 DAY, NOW() + INTERVAL 12 DAY, 13.00, 16.00, 20, 0, 'RECRUITING', FALSE, NOW(), NOW()),
    (8, NOW() + INTERVAL 5 DAY, NOW() + INTERVAL 10 DAY, 18.00, 20.00, 8, 0, 'RECRUITING', FALSE, NOW(), NOW()),
    (8, NOW() + INTERVAL 10 DAY, NOW() + INTERVAL 15 DAY, 17.00, 20.00, 10, 0, 'RECRUITING', FALSE, NOW(), NOW());


SET SQL_SAFE_UPDATES = 0;

UPDATE Review_image AS img1
    JOIN Review_image AS img2
ON img1.template_id = img2.template_id
    AND img1.image_url < img2.image_url
    SET img1.next_image_id = img2.image_id;

SET SQL_SAFE_UPDATES = 1;

-- ----------------------------------------
INSERT INTO Review (parent_review_id, group_id, recruit_id, org_id, writer_id, title, content, is_deleted, is_public, img_count, updated_at, created_at)
VALUES
    (NULL, 1, 1, 1, 1, '깨끗한 하천 만들기', '강남 청담천에서 봉사활동을 했습니다. 많은 분들이 함께해서 뿌듯했어요!', FALSE, TRUE, 2, NOW(), NOW()),
    (NULL, 2, 3, 1, 1, '도시 숲 가꾸기 봉사 후기', '양재 시민의 숲에서 나무를 심고 정리하는 활동을 했어요.', FALSE, TRUE, 2, NOW(), NOW()),
    (NULL, 3, 5, 2, 2, '아이들에게 도움을 줄 수 있어서 기뻤어요', '초등학생들을 대상으로 학습 멘토링을 진행했습니다. 의미 있는 시간이었습니다.', FALSE, TRUE, 2, NOW(), NOW()),
    (NULL, 4, 7, 2, 2, '아이들과 함께하는 즐거운 영어교실', '많이 배우고 느꼈어요!', FALSE, TRUE, 2, NOW(), NOW()),
    (NULL, 1, 2, 1, 3, '푸른 미래를 위한 한 걸음', '더 맑은 내일을 위해 뿌듯한 하루를 보냈습니다.', FALSE, TRUE, 2, NOW(), NOW()),
    (NULL, 4, 8, 2, 3, '길고양이 급식소 운영 후기', '고양이들에게 사료를 나누어주고 관리하는 봉사를 했어요.', FALSE, TRUE, 2, NOW(), NOW());

INSERT INTO Review (parent_review_id, group_id, recruit_id, org_id, writer_id, title, content, is_deleted, is_public, img_count, updated_at, created_at)
VALUES
    (NULL, 1, 9, 1, 4, '연탄 봉사', '사랑의 연탄 나르기', FALSE, TRUE, 1, NOW(), NOW()),
    (NULL, 3, 5, 2, 5, '초등학생 학습 봉사', '따뜻한 여러분 덕분에 아이들도 행복했어요', FALSE, TRUE, 1, NOW(), NOW()),
    (NULL, 1, 2, 1, 4, '기관 관리자 리뷰 - 환경 봉사 가꾸기', '봉사활동이 잘 마무리되었습니다.', FALSE, TRUE, 1, NOW(), NOW()),
    (NULL, 2, 3, 1, 4, '기관 관리자 리뷰 - 도시 숲 가꾸기', '나무 심기 봉사활동이 잘 마무리되었습니다.', FALSE, TRUE, 1, NOW(), NOW()),
    (NULL, 4, 8, 2, 5, '기관 관리자 리뷰 - 저소득 아동 영어', '매우 유익한 시간이었습니다.', FALSE, TRUE, 1, NOW(), NOW());

SET SQL_SAFE_UPDATES = 0;

UPDATE Review AS child
    JOIN (
    SELECT r1.review_id AS parent_id, r1.recruit_id, r1.org_id, r1.writer_id
    FROM Review r1
    JOIN Organization o ON r1.org_id = o.org_id AND r1.writer_id = o.user_id
    ) AS parent
ON child.recruit_id = parent.recruit_id
    AND child.org_id = parent.org_id
    AND child.writer_id <> parent.writer_id
    AND (child.parent_review_id IS NULL OR child.parent_review_id <> parent.parent_id)
    SET child.parent_review_id = parent.parent_id;

SET SQL_SAFE_UPDATES = 1;

-- --------------------------
-- 봉사활동 정말 보람차네요. 저도 참여해 보고 싶어요!강아지들이 너무 귀엽네요! 다음번엔 저도 함께할게요.
INSERT INTO Review_comment (writer_id, review_id, content, is_deleted, updated_at, created_at)
VALUES
    (2, 1, '정말 멋진 활동이네요! 한번 더 참여하고 싶어요.', FALSE, NOW(), NOW()),
    (4, 1, '기관 측에서도 감사드립니다. 참여해주셔서 고맙습니다!', FALSE, NOW(), NOW()),
    (3, 2, '삭막한 도시가 푸르게 바뀌어가는 첫 걸음이네요!', FALSE, NOW(), NOW()),
    (5, 2, '우리 기관에서도 더 좋은 프로그램을 준비하겠습니다!', FALSE, NOW(), NOW()),
    (1, 3, '저도 학습 멘토링 했었는데 아이들이 너무 좋아하더라고요!', FALSE, NOW(), NOW()),
    (5, 3, '모두 매우 만족하셨습니다. 감사합니다!', FALSE, NOW(), NOW()),
    (3, 4, '아이들이 너무 귀여워요! 즐거웠어요 :>', FALSE, NOW(), NOW()),
    (4, 4, '저희도 큰 도움 받았습니다. 참여해 주셔서 감사해요!', FALSE, NOW(), NOW()),
    (2, 5, '숲이 깨끗해지니 기분이 너무 좋아요! 함께해서 즐거웠습니다.', FALSE, NOW(), NOW()),
    (4, 5, '환경 보호 활동은 꾸준히 필요합니다. 좋은 후기 감사합니다!', FALSE, NOW(), NOW()),
    (1, 6, '정말 도움이 되는 활동이네요!', FALSE, NOW(), NOW()),
    (5, 6, '앞으로도 적극 지원하겠습니다.', FALSE, NOW(), NOW());

-- ---------------
INSERT INTO Application (volunteer_id, recruit_id, status, evaluation_done, is_deleted, created_at, updated_at)
VALUES
    (1, 1, 'COMPLETED', TRUE, FALSE, NOW(), NOW()),
    (1, 3, 'COMPLETED', FALSE, FALSE, NOW(), NOW()),
    (1, 6, 'PENDING', FALSE, FALSE, NOW(), NOW()),
    (2, 1, 'APPROVED', FALSE, FALSE, NOW(), NOW()),
    (2, 5, 'APPROVED', TRUE, FALSE, NOW(), NOW()),
    (2, 4, 'APPROVED', TRUE, FALSE, NOW(), NOW()),
    (2, 6, 'PENDING', TRUE, FALSE, NOW(), NOW()),
    (2, 7, 'REJECTED', FALSE, FALSE, NOW(), NOW()),
    (3, 2, 'COMPLETED', TRUE, FALSE, NOW(), NOW()),
    (3, 8, 'AUTO_CANCEL', FALSE, FALSE, NOW(), NOW()),
    (3, 1, 'NO_SHOW', TRUE, FALSE, NOW(), NOW());

INSERT INTO Review_image (review_id, template_id, image_url, is_deleted, is_thumbnail, created_at, next_image_id)
VALUES
    (1, 1,'1_1.webp', FALSE, TRUE, NOW(), NULL), -- 노인 말벗
    (2, 2,'2_1.webp', FALSE, TRUE, NOW(), NULL),-- 취약계층 일손 봉사
    (3, 3,'3_1.webp', FALSE, TRUE, NOW(), NULL), -- 공원 플로깅
    (4, 4,'4_1.webp', FALSE, TRUE, NOW(), NULL),-- 해외아동 교육 봉사
    (5, 1,'5_1.webp', FALSE, TRUE, NOW(), NULL), -- 초등학생 학습 멘토링
    (6, 4,'6_1.webp', FALSE, TRUE, NOW(), NULL),-- 재난지역 청소 지원 봉사
    (7, 1, '7_1.webp', FALSE, TRUE, NOW(), NULL), -- 저소득층 아동 영어 교육
    (7, 1, '7_2.webp', FALSE, FALSE, NOW(), NULL),-- 연탄봉사
    (7, 1, '7_3.webp', FALSE, FALSE, NOW(), NULL),
    (7, 1, '7_4.webp', FALSE, FALSE, NOW(), NULL),
    (7, 1, '7_5.webp', FALSE, FALSE, NOW(), NULL),
    (7, 1, '7_6.webp', FALSE, FALSE, NOW(), NULL),
    (7, 1, '7_7.webp', FALSE, FALSE, NOW(), NULL),
    (7, 1, '7_8.webp', FALSE, FALSE, NOW(), NULL),
    (7, 1, '7_9.webp', FALSE, FALSE, NOW(), NULL);

INSERT INTO Volunteer_reaction (volunteer_id, recruit_id, is_like, created_at)
SELECT v.volunteer_id, r.recruit_id, CASE WHEN RAND() > 0.5 THEN TRUE ELSE FALSE END, NOW()
FROM Volunteer v JOIN Recruit r ON RAND() < 0.5 LIMIT 50;

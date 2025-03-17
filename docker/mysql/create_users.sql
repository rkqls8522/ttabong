-- 유저 생성 및 권한 설정
CREATE USER IF NOT EXISTS 'ddabong'@'%' IDENTIFIED BY '707';
GRANT ALL PRIVILEGES ON volunteer_service.* TO 'ddabong'@'%';

ALTER USER 'ddabong'@'%' IDENTIFIED BY '707';
GRANT ALL PRIVILEGES ON volunteer_service.* TO 'ddabong'@'%';
FLUSH PRIVILEGES;
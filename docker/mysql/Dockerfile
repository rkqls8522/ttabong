# MySQL 8.0 공식 이미지 사용
FROM mysql:8.0

# 환경 변수 설정 (Kubernetes Secret 또는 ConfigMap과 호환)
ENV MYSQL_ROOT_PASSWORD=root
ENV MYSQL_DATABASE=volunteer_service
ENV MYSQL_USER=ddabong
ENV MYSQL_PASSWORD=707

# 초기화 스크립트 복사
COPY ./init.sql /docker-entrypoint-initdb.d/
COPY ./create_users.sql /docker-entrypoint-initdb.d/

# 데이터 지속성 유지
VOLUME ["/var/lib/mysql"]

# Healthcheck 추가
HEALTHCHECK --interval=10s --timeout=5s --retries=5 \
  CMD mysqladmin ping -h localhost -u root --password=root || exit 1
# 공식 Redis 이미지를 기반으로 사용
FROM redis:7.4.0

# Redis 설정 파일 복사
COPY redis.conf /usr/local/etc/redis/redis.conf

# 데이터 지속성 유지
VOLUME ["/data"]

# Healthcheck 추가
HEALTHCHECK --interval=10s --timeout=5s --retries=5 \
  CMD redis-cli ping || exit 1

# Redis 실행
CMD ["redis-server", "/usr/local/etc/redis/redis.conf"]
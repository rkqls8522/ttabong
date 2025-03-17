# 공식 RabbitMQ 이미지 사용 (관리 UI 포함)
FROM rabbitmq:3.12-management

# 환경 변수 설정
ENV RABBITMQ_DEFAULT_USER=ddabong
ENV RABBITMQ_DEFAULT_PASS=707

# 데이터 지속성 유지
VOLUME ["/var/lib/rabbitmq"]

# Healthcheck 추가
HEALTHCHECK --interval=10s --timeout=5s --retries=5 \
  CMD rabbitmqctl status || exit 1

# RabbitMQ 실행
CMD ["rabbitmq-server"]

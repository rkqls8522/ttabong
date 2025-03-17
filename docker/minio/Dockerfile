# MinIO 공식 이미지 사용
FROM quay.io/minio/minio:latest

# 환경 변수 설정 (Access Key / Secret Key / 기본 버킷)
ENV MINIO_ROOT_USER=ttabong
ENV MINIO_ROOT_PASSWORD=ttabong-bongteum
ENV MINIO_DEFAULT_BUCKETS=ttabong-bucket

# 데이터 저장소 설정
VOLUME ["/data"]

# MinIO 실행
CMD ["server", "/data", "--console-address", ":9001"]

#docker build -t my-minio .
#docker run -p 9000:9000 -p 9001:9001 --name minio-container my-minio
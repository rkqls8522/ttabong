# 2️⃣ Nginx를 이용해 정적 파일 서빙
FROM nginx:1.21.3-alpine
WORKDIR /usr/share/nginx/html

# Nginx 설정 파일 복사
COPY ./local_nginx.conf /etc/nginx/nginx.conf

# 컨테이너 실행 시 Nginx 실행
CMD ["nginx", "-g", "daemon off;"]

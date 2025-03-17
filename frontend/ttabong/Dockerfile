# 🔹 1단계: React 빌드 (builder 스테이지)
FROM node:20 AS builder
WORKDIR /app

# package.json과 package-lock.json만 먼저 복사 후 의존성 설치
COPY package*.json ./
RUN npm install

# 전체 프로젝트 복사
COPY . .

# React 빌드 실행
RUN npm run build

# 빌드 결과 확인
RUN ls -l build  

# 🔹 2단계: Nginx 스테이지
FROM nginx:alpine
WORKDIR /usr/share/nginx/html

# ✅ 빌드된 `build` 폴더를 제대로 복사
COPY --from=builder /app/build/ /usr/share/nginx/html 

# ✅ Nginx 설정 파일을 Dockerfile로 복사
COPY ./nginx.conf /etc/nginx/nginx.conf

# ✅ Nginx 실행
CMD ["nginx", "-g", "daemon off;"]

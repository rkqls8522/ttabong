#!/bin/bash

echo "🚀 GitLab Runner 정리 및 재시작 스크립트 실행 중..."

# 1️⃣ 실행 중인 모든 GitLab Runner 작업 중지
echo "🛑 모든 실행 중인 GitLab Runner 작업 중지..."
gitlab-runner stop

# 2️⃣ 정리할 대상 설정
echo "🧹 불필요한 컨테이너 정리..."
docker container prune -f

echo "🧹 사용되지 않는 볼륨 정리..."
docker volume prune -f

echo "🧹 사용되지 않는 네트워크 정리..."
docker network prune -f

echo "🧹 사용되지 않는 이미지 정리..."
docker image prune -af

# 3️⃣ GitLab Runner 다시 시작
echo "🔄 GitLab Runner 재시작..."
gitlab-runner restart

# 4️⃣ 실행 중인 Docker 컨테이너 목록 확인
echo "✅ 현재 실행 중인 Docker 컨테이너 목록:"
docker ps

echo "🎉 GitLab Runner 정리 완료!"
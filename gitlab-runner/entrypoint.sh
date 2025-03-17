#!/bin/sh
echo "📌 GitLab Runner 등록 중..."
if [ -f .env ]; then
  source .env
else
  echo "❌ .env 파일을 찾을 수 없습니다."
  exit 1
fi
gitlab-runner register --non-interactive \
   --url https://lab.ssafy.com  \
   --token "$GITLAB_RUNNER_TOKEN" \
   --executor "docker" \
   --docker-image "alpine:latest" \
   --description "docker-runner" \
   --docker-privileged

echo "✅ GitLab Runner 등록 완료"

# GitLab Runner 실행
echo "🚀 GitLab Runner 실행 중..."
exec gitlab-runner run
#cat /etc/gitlab-runner/config.toml

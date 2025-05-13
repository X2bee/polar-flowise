#!/bin/sh
set -euxo pipefail

FLOWISE_DIR="/root/.flowise"

mkdir -p "$FLOWISE_DIR"

echo "[$(date)] ===== Container Start ====="

# Git 설정
if [ -z "$GIT_REPO_URL" ]; then
  echo "[$(date)] ERROR: GIT_REPO_URL is not set!"
  exit 1
fi

# Git clone or pull
if [ ! -d "$FLOWISE_DIR/.git" ]; then
  echo "[$(date)] Cloning repository: $GIT_REPO_URL"
  git clone "$GIT_REPO_URL" "$FLOWISE_DIR"
else
  echo "[$(date)] Pulling latest changes..."
  cd "$FLOWISE_DIR" && git pull origin main
fi

# 의존성 설치 및 빌드
cd "$FLOWISE_DIR"

# pnpm 설치 확인 후 없으면 설치
if ! command -v pnpm >/dev/null 2>&1; then
  echo "[$(date)] pnpm not found, installing..."
  npm install -g pnpm
fi

# 의존성 설치 및 빌드
echo "[$(date)] Installing dependencies..."
pnpm install --frozen-lockfile

echo "[$(date)] Building Flowise..."
pnpm build

# 실행
echo "[$(date)] Starting Flowise..."
sleep 2
pnpm run start

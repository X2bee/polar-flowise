#!/bin/sh
set -euxo pipefail

FLOWISE_DIR="/root/.flowise"

mkdir -p "$FLOWISE_DIR"

echo "[$(date)] ===== Container Start ====="

if [ -z "$GIT_REPO_URL" ]; then
  echo "[$(date)] ERROR: GIT_REPO_URL is not set!"
  exit 1
fi

if [ ! -d "$FLOWISE_DIR/.git" ]; then
  echo "[$(date)] Cloning repository: $GIT_REPO_URL"
  git clone "$GIT_REPO_URL" "$FLOWISE_DIR"
else
  echo "[$(date)] Pulling latest changes..."
  cd "$FLOWISE_DIR" && git pull origin main
fi

echo "[$(date)] Starting Flowise..."
sleep 3
npm run start

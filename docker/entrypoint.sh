#!/bin/sh

LOG_FILE="/root/.flowise/entrypoint.log"

echo "[$(date)] ===== Container Start =====" >> "$LOG_FILE"

# 환경변수 GIT_REPO_URL 확인
if [ -z "$GIT_REPO_URL" ]; then
  echo "[$(date)] ERROR: GIT_REPO_URL is not set!" | tee -a "$LOG_FILE"
  exit 1
fi

# 최초 clone 또는 pull
if [ ! -d "/root/.flowise/.git" ]; then
  echo "[$(date)] Cloning repository: $GIT_REPO_URL" >> "$LOG_FILE"
  git clone "$GIT_REPO_URL" /root/.flowise >> "$LOG_FILE" 2>&1
else
  echo "[$(date)] Pulling latest changes from main branch..." >> "$LOG_FILE"
  cd /root/.flowise && git pull origin main >> "$LOG_FILE" 2>&1
fi

# Flowise 실행 로그
echo "[$(date)] Starting Flowise..." >> "$LOG_FILE"
sleep 3
flowise start >> "$LOG_FILE" 2>&1

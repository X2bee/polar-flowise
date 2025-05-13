FROM node:20-alpine

# 기본 패키지 설치
RUN apk add --no-cache chromium git python3 py3-pip make g++ build-base cairo-dev pango-dev curl

# Puppeteer 환경 변수
ENV PUPPETEER_SKIP_DOWNLOAD=true
ENV PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium-browser

# Flowise 설치 (고정 버전)
RUN npm install -g flowise@2.2.8

# 코드가 위치할 디렉토리 설정
WORKDIR /app

# entrypoint.sh 추가
COPY entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh

ENTRYPOINT ["/entrypoint.sh"]

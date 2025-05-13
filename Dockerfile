# Use Node.js 22.15.0 on Alpine for ARMv6 (Raspberry Pi Zero W)
FROM --platform=linux/arm/v6 node:22.15.0-alpine

WORKDIR /app

RUN apk add --no-cache python3 make g++

COPY package*.json ./
RUN npm ci

COPY tsconfig.json ./
COPY src ./src

RUN npx tsc

CMD ["node", "build/index.js"]

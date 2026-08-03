# build frontend deps
FROM node:22-alpine AS frontend
WORKDIR /frontend
COPY ./frontend/package*.json ./
RUN npm install
COPY ./frontend . 
RUN npm run build

# Build and install backend deps
FROM node:22-alpine AS builder
ENV CXXFLAGS="-std=c++17"
RUN apk update && apk add --no-cache \
    build-base \
    python3 \
    libusb-dev \
    linux-headers \
    eudev-dev \
    g++ \
    make \
    py3-pip \
    py3-setuptools

WORKDIR /app
COPY package*.json ./
RUN npm install

# Copy dependencies from prior build stages and finally run the emulator
FROM node:22-alpine AS final
COPY --from=builder /app /app
WORKDIR /app
COPY --from=frontend /frontend/dist ./server
COPY server ./server
COPY index.js ./index.js
VOLUME ["/app/server/json"]
EXPOSE 80
CMD ["node", "index.js"]

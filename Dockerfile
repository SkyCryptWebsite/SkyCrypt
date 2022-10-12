# syntax=docker/dockerfile:1
FROM node:current-slim
LABEL maintainer="SkyCrypt"
RUN mkdir -p /usr/src/main
WORKDIR '/usr/src/main'
COPY . /usr/src/main
RUN pnpm install --offline
RUN pnpm i && pnpm build
EXPOSE 32464

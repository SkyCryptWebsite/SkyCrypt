# syntax=docker/dockerfile:1
FROM node:18-slim
LABEL maintainer="SkyCrypt"

RUN mkdir -p /skycrypt
WORKDIR '/skycrypt'
COPY . /skycrypt

RUN npm install -g pnpm
RUN pnpm i

VOLUME /skycrypt/cache

CMD [ "pnpm", "start" ]
EXPOSE 32464

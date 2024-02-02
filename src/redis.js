/* eslint-disable */
import Redis from "ioredis";
import credentials from "./credentials.js";

export const redisClient = new Redis({
  port: credentials.redisUrl.port,
  host: credentials.redisUrl.host,
  password: credentials.redisUrl.password,
  username: credentials.redisUrl.username,
});

/* eslint-disable */
import Redis from "ioredis";
import credentials from "./credentials.js";

export const redisClient = new Redis(credentials.redisUrl);

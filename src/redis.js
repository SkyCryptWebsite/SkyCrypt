const Redis = require("ioredis");

const redisClient = new Redis();

module.exports = { redisClient };

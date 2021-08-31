const Redis = require("ioredis");
const credentials = require("./../credentials.json");

const redisClient = new Redis(credentials.redisUrl);

module.exports = { redisClient };

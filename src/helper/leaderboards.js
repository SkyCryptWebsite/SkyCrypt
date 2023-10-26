import { redisClient } from "../redis.js";

export async function getLeaderboardPosition(lb, data) {
  const multi = redisClient.pipeline();
  multi.zcount(`lb_${lb}`, data, "+inf");

  const results = await multi.exec();

  return results[0][1] || 0;
}

export async function getHighestLeaderboardValue(lb) {
  const multi = redisClient.pipeline();
  multi.zrange(`lb_${lb}`, -1, -1, "WITHSCORES");

  const results = await multi.exec();

  return results[0][1][1] || 0;
}

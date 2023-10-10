import { redisClient } from "../redis.js";

export async function getLeaderboardPosition(lb, data) {
  const multi = redisClient.pipeline();
  multi.zcount(`lb_${lb}`, data, "+inf");

  const results = await multi.exec();

  return results[0][1] || 0;
}

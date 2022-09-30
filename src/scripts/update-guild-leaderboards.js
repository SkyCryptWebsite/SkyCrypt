import { db } from "../mongo.js";

import Redis from "ioredis";
const redisClient = new Redis();

import leaderboard from "../leaderboards.js";

import ProgressBar from "progress";

function getAverage(scores) {
  return scores.reduce((a, b) => a + b, 0) / scores.length;
}

async function updateGuildLeaderboards() {
  const keys = await redisClient.keys("lb_*");
  const guilds = (
    await db
      .collection("guilds")
      .find({ members: { $gte: 75 } })
      .toArray()
  ).map((a) => a.gid);

  console.log("updating", guilds.length, "guilds");

  const bar = new ProgressBar("  generating guild leaderboards [:bar] :current/:total :rate guilds/s :percent :etas", {
    complete: "=",
    incomplete: " ",
    width: 20,
    total: guilds.length,
  });

  for (const gid of guilds) {
    const guildMembers = (await db.collection("guildMembers").find({ gid }).toArray()).map((a) => a.uuid);

    const multi = redisClient.pipeline();

    for (const key of keys) {
      const options = leaderboard(key);

      if (options.mappedBy != "uuid") {
        continue;
      }

      const scores = [];

      const getScores = redisClient.pipeline();

      for (const member of guildMembers) {
        getScores.zscore(key, member);
      }

      const memberScores = (await getScores.exec()).map((a) => a[1]);

      for (const memberScore of memberScores) {
        const score = new Number(memberScore);

        if (isNaN(score)) {
          if (!key.includes("best_time")) {
            scores.push(0);
          }

          continue;
        }

        scores.push(score);
      }

      if (key == "lb_bank") {
        continue;
      }

      if (scores.length < 75) {
        continue;
      }

      const avgScore = getAverage(scores);

      multi.zadd([`g${key}`, avgScore, gid]);
    }

    try {
      await multi.exec();
    } catch (e) {
      console.error(e);
    }

    bar.tick();
  }

  updateGuildLeaderboards();
}

updateGuildLeaderboards();

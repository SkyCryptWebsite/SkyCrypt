import { db } from "../mongo.js";
import _ from "lodash";

import { getProfile } from "../lib.js";
import leaderboard from "../leaderboards.js";

import ProgressBar from "progress";
import { redisClient } from "../redis.js";

async function updateLeaderboards() {
  const keys = await redisClient.keys("lb_*");

  const multi = redisClient.pipeline();

  for (const key of keys) {
    const lb = leaderboard(key);

    if (lb.sortedBy < 0) {
      multi.zrevrange(key, 0, 49);
    } else {
      multi.zrange(key, 0, 49);
    }
  }

  const updateUsers = _.uniq((await multi.exec()).map((a) => a[1]).flat());

  console.log("updating", updateUsers.length, "profiles");

  const bar = new ProgressBar("  generating leaderboards [:bar] :current/:total :rate users/s :percent :etas", {
    complete: "=",
    incomplete: " ",
    width: 20,
    total: updateUsers.length,
  });

  for (const uuid of updateUsers) {
    getProfile(db, uuid)
      .then(() => {
        bar.tick();
      })
      .catch(() => {});

    await new Promise((r) => setTimeout(r, 500));
  }

  updateLeaderboards();
}

updateLeaderboards();

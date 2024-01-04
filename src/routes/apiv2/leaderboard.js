import * as helper from "../../helper.js";
import express from "express";
import leaderboard from "../../leaderboards.js";

import { db } from "../../mongo.js";
import { redisClient } from "../../redis.js";
import { handleError } from "../apiv2.js";

const router = express.Router();

router.use((req, res, next) => {
  req.options.debugId = helper.generateDebugId("api/v2/leaderboard");
  next();
});

/**
 * @deprecated Not meant to be used by public.
 * @description Endpoint for getting a specific leaderboard.
 *
 * - Undocumented endpoint
 *
 * @todo Remake how leaderboards work in their entirety.
 */
router.get("/:lbName", async (req, res, next) => {
  try {
    const count = Math.min(100, req.query.count || 20);

    let page, startIndex, endIndex;

    const lb = leaderboard(`lb_${req.params.lbName}`);
    const lbCount = await redisClient.zcount(`lb_${lb.key}`, "-Infinity", "+Infinity");

    if (lbCount <= 0) {
      handleError(res, new Error("Leaderboard not found."), 404, false);
      return;
    }

    const output = {
      positions: [],
    };

    if (req.query.find) {
      const uuid = (await helper.resolveUsernameOrUuid(req.query.find, db, true)).uuid;

      const rank =
        lb.sortedBy > 0
          ? await redisClient.zrank(`lb_${lb.key}`, uuid)
          : await redisClient.zrevrank(`lb_${lb.key}`, uuid);

      if (rank == null) {
        handleError(res, new Error("Specified user not found on leaderboard."), 404, false);
        return;
      }

      output.self = { rank: rank + 1 };

      page = Math.floor(rank / count) + 1;
      startIndex = (page - 1) * count;
      endIndex = startIndex - 1 + count;
    } else {
      page = Math.max(1, req.query.page || 1);
      startIndex = (page - 1) * count;
      endIndex = startIndex - 1 + count;
    }

    page = Math.min(page, Math.floor(lbCount / count) + 1);

    output.page = page;

    startIndex = (page - 1) * count;
    endIndex = startIndex - 1 + count;

    const results =
      lb.sortedBy > 0
        ? await redisClient.zrange(`lb_${lb.key}`, startIndex, endIndex, "WITHSCORES")
        : await redisClient.zrevrange(`lb_${lb.key}`, startIndex, endIndex, "WITHSCORES");

    for (let i = 0; i < results.length; i += 2) {
      const lbPosition = {
        rank: i / 2 + startIndex + 1,
        amount: lb.format(results[i + 1]),
        raw: results[i + 1],
        uuid: results[i],
        username: (await helper.resolveUsernameOrUuid(results[i], db, true)).display_name,
      };

      if ("self" in output && output.self.rank == lbPosition.rank) {
        output.self = lbPosition;
      }

      output.positions.push(lbPosition);
    }

    helper.sendMetric("endpoint_apiv2_leaderboard_success");
    res.json(output);
  } catch (e) {
    next(e);
  }
});

export { router };

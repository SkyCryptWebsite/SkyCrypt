import * as helper from "../../helper.js";
import * as lib from "../../lib.js";
import express from "express";

import { tableify } from "../api.js";
import { db } from "../../mongo.js";

const router = express.Router();

router.use((req, res, next) => {
  req.options.debugId = helper.generateDebugId("api/minions");
  next();
});

router.use(async (req, res, next) => {
  try {
    const { profile } = await lib.getProfile(db, req.player, req.profile, req.options);

    const minions = [];

    const coopMembers = profile.members;

    for (const member in coopMembers) {
      if (!("crafted_generators" in coopMembers[member])) {
        continue;
      }

      for (const minion of coopMembers[member].crafted_generators) {
        const minionName = minion.replaceAll(/(_[0-9]+)/g, "");

        const minionLevel = parseInt(minion.split("_").pop());

        if (minions.find((a) => a.minion == minionName) == undefined) {
          minions.push({ minion: minionName, level: minionLevel });
        }

        const minionObject = minions.find((a) => a.minion == minionName);

        if (minionObject.level < minionLevel) {
          minionObject.level = minionLevel;
        }
      }
    }

    res.send(tableify(minions));
  } catch (e) {
    next(e);
  }
});

export { router };

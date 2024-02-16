import * as helper from "../../helper.js";
import * as lib from "../../lib.js";
import express from "express";

import { tableify } from "../api.js";
import { db } from "../../mongo.js";
import { getMinions } from "../../stats.js";

const router = express.Router();

router.use((req, res, next) => {
  req.options.debugId = helper.generateDebugId("api/minions");
  next();
});

router.use(async (req, res, next) => {
  try {
    const { profile } = await lib.getProfile(db, req.player, req.profile, req.options);

    const minions = getMinions(profile).minions;
    const minionsData = Object.values(minions)
      .filter((a) => a.minions)
      .map((a) => a.minions)
      .flat()
      .map((a) => ({
        id: a.id,
        name: a.name,
        tier: a.tier,
        maxTier: a.maxTier,
      }));

    res.send(tableify(minionsData));
  } catch (e) {
    next(e);
  }
});

export { router };

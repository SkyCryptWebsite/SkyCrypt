import * as helper from "../../helper.js";
import * as lib from "../../lib.js";
import express from "express";

import { tableify } from "../api.js";
import { db } from "../../mongo.js";
import * as stats from "../../stats.js";

const router = express.Router();

router.use((req, res, next) => {
  req.options.debugId = helper.generateDebugId("api/collections");
  next();
});

router.use(async (req, res, next) => {
  try {
    const { profile, uuid } = await lib.getProfile(db, req.player, req.profile, req.options);

    const collections = await stats.getCollections(uuid, profile, req.options.cacheOnly);
    const collectionData = Object.values(collections)
      .filter((a) => a.collections !== undefined)
      .map((a) => a.collections)
      .flat();

    const output = collectionData.map((a) => ({
      name: a.name,
      tier: a.tier,
      amount: a.amount,
      totalAmount: a.totalAmount,
    }));

    res.send(tableify(output));
  } catch (e) {
    next(e);
  }
});

export { router };

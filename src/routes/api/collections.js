import * as helper from "../../helper.js";
import * as lib from "../../lib.js";
import express from "express";

import { tableify } from "../api.js";
import { db } from "../../mongo.js";

const router = express.Router();

router.use((req, res, next) => {
  req.options.debugId = helper.generateDebugId("api/collections");
  next();
});

router.use(async (req, res, next) => {
  try {
    const { profile, uuid } = await lib.getProfile(db, req.player, req.profile, req.options);

    const collections = await lib.getCollections(uuid, profile, req.options.cacheOnly);

    res.send(
      tableify(
        Object.keys(collections).map((a) => [
          a,
          collections[a].name,
          collections[a].tier,
          collections[a].amount,
          collections[a].totalAmount,
        ])
      )
    );
  } catch (e) {
    next(e);
  }
});

export { router };

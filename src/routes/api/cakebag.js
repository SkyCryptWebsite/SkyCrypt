import * as helper from "../../helper.js";
import * as lib from "../../lib.js";
import express from "express";

import { tableify, handleError } from "../api.js";
import { db } from "../../mongo.js";
import { getItems } from "../../stats.js";

const router = express.Router();

router.use((req, res, next) => {
  req.options.debugId = helper.generateDebugId("api/cakebag");
  next();
});

router.use(async (req, res, next) => {
  try {
    const { profile, uuid } = await lib.getProfile(db, req.player, req.profile, { cacheOnly: true });
    const userProfile = profile.members[uuid];

    const items = await getItems(userProfile, null, false, undefined, req.options);

    const cakeBags = items.allItems.filter((a) => helper.getId(a) === "NEW_YEAR_CAKE_BAG");
    if (cakeBags.length == 0) {
      return handleError(req, res, new Error("Player has no cake bag"), 404);
    }

    const cakes = cakeBags
      .map((a) =>
        a.containsItems
          .map((b) => b.tag?.ExtraAttributes?.new_years_cake)
          .filter((c) => c)
          .map((c) => ({ cake: c })),
      )
      .flat()
      .sort((a, b) => a.cake - b.cake);

    res.send(tableify(cakes));
  } catch (e) {
    next(e);
  }
});

export { router };

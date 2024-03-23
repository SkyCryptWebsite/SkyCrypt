import * as helper from "../../helper.js";
import * as lib from "../../lib.js";
import express from "express";

import { tableify } from "../api.js";
import { db } from "../../mongo.js";
import { getItems } from "../../stats.js";

const router = express.Router();

router.use((req, res, next) => {
  req.options.debugId = helper.generateDebugId("api/items");
  next();
});

router.use(async (req, res, next) => {
  try {
    const { profile, uuid } = await lib.getProfile(db, req.player, req.profile, req.options);
    const userProfile = profile.members[uuid];

    const items = await getItems(userProfile, null, false, undefined, req.options);

    const allItems = items.allItems
      .concat(
        items.allItems
          .filter((a) => a.containsItems)
          .map((a) => a.containsItems)
          .flat(),
      )
      .filter((a) => a && helper.getId(a))
      .map((a) => ({
        id: helper.getId(a),
        Count: a.Count,
        display_name: a.display_name,
        rarity: a.rarity,
        type: a.type,
        location: a.extra ? a.extra.source.toLowerCase() : undefined,
      }));

    res.send(tableify(allItems));
  } catch (e) {
    next(e);
  }
});

export { router };

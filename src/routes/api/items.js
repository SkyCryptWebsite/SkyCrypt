import * as helper from "../../helper.js";
import * as lib from "../../lib.js";
import express from "express";

import { tableify } from "../api.js";
import { db } from "../../mongo.js";

const router = express.Router();

router.use((req, res, next) => {
  req.options.debugId = helper.generateDebugId("api/items");
  next();
});

router.use(async (req, res, next) => {
  try {
    const { profile, uuid } = await lib.getProfile(db, req.player, req.profile, req.options);
    const userProfile = profile.members[uuid];

    const items = await lib.getItems(userProfile, false, undefined, req.options);

    const allItems = items.inventory.concat(items.enderchest);

    for (const item of allItems) {
      if (Array.isArray(item.containsItems)) {
        allItems.push(...item.containsItems);
      }
    }

    res.send(
      tableify(
        allItems
          .filter((a) => helper.getId(a).length > 0)
          .map((a) => [helper.getId(a), a.Count, a.display_name, a.rarity, a.type])
      )
    );
  } catch (e) {
    next(e);
  }
});

export { router };

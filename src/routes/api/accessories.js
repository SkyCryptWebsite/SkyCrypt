import * as helper from "../../helper.js";
import * as lib from "../../lib.js";
import express from "express";

import { tableify } from "../api.js";
import { db } from "../../mongo.js";
import { getItems } from "../../stats.js";

const router = express.Router();

router.use((req, res, next) => {
  req.options.debugId = helper.generateDebugId("api/accessories");
  next();
});

router.use(async (req, res, next) => {
  try {
    const { profile, uuid } = await lib.getProfile(db, req.player, req.profile, req.options);
    const userProfile = profile.members[uuid];

    const items = await getItems(userProfile, false, undefined, req.options);

    const accessories = items.accessories
      .filter((a) => a.isUnique)
      .map((a) => {
        return {
          id: a.tag.ExtraAttributes.id,
          rarity: a.rarity,
          reforge: a.reforge,
          name: a.base_name,
          isActive: a.isInactive ? "false" : "true",
        };
      });

    res.send(tableify(accessories));
  } catch (e) {
    next(e);
  }
});

export { router };

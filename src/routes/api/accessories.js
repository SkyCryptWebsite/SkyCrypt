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

    const items = await getItems(userProfile, null, false, undefined, req.options);

    const accessories = items.accessories.accessories
      .filter((a) => a.isUnique)
      .map((a) => {
        return {
          id: helper.getId(a),
          rarity: a.rarity,
          name: a.display_name,
          recombobulated: a.recombobulated,
          enrichment: a.enrichment,
          isActive: !a.isInactive,
        };
      });

    res.send(tableify(accessories));
  } catch (e) {
    next(e);
  }
});

export { router };

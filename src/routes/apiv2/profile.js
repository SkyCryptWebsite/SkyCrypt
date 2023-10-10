import * as helper from "../../helper.js";
import * as lib from "../../lib.js";
import express from "express";

import { db } from "../../mongo.js";

const router = express.Router();

router.use((req, res, next) => {
  req.options.debugId = helper.generateDebugId("api/v2/profile");
  next();
});

router.get("/:player", async (req, res, next) => {
  try {
    const { profile, allProfiles } = await lib.getProfile(db, req.params.player, null, req.options);
    const bingoProfile = await lib.getBingoProfile(db, req.params.player, req.options);

    const output = { profiles: {} };

    for (const singleProfile of allProfiles) {
      const userProfile = singleProfile.members[profile.uuid];

      const items = await lib.getItems(userProfile, bingoProfile, false, "", req.options);
      const data = await lib.getStats(db, singleProfile, bingoProfile, allProfiles, items, req.options);

      output.profiles[singleProfile.profile_id] = {
        profile_id: singleProfile.profile_id,
        cute_name: singleProfile.cute_name,
        game_mode: singleProfile.game_mode,
        current: singleProfile.selected,
        raw: userProfile,
        items,
        data,
      };
    }

    res.json(output);
  } catch (e) {
    next(e);
  }
});

export { router };

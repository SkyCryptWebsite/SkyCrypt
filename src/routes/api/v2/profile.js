import * as helper from "../../../helper.js";
import * as lib from "../../../lib.js";
import cors from "cors";
import express from "express";

import { db } from "../../../mongo.js";

const router = express.Router();

router.use((req, res, next) => {
  req.options.debugId = helper.generateDebugId("api/v2/profile");
  next();
});

router.get("/:player", cors(), async (req, res, next) => {
  try {
    const { profile, allProfiles } = await lib.getProfile(db, req.params.player, null, req.options);

    const output = { profiles: {} };

    for (const singleProfile of allProfiles) {
      const userProfile = singleProfile.members[profile.uuid];

      const items = await lib.getItems(userProfile, false, "", req.options);
      const data = await lib.getStats(db, singleProfile, allProfiles, items, req.options);

      output.profiles[singleProfile.profile_id] = {
        profile_id: singleProfile.profile_id,
        cute_name: singleProfile.cute_name,
        current: Math.max(...allProfiles.map((a) => a.members[profile.uuid].last_save)) == userProfile.last_save,
        last_save: userProfile.last_save,
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

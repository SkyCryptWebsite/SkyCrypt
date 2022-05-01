import * as helper from "../../../helper.js";
import * as lib from "../../../lib.js";
import cors from "cors";
import express from "express";

import { db } from "../../../mongo.js";

const router = express.Router();

router.use((req, res, next) => {
  req.options.debugId = helper.generateDebugId("api/v2/talismans");
  next();
});

router.get("/:player/:profile", cors(), async (req, res, next) => {
  try {
    const { profile, allProfiles } = await lib.getProfile(db, req.params.player, null, req.options);

    let output = {
      error: "Invalid Profile Name!",
    };

    for (const singleProfile of allProfiles) {
      const cute_name = singleProfile.cute_name;

      if (cute_name.toLowerCase() != req.params.profile.toLowerCase()) {
        continue;
      }

      const items = await lib.getItems(singleProfile.members[profile.uuid], false, "", req.options);
      const talismans = items.talismans;

      output = {
        profile_id: singleProfile.profile_id,
        cute_name: singleProfile.cute_name,
        talismans,
      };
    }

    res.json(output);
  } catch (e) {
    next(e);
  }
});

router.get("/:player", cors(), async (req, res, next) => {
  try {
    const { profile, allProfiles } = await lib.getProfile(db, req.params.player, null, req.options);

    const output = { profiles: {} };

    for (const singleProfile of allProfiles) {
      const userProfile = singleProfile.members[profile.uuid];

      const items = await lib.getItems(userProfile, false, "", req.options);
      const talismans = items.talismans;

      output.profiles[singleProfile.profile_id] = {
        profile_id: singleProfile.profile_id,
        cute_name: singleProfile.cute_name,
        talismans,
      };
    }

    res.json(output);
  } catch (e) {
    next(e);
  }
});

export { router };

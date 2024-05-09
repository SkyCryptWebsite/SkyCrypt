import * as helper from "../../helper.js";
import * as lib from "../../lib.js";
import express from "express";

import { db } from "../../mongo.js";
import { getDungeons } from "../../stats.js";

const router = express.Router();

router.use((req, res, next) => {
  req.options.debugId = helper.generateDebugId("api/v2/dungeons");
  next();
});

router.get("/:player/:profile", async (req, res, next) => {
  try {
    const { profile, allProfiles } = await lib.getProfile(db, req.params.player, null, req.options);

    let output = {
      error: "Invalid Profile Name!",
    };

    for (const singleProfile of allProfiles) {
      const cuteName = singleProfile.cute_name;

      if (cuteName.toLowerCase() != req.params.profile.toLowerCase()) {
        continue;
      }

      const userProfile = singleProfile.members[profile.uuid];
      const dungeonData = await getDungeons(userProfile);

      output = {
        profile_id: singleProfile.profile_id,
        cute_name: singleProfile.cute_name,
        selected: singleProfile.selected,
        dungeons: dungeonData,
      };
    }

    helper.sendMetric("endpoint_apiv2_dungeons_profile_success");
    res.json(output);
  } catch (e) {
    next(e);
  }
});

router.get("/:player", async (req, res, next) => {
  try {
    const { profile, allProfiles } = await lib.getProfile(db, req.params.player, null, req.options);

    const output = { profiles: {} };

    for (const singleProfile of allProfiles) {
      const userProfile = singleProfile.members[profile.uuid];
      const dungeonData = await getDungeons(userProfile);

      output.profiles[singleProfile.profile_id] = {
        profile_id: singleProfile.profile_id,
        cute_name: singleProfile.cute_name,
        selected: singleProfile.selected,
        dungeons: dungeonData,
      };
    }

    helper.sendMetric("endpoint_apiv2_dungeons_player_success");
    res.json(output);
  } catch (e) {
    next(e);
  }
});

export { router };

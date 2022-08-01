import * as helper from "../../helper.js";
import * as lib from "../../lib.js";
import express from "express";

import { db } from "../../mongo.js";
import { handleError } from "../apiv2.js";

const router = express.Router();

router.use((req, res, next) => {
  req.options.debugId = helper.generateDebugId("api/v2/talismans");
  next();
});

router.get("/:player/:profile", async (req, res, next) => {
  try {
    const { profile, allProfiles } = await lib.getProfile(db, req.params.player, null, req.options);

    let output;
    for (const singleProfile of allProfiles) {
      const cute_name = singleProfile.cute_name;

      if (cute_name.toLowerCase() != req.params.profile.toLowerCase()) {
        continue;
      }

      const items = await lib.getItems(singleProfile.members[profile.uuid], false, "", req.options);
      const accessories = items.accessories;

      output = {
        profile_id: singleProfile.profile_id,
        cute_name: singleProfile.cute_name,
        accessories,
      };
    }

    if (!output) {
      handleError(res, new Error("Profile not found."), 404, false);
      return;
    }

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

      const items = await lib.getItems(userProfile, false, "", req.options);
      const accessories = items.accessories;

      output.profiles[singleProfile.profile_id] = {
        profile_id: singleProfile.profile_id,
        cute_name: singleProfile.cute_name,
        accessories,
      };
    }

    res.json(output);
  } catch (e) {
    next(e);
  }
});

export { router };

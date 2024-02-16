import * as helper from "../../helper.js";
import * as lib from "../../lib.js";
import express from "express";

import { db } from "../../mongo.js";
import { handleError } from "../apiv2.js";
import { getItems } from "../../stats.js";

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
      const cuteName = singleProfile.cute_name;

      if (cuteName.toLowerCase() != req.params.profile.toLowerCase()) {
        continue;
      }

      const items = await getItems(singleProfile.members[profile.uuid], null, false, null, req.options);
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

    helper.sendMetric("endpoint_apiv2_talismans_profile_success");
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

      const items = await getItems(userProfile, false, "", req.options);
      const accessories = items.accessories;

      output.profiles[singleProfile.profile_id] = {
        profile_id: singleProfile.profile_id,
        cute_name: singleProfile.cute_name,
        accessories,
      };
    }

    helper.sendMetric("endpoint_apiv2_talismans_profile_success");
    res.json(output);
  } catch (e) {
    next(e);
  }
});

export { router };

import * as helper from "../../helper.js";
import * as lib from "../../lib.js";
import express from "express";

import { db } from "../../mongo.js";

const router = express.Router();

router.use((req, res, next) => {
  req.options.debugId = helper.generateDebugId("api/v2/slayers");
  next();
});

router.get("/:player/:profile", async (req, res, next) => {
  try {
    const { allProfiles } = await lib.getProfile(db, req.params.player, null, req.options);

    const output = {};
    for (const singleProfile of allProfiles) {
      const profileId = req.params.profile;
      if (singleProfile.cute_name.toLowerCase() !== profileId.toLowerCase()) {
        continue;
      }

      const data = await lib.getStats(db, singleProfile, null, allProfiles, [], req.options);
      output[singleProfile.profile_id] = {
        profile_id: singleProfile.profile_id,
        cute_name: singleProfile.cute_name,
        data: data.slayer,
      };
    }

    helper.sendMetric("endpoint_apiv2_slayers_profile_success");
    res.json(output);
  } catch (e) {
    next(e);
  }
});

router.get("/:player", async (req, res, next) => {
  try {
    const { allProfiles } = await lib.getProfile(db, req.params.player, null, req.options);

    const output = {};
    for (const singleProfile of allProfiles) {
      const data = await lib.getStats(db, singleProfile, null, allProfiles, [], req.options);
      output[singleProfile.profile_id] = {
        profile_id: singleProfile.profile_id,
        cute_name: singleProfile.cute_name,
        data: data.slayer,
      };
    }

    helper.sendMetric("endpoint_apiv2_slayers_profile_success");
    res.json(output);
  } catch (e) {
    next(e);
  }
});

export { router };

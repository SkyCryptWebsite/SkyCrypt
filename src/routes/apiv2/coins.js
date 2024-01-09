import * as helper from "../../helper.js";
import * as lib from "../../lib.js";
import express from "express";

import { db } from "../../mongo.js";

const router = express.Router();

router.use((req, res, next) => {
  req.options.debugId = helper.generateDebugId("api/v2/coins");
  next();
});

router.get("/:player/:profile", async (req, res, next) => {
  try {
    const { profile } = await lib.getProfile(db, req.params.player, req.params.profile, req.options);
    if (profile.cute_name.toLowerCase() !== req.params.profile.toLowerCase()) {
      throw new Error("Profile not found");
    }

    helper.sendMetric("endpoint_apiv2_coins_profile_success");

    res.json({
      profile_id: profile.profile_id,
      cute_name: profile.cute_name,
      purse: profile.members[profile.uuid]?.currencies?.coin_purse ?? 0,
      bank: profile.banking?.balance ?? 0,
    });
  } catch (e) {
    next(e);
  }
});

router.get("/:player", async (req, res, next) => {
  try {
    const { allProfiles } = await lib.getProfile(db, req.params.player, null, req.options);

    const output = { profiles: {} };
    for (const profile of allProfiles) {
      output.profiles[profile.profile_id] = {
        profile_id: profile.profile_id,
        cute_name: profile.cute_name,
        purse: profile.members[profile.uuid]?.currencies?.coin_purse ?? 0,
        bank: profile.banking?.balance ?? 0,
      };
    }

    helper.sendMetric("endpoint_apiv2_coins_player_success");
    res.json(output);
  } catch (e) {
    next(e);
  }
});

export { router };

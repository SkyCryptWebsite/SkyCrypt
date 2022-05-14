import * as helper from "../../helper.js";
import * as lib from "../../lib.js";
import express from "express";

import { tableify } from "../api.js";
import { db } from "../../mongo.js";

const router = express.Router();

router.use((req, res, next) => {
  req.options.debugId = helper.generateDebugId("api/profiles");
  next();
});

router.use(async (req, res, next) => {
  try {
    const { allProfiles } = await lib.getProfile(db, req.player, null, req.options);

    const profiles = [];

    for (const profile of allProfiles) {
      const members = (
        await Promise.all(Object.keys(profile.members).map((a) => helper.resolveUsernameOrUuid(a, db)))
      ).map((a) => a.display_name);

      profiles.push({
        profile_id: profile.profile_id,
        cute_name: profile.cute_name,
        members: members.join(", "),
      });
    }

    res.send(tableify(profiles));
  } catch (e) {
    next(e);
  }
});

export { router };

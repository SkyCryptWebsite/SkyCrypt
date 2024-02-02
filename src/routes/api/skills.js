import * as helper from "../../helper.js";
import * as lib from "../../lib.js";
import express from "express";

import { tableify } from "../api.js";
import { db } from "../../mongo.js";
import { getItems } from "../../stats.js";

const router = express.Router();

router.use((req, res, next) => {
  req.options.debugId = helper.generateDebugId("api/skills");
  next();
});

router.use(async (req, res, next) => {
  try {
    const { profile, allProfiles, uuid } = await lib.getProfile(db, req.player, req.profile, req.options);
    const bingoProfile = await lib.getBingoProfile(db, req.player, req.options);
    const userProfile = profile.members[uuid];

    const items = await getItems(userProfile, bingoProfile, false, undefined, req.options);
    const calculated = await lib.getStats(db, profile, bingoProfile, allProfiles, items, req.options);

    const response = [];

    for (const skill in calculated.skills.skills) {
      const pushArr = [helper.titleCase(skill), calculated.skills.skills[skill].level.toString()];

      if ("progress" in req.query) {
        pushArr.push(
          calculated.skills.skills[skill].maxLevel,
          calculated.skills.skills[skill].xp,
          calculated.skills.skills[skill].xpCurrent,
          calculated.skills.skills[skill].xpForNext,
        );
      }

      response.push(pushArr);
    }

    for (const slayer in calculated.slayers) {
      const pushArr = [helper.titleCase(slayer), calculated.slayers[slayer].level.currentLevel.toString()];

      if ("progress" in req.query) {
        pushArr.push(
          calculated.slayers[slayer].level.maxLevel,
          calculated.slayers[slayer].xp,
          calculated.slayers[slayer].xp,
          calculated.slayers[slayer].level.xpForNext,
        );
      }

      response.push(pushArr);
    }

    response.push(["Fairy Souls", calculated.fairy_souls.collected.toString()]);

    res.send(tableify(response));
  } catch (e) {
    next(e);
  }
});

export { router };

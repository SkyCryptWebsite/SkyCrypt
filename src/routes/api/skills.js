import * as helper from "../../helper.js";
import * as lib from "../../lib.js";
import express from "express";

import { tableify } from "../api.js";
import { db } from "../../mongo.js";
import { getSkills, getSlayer, getSkyBlockLevel } from "../../stats.js";

const router = express.Router();

router.use((req, res, next) => {
  req.options.debugId = helper.generateDebugId("api/skills");
  next();
});

router.use(async (req, res, next) => {
  try {
    const { profile, uuid } = await lib.getProfile(db, req.player, req.profile, req.options);
    const hypixelProfile = await helper.getRank(profile.uuid, db, req.options);
    const userProfile = profile.members[uuid];

    const response = [];

    const { skills } = await getSkills(userProfile, hypixelProfile, profile.members);
    for (const skill in skills) {
      const pushArr = [
        helper.titleCase(skill),
        skills[skill].level.toString(),
        skills[skill].maxLevel,
        skills[skill].xp,
        skills[skill].xpCurrent,
        skills[skill].xpForNext,
      ];

      response.push(pushArr);
    }

    const { slayers } = getSlayer(userProfile);
    for (const slayer in slayers) {
      const pushArr = [
        helper.titleCase(slayer),
        slayers[slayer].level.currentLevel.toString(),
        slayers[slayer].level.maxLevel,
        slayers[slayer].level.xp,
        slayers[slayer].level.xpForNext,
      ];

      response.push(pushArr);
    }

    const skyblockLevel = await getSkyBlockLevel(userProfile);
    response.push([
      "SkyBlock Level",
      skyblockLevel.level,
      skyblockLevel.maxLevel,
      skyblockLevel.xp,
      skyblockLevel.xpCurrent,
      skyblockLevel.xpForNext,
      skyblockLevel.maxExperience,
    ]);

    response.push(["Fairy Souls", userProfile.fairy_soul.total_collected.toString()]);

    res.send(tableify(response));
  } catch (e) {
    next(e);
  }
});

export { router };

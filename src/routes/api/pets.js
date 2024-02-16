import * as helper from "../../helper.js";
import * as lib from "../../lib.js";
import express from "express";

import { tableify } from "../api.js";
import { db } from "../../mongo.js";
import { getItems, getPets } from "../../stats.js";

const router = express.Router();

router.use((req, res, next) => {
  req.options.debugId = helper.generateDebugId("api/pets");
  next();
});

router.use(async (req, res, next) => {
  try {
    const { profile, uuid } = await lib.getProfile(db, req.player, req.profile, req.options);
    const userProfile = profile.members[uuid];

    const pets = await getPets(userProfile, userProfile, profile);
    const petsData = pets.pets.map((a) => ({
      type: a.type,
      exp: a.exp,
      active: a.active,
      rarity: a.rarity,
      texture_path: a.texture_path,
      display_name: a.display_name,
      level: a.level.level,
      xpCurrent: a.level.xpCurrent,
      xpForNext: a.level.xpForNext,
      progress: a.level.progress,
      xpMaxLevel: a.level.xpMaxLevel,
      skin: a.skin,
    }));

    res.send(tableify(petsData));
  } catch (e) {
    next(e);
  }
});

export { router };

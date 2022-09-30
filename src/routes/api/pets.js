import * as helper from "../../helper.js";
import * as lib from "../../lib.js";
import express from "express";

import { tableify } from "../api.js";
import { db } from "../../mongo.js";

const router = express.Router();

router.use((req, res, next) => {
  req.options.debugId = helper.generateDebugId("api/pets");
  next();
});

router.use(async (req, res, next) => {
  try {
    const { profile, uuid } = await lib.getProfile(db, req.player, req.profile, req.options);
    const userProfile = profile.members[uuid];

    const pets = await lib.getPets(userProfile);

    for (const pet of pets) {
      delete pet.lore;

      const petLevel = Object.assign({}, pet.level);
      delete pet.level;
      delete pet.tier;

      for (const key in petLevel) {
        pet[key] = petLevel[key];
      }
    }

    res.send(
      tableify(
        pets.map((a) => [
          a.type,
          a.exp,
          a.active,
          a.rarity,
          a.texture_path,
          a.display_name,
          a.level,
          a.xpCurrent,
          a.xpForNext,
          a.progress,
          a.xpMaxLevel,
        ])
      )
    );
  } catch (e) {
    next(e);
  }
});

export { router };

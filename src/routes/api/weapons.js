import * as helper from "../../helper.js";
import * as lib from "../../lib.js";
import express from "express";

import { tableify } from "../api.js";
import { db } from "../../mongo.js";
import { getItems } from "../../stats.js";

const router = express.Router();

router.use((req, res, next) => {
  req.options.debugId = helper.generateDebugId("api/weapons");
  next();
});

router.use(async (req, res, next) => {
  try {
    const { profile, uuid } = await lib.getProfile(db, req.player, req.profile, req.options);
    const userProfile = profile.members[uuid];

    const items = await getItems(userProfile, null, false, undefined, req.options);

    const output = [];
    for (const weapon of items.weapons.weapons) {
      const weaponEnchantments = weapon.tag.ExtraAttributes.enchantments;
      let enchantmentsOutput;
      if (weaponEnchantments) {
        enchantmentsOutput = Object.entries(weapon.tag.ExtraAttributes.enchantments)
          .map(([key, value]) => `${key}=${value}`)
          .join(",");
      }

      const weaponExtra = weapon.extra;
      let extraOutput;
      if (weaponExtra) {
        extraOutput = Object.entries(weaponExtra)
          .map(([key, value]) => `${key}=${JSON.stringify(value)}`)
          .join(",");
      }

      output.push({
        id: helper.getId(weapon),
        name: weapon.display_name,
        rarity: weapon.rarity,
        enchantments: enchantmentsOutput,
        extra: extraOutput,
        recombobulated: weapon.recombobulated,
      });
    }

    res.send(tableify(output));
  } catch (e) {
    next(e);
  }
});

export { router };

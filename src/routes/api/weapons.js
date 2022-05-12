import * as helper from "../../helper.js";
import * as lib from "../../lib.js";
import express from "express";

import { tableify } from "../api.js";
import { db } from "../../mongo.js";

const router = express.Router();

router.use((req, res, next) => {
  req.options.debugId = helper.generateDebugId("api/weapons");
  next();
});

router.use(async (req, res, next) => {
  try {
    const { profile, uuid } = await lib.getProfile(db, req.player, req.profile, req.options);
    const userProfile = profile.members[uuid];

    const items = await lib.getItems(userProfile, false, undefined, req.options);

    let output = [];

    for (const weapon of items.weapons) {
      const enchantments = weapon.tag.ExtraAttributes.enchantments;
      let enchantmentsOutput = enchantments;

      const stats = weapon.stats;
      let statsOutput = weapon.stats;

      const extra = weapon.extra;
      let extraOutput = weapon.extra;

      if (weapon.tag?.ExtraAttributes) {
        if (enchantments !== undefined) {
          enchantmentsOutput = [];

          for (const enchantment in enchantments) {
            enchantmentsOutput.push(enchantment + "=" + enchantments[enchantment]);
          }

          enchantmentsOutput = enchantmentsOutput.join(",");
        }

        if (stats !== undefined) {
          statsOutput = [];

          for (const stat in stats) {
            statsOutput.push(stat + "=" + stats[stat]);
          }

          statsOutput = statsOutput.join(",");
        }

        if (extra !== undefined) {
          extraOutput = [];

          for (const value in extra) {
            extraOutput.push(value + "=" + extra[value]);
          }

          extraOutput = extraOutput.join(",");
        }
      }

      output.push({
        id: helper.getId(weapon),
        name: weapon.display_name,
        rarity: weapon.rarity,
        enchantments: enchantmentsOutput,
        stats: statsOutput,
        extra: extraOutput,
      });
    }

    res.send(tableify(output));
  } catch (e) {
    next(e);
  }
});

export { router };

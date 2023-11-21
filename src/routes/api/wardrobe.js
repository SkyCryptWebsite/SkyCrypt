import * as helper from "../../helper.js";
import * as lib from "../../lib.js";
import express from "express";

import { tableify } from "../api.js";
import { db } from "../../mongo.js";
import { getItems } from "../../stats.js";

const router = express.Router();

router.use((req, res, next) => {
  req.options.debugId = helper.generateDebugId("api/wardrobe");
  next();
});

router.use(async (req, res, next) => {
  try {
    const { profile, uuid } = await lib.getProfile(db, req.player, req.profile, req.options);
    const userProfile = profile.members[uuid];

    const items = await getItems(userProfile, false, undefined, req.options);

    const output = [];

    for (const wardrobe of items.wardrobe) {
      for (const armor of wardrobe) {
        if (armor === null) {
          output.push({});
          continue;
        }

        const enchantments = armor.tag.ExtraAttributes.enchantments;
        let enchantmentsOutput = enchantments;

        const stats = armor.stats;
        let statsOutput = stats;

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

        output.push({
          id: helper.getId(armor),
          name: armor.display_name,
          rarity: armor.rarity,
          enchantments: enchantmentsOutput,
          stats: statsOutput,
        });
      }
    }

    res.send(tableify(output));
  } catch (e) {
    next(e);
  }
});

export { router };

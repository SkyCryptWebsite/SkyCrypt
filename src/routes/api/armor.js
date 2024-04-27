import * as helper from "../../helper.js";
import * as lib from "../../lib.js";
import express from "express";

import { tableify } from "../api.js";
import { db } from "../../mongo.js";
import { getItems } from "../../stats.js";

const router = express.Router();

router.use((req, res, next) => {
  req.options.debugId = helper.generateDebugId("api/armor");
  next();
});

router.use(async (req, res, next) => {
  try {
    const { profile, uuid } = await lib.getProfile(db, req.player, req.profile, req.options);
    const userProfile = profile.members[uuid];

    const items = await getItems(userProfile, null, false, undefined, req.options);

    const output = [];
    for (const armor of items.armor?.armor ?? []) {
      const armorEnchantments = armor.tag.ExtraAttributes.enchantments;
      let enchantmentsOutput;
      if (armorEnchantments) {
        enchantmentsOutput = Object.entries(armor.tag.ExtraAttributes.enchantments)
          .map(([key, value]) => `${key}=${value}`)
          .join(",");
      }

      output.push({
        id: helper.getId(armor),
        name: armor.display_name,
        rarity: armor.rarity,
        enchantments: enchantmentsOutput,
        recombobulated: armor.recombobulated,
      });
    }

    res.send(tableify(output));
  } catch (e) {
    next(e);
  }
});

export { router };

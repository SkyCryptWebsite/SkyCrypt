import * as helper from "../../helper.js";
import * as lib from "../../lib.js";
import express from "express";

import { tableify, handleError } from "../api.js";
import { db } from "../../mongo.js";

const router = express.Router();

router.use((req, res, next) => {
  req.options.debugId = helper.generateDebugId("api/cakebag");
  next();
});

router.use(async (req, res, next) => {
  try {
    const { profile, uuid } = await lib.getProfile(db, req.player, req.profile, { cacheOnly: true });
    const userProfile = profile.members[uuid];

    const items = await lib.getItems(userProfile, false, undefined, req.options);

    const allItems = items.armor.concat(items.inventory, items.accessory_bag, items.enderchest);

    const cakeBags = allItems.filter((a) => a?.tag?.ExtraAttributes?.id == "NEW_YEAR_CAKE_BAG");

    if (cakeBags.length == 0) {
      handleError(req, res, new Error("Player has no cake bag"), 404);
    } else {
      const cakeBag = cakeBags[0];

      let cakes = [];

      for (const item of cakeBag.containsItems) {
        if (item.tag?.ExtraAttributes?.new_years_cake) {
          cakes.push({ cake: item.tag.ExtraAttributes.new_years_cake });
        }
      }

      cakes = cakes.sort((a, b) => a.cake - b.cake);

      res.send(tableify(cakes));
    }
  } catch (e) {
    next(e);
  }
});

export { router };

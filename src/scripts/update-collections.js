import { db } from "../mongo.js";
import axios from "axios";

import "axios-debug-log";

async function updateCollections() {
  try {
    const { data } = await axios("https://api.hypixel.net/resources/skyblock/collections");
    if (data.collections === undefined) {
      throw new Error("Failed to fetch collections.");
    }

    const output = {};
    for (const [category, collection] of Object.entries(data.collections)) {
      output[category] = {
        name: collection.name,
        items: await Promise.all(
          Object.keys(collection.items).map(async (id) => {
            return {
              id,
              name: collection.items[id].name,
              texture: `/item/${displayID(id)}`,
              maxTier: collection.items[id].maxTiers,
              tiers: collection.items[id].tiers,
            };
          }),
        ),
      };
    }

    await db
      .collection("collections")
      .updateOne({ _id: "collections" }, { $set: { collections: output } }, { upsert: true });
  } catch (e) {
    console.error(e);
  }

  setTimeout(updateCollections, 1000 * 60 * 60 * 12);
}

function displayID(input) {
  const replacements = {
    "GLACITE": "PACKED_ICE", 
    "SULPHUR_ORE": "GLOWSTONE_DUST",
    "HARD_STONE": "STONE",
    "MITHRIL_ORE": "PRISMARINE_CRYSTALS",
    "WILTED_BERBERIS": "DEAD_BUSH",
    "HALF_EATEN_CARROT": "CARROT_ITEM",
    "CADUCOUS_STEM": "DOUBLE_PLANT:4",
    "HEMOVIBE": "REDSTONE_ORE",
  };

  if (replacements[input]) {
    return replacements[input];
  }
  return input;
}

updateCollections();

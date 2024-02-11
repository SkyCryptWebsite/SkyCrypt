import * as constants from "../constants.js";
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
              texture: `/item/${id}`,
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

updateCollections();

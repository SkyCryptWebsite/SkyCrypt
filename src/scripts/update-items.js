import { db } from "../mongo.js";
import axios from "axios";

import "axios-debug-log";

async function updateItems() {
  try {
    const items = [];
    const { data } = await axios("https://api.slothpixel.me/api/skyblock/items");

    for (const skyblockId in data) {
      const skyblockItem = data[skyblockId];

      const item = {
        id: skyblockId,
        damage: 0,
      };

      Object.assign(item, skyblockItem);
      items.push(item);
    }

    items.forEach(async (item) => {
      if (item.tier === undefined) {
        item.tier = "common";
      }
      
      await db.collection("items").updateOne({ id: item.id }, { $set: item }, { upsert: true });
    });
  } catch (e) {
    console.error(e);
  }

  setTimeout(updateItems, 1000 * 60 * 60 * 12);
}

updateItems();

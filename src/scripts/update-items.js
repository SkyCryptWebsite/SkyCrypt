import cluster from "cluster";

import { MongoClient } from "mongodb";
import axios from "axios";

import "axios-debug-log";

import credentials from "../credentials.js";

async function main() {
  const mongo = new MongoClient(credentials.dbUrl, { useUnifiedTopology: true });
  await mongo.connect();

  const db = mongo.db(credentials.dbName);

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
        await db.collection("items").updateOne({ id: item.id }, { $set: item }, { upsert: true });
      });
    } catch (e) {
      console.error(e);
    }

    setTimeout(updateItems, 1000 * 60 * 60 * 12);
  }

  updateItems();
}

if (cluster.isMaster) {
  main();
}

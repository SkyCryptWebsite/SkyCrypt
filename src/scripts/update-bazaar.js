import { db } from "../mongo.js";
import axios from "axios";
import "axios-debug-log";

import { getBazaarPrices } from "../helper.js";

const hypixel = axios.create({
  baseURL: "https://api.hypixel.net/",
});

async function updateBazaar() {
  try {
    const response = await hypixel.get("skyblock/bazaar" /*, { params: { key: credentials.hypixel_api_key }}*/);

    const { products } = response.data;

    for (const productId in products) {
      const product = products[productId];

      const { buyPrice, sellPrice } = getBazaarPrices(product);

      const { buyVolume, sellVolume } = product.quick_status;

      await db
        .collection("bazaar")
        .updateOne({ productId }, { $set: { buyPrice, sellPrice, buyVolume, sellVolume } }, { upsert: true });

      await db.collection("items").updateOne({ id: productId }, { $set: { bazaar: true } });
    }
  } catch (e) {
    console.error(e);
  }

  setTimeout(updateBazaar, 1000 * 120);
}

updateBazaar();

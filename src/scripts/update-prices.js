import { getPrices } from "skyhelper-networth";
import { db } from "../mongo.js";
import "axios-debug-log";

async function updatePrices() {
  try {
    const priceData = await getPrices();
    await db.collection("networth").updateOne({ _id: "prices" }, { $set: { priceData } }, { upsert: true });
  } catch (e) {
    console.error(e);
  }

  setTimeout(updatePrices, 1000 * 60 * 5);
}

updatePrices();

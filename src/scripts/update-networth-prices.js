import fs from "fs-extra";
import { getPrices } from "skyhelper-networth";
import * as helper from "../helper.js";

async function updateNetworthPrices() {
  try {
    const priceData = await getPrices();

    const cachePath = helper.getCacheFolderPath(helper.getFolderPath());
    await fs.writeJson(helper.getCacheFilePath(cachePath, "json", "networth-prices", "json"), priceData);
  } catch (e) {
    console.error(e);
  }

  setTimeout(updateNetworthPrices, 1000 * 60 * 15);
}

updateNetworthPrices();

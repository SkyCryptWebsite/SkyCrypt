import * as helper from "../../helper.js";
import express from "express";

import { db } from "../../mongo.js";
import { productInfo } from "../apiv2.js";

const router = express.Router();

router.use((req, res, next) => {
  req.options.debugId = helper.generateDebugId("api/v2/bazaar");
  next();
});

router.get("/", async (req, res, next) => {
  try {
    const output = {};

    for await (const product of db.collection("bazaar").find()) {
      const itemInfo = productInfo[product.productId];

      const productName = itemInfo ? itemInfo.name : helper.titleCase(product.productId.replaceAll(/(_+)/g, " "));

      output[product.productId] = {
        id: product.productId,
        name: productName,
        buyPrice: product.buyPrice,
        sellPrice: product.sellPrice,
        buyVolume: product.buyVolume,
        sellVolume: product.sellVolume,
        tag: itemInfo?.tag ?? null,
        price: (product.buyPrice + product.sellPrice) / 2,
      };
    }

    res.json(output);
  } catch (e) {
    next(e);
  }
});

export { router };

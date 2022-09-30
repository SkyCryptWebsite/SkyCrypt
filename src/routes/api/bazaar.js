import * as helper from "../../helper.js";
import express from "express";

import { tableify, productInfo } from "../api.js";
import { db } from "../../mongo.js";

const router = express.Router();

router.use(async (req, res, next) => {
  try {
    const output = [];

    for await (const product of db.collection("bazaar").find()) {
      const itemInfo = productInfo[product.productId];

      const productName = itemInfo ? itemInfo.name : helper.titleCase(product.productId.replaceAll(/(_+)/g, " "));

      output.push({
        id: product.productId,
        name: productName,
        buyPrice: product.buyPrice,
        sellPrice: product.sellPrice,
        buyVolume: product.buyVolume,
        sellVolume: product.sellVolume,
        tag: itemInfo?.tag ?? null,
        price: (product.buyPrice + product.sellPrice) / 2,
      });
    }

    if (req.isHtml) {
      res.send(tableify(output.map((a) => [a.name, +a.price.toFixed(3)])));
    } else {
      res.json(output);
    }
  } catch (e) {
    next(e, res);
  }
});

export { router };

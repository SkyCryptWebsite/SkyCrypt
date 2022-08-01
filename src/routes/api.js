import cors from "cors";
import express from "express";
import sanitize from "mongo-sanitize";

import { db } from "../mongo.js";

import * as accessories from "./api/accessories.js";
import * as armor from "./api/armor.js";
import * as bazaar from "./api/bazaar.js";
import * as cakebag from "./api/cakebag.js";
import * as collections from "./api/collections.js";
import * as items from "./api/items.js";
import * as minions from "./api/minions.js";
import * as pets from "./api/pets.js";
import * as profiles from "./api/profiles.js";
import * as skills from "./api/skills.js";
import * as wardrobe from "./api/wardrobe.js";
import * as weapons from "./api/weapons.js";

const router = express.Router();
router.use(cors());

// Checks if the request is HTML and also sets options for cacheOnly and other stuff.
router.use((req, res, next) => {
  req.isHtml = "html" in req.query;
  req.options = {
    cacheOnly: true,
  };

  next();
});

// /api/bazaar is the only endpoint that still supports JSON..
// So I had to make an exception for it. Great.
router.get("/bazaar", bazaar.router);

router.use((req, res, next) => {
  if (!req.isHtml) {
    handleError(req, res, new Error("Old JSON API has been disabled."), 403, false);
    return;
  }

  next();
});

// Endpoints with player parameter
router.get("/:player/profiles", handleParams, profiles.router);

// Endpoints with player and profile parameters
router.get("/:player/:profile/accessories", handleParams, accessories.router);
router.get("/:player/:profile/armor", handleParams, armor.router);
router.get("/:player/:profile/cakebag", handleParams, cakebag.router);
router.get("/:player/:profile/collections", handleParams, collections.router);
router.get("/:player/:profile/items", handleParams, items.router);
router.get("/:player/:profile/minions", handleParams, minions.router);
router.get("/:player/:profile/pets", handleParams, pets.router);
router.get("/:player/:profile/skills", handleParams, skills.router);
router.get("/:player/:profile/wardrobe", handleParams, wardrobe.router);
router.get("/:player/:profile/weapons", handleParams, weapons.router);

// Handler of non-existing endpoints
router.get("/*", async (req, res) => {
  handleError(req, res, new Error("Endpoint was not found."), 404, false);
});

// Handler of unsupported methods
router.all("/*", async (req, res) => {
  handleError(req, res, new Error("API only supports GET requests."), 405, false);
});

// Error handler for all /api endpoints
// Meant to be a safenet if some endpoint returns an error.
router.use((err, req, res, next) => {
  handleError(req, res, err);
});

/**
 * converts an array of objects to a table
 *
 * based on github.com/tillhub/tableify
 *
 * @param items {Iterable}
 */
export function tableify(items) {
  const keys = new Set();

  // get unique keys of all objects
  for (const item of items) {
    for (const key in item) {
      keys.add(key);
    }
  }

  let html = "<table><tbody>";

  for (const item of items) {
    html += "<tr>";
    for (const key of keys) {
      html += "<td>";
      html += item[key] || "";
      html += "</td>";
    }
    html += "</tr>";
  }

  html += "</tbody></table>";

  return html;
}

export const productInfo = {};

/**
 * Prepares productInfo for /api/bazaar
 * @returns void
 */
async function prepareProductInfo() {
  try {
    const bazaarProducts = await db.collection("bazaar").find().toArray();

    const itemInfo = await db
      .collection("items")
      .find({ id: { $in: bazaarProducts.map((a) => a.productId) } })
      .toArray();

    for (const product of bazaarProducts) {
      const info = itemInfo.filter((a) => a.id == product.productId);

      if (info.length > 0) {
        productInfo[product.productId] = info[0];
      }
    }

    return;
  } catch (e) {
    console.error(e);
  }
}

/**
 * Initializes prepare functions.
 * @returns void
 */
export async function init() {
  await prepareProductInfo();
  return;
}

/**
 * Does things with parameters, because I can't work with req.params across routers.
 *
 * @param Request req
 * @param Response res
 * @param Next next
 */
export function handleParams(req, res, next) {
  for (const key in req.params) {
    req[key] = sanitize(req.params[key]);
  }

  next();
}

/**
 * Sends error messages for handled errors.
 *
 * @param Request req
 * @param Response res
 * @param Error err
 * @param number status
 * @param boolean logged
 */
export function handleError(req, res, err, status = 500, logged = true) {
  if (logged) {
    console.error(err);
  }

  if (req.isHtml) {
    res.set("Content-Type", "text/plain");
    res.status(status).send(err.message);
  } else {
    res.status(status).json({
      error: err.message,
    });
  }
}

export { router };

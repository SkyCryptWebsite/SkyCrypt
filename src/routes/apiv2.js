import cors from "cors";
import express from "express";
import sanitize from "mongo-sanitize";
import leaderboard from "../leaderboards.js";

import { completePacks } from "../custom-resources.js";
import { db } from "../mongo.js";
import { redisClient } from "../redis.js";

import { router as bazaarRouter } from "./apiv2/bazaar.js";
import { router as coinsRouter } from "./apiv2/coins.js";
import { router as dungeonsRouter } from "./apiv2/dungeons.js";
import { router as leaderboardRouter } from "./apiv2/leaderboard.js";
import { router as profileRouter } from "./apiv2/profile.js";
import { router as slayersRouter } from "./apiv2/slayers.js";
import { router as talismansRouter } from "./apiv2/talismans.js";

const router = express.Router();
router.use(cors());

// Checks if there's an API key and if valid, disables cacheOnly
router.use(async (req, res, next) => {
  req.apiKey = false;

  if (req.query.key) {
    const doc = await db.collection("apiKeys").findOne({ key: sanitize(req.query.key) });

    if (doc != null) {
      req.apiKey = true;
    }
  }

  req.cacheOnly = !req.apiKey;
  req.options = {
    cacheOnly: req.cacheOnly,
  };

  next();
});

/**
 * @deprecated Not meant to be used by public.
 * @description Endpoint for getting currently processed packs
 *
 * - Undocumented endpoint
 * - Requires API key
 *
 * @todo Make an endpoint that actually returns just a list of available packs. Because why not.
 */
router.get("/packs", async (req, res) => {
  if (req.apiKey) {
    res.json(completePacks);
  } else {
    res.status(404).json({ error: "This endpoint isn't available to the public." });
  }
});

/**
 * @deprecated Not meant to be used by public.
 * @description Endpoint for getting all available leaderboards.
 *
 * - Undocumented endpoint
 *
 * @todo Remake how leaderboards work in their entirety.
 */
router.get("/leaderboards", async (req, res) => {
  res.json(leaderboards);
});

// Routes for all available /api/v2 endpoints. Duh.
router.use("/bazaar", bazaarRouter);
router.use("/coins", coinsRouter);
router.use("/dungeons", dungeonsRouter);
router.use("/leaderboard", leaderboardRouter);
router.use("/profile", profileRouter);
router.use("/slayers", slayersRouter);
router.use("/talismans", talismansRouter);

// Handler of non-existing endpoints
router.get("/*", async (req, res) => {
  handleError(res, new Error("Endpoint was not found."), 404, false);
});

// Handler of unsupported methods
router.all("/*", async (req, res) => {
  handleError(res, new Error("API v2 only supports GET requests."), 405, false);
});

// Error handler for all /api/v2 endpoints
// Meant to be a safenet if some endpoint returns an error.
router.use((err, req, res, next) => {
  handleError(res, err);
});

export const productInfo = {};
export const leaderboards = [];

/**
 * Prepares productInfo for /api/v2/bazaar
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
 * Prepares leaderboards for /api/v2 leaderboard endpoints
 * @returns void
 */
async function prepareLeaderboards() {
  try {
    const keys = await redisClient.keys("lb_*");

    for (const key of keys) {
      const lb = leaderboard(key);

      if (lb.mappedBy == "uuid" && !lb.key.startsWith("collection_enchanted")) {
        leaderboards.push(lb);
      }
    }

    leaderboards.sort((a, b) => {
      return a.key.localeCompare(b.key);
    });

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
  await prepareLeaderboards();
  return;
}

export function handleError(res, err, status = 500, logged = true) {
  if (logged) {
    console.error(err);
  }

  res.status(status).json({
    error: err.message,
  });
}

export { router };

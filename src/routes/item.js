import cors from "cors";
import express from "express";

import * as app from "../app.js";
import * as helper from "../helper.js";
import * as renderer from "../renderer.js";

const router = express.Router();
router.use(cors());

router.all("/:itemId?", cors(), async (req, res, next) => {
  try {
    const itemId = req.params.itemId || null;
    if (!req.query.pack && req.cookies.pack) {
      req.query.pack = req.cookies.pack;
    }

    const item = await renderer.renderItem(itemId, req.query);

    if (item.error) {
      throw new Error(item.error);
    }

    if (item.path) {
      res.set("X-Texture-Path", `${item.path}`);
    }

    if (item.debug) {
      res.set("X-Texture-Debug", `${JSON.stringify(item.debug)}`);
    }

    res.set("X-Cluster-ID", `${helper.getClusterId()}`);
    res.setHeader("Cache-Control", `public, max-age=${app.CACHE_MAX_AGE}`);
    res.contentType(item.mime);
    res.send(item.image);
  } catch (e) {
    next(e);
  }
});

router.use((err, req, res, next) => {
  handleError(res, err);
});

export function handleError(res, err, status = 500, logged = true) {
  if (logged) {
    console.error(err);
  }

  res.status(status).send(err.message);
}

export { router };

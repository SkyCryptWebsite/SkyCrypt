import cors from "cors";
import express from "express";

import * as app from "../app.js";
import * as helper from "../helper.js";
import * as renderer from "../renderer.js";

const router = express.Router();
router.use(cors());

router.all("/:textureId", cors(), async (req, res, next) => {
  try {
    const { textureId } = req.params;

    if (!/^[0-9a-fA-F]+$/.test(textureId)) {
      handleError(res, new Error("invalid texture id: " + textureId), 400);
      return;
    }

    const file = await renderer.getHead(textureId);

    res.set("X-Cluster-ID", `${helper.getClusterId()}`);
    res.setHeader("Cache-Control", `public, max-age=${app.CACHE_MAX_AGE}`);
    res.contentType("image/png");
    res.send(file);
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

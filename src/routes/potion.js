import cors from "cors";
import express from "express";

import * as app from "../app.js";
import * as helper from "../helper.js";
import * as renderer from "../renderer.js";

const router = express.Router();
router.use(cors());

router.all("/:type/:color", cors(), async (req, res, next) => {
  try {
    const { type, color } = req.params;

    if (!["normal", "splash"].includes(type)) {
      handleError(res, new Error("invalid armor type: " + type), 400);
      return;
    }

    if (!/^[0-9a-fA-F]{6}$/.test(color)) {
      handleError(res, new Error("invalid color: #" + color), 400);
      return;
    }

    const file = await renderer.getPotion(type, color);

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

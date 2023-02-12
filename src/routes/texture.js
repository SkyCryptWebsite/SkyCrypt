import axios from "axios";
import cors from "cors";
import express from "express";
import fs from "fs-extra";

import * as app from "../app.js";
import * as helper from "../helper.js";

const router = express.Router();
router.use(cors());

router.all("/:textureId", cors(), async (req, res, next) => {
  try {
    const { textureId } = req.params;

    if (!/^[0-9a-fA-F]+$/.test(textureId)) {
      handleError(res, new Error("invalid texture id: " + textureId), 400);
      return;
    }

    const texture = await getTexture(textureId);

    if (!texture) {
      handleError(res, new Error("texture not found"), 404);
      return;
    }

    res.set("X-Cluster-ID", `${helper.getClusterId()}`);
    res.setHeader("Cache-Control", `public, max-age=${app.MAX_MAX_AGE}`);
    res.contentType("image/png");
    res.send(texture);
  } catch (e) {
    next(e);
  }
});

async function getTexture(textureId) {
  const filePath = helper.getCacheFilePath(app.CACHE_PATH, "texture", textureId);
  let file;

  try {
    file = await fs.readFile(filePath);
  } catch (e) {
    try {
      file = (await axios.get(`https://textures.minecraft.net/texture/${textureId}`, { responseType: "arraybuffer" }))
        .data;

      fs.writeFile(filePath, file, (err) => {
        if (err) {
          console.error(err);
        }
      });
    } catch (e) {
      return null;
    }
  }

  return file;
}

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

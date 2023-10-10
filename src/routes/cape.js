import axios from "axios";
import cors from "cors";
import express from "express";
import fs from "fs-extra";
import moment from "moment-timezone";

import * as app from "../app.js";
import * as helper from "../helper.js";

const router = express.Router();
router.use(cors());

router.all("/:username", cors(), async (req, res, next) => {
  try {
    const { username } = req.params;

    if (!/^[0-9a-zA-Z_]{1,16}$/.test(username)) {
      handleError(res, new Error("invalid username"), 400);
      return;
    }

    const file = getCape(username);

    if (file == null) {
      handleError(res, new Error("no cape for user"), 204);
      return;
    }

    res.set("X-Cluster-ID", `${helper.getClusterId()}`);
    res.setHeader("Cache-Control", `public, max-age=${app.VOLATILE_CACHE_MAX_AGE}`);
    res.contentType("image/png");
    res.send(file);
  } catch (e) {
    next(e);
  }
});

async function getCape(username) {
  const filePath = helper.getCacheFilePath(app.CACHE_PATH, "cape", username);
  let file;

  try {
    // try to use file from disk
    const fileStats = await fs.stat(filePath);

    const optifineCape = await axios.head(`https://optifine.net/capes/${username}.png`);
    const lastUpdated = moment(optifineCape.headers["last-modified"]);

    if (lastUpdated.unix() > fileStats.mtime) {
      throw new Error("optifine cape changed");
    } else {
      file = await fs.readFile(filePath);
    }
  } catch (e) {
    // file on disk could not be used so try to get from network
    try {
      file = (await axios.get(`https://optifine.net/capes/${username}.png`, { responseType: "arraybuffer" })).data;

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

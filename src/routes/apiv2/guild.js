import * as helper from "../../helper.js";
import * as lib from "../../lib.js";
import express from "express";

import { db } from "../../mongo.js";

const router = express.Router();

router.use((req, res, next) => {
  req.options.debugId = helper.generateDebugId("api/v2/guild");
  next();
});

router.get("/:guild", async (req, res, next) => {
  try {
    const output = await lib.getGuild(db, req.params.guild, req.options);

    res.json(output);
  } catch (e) {
    next(e);
  }
});

export { router };

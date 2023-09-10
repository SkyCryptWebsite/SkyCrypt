// this file never runs on the master thread
import * as lib from "./lib.js";
import { getFileHashes, getFileHash, hashedDirectories } from "./hashes.js";
import fetch from "node-fetch";

import express from "express";
import session from "express-session";
import MongoStore from "connect-mongo";
import bodyParser from "body-parser";

import "axios-debug-log";

import fs from "fs-extra";

import path from "path";
import * as renderer from "./renderer.js";

import credentials from "./credentials.js";

import _ from "lodash";
import moment from "moment-timezone";
import momentDurationFormat from "moment-duration-format";
momentDurationFormat(moment);

import { mongo, db } from "./mongo.js";
import sanitize from "mongo-sanitize";
import * as helper from "./helper.js";
import * as constants from "./constants.js";
import * as custom_resources from "./custom-resources.js";
import { SitemapStream, streamToPromise } from "sitemap";
import { createGzip } from "zlib";
import twemoji from "twemoji";
import cookieParser from "cookie-parser";

import * as apiRoute from "./routes/api.js";
import * as apiv2Route from "./routes/apiv2.js";

import * as textureRoute from "./routes/texture.js";
import * as capeRoute from "./routes/cape.js";

import * as itemRoute from "./routes/item.js";
import * as headRoute from "./routes/head.js";
import * as leatherRoute from "./routes/leather.js";
import * as potionRoute from "./routes/potion.js";

const folderPath = helper.getFolderPath();

const manifest = JSON.parse(fs.readFileSync(path.join(folderPath, "../public/manifest.json")));

await renderer.init();
await custom_resources.init();

const fileHashes = await getFileHashes();

const fileNameMapFileName = path.join(folderPath, "../public/resources/js/file-name-map.json");

while (!fs.existsSync(fileNameMapFileName)) {
  console.log(`waiting for: "${fileNameMapFileName}" make sure you ran rollup`);
  await new Promise((resolve) => setTimeout(resolve, 1000));
}

let fileNameMap = JSON.parse(fs.readFileSync(fileNameMapFileName));

if (process.env.NODE_ENV == "development") {
  const { default: watch } = await import("node-watch");

  watch("public/resources/css", { recursive: true }, async (evt, name) => {
    const [, , directory, fileName] = name.split(/\/|\\/);
    if (hashedDirectories.includes(directory)) {
      fileHashes[directory][fileName] = await getFileHash(name);
    }
  });

  watch(fileNameMapFileName, {}, async (evt, name) => {
    if (evt != "remove") {
      fileNameMap = JSON.parse(fs.readFileSync(fileNameMapFileName));
    }
  });
}

/**
 * the largest number of second that `max-age` in `Cache-Control` will allow
 * @example
 * // this is static and never changes so it should be cached forever
 * res.setHeader("Cache-Control", `max-age=${maxMaxAge}`);
 */
export const MAX_MAX_AGE = 31536000;

/**
 * the number of seconds that mostly static resources should be cached for
 * @example
 * // this is only changes when a Dev updates it manually which doesn't happen very much so it should be cached for a long time
 * res.setHeader("Cache-Control", `max-age=${cacheMaxAge}`);
 */
export const CACHE_MAX_AGE = 30 * 24 * 60 * 60; // 30 days should be cached for

/**
 * the number of seconds that frequently changing resources should be cached for
 * @example
 * // this is could change at any time but it is not important that that updates goes to the user right away
 * res.setHeader("Cache-Control", `max-age=${volatileCacheMaxAge}`);
 */
export const VOLATILE_CACHE_MAX_AGE = 12 * 60 * 60; // 12 hours

export const CACHE_PATH = helper.getCacheFolderPath(folderPath);
await fs.ensureDir(CACHE_PATH);

if (credentials.hypixel_api_key.length == 0) {
  throw new Error(
    "Please enter a valid Hypixel API Key. Go to developer.hypixel.net/dashboard and click Create API Key to obtain one."
  );
}

let isFoolsDay;
function updateIsFoolsDay() {
  const date = new Date();
  isFoolsDay = date.getUTCMonth() === 3 && date.getUTCDate() === 1;
}
updateIsFoolsDay();
setInterval(updateIsFoolsDay, 60_000);

let forceCacheOnly = false;
const hypixelUUID = "f7c77d999f154a66a87dc4a51ef30d19";
async function updateCacheOnly() {
  try {
    const response = await fetch(
      `https://api.hypixel.net/skyblock/profiles?uuid=${hypixelUUID}&key=${credentials.hypixel_api_key}`
    );
    //forceCacheOnly = false;
    // 429 = key throttle
    if (!response.ok && response.status != 429) {
      forceCacheOnly = true;
      console.log(`forcing cache only mode because: hypixel responded with ${response.status}`);
    }
  } catch (error) {
    forceCacheOnly = true;
    console.log("forcing cache only mode because:", error);
  }
}
updateCacheOnly();
setInterval(updateCacheOnly, 60_000 * 5);

const commitHash = "N/A"; // helper.getCommitHash();
const featuredProfiles = fs.readJSONSync(helper.getCacheFilePath(CACHE_PATH, "json", "featured-profiles", "json"));

// Wait for APIs to be ready..
// Maybe these awaits are done wrong or just unnecessary, idk.. -Martin
await apiv2Route.init();
await apiRoute.init();

const app = express();
const port = process.env.SKYCRYPT_PORT ?? 32464;

let sitemap;

app.locals.moment = moment;
app.use(bodyParser.urlencoded({ extended: true }));
app.set("view engine", "ejs");
express.static.mime.define({ "application/opensearchdescription+xml": ["osd"] });
app.use("/resources/js", express.static("public/resources/js", { maxAge: MAX_MAX_AGE * 1000 }));
app.use("/resources/css", express.static("public/resources/css", { maxAge: MAX_MAX_AGE * 1000 }));
app.use(express.static("public", { maxAge: CACHE_MAX_AGE * 1000 }));
app.use(cookieParser());

app.use(
  session({
    secret: credentials.session_secret,
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({
      client: mongo,
    }),
  })
);

function parseFavorites(cookie) {
  return cookie?.split(",").filter((uuid) => /^[0-9a-f]{32}$/.test(uuid)) || [];
}

async function getFavoritesFormUUIDs(uuids) {
  const favorites = [];
  for (let uuid of uuids) {
    if (uuid == null) continue;
    uuid = sanitize(uuid);

    const cache = await db.collection("favoriteCache").find({ uuid }).toArray();

    if (cache[0]) {
      favorites.push(cache[0]);
      continue;
    } else {
      let outputCache = { uuid };

      const user = await db.collection("usernames").find({ uuid }).toArray();

      if (user[0]) {
        outputCache = user[0];

        const profiles = await db.collection("profileStore").find({ uuid }).toArray();

        if (profiles[0]) {
          const profile = profiles[0];
          outputCache.last_updated = profile.last_save;
        } else {
          outputCache.error = "Profile doesn't exist.";
        }
      } else {
        outputCache.error = "User doesn't exist.";
      }

      await db.collection("favoriteCache").insertOne(outputCache);
      favorites.push(outputCache);
    }
  }
  return favorites;
}

async function getExtra(page = null, favoriteUUIDs = [], cacheOnly) {
  const output = {};

  output.twemoji = twemoji;

  output.packs = custom_resources.getPacks();

  output.isFoolsDay = isFoolsDay;
  output.cacheOnly = cacheOnly;
  output.commit_hash = commitHash;

  if (page === "index") {
    output.favorites = await getFavoritesFormUUIDs(favoriteUUIDs);
    output.featured = featuredProfiles;
  }

  return output;
}

function weightedRandom(array) {
  const weights = [];

  for (let i = 0; i < array.length; i++) weights[i] = array[i].weight + (weights[i - 1] || 0);

  const random = Math.random() * weights[weights.length - 1];

  for (let i = 0; i < weights.length; i++) if (weights[i] > random) return array[i];
}

app.all("/stats/:player/:profile?", async (req, res, next) => {
  const debugId = helper.generateDebugId("stats");
  const timeStarted = Date.now();

  // console.debug(`${debugId}: stats page was called.`);

  const paramPlayer = req.params.player
    .toLowerCase()
    .replaceAll(/[ +]/g, "_")
    .replaceAll(/[^a-z\d\-_:]/g, "");
  const paramProfile = req.params.profile ? req.params.profile.toLowerCase() : null;

  const cacheOnly = req.query.cache === "true" || forceCacheOnly;

  const playerUsername =
    paramPlayer.length == 32 ? await helper.resolveUsernameOrUuid(paramPlayer, db).display_name : paramPlayer;

  try {
    const { profile, allProfiles } = await lib.getProfile(db, paramPlayer, paramProfile, {
      updateArea: true,
      cacheOnly,
      debugId,
    });

    const bingoProfile =
      profile.game_mode === "bingo" ? await lib.getBingoProfile(db, paramPlayer, { cacheOnly, debugId }) : {};
    const items = await lib.getItems(profile.members[profile.uuid], bingoProfile, true, req.cookies.pack, {
      cacheOnly,
      debugId,
    });
    const calculated = await lib.getStats(db, profile, bingoProfile, allProfiles, items, { cacheOnly, debugId });

    if (isFoolsDay) {
      calculated.skin_data.skinurl =
        "http://textures.minecraft.net/texture/b4bd832813ac38e68648938d7a32f6ba29801aaf317404367f214b78b4d4754c";
    }

    // console.debug(`${debugId}: starting page render.`);
    // const renderStart = Date.now();

    if (req.cookies.pack) {
      process.send({ type: "selected_pack", id: req.cookies.pack });
    }

    res.render(
      "stats",
      {
        req,
        items,
        calculated,
        _,
        constants,
        helper,
        extra: await getExtra("stats", undefined, cacheOnly),
        fileHashes,
        fileNameMap,
        page: "stats",
      },
      (err, html) => {
        if (err) console.error(err);
        // else console.debug(`${debugId}: page successfully rendered. (${Date.now() - renderStart}ms)`);

        res.set("X-Debug-ID", `${debugId}`);
        res.set("X-Process-Time", `${Date.now() - timeStarted}`);
        res.send(html);
      }
    );
  } catch (e) {
    const favorites = parseFavorites(req.cookies.favorite);

    console.debug(`${debugId}: an error has occurred.`);
    console.error(e);

    res.render(
      "index",
      {
        req,
        error: e,
        player: playerUsername,
        extra: await getExtra("index", favorites, cacheOnly),
        promotion: weightedRandom(constants.PROMOTIONS),
        fileHashes,
        fileNameMap,
        helper,
        page: "index",
      },
      (err, html) => {
        res.set("X-Debug-ID", `${debugId}`);
        res.set("X-Process-Time", `${Date.now() - timeStarted}`);
        res.send(html);
      }
    );

    return false;
  }
});

app.all("/api", async (req, res, next) => {
  res.render(
    "api",
    { error: null, player: null, extra: await getExtra("api"), fileHashes, fileNameMap, helper, page: "api" },
    (err, html) => {
      res.set("X-Cluster-ID", `${helper.getClusterId()}`);
      res.send(html);
    }
  );
});

app.use("/api/v2", apiv2Route.router);
app.use("/api", apiRoute.router);

app.use("/texture", textureRoute.router);
app.use("/cape", capeRoute.router);

app.use("/item", itemRoute.router);
app.use("/head", headRoute.router);
app.use("/leather", leatherRoute.router);
app.use("/potion", potionRoute.router);

app.all("/robots.txt", async (req, res, next) => {
  res
    .type("text")
    .send(
      `User-agent: *\nDisallow: /item /cape /head /leather /potion /resources\nSitemap: https://sky.shiiyu.moe/sitemap.xml`
    );
});

app.all("/sitemap.xml", async (req, res, next) => {
  res.header("Content-Type", "application/xml");
  res.header("Content-Encoding", "gzip");

  if (sitemap) {
    res.send(sitemap);
    return;
  }

  try {
    const smStream = new SitemapStream({ hostname: "https://sky.shiiyu.moe/" });
    const pipeline = smStream.pipe(createGzip());

    const cursor = await db.collection("featuredProfiles").find();

    while (await cursor.hasNext()) {
      const doc = await cursor.next();

      smStream.write({ url: `/stats/${doc.username}` });
    }

    smStream.end();

    streamToPromise(pipeline).then((sm) => (sitemap = sm));

    pipeline.pipe(res).on("error", (e) => {
      throw e;
    });
  } catch (e) {
    console.error(e);
    res.status(500).end();
  }
});

app.all("/random/stats", async (req, res, next) => {
  // const profile = await db
  //   .collection("profileStore")
  //   .aggregate([{ $match: { apis: true } }, { $sample: { size: 1 } }])
  //   .next();

  res.redirect(`/stats/20934ef9488c465180a78f861586b4cf/bf7c14fb018946899d944d56e65222d2`);
});

app.all("/resources/img/logo_square.svg", async (req, res, next) => {
  let color = "0bda51";
  if (typeof req.query.color === "string" && req.query.color.match(/^[0-9a-fA-F]{6}$/)) {
    color = req.query.color;
  }
  let background;
  let foreground;
  if ("invert" in req.query) {
    background = "ffffff";
    foreground = color;
  } else {
    background = color;
    foreground = "ffffff";
  }
  res.setHeader("Cache-Control", `public, max-age=${CACHE_MAX_AGE}`);
  res.type("svg").send(/*xml*/ `
      <svg width="120" height="120" xmlns="http://www.w3.org/2000/svg">
        <title>SkyCrypt Logo</title>
        <rect rx="16" height="120" width="120" y="0" x="0" fill="#${background}"/>
        <g fill="#${foreground}">
          <rect rx="4" height="28" width="19" y="69" x="22"/>
          <rect rx="4" height="75" width="19" y="22" x="50"/>
          <rect rx="4" height="47" width="19" y="50" x="79"/>
        </g>
      </svg>
    `);
});

app.all("/manifest.webmanifest", async (req, res) => {
  const favorites = await getFavoritesFormUUIDs(parseFavorites(req.cookies.favorite));
  const shortcuts = favorites.map((favorite) => ({
    url: `/stats/${favorite.uuid}`,
    name: favorite.username,
    icons: [48, 72, 96, 144, 192, 512].map((size) => ({
      src: `https://crafatar.com/avatars/${favorite.uuid}?size=${size}&overlay`,
      sizes: `${size}x${size}`,
      type: "image/png",
    })),
  }));
  res.json(Object.assign({ shortcuts }, manifest));
});

app.all("/:player/:profile?", async (req, res, next) => {
  res.redirect(`/stats${req.path}`);
});

app.all("/", async (req, res, next) => {
  const timeStarted = Date.now();
  const favorites = parseFavorites(req.cookies.favorite);
  const cacheOnly = req.query.cache === "true" || forceCacheOnly;

  res.render(
    "index",
    {
      req,
      error: null,
      player: null,
      extra: await getExtra("index", favorites, cacheOnly),
      promotion: weightedRandom(constants.PROMOTIONS),
      fileHashes,
      fileNameMap,
      helper,
      page: "index",
    },
    (err, html) => {
      res.set("X-Cluster-ID", `${helper.getClusterId()}`);
      res.set("X-Process-Time", `${Date.now() - timeStarted}`);
      res.send(html);
    }
  );
});

app.all("*", async (req, res, next) => {
  res.status(404).type("txt").send("Not found");
});

app.listen(port, () => console.log(`SkyBlock Stats running on http://localhost:${port} (${helper.getClusterId()})`));

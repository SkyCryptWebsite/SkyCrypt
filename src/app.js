const cluster = require("cluster");
const lib = require("./lib");
const { getFileHashes, getFileHash, hashedDirectories } = require("./hashes");
const fetch = require("node-fetch");

async function main() {
  const express = require("express");
  const session = require("express-session");
  const MongoStore = require("connect-mongo");
  const bodyParser = require("body-parser");
  const cors = require("cors");

  const axios = require("axios");
  require("axios-debug-log");

  const fs = require("fs-extra");

  const path = require("path");
  const renderer = require("./renderer");

  await renderer.init();

  const fileHashes = await getFileHashes();

  let fileNameMap = JSON.parse(fs.readFileSync("public/resources/js/file-name-map.json"));

  if (process.env.NODE_ENV == "development") {
    const { default: watch } = await import("node-watch");

    watch("public/resources/css", { recursive: true }, async (evt, name) => {
      const [, , directory, fileName] = name.split(/\/|\\/);
      if (hashedDirectories.includes(directory)) {
        fileHashes[directory][fileName] = await getFileHash(name);
      }
    });

    watch("public/resources/js/file-name-map.json", {}, async (evt, name) => {
      fileNameMap = JSON.parse(fs.readFileSync("public/resources/js/file-name-map.json"));
    });
  }

  const credentials = require(path.resolve(__dirname, "../credentials.json"));

  const _ = require("lodash");
  const moment = require("moment-timezone");
  require("moment-duration-format")(moment);

  const { MongoClient } = require("mongodb");
  const sanitize = require("mongo-sanitize");
  const helper = require("./helper");
  const constants = require("./constants");
  const manifest = require("../public/manifest.json");
  const { SitemapStream, streamToPromise } = require("sitemap");
  const { createGzip } = require("zlib");
  const twemoji = require("twemoji");
  const cookieParser = require("cookie-parser");

  const mongo = new MongoClient(credentials.dbUrl, { useUnifiedTopology: true });
  await mongo.connect();
  const db = mongo.db(credentials.dbName);

  const CACHE_DURATION = 30 * 24 * 60 * 60 * 1000; // 30 days
  const cachePath = path.resolve(__dirname, "../cache");
  await fs.ensureDir(cachePath);

  if (credentials.hypixel_api_key.length == 0) {
    throw "Please enter a valid Hypixel API Key. Join mc.hypixel.net and enter /api to obtain one.";
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
      forceCacheOnly = false;
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

  const app = express();
  const port = 32464;

  let sitemap;

  app.locals.moment = moment;
  app.use(bodyParser.urlencoded({ extended: true }));
  app.set("view engine", "ejs");
  express.static.mime.define({ "application/opensearchdescription+xml": ["osd"] });
  app.use(express.static("public", { maxAge: CACHE_DURATION }));
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

  require("./api")(app, db);
  require("./apiv2")(app, db);
  require("./donations/kofi")(app, db);

  function parseFavorites(cookie) {
    return cookie?.split(",").filter((uuid) => /^[0-9a-f]{32}$/.test(uuid)) || [];
  }

  async function getFavoritesFormUUIDs(uuids) {
    let favorites = [];
    for (let uuid of uuids) {
      if (uuid == null) continue;
      uuid = sanitize(uuid);

      const cache = await db.collection("favoriteCache").find({ uuid }).toArray();

      if (cache[0]) {
        favorites.push(cache[0]);
        continue;
      } else {
        let output_cache = { uuid };

        const user = await db.collection("usernames").find({ uuid }).toArray();

        if (user[0]) {
          output_cache = user[0];

          let profiles = await db.collection("profileStore").find({ uuid }).toArray();

          if (profiles[0]) {
            const profile = profiles[0];
            output_cache.last_updated = profile.last_save;
          } else {
            output_cache.error = "Profile doesn't exist.";
          }
        } else {
          output_cache.error = "User doesn't exist.";
        }

        await db.collection("favoriteCache").insertOne(output_cache);
        favorites.push(output_cache);
      }
    }
    return favorites;
  }

  async function getExtra(page = null, favoriteUUIDs = [], cacheOnly) {
    const output = {};

    output.twemoji = twemoji;

    output.themes = lib.getThemes();

    output.packs = lib.getPacks();

    output.isFoolsDay = isFoolsDay;
    output.cacheOnly = cacheOnly;

    if ("recaptcha_site_key" in credentials) {
      output.recaptcha_site_key = credentials.recaptcha_site_key;
    }

    const patreonEntry = await db.collection("donations").findOne({ type: "patreon" });

    if (patreonEntry != null) {
      output.donations = { patreon: patreonEntry.amount || 0 };
    }

    if (page === "index") {
      output.favorites = await getFavoritesFormUUIDs(favoriteUUIDs);

      output.devs = await db.collection("topViews").find().sort({ position: 1 }).toArray();
    } else if (page === "stats") {
      output.favoriteUUIDs = favoriteUUIDs;
    }

    return output;
  }

  app.all("/stats/:player/:profile?", async (req, res, next) => {
    const debugId = helper.generateDebugId("stats");
    const timeStarted = new Date().getTime();

    console.debug(`${debugId}: stats page was called.`);

    let paramPlayer = req.params.player
      .toLowerCase()
      .replace(/[ +]/g, "_")
      .replace(/[^a-z\d\-_:]/g, "");
    let paramProfile = req.params.profile ? req.params.profile.toLowerCase() : null;

    const cacheOnly = req.query.cache === "true" || forceCacheOnly;

    const playerUsername =
      paramPlayer.length == 32 ? await helper.resolveUsernameOrUuid(paramPlayer, db).display_name : paramPlayer;

    const favorites = parseFavorites(req.cookies.favorite);
    try {
      const { profile, allProfiles } = await lib.getProfile(db, paramPlayer, paramProfile, {
        updateArea: true,
        cacheOnly,
        debugId,
      });

      const items = await lib.getItems(profile.members[profile.uuid], true, req.cookies.pack, { cacheOnly, debugId });
      const calculated = await lib.getStats(db, profile, allProfiles, items, { cacheOnly, debugId });

      if (isFoolsDay) {
        calculated.skin_data.skinurl =
          "http://textures.minecraft.net/texture/b4bd832813ac38e68648938d7a32f6ba29801aaf317404367f214b78b4d4754c";
      }

      console.debug(`${debugId}: starting page render.`);
      const renderStart = new Date().getTime();

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
          extra: await getExtra("stats", favorites, cacheOnly),
          fileHashes,
          fileNameMap,
          page: "stats",
        },
        (err, html) => {
          if (err) console.error(err);
          else console.debug(`${debugId}: page succesfully rendered. (${new Date().getTime() - renderStart}ms)`);

          res.set("X-Debug-ID", `${debugId}`);
          res.set("X-Process-Time", `${new Date().getTime() - timeStarted}`);
          res.send(html);
        }
      );
    } catch (e) {
      console.debug(`${debugId}: an error has occured.`);
      console.error(e);

      res.render(
        "index",
        {
          req,
          error: e,
          player: playerUsername,
          extra: await getExtra("index", favorites, cacheOnly),
          fileHashes,
          fileNameMap,
          helper,
          page: "index",
        },
        (err, html) => {
          res.set("X-Debug-ID", `${debugId}`);
          res.set("X-Process-Time", `${new Date().getTime() - timeStarted}`);
          res.send(html);
        }
      );

      return false;
    }
  });

  app.all("/texture/:uuid", cors(), async (req, res) => {
    const { uuid } = req.params;

    const filename = `texture_${uuid}.png`;
    res.set("X-Cluster-ID", `${helper.getClusterId()}`);

    let file;

    try {
      file = await fs.readFile(path.resolve(cachePath, filename));
    } catch (e) {
      try {
        file = (await axios.get(`https://textures.minecraft.net/texture/${uuid}`, { responseType: "arraybuffer" }))
          .data;

        fs.writeFile(path.resolve(cachePath, filename), file, (err) => {
          if (err) {
            console.error(err);
          }
        });
      } catch (e) {
        res.status(404);
        res.send("texture not found");

        return;
      }
    }

    res.setHeader("Cache-Control", `public, max-age=${CACHE_DURATION}`);
    res.contentType("image/png");
    res.send(file);
  });

  app.all("/cape/:username", cors(), async (req, res) => {
    res.set("X-Cluster-ID", `${helper.getClusterId()}`);

    const { username } = req.params;

    if (!/^[0-9a-zA-Z_]{1,16}$/.test(username)) {
      res.status(400);
      res.send("invalid username");
      return;
    }

    const filename = path.resolve(cachePath, `cape_${username}.png`);

    let file;

    try {
      // try to use file from disk
      const fileStats = await fs.stat(filename);

      const optifineCape = await axios.head(`https://optifine.net/capes/${username}.png`);
      const lastUpdated = moment(optifineCape.headers["last-modified"]);

      if (lastUpdated.unix() > fileStats.mtime) {
        throw "optifine cape changed";
      } else {
        file = await fs.readFile(filename);
      }
    } catch (e) {
      // file on disk could not be used so try to get from network
      try {
        file = (await axios.get(`https://optifine.net/capes/${username}.png`, { responseType: "arraybuffer" })).data;

        fs.writeFile(filename, file, (err) => {
          if (err) {
            console.error(err);
          }
        });
      } catch (e) {
        res.status(204);
        res.send("no cape for user");

        return;
      }
    }

    res.setHeader("Cache-Control", `public, max-age=${12 * 60 * 60 * 1000}`);
    res.contentType("image/png");
    res.send(file);
  });

  app.all("/head/:uuid", cors(), async (req, res) => {
    const { uuid } = req.params;

    const filename = `head_${uuid}.png`;

    let file;

    try {
      file = await fs.readFile(path.resolve(cachePath, filename));
    } catch (e) {
      file = await renderer.renderHead(`http://textures.minecraft.net/texture/${uuid}`, 6.4);

      fs.writeFile(path.resolve(cachePath, filename), file, (err) => {
        if (err) {
          console.error(err);
        }
      });
    }

    res.set("X-Cluster-ID", `${helper.getClusterId()}`);

    res.setHeader("Cache-Control", `public, max-age=${CACHE_DURATION}`);
    res.contentType("image/png");
    res.send(file);
  });

  app.all("/item(.gif)?/:skyblockId?", cors(), async (req, res) => {
    const skyblockId = req.params.skyblockId || null;
    const item = await renderer.renderItem(skyblockId, req.query, db);

    res.set("X-Cluster-ID", `${helper.getClusterId()}`);

    if (item.error) {
      res.status(500);
      res.send(item.error);
      return;
    }

    if (item.path) {
      res.set("X-Texture-Path", `${item.path}`);
    }

    res.setHeader("Cache-Control", `public, max-age=${CACHE_DURATION}`);
    res.contentType(item.mime);
    res.send(item.image);
  });

  app.all("/leather/:type/:color", cors(), async (req, res) => {
    const { type, color } = req.params;

    if (!["boots", "leggings", "chestplate", "helmet"].includes(type)) {
      throw new Error("invalid armor type: " + type);
    }

    if (!/^[0-9a-fA-F]{6}$/.test(color)) {
      throw new Error("invalid color: #" + color);
    }

    const filename = `leather_${type}_${color}.png`;

    let file;

    try {
      file = await fs.readFile(path.resolve(cachePath, filename));
    } catch (e) {
      file = await renderer.renderArmor(type, color);

      fs.writeFile(path.resolve(cachePath, filename), file, (err) => {
        if (err) {
          console.error(err);
        }
      });
    }

    res.setHeader("Cache-Control", `public, max-age=${CACHE_DURATION}`);
    res.contentType("image/png");
    res.send(file);
  });

  app.all("/potion/:type/:color", cors(), async (req, res) => {
    const { type, color } = req.params;

    if (!["normal", "splash"].includes(type)) {
      throw new Error("invalid armor type: " + type);
    }

    if (!/^[0-9a-fA-F]{6}$/.test(color)) {
      throw new Error("invalid color: #" + color);
    }

    const filename = `potion_${type}_${color}.png`;

    let file;

    try {
      file = await fs.readFile(path.resolve(cachePath, filename));
    } catch (e) {
      file = await renderer.renderPotion(type, color);

      fs.writeFile(path.resolve(cachePath, filename), file, (err) => {
        if (err) {
          console.error(err);
        }
      });
    }

    res.setHeader("Cache-Control", `public, max-age=${CACHE_DURATION}`);
    res.contentType("image/png");
    res.send(file);
  });

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

      const cursor = await db.collection("topViews").find();

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

  app.all("/:player/:profile?", async (req, res, next) => {
    res.redirect(`/stats${req.path}`);
  });

  app.all("/", async (req, res, next) => {
    const timeStarted = new Date().getTime();
    const favorites = parseFavorites(req.cookies.favorite);
    const cacheOnly = req.query.cache === "true" || forceCacheOnly;

    res.render(
      "index",
      {
        req,
        error: null,
        player: null,
        extra: await getExtra("index", favorites, cacheOnly),
        fileHashes,
        fileNameMap,
        helper,
        page: "index",
      },
      (err, html) => {
        res.set("X-Cluster-ID", `${helper.getClusterId()}`);
        res.set("X-Process-Time", `${new Date().getTime() - timeStarted}`);
        res.send(html);
      }
    );
  });

  app.all("*", async (req, res, next) => {
    res.status(404).type("txt").send("Not found");
  });

  app.listen(port, () => console.log(`SkyBlock Stats running on http://localhost:${port} (${helper.getClusterId()})`));
}

if (cluster.isMaster) {
  const totalCpus = require("os").cpus().length;
  const cpus = Math.min(process.env?.NODE_ENV != "development" ? 8 : 2, totalCpus);

  for (let i = 0; i < cpus; i += 1) {
    cluster.fork();
  }

  console.log(`Running SkyBlock Stats on ${cpus} cores`);
} else {
  main();
}

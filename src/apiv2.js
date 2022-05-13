import * as helper from "./helper.js";
import * as lib from "./lib.js";
import cors from "cors";
import sanitize from "mongo-sanitize";
import leaderboard from "./leaderboards.js";

import { completePacks } from "./custom-resources.js";

import { redisClient } from "./redis.js";

function handleError(e, res) {
  console.error(e);

  res.status(500).json({
    error: e.toString(),
  });
}

export default (app, db) => {
  const productInfo = {};
  const leaderboards = [];

  async function initializer() {
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
  }

  const init = initializer();

  app.use("/api/v2/*", async (req, res, next) => {
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

  app.all("/api/v2/packs", cors(), async (req, res) => {
    if (req.apiKey) {
      res.json(completePacks);
    } else {
      res.status(404).json({ error: "This endpoint isn't available to the public." });
    }
  });

  app.all("/api/v2/leaderboards", cors(), async (req, res) => {
    res.json(leaderboards);
  });

  app.all("/api/v2/leaderboard/:lbName", cors(), async (req, res) => {
    const count = Math.min(100, req.query.count || 20);

    let page, startIndex, endIndex;

    const lb = leaderboard(`lb_${req.params.lbName}`);

    const lbCount = await redisClient.zcount(`lb_${lb.key}`, "-Infinity", "+Infinity");

    if (lbCount == 0) {
      res.status(404).json({ error: "Leaderboard not found." });
      return;
    }

    const output = {
      positions: [],
    };

    if (req.query.find) {
      const uuid = (await helper.resolveUsernameOrUuid(req.query.find, db, true)).uuid;

      const rank =
        lb.sortedBy > 0
          ? await redisClient.zrank(`lb_${lb.key}`, uuid)
          : await redisClient.zrevrank(`lb_${lb.key}`, uuid);

      if (rank == null) {
        res.status(404).json({ error: "Specified user not found on leaderboard." });
        return;
      }

      output.self = { rank: rank + 1 };

      page = Math.floor(rank / count) + 1;
      startIndex = (page - 1) * count;
      endIndex = startIndex - 1 + count;
    } else {
      page = Math.max(1, req.query.page || 1);
      startIndex = (page - 1) * count;
      endIndex = startIndex - 1 + count;
    }

    page = Math.min(page, Math.floor(lbCount / count) + 1);

    output.page = page;

    startIndex = (page - 1) * count;
    endIndex = startIndex - 1 + count;

    const results =
      lb.sortedBy > 0
        ? await redisClient.zrange(`lb_${lb.key}`, startIndex, endIndex, "WITHSCORES")
        : await redisClient.zrevrange(`lb_${lb.key}`, startIndex, endIndex, "WITHSCORES");

    for (let i = 0; i < results.length; i += 2) {
      const lbPosition = {
        rank: i / 2 + startIndex + 1,
        amount: lb.format(results[i + 1]),
        raw: results[i + 1],
        uuid: results[i],
        username: (await helper.resolveUsernameOrUuid(results[i], db, true)).display_name,
      };

      if ("self" in output && output.self.rank == lbPosition.rank) {
        output.self = lbPosition;
      }

      output.positions.push(lbPosition);
    }

    res.json(output);
  });

  app.all("/api/v2/bazaar", cors(), async (req, res) => {
    await init;

    try {
      const output = {};

      for await (const product of db.collection("bazaar").find()) {
        const itemInfo = productInfo[product.productId];

        const productName = itemInfo ? itemInfo.name : helper.titleCase(product.productId.replaceAll(/(_+)/g, " "));

        output[product.productId] = {
          id: product.productId,
          name: productName,
          buyPrice: product.buyPrice,
          sellPrice: product.sellPrice,
          buyVolume: product.buyVolume,
          sellVolume: product.sellVolume,
          tag: itemInfo?.tag ?? null,
          price: (product.buyPrice + product.sellPrice) / 2,
        };
      }

      res.json(output);
    } catch (e) {
      handleError(e, res);
    }
  });

  app.all("/api/v2/profile/:player", cors(), async (req, res) => {
    try {
      req.options.debugId = helper.generateDebugId("api/v2/profile");
      const { profile, allProfiles } = await lib.getProfile(db, req.params.player, null, req.options);

      const output = { profiles: {} };

      for (const singleProfile of allProfiles) {
        const userProfile = singleProfile.members[profile.uuid];

        const items = await lib.getItems(userProfile, false, "", req.options);
        const data = await lib.getStats(db, singleProfile, allProfiles, items, req.options);

        output.profiles[singleProfile.profile_id] = {
          profile_id: singleProfile.profile_id,
          cute_name: singleProfile.cute_name,
          current: Math.max(...allProfiles.map((a) => a.members[profile.uuid].last_save)) == userProfile.last_save,
          last_save: userProfile.last_save,
          raw: userProfile,
          items,
          data,
        };
      }

      res.json(output);
    } catch (e) {
      handleError(e, res);
    }
  });

  app.all("/api/v2/coins/:player/:profile", cors(), async (req, res) => {
    try {
      req.options.debugId = helper.generateDebugId("api/v2/coins");
      const { profile, allProfiles } = await lib.getProfile(db, req.params.player, null, req.options);

      let output = {
        error: "Invalid Profile Name!",
      };

      for (const singleProfile of allProfiles) {
        const cute_name = singleProfile.cute_name;

        if (cute_name.toLowerCase() != req.params.profile.toLowerCase()) {
          continue;
        }

        const items = await lib.getItems(singleProfile.members[profile.uuid], false, "", req.options);
        const data = await lib.getStats(db, singleProfile, allProfiles, items, req.options);

        output = {
          profile_id: singleProfile.profile_id,
          cute_name: cute_name,
          purse: data.purse,
          bank: data.bank,
        };
      }

      res.json(output);
    } catch (e) {
      handleError(e, res);
    }
  });

  app.all("/api/v2/coins/:player", cors(), async (req, res) => {
    try {
      req.options.debugId = helper.generateDebugId("api/v2/coins");
      const { profile, allProfiles } = await lib.getProfile(db, req.params.player, null, req.options);

      const output = { profiles: {} };

      for (const singleProfile of allProfiles) {
        const cute_name = singleProfile.cute_name;

        const items = await lib.getItems(singleProfile.members[profile.uuid], false, "", req.options);
        const data = await lib.getStats(db, singleProfile, allProfiles, items, req.options);

        output.profiles[singleProfile.profile_id] = {
          profile_id: singleProfile.profile_id,
          cute_name: cute_name,
          purse: data.purse,
          bank: data.bank,
        };
      }

      res.json(output);
    } catch (e) {
      handleError(e, res);
    }
  });

  app.all("/api/v2/talismans/:player/:profile", cors(), async (req, res) => {
    try {
      req.options.debugId = helper.generateDebugId("api/v2/talismans");
      const { profile, allProfiles } = await lib.getProfile(db, req.params.player, null, req.options);

      let output = {
        error: "Invalid Profile Name!",
      };

      for (const singleProfile of allProfiles) {
        const cute_name = singleProfile.cute_name;

        if (cute_name.toLowerCase() != req.params.profile.toLowerCase()) {
          continue;
        }

        const items = await lib.getItems(singleProfile.members[profile.uuid], false, "", req.options);
        const talismans = items.talismans;

        output = {
          profile_id: singleProfile.profile_id,
          cute_name: singleProfile.cute_name,
          talismans,
        };
      }

      res.json(output);
    } catch (e) {
      handleError(e, res);
    }
  });

  app.all("/api/v2/talismans/:player", cors(), async (req, res) => {
    try {
      req.options.debugId = helper.generateDebugId("api/v2/talismans");
      const { profile, allProfiles } = await lib.getProfile(db, req.params.player, null, req.options);

      const output = { profiles: {} };

      for (const singleProfile of allProfiles) {
        const userProfile = singleProfile.members[profile.uuid];

        const items = await lib.getItems(userProfile, false, "", req.options);
        const talismans = items.talismans;

        output.profiles[singleProfile.profile_id] = {
          profile_id: singleProfile.profile_id,
          cute_name: singleProfile.cute_name,
          talismans,
        };
      }

      res.json(output);
    } catch (e) {
      handleError(e, res);
    }
  });

  app.all("/api/v2/slayers/:player/:profile", cors(), async (req, res) => {
    try {
      req.options.debugId = helper.generateDebugId("api/v2/slayers");
      const { profile, allProfiles } = await lib.getProfile(db, req.params.player, null, req.options);

      let output = {
        error: "Invalid Profile Name!",
      };

      for (const singleProfile of allProfiles) {
        const cute_name = singleProfile.cute_name;

        if (cute_name.toLowerCase() != req.params.profile.toLowerCase()) {
          continue;
        }

        const items = await lib.getItems(singleProfile.members[profile.uuid], false, "", req.options);
        const data = await lib.getStats(db, singleProfile, allProfiles, items, req.options);

        output = {
          profile_id: singleProfile.profile_id,
          cute_name: singleProfile.cute_name,
          slayer_xp: data.slayer_xp,
          slayers: data.slayers,
          slayer_bonus: data.slayer_bonus,
          slayer_coins_spent: data.slayer_coins_spent,
        };
      }

      res.json(output);
    } catch (e) {
      handleError(e, res);
    }
  });

  app.all("/api/v2/slayers/:player", cors(), async (req, res) => {
    try {
      req.options.debugId = helper.generateDebugId("api/v2/slayers");
      const { profile, allProfiles } = await lib.getProfile(db, req.params.player, null, req.options);

      const output = { profiles: {} };

      for (const singleProfile of allProfiles) {
        const userProfile = singleProfile.members[profile.uuid];

        const items = await lib.getItems(userProfile, false, "", req.options);
        const data = await lib.getStats(db, singleProfile, allProfiles, items, req.options);

        output.profiles[singleProfile.profile_id] = {
          profile_id: singleProfile.profile_id,
          cute_name: singleProfile.cute_name,
          slayer_xp: data.slayer_xp,
          slayers: data.slayers,
          slayer_bonus: data.slayer_bonus,
          slayer_coins_spent: data.slayer_coins_spent,
        };
      }

      res.json(output);
    } catch (e) {
      handleError(e, res);
    }
  });

  app.all("/api/v2/dungeons/:player/:profile", cors(), async (req, res) => {
    try {
      req.options.debugId = helper.generateDebugId("api/v2/dungeons");
      const { profile, allProfiles } = await lib.getProfile(db, req.params.player, null, req.options);

      let output = {
        error: "Invalid Profile Name!",
      };

      for (const singleProfile of allProfiles) {
        const cute_name = singleProfile.cute_name;

        if (cute_name.toLowerCase() != req.params.profile.toLowerCase()) {
          continue;
        }

        const userProfile = singleProfile.members[profile.uuid];
        const hypixelProfile = await helper.getRank(profile.uuid, db, req.cacheOnly);

        const dungeonData = await lib.getDungeons(userProfile, hypixelProfile);

        output = {
          profile_id: singleProfile.profile_id,
          cute_name: singleProfile.cute_name,
          dungeons: dungeonData,
        };
      }

      res.json(output);
    } catch (e) {
      handleError(e, res);
    }
  });

  app.all("/api/v2/dungeons/:player", cors(), async (req, res) => {
    try {
      req.options.debugId = helper.generateDebugId("api/v2/dungeons");
      const { profile, allProfiles } = await lib.getProfile(db, req.params.player, null, req.options);

      const output = { profiles: {} };

      for (const singleProfile of allProfiles) {
        const userProfile = singleProfile.members[profile.uuid];
        const hypixelProfile = await helper.getRank(profile.uuid, db, req.cacheOnly);

        const dungeonData = await lib.getDungeons(userProfile, hypixelProfile);

        output.profiles[singleProfile.profile_id] = {
          profile_id: singleProfile.profile_id,
          cute_name: singleProfile.cute_name,
          dungeons: dungeonData,
        };
      }

      res.json(output);
    } catch (e) {
      handleError(e, res);
    }
  });
};

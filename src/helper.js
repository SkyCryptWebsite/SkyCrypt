import cluster from "cluster";
import axios from "axios";
import sanitize from "mongo-sanitize";
import "axios-debug-log";
import { v4 } from "uuid";
import retry from "async-retry";
import path from "path";
import fs from "fs-extra";

export { renderLore, formatNumber } from "../common/formatting.js";
export * from "../common/helper.js";
import { titleCase } from "../common/helper.js";

import * as constants from "./constants.js";
import credentials from "./credentials.js";

const Hypixel = axios.create({
  baseURL: "https://api.hypixel.net/",
});

/**
 * converts a string to a number if it can be converted
 * @param {string} key
 * @returns {string|number}
 */
function getKey(key) {
  const intKey = new Number(key);

  if (!isNaN(intKey)) {
    return intKey;
  }

  return key;
}

/**
 * @param {any} obj an object
 * @param  {...(string|number)} keys a path
 * @returns {boolean} if the path exists on the object
 */
export function hasPath(obj, ...keys) {
  if (obj == null) {
    return false;
  }

  let loc = obj;

  for (let i = 0; i < keys.length; i++) {
    loc = loc[getKey(keys[i])];

    if (loc === undefined) {
      return false;
    }
  }

  return true;
}

/**
 * @param {any} obj an object
 * @param  {...(string|number)} keys a path
 * @returns {any} the value at the path on the object
 */
export function getPath(obj, ...keys) {
  if (obj == null) {
    return undefined;
  }

  let loc = obj;

  for (let i = 0; i < keys.length; i++) {
    loc = loc[getKey(keys[i])];

    if (loc === undefined) {
      return undefined;
    }
  }

  return loc;
}

/**
 * @deprecated because it's inefficient
 *
 * sets value at path on object
 * @param {any} obj an object
 * @param {any} value a value
 * @param  {...(string|number)} keys a path
 */
export function setPath(obj, value, ...keys) {
  let i;
  let loc = obj || {};

  for (i = 0; i < keys.length - 1; i++) {
    loc[keys[i]] ??= {};

    loc = loc[keys[i]];
  }

  loc[keys[i]] = value;
}

export function getId(item) {
  return item?.tag?.ExtraAttributes?.id ?? "";
}

export async function resolveUsernameOrUuid(uuid, db, cacheOnly = false) {
  let user = null;

  uuid = uuid.replaceAll("-", "");

  const isUuid = uuid.length == 32;

  if (isUuid) {
    user = await db.collection("usernames").findOne({ uuid: sanitize(uuid) });
  } else {
    const playerObjects = await db
      .collection("usernames")
      .find({ $text: { $search: sanitize(uuid) } })
      .toArray();

    for (const doc of playerObjects) {
      if (doc.username.toLowerCase() == uuid.toLowerCase()) {
        user = doc;
      }
    }
  }

  const defaultAlexSkin =
    "https://textures.minecraft.net/texture/3b60a1f6d562f52aaebbf1434f1de147933a3affe0e764fa49ea057536623cd3";

  /** @type {{model:"default"|"slim"; skinurl:string; capeurl?:string;}} */
  const skin_data = {
    skinurl: defaultAlexSkin,
    model: "slim",
  };

  if (user?.skinurl != undefined) {
    skin_data.skinurl = user.skinurl;
    skin_data.model = user.model;

    if (user?.capeurl != undefined) {
      skin_data.capeurl = user.capeurl;
    }
  }

  if (cacheOnly === false && (user == undefined || +new Date() - user.date > 7200 * 1000)) {
    let profileRequest = axios(`https://api.ashcon.app/mojang/v1/user/${uuid}`, { timeout: 5000 });

    profileRequest
      .then(async (response) => {
        try {
          const { data } = response;

          data.id = data.uuid.replaceAll("-", "");

          let updateDoc = {
            username: data.username,
            date: +new Date(),
          };

          if (data.textures?.skin != undefined) {
            skin_data.skinurl = data.textures.skin.url;
            skin_data.model = data.textures.slim ? "slim" : "default";
          }

          if (data.textures?.cape != undefined) {
            skin_data.capeurl = data.textures.cape.url;
          }

          updateDoc = Object.assign(updateDoc, skin_data);

          await db.collection("usernames").updateOne({ uuid: data.id }, { $set: updateDoc }, { upsert: true });

          const playerObjects = await db.collection("usernames").find({ $text: { $search: data.username } });

          for await (const doc of playerObjects) {
            if (doc.uuid == data.id) {
              continue;
            }

            if (doc.username.toLowerCase() == data.username.toLowerCase()) {
              await db.collection("usernames").deleteOne({ _id: doc._id });

              resolveUsernameOrUuid(doc.uuid, db).catch(console.error);
            }
          }
        } catch (e) {
          console.error(e);
        }
      })
      .catch(async (err) => {
        if (user) {
          await db.collection("usernames").updateOne({ uuid: user.uuid }, { $set: { date: +new Date() } });
        }

        console.error(err);
      });

    if (!user) {
      try {
        let { data } = await profileRequest;

        data.id = data.uuid.replaceAll("-", "");

        if (data.textures?.skin != undefined) {
          skin_data.skinurl = data.textures.skin.url;
          skin_data.model = data.textures.slim ? "slim" : "default";
        }

        if (data.textures?.cape != undefined) {
          skin_data.capeurl = data.textures.cape.url;
        }

        return { uuid: data.id, display_name: data.username, skin_data };
      } catch (e) {
        if (isUuid) {
          return { uuid, display_name: uuid, skin_data };
        } else {
          throw new Error(e?.response?.data?.reason ?? "Failed resolving username.");
        }
      }
    }
  }

  if (user) {
    return { uuid: user.uuid, display_name: user.username, emoji: user.emoji, skin_data };
  } else {
    return { uuid, display_name: uuid, skin_data };
  }
}

export async function getGuild(uuid, db, cacheOnly = false) {
  uuid = sanitize(uuid);
  const guildMember = await db.collection("guildMembers").findOne({ uuid });

  let guildObject = null;

  if (cacheOnly && guildMember == undefined) {
    return null;
  }

  if (guildMember != undefined && guildMember.gid !== null) {
    guildObject = await db.collection("guilds").findOne({ gid: sanitize(guildMember.gid) });
  }

  if (
    cacheOnly ||
    (guildMember != undefined &&
      guildMember.gid !== null &&
      (guildObject == undefined || Date.now() - guildMember.last_updated < 7200 * 1000))
  ) {
    if (guildMember.gid !== null) {
      const guildObject = await db.collection("guilds").findOne({ gid: sanitize(guildMember.gid) });

      if (guildObject == undefined) {
        return null;
      }

      guildObject.level = getGuildLevel(guildObject.exp);
      guildObject.gmUser = guildObject.gm ? await resolveUsernameOrUuid(guildObject.gm, db, cacheOnly) : "None";
      guildObject.rank = guildMember.rank;

      return guildObject;
    }

    return null;
  } else {
    if (guildMember == undefined || Date.now() - guildMember.last_updated > 7200 * 1000) {
      try {
        const guildResponse = await Hypixel.get("guild", {
          params: { player: uuid, key: credentials.hypixel_api_key },
        });

        const { guild } = guildResponse.data;

        let gm;

        if (guild && guild !== null) {
          for (const member of guild.members) {
            if (["guild master", "guildmaster"].includes(member.rank.toLowerCase())) {
              gm = member.uuid;
            }
          }

          for (const member of guild.members) {
            if (!gm && guild.ranks.find((a) => a.name.toLowerCase() == member.rank.toLowerCase()) == undefined) {
              gm = member.uuid;
            }

            await db
              .collection("guildMembers")
              .updateOne(
                { uuid: member.uuid },
                { $set: { gid: guild._id, rank: member.rank, last_updated: new Date() } },
                { upsert: true }
              );
          }

          const guildMembers = await db.collection("guildMembers").find({ gid: guild._id }).toArray();

          for (const member of guildMembers) {
            if (guild.members.find((a) => a.uuid == member.uuid) == undefined) {
              await db
                .collection("guildMembers")
                .updateOne({ uuid: member.uuid }, { $set: { gid: null, last_updated: new Date() } });
            }
          }

          const guildObject = await db.collection("guilds").findOneAndUpdate(
            { gid: guild._id },
            {
              $set: {
                name: guild.name,
                tag: guild.tag,
                exp: guild.exp,
                created: guild.created,
                gm,
                members: guild.members.length,
                last_updated: new Date(),
              },
            },
            { returnOriginal: false, upsert: true }
          );

          guildObject.value.level = getGuildLevel(guildObject.value.exp);
          guildObject.value.gmUser = await resolveUsernameOrUuid(guildObject.value.gm, db);
          guildObject.value.rank = guild.members.find((a) => a.uuid == uuid).rank;

          return guildObject.value;
        } else {
          await db
            .collection("guildMembers")
            .findOneAndUpdate({ uuid }, { $set: { gid: null, last_updated: new Date() } }, { upsert: true });
        }

        return null;
      } catch (e) {
        console.error(e);
        return null;
      }
    } else {
      return null;
    }
  }
}

export function getGuildLevel(xp) {
  let level = 0;

  while (true) {
    const xpNeeded = constants.guild_xp[Math.min(constants.guild_xp.length - 1, level)];

    if (xp > xpNeeded) {
      xp -= xpNeeded;
      level++;
    } else {
      return level;
    }
  }
}

/**
 * Get Minecraft lore without the color and formatting codes
 * @param {string} text lore with color codes
 * @returns {string} lore without color codes
 */
export function getRawLore(text) {
  return text.replaceAll(/§[0-9a-fk-or]/g, "");
}

/**
 * returns a string with 4 dots "●" for completed tiers and "○" for incomplete tiers
 * @param {number} completeTiers
 * @returns {string} 4 dots
 */
export function renderRaceTier(completeTiers) {
  const incompleteTiers = Math.max(0, 4 - completeTiers);
  return "●".repeat(completeTiers) + "○".repeat(incompleteTiers);
}

/**
 * checks whether a string should be proceeded by a or by an
 * @param {string} string
 * @returns {"a"|"an"}
 * @example
 * // returns "a"
 * aOrAn("cat");
 * @example
 * // returns "an"
 * aOrAn("egg");
 */
export function aOrAn(string) {
  return ["a", "e", "i", "o", "u"].includes(string.charAt(0).toLowerCase()) ? "an" : "a";
}

/**
 * returns a object with they key sorted
 * @param {object} obj
 * @returns {object}
 */
export function sortObject(obj) {
  return Object.keys(obj)
    .sort()
    .reduce(function (res, key) {
      res[key] = obj[key];
      return res;
    }, {});
}

export function getPrice(orderSummary) {
  orderSummary = orderSummary.slice(0, Math.ceil(orderSummary.length / 2));

  const orders = [];

  const totalVolume = orderSummary.map((a) => a.amount).reduce((a, b) => a + b, 0);
  const volumeTop2 = Math.ceil(totalVolume * 0.02);

  let volume = 0;

  for (const order of orderSummary) {
    const cappedAmount = Math.min(order.amount, volumeTop2 - volume);

    orders.push([order.pricePerUnit, cappedAmount]);

    volume += cappedAmount;

    if (volume >= volumeTop2) {
      break;
    }
  }

  const totalWeight = orders.reduce((sum, value) => sum + value[1], 0);

  return orders.reduce((mean, value) => mean + (value[0] * value[1]) / totalWeight, 0);
}

export function getPrices(product) {
  return {
    buyPrice: getPrice(product.buy_summary),
    sellPrice: getPrice(product.sell_summary),
  };
}

/**
 * calculates the letter grade of a dungeon Run
 * @param {{score_exploration:number,score_speed:number,score_skill:number,score_bonus:number}} data dungeon run
 * @returns {"S+"|"S"|"A"|"B"|"C"|"D"} letter grade
 */
export function calcDungeonGrade(data) {
  const total_score = data.score_exploration + data.score_speed + data.score_skill + data.score_bonus;
  if (total_score <= 99) {
    return "D";
  } else if (total_score <= 159) {
    return "C";
  } else if (total_score <= 229) {
    return "B";
  } else if (total_score <= 269) {
    return "A";
  } else if (total_score <= 299) {
    return "S";
  } else {
    return "S+";
  }
}

export function parseRank(player) {
  const output = {
    rankText: null,
    rankColor: null,
    plusText: null,
    plusColor: null,
  };

  const rankName = player.prefix
    ? getRawLore(player.prefix).replaceAll(/\[|\]/g, "")
    : player.rank && player.rank != "NORMAL"
    ? player.rank
    : player.monthlyPackageRank && player.monthlyPackageRank != "NONE"
    ? player.monthlyPackageRank
    : player.newPackageRank
    ? player.newPackageRank
    : player.packageRank
    ? player.packageRank
    : "NONE";

  if (constants.ranks[rankName]) {
    const { tag, color, plus, plusColor } = constants.ranks[rankName];
    output.rankText = tag;

    if (rankName == "SUPERSTAR") {
      output.rankColor = constants.color_names[player.monthlyRankColor] ?? color;
    } else {
      output.rankColor = color;
    }

    if (plus) {
      output.plusText = plus;

      if (rankName == "SUPERSTAR" || rankName == "MVP_PLUS") {
        output.plusColor = constants.color_names[player.rankPlusColor] ?? plusColor;
      } else {
        output.plusColor = plusColor;
      }
    }
  }

  return output;
}

export const renderRank = ({ rankText, rankColor, plusText, plusColor }) => {
  if (rankText === null) {
    return "";
  } else {
    return /*html*/ `
        <div class="rank-tag nice-colors-dark">
            <div class="rank-name" style="background-color: var(--§${rankColor})">${rankText}</div>
            ${
              plusText
                ? /*html*/ `<div class="rank-plus" style="background-color: var(--§${plusColor})">${plusText}</div>`
                : ""
            }
        </div>
      `;
  }
};

export async function updateRank(uuid, db) {
  let rank = {
    rankText: null,
    rankColor: null,
    plusText: null,
    plusColor: null,
    socials: {},
    achievements: {},
    claimed_items: {},
  };

  try {
    const response = await retry(async () => {
      return await Hypixel.get("player", {
        params: {
          key: credentials.hypixel_api_key,
          uuid,
        },
      });
    });

    const player = response.data.player;

    rank = Object.assign(rank, parseRank(player));

    if (player?.socialMedia?.links != undefined) {
      rank.socials = player.socialMedia.links;
    }

    if (player?.achievements != undefined) {
      rank.achievements = player.achievements;
    }

    let claimable = {
      claimed_potato_talisman: "Potato Talisman",
      claimed_potato_basket: "Potato Basket",
      claim_potato_war_silver_medal: "Silver Medal (Potato War)",
      claim_potato_war_crown: "Crown (Potato War)",
      skyblock_free_cookie: "Free Booster Cookie",
    };

    for (const item in claimable) {
      if (player?.[item]) {
        rank.claimed_items[claimable[item]] = player[item];
      }
    }

    // Scorpius Bribe
    for (const key of Object.keys(player).filter((key) => key.match(/^scorpius_bribe_\d+$/))) {
      rank.claimed_items[`Scorpius Bribe (Year ${key.split("_").pop()})`] = player[key];
    }
  } catch (e) {
    console.error(e);
  }

  rank.last_updated = new Date();

  await db.collection("hypixelPlayers").updateOne({ uuid: sanitize(uuid) }, { $set: rank }, { upsert: true });

  return rank;
}

export async function getRank(uuid, db, cacheOnly = false) {
  uuid = sanitize(uuid);

  let hypixelPlayer = await db.collection("hypixelPlayers").findOne({ uuid });

  let _updateRank;

  if (cacheOnly === false && (hypixelPlayer == undefined || +new Date() - hypixelPlayer.last_updated > 3600 * 1000)) {
    _updateRank = updateRank(uuid, db);
  }

  if (cacheOnly === false && hypixelPlayer == undefined) {
    hypixelPlayer = await _updateRank;
  }

  hypixelPlayer ??= { achievements: {} };

  return hypixelPlayer;
}

export async function fetchMembers(profileId, db, returnUuid = false) {
  let output = [];
  profileId = sanitize(profileId);

  const members = await db.collection("members").find({ profile_id: profileId }).toArray();

  if (members.length == 0) {
    let profileResponse = await Hypixel.get("skyblock/profile", {
      params: { key: credentials.hypixel_api_key, profile: profileId },
    });

    let memberPromises = [];

    for (const member in profileResponse.data.profile.members) {
      memberPromises.push(resolveUsernameOrUuid(member, db));
    }

    let profileMembers = await Promise.all(memberPromises);

    for (const profileMember of profileMembers) {
      await db
        .collection("members")
        .replaceOne(
          { profile_id: profileId, uuid: profileMember.uuid },
          { profile_id: profileId, uuid: profileMember.uuid, username: profileMember.display_name },
          { upsert: true }
        );
    }

    if (returnUuid) {
      output = profileMembers;
    } else {
      output = profileMembers.map((a) => a.display_name);
    }
  } else {
    if (returnUuid) {
      output = members.map((a) => {
        return { uuid: a.uuid, display_name: a.username };
      });
    } else {
      output = members.map((a) => a.username);
    }
  }

  return output;
}

export function getClusterId(fullName = false) {
  if (fullName) {
    return cluster.isWorker ? `worker${cluster.worker.id}` : "master";
  }

  return cluster.isWorker ? `w${cluster.worker.id}` : "m";
}

export const generateDebugId = (endpointName = "unknown") => {
  return (
    getClusterId() + "/" + endpointName + "_" + new Date().getTime() + "." + Math.floor(Math.random() * 9000 + 1000)
  );
};

export function generateUUID() {
  let u = "",
    i = 0;
  while (i++ < 36) {
    let c = "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx"[i - 1],
      r = (Math.random() * 16) | 0,
      v = c == "x" ? r : (r & 0x3) | 0x8;
    u += c == "-" || c == "4" ? c : v.toString(16);
  }
  return u;
}

/**
 * @typedef {{slot_type:string,slot_number:number,gem_type:string,gem_tier:string,lore:string}} Gem
 */

/**
 * @param  {{[key:string]:string}} gems item.ExtraAttributes.gems
 * @param  {string} [rarity] item rarity, ex: MYTHIC
 *
 * @returns {Gem[]} array of gem objects
 */
export function parseItemGems(gems, rarity) {
  /** @type {Gem[]} */

  const slots = {
    normal: Object.keys(constants.gemstones),
    special: ["UNIVERSAL", "COMBAT", "OFFENSIVE", "DEFENSIVE", "MINING"],
    ignore: ["unlocked_slots"],
  };

  const parsed = [];
  for (const [key, value] of Object.entries(gems)) {
    const slot_type = key.split("_")[0];

    if (slots.ignore.includes(key) || (slots.special.includes(slot_type) && key.endsWith("_gem"))) {
      continue;
    }

    if (slots.special.includes(slot_type)) {
      parsed.push({
        slot_type,
        slot_number: +key.split("_")[1],
        gem_type: gems[`${key}_gem`],
        gem_tier: value,
      });
    } else if (slots.normal.includes(slot_type)) {
      parsed.push({
        slot_type,
        slot_number: +key.split("_")[1],
        gem_type: key.split("_")[0],
        gem_tier: value,
      });
    } else {
      throw new Error(`Error! Unknown gemstone slot key: ${key}`);
    }
  }

  parsed.forEach((gem) => {
    gem.lore = generateGemLore(gem.gem_type, gem.gem_tier, rarity);
  });

  return parsed;
}

/**
 * @param  {string} type gem name, ex: RUBY
 * @param  {string} tier gem tier, ex: PERFECT
 * @param  {string} [rarity] item rarity, ex: MYTHIC
 *
 * @returns {string} formatted gem string
 *
 * @example
 * // returns "§cPerfect Ruby §7(§c+25❤§7)"
 * generateGemLore("RUBY", "PERFECT", "MYTHIC");
 */
export function generateGemLore(type, tier, rarity) {
  const lore = [];
  const stats = [];

  // Gem color
  const color = `§${constants.gemstones[type.toUpperCase()].color}`;

  // Gem stats
  if (rarity) {
    const gemstone_stats = constants.gemstones[type.toUpperCase()]?.stats?.[tier.toUpperCase()];
    if (gemstone_stats) {
      Object.keys(gemstone_stats).forEach((stat) => {
        let stat_value = gemstone_stats[stat][rarityNameToInt(rarity)];

        // Fallback since skyblock devs didn't code all gemstone stats for divine rarity yet
        // ...they didn't expect people to own divine tier items other than divan's drill
        if (rarity.toUpperCase() === "DIVINE" && stat_value === null) {
          stat_value = gemstone_stats[stat][rarityNameToInt("MYTHIC")];
        }

        if (stat_value) {
          stats.push(
            ["§", constants.statsData[stat].color, "+", stat_value, " ", constants.statsData[stat].symbol].join("")
          );
        } else {
          stats.push("§c§oMISSING VALUE§r");
        }
      });
    }
  }

  // Final lore
  lore.push(color, titleCase(tier), " ", titleCase(type));

  if (stats.length) {
    lore.push("§7 (", stats.join("§7, "), "§7)");
  }

  return lore.join("");
}

export function rarityNameToInt(string) {
  return constants.rarities.indexOf(string.toLowerCase());
}

/**
 * rounds a number to a certain number of decimal places
 * @param {number} num the number to be rounded
 * @param {number} decimals the number of decimal places to round to
 * @returns {number} the rounded number
 */
export function round(num, decimals = 0) {
  return Math.round(Math.pow(10, decimals) * num) / Math.pow(10, decimals);
}

/**
 * floors a number to a certain number of decimal places
 * @param {number} num the number to be floored
 * @param {number} decimals the number of decimal places to floor to
 * @returns {number} the floored number
 */
export function floor(num, decimals = 0) {
  return Math.floor(Math.pow(10, decimals) * num) / Math.pow(10, decimals);
}

/**
 * ceils a number to a certain number of decimal places
 * @param {number} num the number to be ceiled
 * @param {number} decimals the number of decimal places to ceil to
 * @returns {number} the ceiled number
 */
export function ceil(num, decimals = 0) {
  return Math.ceil(Math.pow(10, decimals) * num) / Math.pow(10, decimals);
}

export function generateItem(data) {
  if (!data) {
    return {
      itemId: v4("itemid"),
      item_index: Date.now(),
    };
  }

  const default_data = {
    id: 389,
    Damage: 0,
    Count: 1,
    display_name: "",
    rarity: null,
    categories: [],
    type: "misc",
    tag: {
      display: {
        Name: "",
        Lore: [""],
      },
    },
    itemId: v4("itemid"),
    item_index: Date.now(),
  };

  // Making sure rarity is lowercase
  if (data.rarity) {
    data.rarity = data.rarity.toLowerCase();
  }

  // Setting tag.display.Name using display_name if not specified
  if (data.display_name && !data.tag.display.Name) {
    data.tag = data.tag ?? {};
    data.tag.display = data.tag.display ?? {};
    const rarityColor = data.rarity ? `§${constants.rarityColors[data.rarity ?? "common"]}` : "";
    data.tag.display.Name = `${rarityColor}${data.display_name}`;
  }

  // Creating final item
  return Object.assign(default_data, data);
}

/**
 * @param {number} hotmTier
 * @param {number} potmTier
 * @returns {number}
 */
export function calcHotmTokens(hotmTier, potmTier) {
  let tokens = 0;

  for (let tier = 1; tier <= hotmTier; tier++) {
    tokens += constants.hotm.rewards.hotm[tier]?.token_of_the_mountain || 0;
  }

  for (let tier = 1; tier <= potmTier; tier++) {
    tokens += constants.hotm.rewards.potm[tier]?.token_of_the_mountain || 0;
  }

  return tokens;
}

/**
 * convert an amount of seconds into seconds minutes and hours
 * @param {string} seconds
 * @param {"friendly"|"friendlyhhmm"|"clock"} format
 * @param {boolean} alwaysTwoDigits
 * @returns {string}
 */
export function convertHMS(seconds, format = "clock", alwaysTwoDigits = false) {
  seconds = parseInt(seconds, 10);

  let hh = Math.floor(seconds / 3600);
  let mm = Math.floor((seconds - hh * 3600) / 60);
  let ss = seconds - hh * 3600 - mm * 60;

  if (alwaysTwoDigits) {
    hh = hh < 10 ? `0${hh}` : hh;
    mm = mm < 10 ? `0${mm}` : mm;
    ss = ss < 10 ? `0${ss}` : ss;
  }

  switch (format) {
    case "friendly":
      return `${hh} hours, ${mm} minutes and ${ss} seconds`;
    case "friendlyhhmm":
      return `${hh} hours and ${mm} minutes`;
    // clock
    default:
      return `${hh}:${mm}:${ss}`;
  }
}

export function parseItemTypeFromLore(lore) {
  const regex = new RegExp(
    `^(?<recomb>a )?(?<shiny>SHINY )?(?:(?<rarity>${constants.rarities
      .map((x) => x.replaceAll("_", " ").toUpperCase())
      .join("|")}) ?)(?<dungeon>DUNGEON )?(?<type>[A-Z ]+)?(?<recomb2>a)?$`
  );

  // Executing the regex on every lore line
  // Reverse array and breaks after first find to optimize speed
  let match = null;
  for (const line of lore.reverse()) {
    match = regex.exec(line);

    if (match) {
      break;
    }
  }

  // No match found (glitched items, like /sbmenu gui items)
  if (match == null) {
    return {
      categories: [],
      rarity: null,
      recombobulated: null,
      dungeon: null,
      shiny: null,
    };
  }

  // Parsing the match and returning data
  const r = match.groups;
  return {
    categories: r.type ? getCategoriesFromType(r.type.trim().toLowerCase()) : [],
    rarity: r.rarity.replaceAll(" ", "_").toLowerCase(),
    recombobulated: !!r.recomb && !!r.recomb2,
    dungeon: !!r.dungeon,
    shiny: !!r.shiny,
  };
}

export function getCacheFilePath(dirPath, type, name) {
  // we don't care about folder optimization when we're developing
  if (process.env?.NODE_ENV == "development") {
    return path.resolve(dirPath, `${type}_${name}.png`);
  }

  const subdirs = [type];

  // for texture and head type, we get the first 2 characters to split them further
  if (type == "texture" || type == "head") {
    subdirs.push(name.slice(0, 2));
  }

  // for potion and leather type, we get what variant they are to split them further
  if (type == "leather" || type == "potion") {
    subdirs.push(name.split("_")[0]);
  }

  // check if the entire folder path is available
  if (!fs.pathExistsSync(path.resolve(dirPath, subdirs.join("/")))) {
    // check if every subdirectory is available
    for (let i = 1; i <= subdirs.length; i++) {
      const checkDirs = subdirs.slice(0, i);
      const checkPath = path.resolve(dirPath, checkDirs.join("/"));

      if (!fs.pathExistsSync(checkPath)) {
        fs.mkdirSync(checkPath);
      }
    }
  }

  return path.resolve(dirPath, `${subdirs.join("/")}/${type}_${name}.png`);
}

function getCategoriesFromType(type) {
  if (type in constants.typeToCategories) {
    return constants.typeToCategories[type];
  }

  return ["unknown"];
}

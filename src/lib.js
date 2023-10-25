import retry from "async-retry";
import axios from "axios";
import _ from "lodash";
import minecraftData from "minecraft-data";
import { getItemNetworth, getPreDecodedNetworth } from "skyhelper-networth";
import moment from "moment";
import sanitize from "mongo-sanitize";
import path from "path";
import nbt from "prismarine-nbt";
import { fileURLToPath } from "url";
import util from "util";
import { v4 } from "uuid";

import * as stats from "./stats.js";
import * as constants from "./constants.js";
import credentials from "./credentials.js";
import { getTexture } from "./custom-resources.js";
import * as helper from "./helper.js";
import { db } from "./mongo.js";
import { redisClient } from "./redis.js";
import { calculateLilyWeight } from "./weight/lily-weight.js";
import { calculateSenitherWeight } from "./weight/senither-weight.js";
import { getLeaderboardPosition } from "./helper/leaderboards.js";
import { calculateFarmingWeight } from "./weight/farming-weight.js";

const mcData = minecraftData("1.8.9");
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const hypixel = axios.create({
  baseURL: "https://api.hypixel.net/",
});
const parseNbt = util.promisify(nbt.parse);

function getMinMax(profiles, min, ...path) {
  let output = null;

  const compareValues = profiles.map((a) => helper.getPath(a, ...path)).filter((a) => !isNaN(a));

  if (compareValues.length == 0) {
    return output;
  }

  if (min) {
    output = Math.min(...compareValues);
  } else {
    output = Math.max(...compareValues);
  }

  if (isNaN(output)) {
    return null;
  }

  return output;
}

function getMax(profiles, ...path) {
  return getMinMax(profiles, false, ...path);
}

function getAllKeys(profiles, ...path) {
  return _.uniq([].concat(...profiles.map((a) => _.keys(helper.getPath(a, ...path)))));
}

/**
 * gets the xp table for the given type
 * @param {string} type
 * @returns {{[key: number]: number}}
 */
function getXpTable(type) {
  switch (type) {
    case "runecrafting":
      return constants.RUNECRAFTING_XP;
    case "social":
      return constants.SOCIAL_XP;
    case "dungeoneering":
      return constants.DUNGEONEERING_XP;
    case "hotm":
      return constants.HOTM_XP;
    default:
      return constants.LEVELING_XP;
  }
}

/**
 * estimates the xp based on the level
 * @param {number} uncappedLevel
 * @param {{type?: string, cap?: number, skill?: string}} extra
 * @param type the type of levels (used to determine which xp table to use)
 * @param cap override the cap highest level the player can reach
 * @param skill the key of default_skill_caps
 */
function getXpByLevel(uncappedLevel, extra = {}) {
  const xpTable = getXpTable(extra.type);

  if (typeof uncappedLevel !== "number" || isNaN(uncappedLevel)) {
    uncappedLevel = 0;
  }

  /** the level that this player is caped at */
  const levelCap =
    extra.cap ??
    Math.max(uncappedLevel, constants.DEFAULT_SKILL_CAPS[extra.skill]) ??
    Math.max(...Object.keys(xpTable).map((a) => Number(a)));

  /** the maximum level that any player can achieve (used for gold progress bars) */
  const maxLevel = constants.MAXED_SKILL_CAPS[extra.skill] ?? levelCap;

  /** the amount of xp over the amount required for the level (used for calculation progress to next level) */
  const xpCurrent = 0;

  /** the sum of all levels including level */
  let xp = 0;

  for (let x = 1; x <= uncappedLevel; x++) {
    xp += xpTable[x];
  }

  /** the level as displayed by in game UI */
  const level = Math.min(levelCap, uncappedLevel);

  /** the amount amount of xp needed to reach the next level (used for calculation progress to next level) */
  const xpForNext = level < maxLevel ? Math.ceil(xpTable[level + 1]) : Infinity;

  /** the fraction of the way toward the next level */
  const progress = level < maxLevel ? 0.05 : 0;

  /** a floating point value representing the current level for example if you are half way to level 5 it would be 4.5 */
  const levelWithProgress = level + progress;

  return {
    xp,
    level,
    maxLevel,
    xpCurrent,
    xpForNext,
    progress,
    levelCap,
    uncappedLevel,
    levelWithProgress,
  };
}

/**
 * gets the level and some other information from an xp amount
 * @param {number} xp
 * @param {{type?: string, cap?: number, skill?: string, ignoreCap?: boolean }} extra
 * @param type the type of levels (used to determine which xp table to use)
 * @param cap override the cap highest level the player can reach
 * @param skill the key of default_skill_caps
 */
export function getLevelByXp(xp, extra = {}) {
  const xpTable = getXpTable(extra.type);

  if (typeof xp !== "number" || isNaN(xp)) {
    xp = 0;
  }

  /** the level that this player is caped at */
  const levelCap =
    extra.cap ?? constants.DEFAULT_SKILL_CAPS[extra.skill] ?? Math.max(...Object.keys(xpTable).map(Number));

  /** the level ignoring the cap and using only the table */
  let uncappedLevel = 0;

  /** the amount of xp over the amount required for the level (used for calculation progress to next level) */
  let xpCurrent = xp;

  /** like xpCurrent but ignores cap */
  let xpRemaining = xp;

  while (xpTable[uncappedLevel + 1] <= xpRemaining) {
    uncappedLevel++;
    xpRemaining -= xpTable[uncappedLevel];
    if (uncappedLevel <= levelCap) {
      xpCurrent = xpRemaining;
    }
  }

  /** adds support for catacombs level above 50 */
  if (extra.type === "dungeoneering") {
    uncappedLevel += Math.floor(xpCurrent / 200_000_000);
    xpCurrent %= 200_000_000;
  }

  /** the maximum level that any player can achieve (used for gold progress bars) */
  const maxLevel =
    extra.ignoreCap && uncappedLevel >= levelCap ? uncappedLevel : constants.MAXED_SKILL_CAPS[extra.skill] ?? levelCap;

  // not sure why this is floored but I'm leaving it in for now
  xpCurrent = Math.floor(xpCurrent);

  /** the level as displayed by in game UI */
  const level = extra.ignoreCap ? uncappedLevel : Math.min(levelCap, uncappedLevel);

  /** the amount amount of xp needed to reach the next level (used for calculation progress to next level) */
  const xpForNext = level < maxLevel ? Math.ceil(xpTable[level + 1]) : Infinity;

  /** the fraction of the way toward the next level */
  const progress = level >= levelCap ? (extra.ignoreCap ? 1 : 0) : Math.max(0, Math.min(xpCurrent / xpForNext, 1));

  /** a floating point value representing the current level for example if you are half way to level 5 it would be 4.5 */
  const levelWithProgress = level + progress;

  /** a floating point value representing the current level ignoring the in-game unlockable caps for example if you are half way to level 5 it would be 4.5 */
  const unlockableLevelWithProgress = extra.cap ? Math.min(uncappedLevel + progress, maxLevel) : levelWithProgress;

  return {
    xp,
    level,
    maxLevel,
    xpCurrent,
    xpForNext,
    progress,
    levelCap,
    uncappedLevel,
    levelWithProgress,
    unlockableLevelWithProgress,
  };
}

function getSlayerLevel(slayer, slayerName) {
  const { xp = 0, claimed_levels } = slayer;

  let currentLevel = 0;
  let progress = 0;
  let xpForNext = 0;

  if (constants.SLAYER_XP[slayerName] === undefined) {
    return {
      currentLevel,
      xp: 0,
      maxLevel: 0,
      progress,
      xpForNext,
    };
  }

  const maxLevel = Math.max(...Object.keys(constants.SLAYER_XP[slayerName]));

  for (const level_name in claimed_levels) {
    // Ignoring legacy levels for zombie
    if (slayerName === "zombie" && ["level_7", "level_8", "level_9"].includes(level_name)) {
      continue;
    }

    const level = parseInt(level_name.split("_")[1]);

    if (level > currentLevel) {
      currentLevel = level;
    }
  }

  if (currentLevel < maxLevel) {
    const nextLevel = constants.SLAYER_XP[slayerName][currentLevel + 1];

    progress = xp / nextLevel;
    xpForNext = nextLevel;
  } else {
    progress = 1;
  }

  return { currentLevel, xp, maxLevel, progress, xpForNext };
}

function getPetLevel(petExp, offsetRarity, maxLevel) {
  const rarityOffset = constants.PET_RARITY_OFFSET[offsetRarity];
  const levels = constants.PET_LEVELS.slice(rarityOffset, rarityOffset + maxLevel - 1);

  const xpMaxLevel = levels.reduce((a, b) => a + b, 0);
  let xpTotal = 0;
  let level = 1;

  let xpForNext = Infinity;

  for (let i = 0; i < maxLevel; i++) {
    xpTotal += levels[i];

    if (xpTotal > petExp) {
      xpTotal -= levels[i];
      break;
    } else {
      level++;
    }
  }

  let xpCurrent = Math.floor(petExp - xpTotal);
  let progress;

  if (level < maxLevel) {
    xpForNext = Math.ceil(levels[level - 1]);
    progress = Math.max(0, Math.min(xpCurrent / xpForNext, 1));
  } else {
    level = maxLevel;
    xpCurrent = petExp - levels[maxLevel - 1];
    xpForNext = 0;
    progress = 1;
  }

  return {
    level,
    xpCurrent,
    xpForNext,
    progress,
    xpMaxLevel,
  };
}

async function getBackpackContents(arraybuf) {
  const buf = Buffer.from(arraybuf);

  let data = await parseNbt(buf);
  data = nbt.simplify(data);

  const items = data.i;

  for (const [index, item] of items.entries()) {
    item.isInactive = true;
    item.inBackpack = true;
    item.item_index = index;
  }

  return items;
}

// Process items returned by API
async function processItems(base64, source, customTextures = false, packs, cacheOnly = false) {
  // API stores data as base64 encoded gzipped Minecraft NBT data
  const buf = Buffer.from(base64, "base64");

  let data = await parseNbt(buf);
  data = nbt.simplify(data);

  let items = data.i;

  // Check backpack contents and add them to the list of items
  for (const [index, item] of items.entries()) {
    if (
      item.tag?.display?.Name.includes("Backpack") ||
      ["NEW_YEAR_CAKE_BAG", "BUILDERS_WAND", "BASKET_OF_SEEDS"].includes(item.tag?.ExtraAttributes?.id)
    ) {
      let backpackData;

      for (const key of Object.keys(item.tag.ExtraAttributes)) {
        if (key.endsWith("_data")) backpackData = item.tag.ExtraAttributes[key];
      }

      if (!Array.isArray(backpackData)) {
        continue;
      }

      const backpackContents = await getBackpackContents(backpackData);

      for (const backpackItem of backpackContents) {
        backpackItem.backpackIndex = index;
      }

      item.containsItems = [];

      items.push(...backpackContents);
    }

    if (
      item.tag?.ExtraAttributes?.id?.includes("PERSONAL_COMPACTOR_") ||
      item.tag?.ExtraAttributes?.id?.includes("PERSONAL_DELETOR_")
    ) {
      item.containsItems = [];
      for (const key in item.tag.ExtraAttributes) {
        if (key.startsWith("personal_compact_") || key.startsWith("personal_deletor_")) {
          const hypixelItem = await db.collection("items").findOne({ id: item.tag.ExtraAttributes[key] });

          const itemData = {
            Count: 1,
            Damage: hypixelItem?.damage ?? 3,
            id: hypixelItem?.item_id ?? 397,
            itemIndex: item.containsItems.length,
            glowing: hypixelItem?.glowing ?? false,
            display_name: hypixelItem?.name ?? _.startCase(item.tag.ExtraAttributes[key].replace(/_/g, " ")),
            rarity: hypixelItem?.tier ?? "common",
            categories: [],
          };

          if (hypixelItem?.texture !== undefined) {
            itemData.texture_path = `/head/${hypixelItem.texture}`;
          }

          if (itemData.id >= 298 && itemData.id <= 301) {
            const type = ["helmet", "chestplate", "leggings", "boots"][itemData.id - 298];

            if (hypixelItem?.color !== undefined) {
              const color = helper.RGBtoHex(hypixelItem.color) ?? "955e3b";

              itemData.texture_path = `/leather/${type}/${color}`;
            }
          }

          if (hypixelItem === null) {
            itemData.texture_path = "/head/bc8ea1f51f253ff5142ca11ae45193a4ad8c3ab5e9c6eec8ba7a4fcb7bac40";
          }

          item.containsItems.push(itemData);
        }
      }
    }
  }

  for (const item of items) {
    // Get extra info about certain things
    if (item.tag?.ExtraAttributes != undefined) {
      item.extra = {
        hpbs: 0,
      };
    }

    if (item.tag?.ExtraAttributes?.rarity_upgrades != undefined) {
      const { rarity_upgrades } = item.tag.ExtraAttributes;

      if (rarity_upgrades > 0) {
        item.extra.recombobulated = true;
      }
    }

    if (item.tag?.ExtraAttributes?.model != undefined) {
      item.extra.model = item.tag.ExtraAttributes.model;
    }

    if (item.tag?.ExtraAttributes?.hot_potato_count != undefined) {
      item.extra.hpbs = item.tag.ExtraAttributes.hot_potato_count;
    }

    if (item.tag?.ExtraAttributes?.expertise_kills != undefined) {
      const { expertise_kills } = item.tag.ExtraAttributes;

      if (expertise_kills > 0) {
        item.extra.expertise_kills = expertise_kills;
      }
    }

    if (item.tag?.ExtraAttributes?.hecatomb_s_runs != undefined) {
      const { hecatomb_s_runs } = item.tag.ExtraAttributes;

      if (hecatomb_s_runs > 0) {
        item.extra.hecatomb_s_runs = hecatomb_s_runs;
      }
    }

    if (item.tag?.ExtraAttributes?.champion_combat_xp != undefined) {
      const { champion_combat_xp } = item.tag.ExtraAttributes;

      if (champion_combat_xp > 0) {
        item.extra.champion_combat_xp = champion_combat_xp;
      }
    }

    if (item.tag?.ExtraAttributes?.farmed_cultivating != undefined) {
      const { farmed_cultivating } = item.tag.ExtraAttributes;

      if (farmed_cultivating > 0) {
        item.extra.farmed_cultivating = item.tag?.ExtraAttributes?.mined_crops?.toString() ?? farmed_cultivating;
      }
    }

    if (item.tag?.ExtraAttributes?.blocks_walked != undefined) {
      const { blocks_walked } = item.tag.ExtraAttributes;

      if (blocks_walked > 0) {
        item.extra.blocks_walked = blocks_walked;
      }
    }

    if (item.tag?.ExtraAttributes?.timestamp != undefined) {
      const timestamp = item.tag.ExtraAttributes.timestamp;

      if (!isNaN(timestamp)) {
        item.extra.timestamp = timestamp;
      } else {
        item.extra.timestamp = Date.parse(timestamp + " EDT");
      }

      item.extra.timestamp;
    }

    if (item.tag?.ExtraAttributes?.spawnedFor != undefined) {
      item.extra.spawned_for = item.tag.ExtraAttributes.spawnedFor.replaceAll("-", "");
    }

    if (item.tag?.ExtraAttributes?.baseStatBoostPercentage != undefined) {
      item.extra.base_stat_boost = item.tag.ExtraAttributes.baseStatBoostPercentage;
    }

    if (item.tag?.ExtraAttributes?.item_tier != undefined) {
      item.extra.floor = item.tag.ExtraAttributes.item_tier;
    }

    if (item.tag?.ExtraAttributes?.winning_bid != undefined) {
      item.extra.price_paid = item.tag.ExtraAttributes.winning_bid;
    }

    if (item.tag?.ExtraAttributes?.modifier != undefined) {
      item.extra.reforge = item.tag.ExtraAttributes.modifier;
    }

    if (item.tag?.ExtraAttributes?.ability_scroll != undefined) {
      item.extra.ability_scroll = item.tag.ExtraAttributes.ability_scroll;
    }

    if (item.tag?.ExtraAttributes?.mined_crops != undefined) {
      item.extra.crop_counter = item.tag.ExtraAttributes.mined_crops;
    }

    if (item.tag?.ExtraAttributes?.petInfo != undefined) {
      item.tag.ExtraAttributes.petInfo = JSON.parse(item.tag.ExtraAttributes.petInfo);
    }

    if (item.tag?.ExtraAttributes?.gems != undefined) {
      item.extra.gems = item.tag.ExtraAttributes.gems;
    }

    if (item.tag?.ExtraAttributes?.skin != undefined) {
      item.extra.skin = item.tag.ExtraAttributes.skin;
    }

    if (item.tag?.ExtraAttributes?.petInfo?.skin != undefined) {
      item.extra.skin = `PET_SKIN_${item.tag.ExtraAttributes.petInfo.skin}`;
    }

    // Set custom texture for colored leather armor
    if (typeof item.id === "number" && item.id >= 298 && item.id <= 301) {
      const color = item.tag?.display?.color?.toString(16).padStart(6, "0") ?? "955e3b";

      const type = ["helmet", "chestplate", "leggings", "boots"][item.id - 298];

      item.texture_path = `/leather/${type}/${color}`;
    }

    // Set custom texture for colored potions
    if (item.id == 373) {
      const color = constants.POTION_COLORS[item.Damage % 16];

      const type = item.Damage & 16384 ? "splash" : "normal";

      item.texture_path = `/potion/${type}/${color}`;
    }

    // Set raw display name without color and formatting codes
    if (item.tag?.display?.Name != undefined) {
      item.display_name = helper.getRawLore(item.tag.display.Name);
    }

    // Resolve skull textures to their image path
    if (
      Array.isArray(item.tag?.SkullOwner?.Properties?.textures) &&
      item.tag.SkullOwner.Properties.textures.length > 0
    ) {
      try {
        const json = JSON.parse(Buffer.from(item.tag.SkullOwner.Properties.textures[0].Value, "base64").toString());
        const url = json.textures.SKIN.url;
        const uuid = url.split("/").pop();

        item.texture_path = `/head/${uuid}?v6`;
      } catch (e) {
        console.error(e);
      }
    }

    const animatedTexture = helper.getAnimatedTexture(item);

    // Gives animated texture on certain items, will be overwritten by custom textures
    if (animatedTexture) {
      item.texture_path = animatedTexture.texture;
    }

    // Uses animated skin texture
    if (item?.extra?.skin != undefined && constants.ANIMATED_ITEMS?.[item.extra.skin]) {
      item.texture_path = constants.ANIMATED_ITEMS[item.extra.skin].texture;
    }

    if (item.tag?.ExtraAttributes?.skin == undefined && customTextures) {
      const customTexture = await getTexture(item, {
        ignore_id: false,
        pack_ids: packs,
      });

      if (customTexture) {
        item.animated = customTexture.animated;
        item.texture_path = "/" + customTexture.path;
        item.texture_pack = customTexture.pack.config;
        item.texture_pack.base_path =
          "/" + path.relative(path.resolve(__dirname, "..", "public"), customTexture.pack.base_path);
      }
    }

    if (source !== undefined) {
      item.extra ??= {};
      item.extra.source = source
        .split(" ")
        .map((a) => a.charAt(0).toUpperCase() + a.slice(1))
        .join(" ");
    }

    // Lore stuff
    const itemLore = item?.tag?.display?.Lore ?? [];
    const lore_raw = [...itemLore];

    const lore = lore_raw != null ? lore_raw.map((a) => (a = helper.getRawLore(a))) : [];

    item.rarity = null;
    item.categories = [];

    if (lore.length > 0) {
      // item categories, rarity, recombobulated, dungeon, shiny
      const itemType = helper.parseItemTypeFromLore(lore, item);

      for (const key in itemType) {
        item[key] = itemType[key];
      }

      // fix custom maps texture
      if (item.id == 358) {
        item.id = 395;
        item.Damage = 0;
      }
    }

    // Set HTML lore to be displayed on the website
    if (itemLore.length > 0) {
      if (item.extra?.recombobulated) {
        itemLore.push("§8(Recombobulated)");
      }

      if (item.extra?.gems) {
        itemLore.push(
          "",
          "§7Applied Gemstones:",
          ...helper.parseItemGems(item.extra.gems, item.rarity).map((gem) => `§7 - ${gem.lore}`)
        );
      }

      if (item.extra?.expertise_kills) {
        const expertise_kills = item.extra.expertise_kills;

        if (lore_raw) {
          itemLore.push("", `§7Expertise Kills: §c${expertise_kills.toLocaleString()}`);
          if (expertise_kills >= 15000) {
            itemLore.push(`§8MAXED OUT!`);
          } else {
            let toNextLevel = 0;
            for (const e of constants.EXPERTISE_KILLS_LADDER) {
              if (expertise_kills < e) {
                toNextLevel = e - expertise_kills;
                break;
              }
            }
            itemLore.push(`§8${toNextLevel.toLocaleString()} kills to tier up!`);
          }
        }
      }

      if (item.extra?.hecatomb_s_runs) {
        const hecatomb_s_runs = item.extra.hecatomb_s_runs;

        if (lore_raw) {
          itemLore.push("", `§7Hecatomb Runs: §c${hecatomb_s_runs.toLocaleString()}`);
          if (hecatomb_s_runs >= 100) {
            itemLore.push(`§8MAXED OUT!`);
          } else {
            let toNextLevel = 0;
            for (const e of constants.hecatomb_s_runs_ladder) {
              if (hecatomb_s_runs < e) {
                toNextLevel = e - hecatomb_s_runs;
                break;
              }
            }
            itemLore.push(`§8${toNextLevel.toLocaleString()} runs to tier up!`);
          }
        }
      }

      if (item.extra?.champion_combat_xp) {
        const champion_combat_xp = Math.floor(item.extra.champion_combat_xp);

        if (lore_raw) {
          itemLore.push("", `§7Champion XP: §c${champion_combat_xp.toLocaleString()}`);
          if (champion_combat_xp >= 3000000) {
            itemLore.push(`§8MAXED OUT!`);
          } else {
            let toNextLevel = 0;
            for (const e of constants.champion_xp_ladder) {
              if (champion_combat_xp < e) {
                toNextLevel = Math.floor(e - champion_combat_xp);
                break;
              }
            }
            itemLore.push(`§8${toNextLevel.toLocaleString()} xp to tier up!`);
          }
        }
      }

      if (item.extra?.farmed_cultivating) {
        const farmed_cultivating = Math.floor(item.extra.farmed_cultivating);

        if (lore_raw) {
          itemLore.push("", `§7Cultivating Crops: §c${farmed_cultivating.toLocaleString()}`);
          if (farmed_cultivating >= 100000000) {
            itemLore.push(`§8MAXED OUT!`);
          } else {
            let toNextLevel = 0;
            for (const e of constants.cultivating_crops_ladder) {
              if (farmed_cultivating < e) {
                toNextLevel = Math.floor(e - farmed_cultivating);
                break;
              }
            }
            itemLore.push(`§8${toNextLevel.toLocaleString()} crops to tier up!`);
          }
        }
      }

      if (item.extra?.blocks_walked) {
        const blocks_walked = item.extra.blocks_walked;

        if (lore_raw) {
          itemLore.push("", `§7Blocks Walked: §c${blocks_walked.toLocaleString()}`);
          if (blocks_walked >= 100000) {
            itemLore.push(`§8MAXED OUT!`);
          } else {
            let toNextLevel = 0;
            for (const e of constants.PREHISTORIC_EGG_BLOCKS_WALKED_LADDER) {
              if (blocks_walked < e) {
                toNextLevel = e - blocks_walked;
                break;
              }
            }
            itemLore.push(`§8Walk ${toNextLevel.toLocaleString()} blocks to tier up!`);
          }
        }
      }

      if (item.tag?.display?.color) {
        const hex = item.tag.display.color.toString(16).padStart(6, "0");
        itemLore.push("", `§7Color: #${hex.toUpperCase()}`);
      }

      if (item.extra?.timestamp) {
        itemLore.push("", `§7Obtained: §c<local-time timestamp="${item.extra.timestamp}"></local-time>`);
      }

      if (item.extra?.spawned_for) {
        if (!item.extra.timestamp) {
          itemLore.push("");
        }

        const spawnedFor = item.extra.spawned_for;
        const spawnedForUser = await helper.resolveUsernameOrUuid(spawnedFor, db, cacheOnly);

        itemLore.push(`§7By: §c<a href="/stats/${spawnedFor}">${spawnedForUser.display_name}</a>`);
      }

      if (item.extra?.base_stat_boost) {
        itemLore.push(
          "",
          `§7Dungeon Item Quality: ${item.extra.base_stat_boost == 50 ? "§6" : "§c"}${item.extra.base_stat_boost}/50%`
        );
      }

      if (item.extra?.floor) {
        itemLore.push(`§7Obtained From: §bFloor ${item.extra.floor}`);
      }

      if (item.extra?.price_paid) {
        itemLore.push("", `§7Price Paid at Dark Auction: §6${item.extra.price_paid.toLocaleString()} Coins`);
      }
    }

    if (item?.tag || item?.exp) {
      if (item.tag?.ExtraAttributes?.id === "PET") {
        item.tag.ExtraAttributes.petInfo =
          JSON.stringify(item.tag.ExtraAttributes.petInfo) ?? item.tag.ExtraAttributes.petInfo;
      }

      const ITEM_PRICE = await getItemNetworth(item, { cache: true });

      if (ITEM_PRICE?.price > 0) {
        itemLore.push(
          "",
          `§7Item Value: §6${Math.round(ITEM_PRICE.price).toLocaleString()} Coins §7(§6${helper.formatNumber(
            ITEM_PRICE.price
          )}§7)`
        );
      }

      if (item.tag?.ExtraAttributes?.id === "PET") {
        item.tag.ExtraAttributes.petInfo =
          typeof item.tag.ExtraAttributes.petInfo === "string"
            ? JSON.parse(item.tag.ExtraAttributes.petInfo)
            : item.tag.ExtraAttributes.petInfo;
      }
    }

    if (!("display_name" in item) && "id" in item) {
      const vanillaItem = mcData.items[item.id];

      if ("displayName" in vanillaItem) {
        item.display_name = vanillaItem.displayName;
      }
    }
  }

  for (const item of items) {
    if (item.inBackpack) {
      items[item.backpackIndex].containsItems.push(Object.assign({}, item));
    }
  }

  items = items.filter((a) => !a.inBackpack);

  return items;
}

function getMinions(coopMembers) {
  const minions = [];

  const craftedGenerators = [];

  for (const member in coopMembers) {
    if (!("crafted_generators" in coopMembers[member])) {
      continue;
    }

    craftedGenerators.push(...coopMembers[member].crafted_generators);
  }

  for (const generator of craftedGenerators) {
    const split = generator.split("_");

    const minionLevel = parseInt(split.pop());
    const minionName = split.join("_");

    const minion = minions.find((a) => a.id == minionName);

    if (minion == undefined) {
      minions.push(
        Object.assign({ id: minionName, maxLevel: 0, levels: [minionLevel] }, constants.MINIONS[minionName])
      );
    } else {
      minion.levels.push(minionLevel);
    }
  }

  for (const minion in constants.MINIONS) {
    if (minions.find((a) => a.id == minion) == undefined) {
      minions.push(Object.assign({ id: minion, levels: [], maxLevel: 0 }, constants.MINIONS[minion]));
    }
  }

  for (const minion of minions) {
    minion.levels = _.uniq(minion.levels.sort((a, b) => a - b));
    minion.maxLevel = minion.levels.length > 0 ? Math.max(...minion.levels) : 0;
    minion.tiers = minion.tiers != null ? minion.tiers : 11;

    if (!("name" in minion)) {
      minion.name = _.startCase(_.toLower(minion.id));
    }
  }

  return minions;
}

function getMinionSlots(minions) {
  let uniqueMinions = 0;

  for (const minion of minions) {
    uniqueMinions += minion.levels.length;
  }

  const output = { currentSlots: 5, toNext: 5 };

  const uniquesRequired = Object.keys(constants.MINION_SLOTS).sort((a, b) => parseInt(a) - parseInt(b));

  for (const [index, uniques] of uniquesRequired.entries()) {
    if (parseInt(uniques) <= uniqueMinions) {
      continue;
    }

    output.currentSlots = constants.MINION_SLOTS[uniquesRequired[index - 1]];
    output.toNextSlot = uniquesRequired[index] - uniqueMinions;
    break;
  }

  return output;
}

export const getItems = async (
  profile,
  bingoProfile,
  customTextures = false,
  packs,
  options = { cacheOnly: false, debugId: `${helper.getClusterId()}/unknown@getItems` }
) => {
  const output = {};

  // console.debug(`${options.debugId}: getItems called.`);
  // const timeStarted = Date.now();

  // Process inventories returned by API
  const armor =
    "inv_armor" in profile
      ? await processItems(profile.inv_armor.data, "armor", customTextures, packs, options.cacheOnly)
      : [];
  const equipment =
    "equippment_contents" in profile
      ? await processItems(profile.equippment_contents.data, "equipment", customTextures, packs, options.cacheOnly)
      : [];
  const inventory =
    "inv_contents" in profile
      ? await processItems(profile.inv_contents.data, "inventory", customTextures, packs, options.cacheOnly)
      : [];
  const wardrobe_inventory =
    "wardrobe_contents" in profile
      ? await processItems(profile.wardrobe_contents.data, "wardrobe", customTextures, packs, options.cacheOnly)
      : [];
  let enderchest =
    "ender_chest_contents" in profile
      ? await processItems(profile.ender_chest_contents.data, "ender chest", customTextures, packs, options.cacheOnly)
      : [];
  const accessory_bag =
    "talisman_bag" in profile
      ? await processItems(profile.talisman_bag.data, "accessory bag", customTextures, packs, options.cacheOnly)
      : [];
  const fishing_bag =
    "fishing_bag" in profile
      ? await processItems(profile.fishing_bag.data, "fishing bag", customTextures, packs, options.cacheOnly)
      : [];
  const quiver =
    "quiver" in profile
      ? await processItems(profile.quiver.data, "quiver", customTextures, packs, options.cacheOnly)
      : [];
  const potion_bag =
    "potion_bag" in profile
      ? await processItems(profile.potion_bag.data, "potion bag", customTextures, packs, options.cacheOnly)
      : [];
  const candy_bag =
    "candy_inventory_contents" in profile
      ? await processItems(profile.candy_inventory_contents.data, "candy bag", customTextures, packs, options.cacheOnly)
      : [];
  const personal_vault =
    "personal_vault_contents" in profile
      ? await processItems(
          profile.personal_vault_contents.data,
          "personal vault",
          customTextures,
          packs,
          options.cacheOnly
        )
      : [];

  let storage = [];
  if (profile.backpack_contents) {
    const storageSize = Math.max(18, Object.keys(profile.backpack_contents).length);
    for (let slot = 0; slot < storageSize; slot++) {
      storage.push({});

      if (profile.backpack_contents[slot] && profile.backpack_icons[slot]) {
        const icon = await processItems(
          profile.backpack_icons[slot].data,
          "storage",
          customTextures,
          packs,
          options.cacheOnly
        );
        const items = await processItems(
          profile.backpack_contents[slot].data,
          "storage",
          customTextures,
          packs,
          options.cacheOnly
        );

        for (const [index, item] of items.entries()) {
          item.isInactive = true;
          item.inBackpack = true;
          item.item_index = index;
        }

        const storageUnit = icon[0];
        storageUnit.containsItems = items;
        storage[slot] = storageUnit;
      }
    }
  }

  const wardrobeColumns = wardrobe_inventory.length / 4;

  const wardrobe = [];

  for (let i = 0; i < wardrobeColumns; i++) {
    const page = Math.floor(i / 9);

    const wardrobeSlot = [];

    for (let j = 0; j < 4; j++) {
      const index = 36 * page + (i % 9) + j * 9;

      if (helper.getId(wardrobe_inventory[index]).length > 0) {
        wardrobeSlot.push(wardrobe_inventory[index]);
      } else {
        wardrobeSlot.push(null);
      }
    }

    if (wardrobeSlot.find((a) => a !== null) != undefined) {
      wardrobe.push(wardrobeSlot);
    }
  }

  let hotm = "mining_core" in profile ? await getHotmItems(profile, packs) : [];

  output.armor = armor.filter((x) => x.rarity);
  output.equipment = equipment.filter((x) => x.rarity);
  output.wardrobe = wardrobe;
  output.wardrobe_inventory = wardrobe_inventory;
  output.inventory = inventory;
  output.enderchest = enderchest;
  output.accessory_bag = accessory_bag;
  output.fishing_bag = fishing_bag;
  output.quiver = quiver;
  output.potion_bag = potion_bag;
  output.personal_vault = personal_vault;
  output.storage = storage;
  output.hotm = hotm;
  output.candy_bag = candy_bag;

  output.bingo_card = {};
  if (bingoProfile?.events !== undefined) {
    const bingoRes = await helper.getBingoGoals(db);
    if (bingoRes === null) {
      throw new Error("Failed to fetch bingo goals");
    }

    const bingoData = bingoRes.output;
    const bingoProfilev2 = bingoProfile.events.find((profile) => profile.key === bingoData.id);

    output.bingo_card = bingoProfilev2 !== undefined ? constants.getBingoItems(bingoProfilev2, bingoData.goals) : {};
  }

  const allItems = armor.concat(
    equipment,
    inventory,
    enderchest,
    accessory_bag,
    fishing_bag,
    quiver,
    potion_bag,
    personal_vault,
    wardrobe_inventory,
    storage,
    hotm
  );

  for (const [index, item] of allItems.entries()) {
    item.item_index = index;
    item.itemId = v4("itemId");

    if ("containsItems" in item && Array.isArray(item.containsItems)) {
      item.containsItems.forEach((a, idx) => {
        a.backpackIndex = item.item_index;
        a.itemId = v4("itemId");
      });
    }
  }

  // All items not in the inventory or accessory bag should be inactive so they don't contribute to the total stats
  enderchest = enderchest.map((a) => Object.assign({ isInactive: true }, a));
  storage = storage.map((a) => Object.assign({ isInactive: true }, a));
  hotm = hotm.map((a) => Object.assign({ isInactive: true }, a));

  // Add candy bag contents as backpack contents to candy bag
  for (const item of allItems) {
    if (helper.getId(item) == "TRICK_OR_TREAT_BAG") {
      item.containsItems = candy_bag;
    }
  }

  const accessories = [];
  const accessoryIds = [];
  const accessoryRarities = {
    common: 0,
    uncommon: 0,
    rare: 0,
    epic: 0,
    legendary: 0,
    mythic: 0,
    special: 0,
    very_special: 0,
    hegemony: null,
    abicase: null,
  };

  // Modify accessories on armor and add
  for (const accessory of armor.filter((a) => a.categories.includes("accessory"))) {
    const id = helper.getId(accessory);

    if (id === "") {
      continue;
    }

    const insertAccessory = Object.assign({ isUnique: true, isInactive: false }, accessory);

    accessories.push(insertAccessory);
    accessoryIds.push(id);
  }

  // Add accessories from inventory and accessory bag
  for (const accessory of accessory_bag.concat(inventory.filter((a) => a.categories.includes("accessory")))) {
    const id = helper.getId(accessory);
    if (id === "") {
      continue;
    }

    const insertAccessory = Object.assign({ isUnique: true, isInactive: false }, accessory);

    // mark lower tiers as inactive
    if (constants.getUpgradeList(id) !== undefined) {
      accessories.find((a) => {
        if (constants.getUpgradeList(id).includes(helper.getId(a)) === false) {
          return;
        }

        insertAccessory.isInactive = true;
        insertAccessory.isUnique = false;
      });
    }

    // mark accessory inactive if player has two exactly same accessories
    accessories.map((a) => {
      if (helper.getId(a) === helper.getId(insertAccessory)) {
        insertAccessory.isInactive = true;
        a.isInactive = true;

        // give accessories with higher rarity priority, mark lower rarity as inactive
        if (constants.RARITIES.indexOf(a.rarity) > constants.RARITIES.indexOf(insertAccessory.rarity)) {
          a.isInactive = false;
          a.isUnique = true;
        } else if (constants.RARITIES.indexOf(insertAccessory.rarity) > constants.RARITIES.indexOf(a.rarity)) {
          insertAccessory.isInactive = false;
          insertAccessory.isUnique = true;
        }
      }
    });

    // mark accessoriy aliases as inactive
    for (const accessory of accessories) {
      const id = helper.getId(accessory);

      if (id in constants.accessoryAliases) {
        const accessoryDuplicates = constants.accessoryAliases[id];

        if (accessories.find((a) => accessoryDuplicates.includes(helper.getId(a))) != undefined) {
          accessory.isUnique = false;
          accessory.isInactive = true;
        }
      }
    }

    accessories.push(insertAccessory);
    accessoryIds.push(id);
    if (insertAccessory.isInactive === false) {
      accessoryRarities[insertAccessory.rarity]++;
      if (id == "HEGEMONY_ARTIFACT") {
        accessoryRarities.hegemony = { rarity: insertAccessory.rarity };
      }
      if (id === "ABICASE") {
        accessoryRarities.abicase = { model: insertAccessory.extra?.model };
      }
    }
  }

  // Add inactive accessories from enderchest and backpacks
  for (const item of enderchest.concat(storage)) {
    // filter out filler or empty slots (such as empty storage slot)
    if (!("categories" in item)) {
      continue;
    }

    let items = [item];

    if (!item.categories.includes("accessory") && "containsItems" in item && Array.isArray(item.containsItems)) {
      items = item.containsItems.slice(0);
    }

    for (const accessory of items.filter((a) => a.categories.includes("accessory"))) {
      const id = helper.getId(accessory);

      const insertAccessory = Object.assign({ isUnique: false, isInactive: true }, accessory);

      accessories.push(insertAccessory);
      accessoryIds.push(id);
    }
  }

  for (const accessory of accessories) {
    accessory.base_name = accessory.display_name;

    if (accessory.tag?.ExtraAttributes?.modifier != undefined) {
      accessory.base_name = accessory.display_name.split(" ").slice(1).join(" ");
      accessory.reforge = accessory.tag.ExtraAttributes.modifier;
    }

    if (accessory.tag?.ExtraAttributes?.talisman_enrichment != undefined) {
      accessory.enrichment = accessory.tag.ExtraAttributes.talisman_enrichment.toLowerCase();
    }

    if (accessory.isUnique === false || accessory.isInactive === true) {
      const source = accessory.extra?.source;
      if (source !== undefined) {
        accessory.tag.display.Lore.push("", `§7Location: §c${source}`);
      }
    }
  }

  output.accessories = accessories;
  output.accessory_ids = accessoryIds;
  output.accessory_rarities = accessoryRarities;

  output.weapons = allItems.filter((a) => a.categories?.includes("weapon"));
  output.farming_tools = allItems.filter((a) => a.categories?.includes("farming_tool"));
  output.mining_tools = allItems.filter((a) => a.categories?.includes("mining_tool"));
  output.fishing_tools = allItems.filter((a) => a.categories?.includes("fishing_tool"));

  output.pets = allItems
    .filter((a) => a.tag?.ExtraAttributes?.petInfo)
    .map((a) => ({
      uuid: a.tag.ExtraAttributes.uuid,
      type: a.tag.ExtraAttributes.petInfo.type,
      exp: a.tag.ExtraAttributes.petInfo.exp,
      active: a.tag.ExtraAttributes.petInfo.active,
      tier: a.tag.ExtraAttributes.petInfo.tier,
      heldItem: a.tag.ExtraAttributes.petInfo.heldItem || null,
      candyUsed: a.tag.ExtraAttributes.petInfo.candyUsed,
      skin: a.tag.ExtraAttributes.petInfo.skin || null,
    }));

  for (const item of allItems) {
    if (!Array.isArray(item.containsItems)) {
      continue;
    }

    output.weapons.push(...item.containsItems.filter((a) => a.categories.includes("weapon")));
    output.farming_tools.push(...item.containsItems.filter((a) => a.categories.includes("farming_tool")));
    output.mining_tools.push(...item.containsItems.filter((a) => a.categories.includes("mining_tool")));
    output.fishing_tools.push(...item.containsItems.filter((a) => a.categories.includes("fishing_tool")));

    output.pets.push(
      ...item.containsItems
        .filter((a) => a.tag?.ExtraAttributes?.petInfo)
        .map((a) => ({
          uuid: a.tag.ExtraAttributes.uuid,
          type: a.tag.ExtraAttributes.petInfo.type,
          exp: a.tag.ExtraAttributes.petInfo.exp,
          active: a.tag.ExtraAttributes.petInfo.active,
          tier: a.tag.ExtraAttributes.petInfo.tier,
          heldItem: a.tag.ExtraAttributes.petInfo.heldItem || null,
          candyUsed: a.tag.ExtraAttributes.petInfo.candyUsed,
          skin: a.tag.ExtraAttributes.petInfo.skin || null,
        }))
    );
  }

  // Check if inventory access disabled by user
  if (inventory.length == 0) {
    output.no_inventory = true;
  }

  // Same for personal vault
  if (personal_vault.length == 0) {
    output.no_personal_vault = true;
  }

  const itemSorter = (a, b) => {
    if (a.rarity !== b.rarity) {
      return constants.RARITIES.indexOf(b.rarity) - constants.RARITIES.indexOf(a.rarity);
    }

    if (b.inBackpack && !a.inBackpack) {
      return -1;
    }
    if (a.inBackpack && !b.inBackpack) {
      return 1;
    }

    return a.item_index - b.item_index;
  };

  // Sort accessories, weapons and rods by rarity
  output.weapons = output.weapons.sort(itemSorter);
  output.fishing_tools = output.fishing_tools.sort(itemSorter);
  output.farming_tools = output.farming_tools.sort(itemSorter);
  output.mining_tools = output.mining_tools.sort(itemSorter);
  output.accessories = output.accessories.sort(itemSorter);

  const countsOfId = {};

  for (const weapon of output.weapons) {
    const id = helper.getId(weapon);

    countsOfId[id] = (countsOfId[id] || 0) + 1;

    if (countsOfId[id] > 2 && constants.RARITIES.indexOf(weapon.rarity) < constants.RARITIES.indexOf("legendary")) {
      weapon.hidden = true;
    }
  }

  for (const item of output.fishing_tools) {
    const id = helper.getId(item);

    countsOfId[id] = (countsOfId[id] || 0) + 1;

    if (countsOfId[id] > 2) {
      item.hidden = true;
    }
  }

  const swords = output.weapons.filter((a) => a.categories.includes("sword"));
  const bows = output.weapons.filter((a) => a.categories.includes("bow"));

  const swordsInventory = swords.filter((a) => a.backpackIndex === undefined);
  const bowsInventory = bows.filter((a) => a.backpackIndex === undefined);
  const fishingtoolsInventory = output.fishing_tools.filter((a) => a.backpackIndex === undefined);
  const farmingtoolsInventory = output.farming_tools.filter((a) => a.backpackIndex === undefined);
  const miningtoolsInventory = output.mining_tools.filter((a) => a.backpackIndex === undefined);

  if (swords.length > 0) {
    output.highest_rarity_sword = swordsInventory
      .filter((a) => a.rarity == swordsInventory[0].rarity)
      .sort((a, b) => a.item_index - b.item_index)[0];
  }

  if (bows.length > 0) {
    output.highest_rarity_bow = bowsInventory
      .filter((a) => a.rarity == bowsInventory[0].rarity)
      .sort((a, b) => a.item_index - b.item_index)[0];
  }

  if (output.fishing_tools.length > 0) {
    output.highest_rarity_fishing_tool = fishingtoolsInventory
      .filter((a) => a.rarity == fishingtoolsInventory[0].rarity)
      .sort((a, b) => a.item_index - b.item_index)[0];
  }

  if (output.farming_tools.length > 0) {
    output.highest_rarity_farming_tool = farmingtoolsInventory
      .filter((a) => a.rarity == farmingtoolsInventory[0].rarity)
      .sort((a, b) => a.item_index - b.item_index)[0];
  }

  if (output.mining_tools.length > 0) {
    output.highest_rarity_mining_tool = miningtoolsInventory
      .filter((a) => a.rarity == miningtoolsInventory[0].rarity)
      .sort((a, b) => a.item_index - b.item_index)[0];
  }

  if (armor.filter((x) => x.rarity).length === 1) {
    const armorPiece = armor.find((x) => x.rarity);

    output.armor_set = armorPiece.display_name;
    output.armor_set_rarity = armorPiece.rarity;
  }

  if (equipment.filter((x) => x.rarity).length === 1) {
    const equipmentPiece = equipment.find((x) => x.rarity);

    output.equipment_set = equipmentPiece.display_name;
    output.equipment_set_rarity = equipmentPiece.rarity;
  }

  // Full armor set (4 pieces)
  if (armor.filter((x) => x.rarity).length === 4) {
    let output_name;
    let reforgeName;

    // Getting armor_name
    armor.forEach((armorPiece) => {
      let name = armorPiece.display_name;

      // Removing skin and stars / Whitelisting a-z and 0-9
      name = name.replace(/[^A-Za-z0-9 -']/g, "").trim();

      // Removing modifier
      if (armorPiece.tag?.ExtraAttributes?.modifier != undefined) {
        name = name.split(" ").slice(1).join(" ");
      }

      // Converting armor_name to generic name
      // Ex: Superior Dragon Helmet -> Superior Dragon Armor
      if (/^Armor .*? (Helmet|Chestplate|Leggings|Boots)$/g.test(name)) {
        // name starts with Armor and ends with piece name, remove piece name
        name = name.replaceAll(/(Helmet|Chestplate|Leggings|Boots)/g, "").trim();
      } else {
        // removing old 'Armor' and replacing the piece name with 'Armor'
        name = name.replace("Armor", "").replace("  ", " ").trim();
        name = name.replaceAll(/(Helmet|Chestplate|Leggings|Boots)/g, "Armor").trim();
      }

      armorPiece.armor_name = name;
    });

    // Getting full armor reforge (same reforge on all pieces)
    if (
      armor.filter(
        (a) =>
          a.tag?.ExtraAttributes?.modifier != undefined &&
          a.tag?.ExtraAttributes?.modifier == armor[0].tag.ExtraAttributes.modifier
      ).length == 4
    ) {
      reforgeName = armor[0].display_name
        .replace(/[^A-Za-z0-9 -']/g, "")
        .trim()
        .split(" ")[0];
    }

    // Handling normal sets of armor
    if (armor.filter((a) => a.armor_name == armor[0].armor_name).length == 4) {
      output_name = armor[0].armor_name;
    }

    // Handling special sets of armor (where pieces aren't named the same)
    constants.SPECIAL_SETS.forEach((set) => {
      if (armor.filter((a) => set.pieces.includes(helper.getId(a))).length == 4) {
        output_name = set.name;
      }
    });

    // Finalizing the output
    if (reforgeName && output_name) {
      output_name = reforgeName + " " + output_name;
    }

    output.armor_set = output_name;
    output.armor_set_rarity = constants.RARITIES[Math.max(...armor.map((a) => helper.rarityNameToInt(a.rarity)))];
  }

  // Full equipment set (4 pieces)
  for (const piece of equipment) {
    if (piece.rarity == null) delete equipment[equipment.indexOf(piece)];
  }

  if (equipment.filter((x) => x.rarity).length === 4) {
    // Getting equipment_name
    equipment.forEach((equipmentPiece) => {
      let name = equipmentPiece.display_name;

      // Removing skin and stars / Whitelisting a-z and 0-9
      name = name.replace(/[^A-Za-z0-9 -']/g, "").trim();

      // Removing modifier
      if (equipmentPiece.tag?.ExtraAttributes?.modifier != undefined) {
        name = name.split(" ").slice(1).join(" ");
      }

      equipmentPiece.equipment_name = name;
    });

    output.equipment_set_rarity =
      constants.RARITIES[Math.max(...equipment.map((a) => helper.rarityNameToInt(a.rarity)))];
  }

  // console.debug(`${options.debugId}: getItems returned. (${Date.now() - timeStarted}ms)`);
  return output;
};

async function getLevels(userProfile, hypixelProfile, levelCaps, profileMembers) {
  const output = {};

  let skillLevels;
  let totalSkillXp = 0;
  let average_level = 0;

  // Apply skill bonuses
  if (
    "experience_skill_taming" in userProfile ||
    "experience_skill_farming" in userProfile ||
    "experience_skill_mining" in userProfile ||
    "experience_skill_combat" in userProfile ||
    "experience_skill_foraging" in userProfile ||
    "experience_skill_fishing" in userProfile ||
    "experience_skill_enchanting" in userProfile ||
    "experience_skill_alchemy" in userProfile ||
    "experience_skill_carpentry" in userProfile ||
    "experience_skill_runecrafting" in userProfile ||
    "experience_skill_social2" in userProfile
  ) {
    let average_level_no_progress = 0;

    skillLevels = {
      taming: getLevelByXp(userProfile.experience_skill_taming, { skill: "taming" }),
      farming: getLevelByXp(userProfile.experience_skill_farming, {
        skill: "farming",
        cap: levelCaps?.farming,
      }),
      mining: getLevelByXp(userProfile.experience_skill_mining, { skill: "mining" }),
      combat: getLevelByXp(userProfile.experience_skill_combat, { skill: "combat" }),
      foraging: getLevelByXp(userProfile.experience_skill_foraging, { skill: "foraging" }),
      fishing: getLevelByXp(userProfile.experience_skill_fishing, { skill: "fishing" }),
      enchanting: getLevelByXp(userProfile.experience_skill_enchanting, { skill: "enchanting" }),
      alchemy: getLevelByXp(userProfile.experience_skill_alchemy, { skill: "alchemy" }),
      carpentry: getLevelByXp(userProfile.experience_skill_carpentry, { skill: "carpentry" }),
      runecrafting: getLevelByXp(userProfile.experience_skill_runecrafting, {
        skill: "runecrafting",
        type: "runecrafting",
        cap:
          hypixelProfile.rankText === null
            ? constants.NON_RUNECRAFTING_LEVEL_CAP
            : constants.DEFAULT_SKILL_CAPS.runecrafting,
      }),
      social:
        Object.keys(profileMembers || {}).length > 0
          ? getLevelByXp(
              Object.keys(profileMembers)
                .map((member) => profileMembers[member].experience_skill_social2 || 0)
                .reduce((a, b) => a + b, 0),
              { skill: "social", type: "social" }
            )
          : getLevelByXp(userProfile.experience_skill_social2, {
              skill: "social",
              type: "social",
            }),
    };

    for (const skill in skillLevels) {
      if (!constants.COSMETIC_SKILLS.includes(skill)) {
        average_level += skillLevels[skill].level + skillLevels[skill].progress;
        average_level_no_progress += skillLevels[skill].level;

        totalSkillXp += skillLevels[skill].xp;
      }
    }

    output.average_level =
      average_level / (Object.keys(skillLevels).length - Object.keys(constants.COSMETIC_SKILLS).length);
    output.average_level_no_progress =
      average_level_no_progress / (Object.keys(skillLevels).length - Object.keys(constants.COSMETIC_SKILLS).length);
    output.total_skill_xp = totalSkillXp;

    output.levels = Object.assign({}, skillLevels);
  } else {
    skillLevels = {
      farming: hypixelProfile.achievements.skyblock_harvester || 0,
      mining: hypixelProfile.achievements.skyblock_excavator || 0,
      combat: hypixelProfile.achievements.skyblock_combat || 0,
      foraging: hypixelProfile.achievements.skyblock_gatherer || 0,
      fishing: hypixelProfile.achievements.skyblock_angler || 0,
      enchanting: hypixelProfile.achievements.skyblock_augmentation || 0,
      alchemy: hypixelProfile.achievements.skyblock_concoctor || 0,
      taming: hypixelProfile.achievements.skyblock_domesticator || 0,
      carpentry: 0,
    };

    output.levels = {};

    let skillsAmount = 0;

    for (const skill in skillLevels) {
      output.levels[skill] = getXpByLevel(skillLevels[skill], { skill: skill });

      if (skillLevels[skill] < 0) {
        continue;
      }

      skillsAmount++;
      average_level += output.levels[skill].level;

      totalSkillXp += output.levels[skill].xp;
    }

    output.average_level = average_level / skillsAmount;
    output.average_level_no_progress = output.average_level;
    output.total_skill_xp = totalSkillXp;
  }

  const skillNames = Object.keys(output.levels);

  for (const skill of skillNames) {
    output.levels[skill].rank = await getLeaderboardPosition(`skill_${skill}_xp`, output.levels[skill].xp);
  }

  output.average_level_rank = await redisClient.zcount([`lb_average_level`, output.average_level, "+inf"]);

  return output;
}

export async function getStats(
  db,
  profile,
  bingoProfile,
  allProfiles,
  items,
  options = { cacheOnly: false, debugId: `${helper.getClusterId()}/unknown@getStats` }
) {
  const output = {};

  // console.debug(`${options.debugId}: getStats called.`);
  // const timeStarted = Date.now();

  const userProfile = profile.members[profile.uuid];
  const hypixelProfile = await helper.getRank(profile.uuid, db, options.cacheOnly);

  output.stats = Object.assign({}, constants.BASE_STATS);

  // fairy souls
  if (isNaN(userProfile.fairy_souls_collected)) {
    userProfile.fairy_souls_collected = 0;
  }

  const totalSouls =
    profile.game_mode === "island" ? constants.FAIRY_SOULS.max.stranded : constants.FAIRY_SOULS.max.normal;

  output.fairy_souls = {
    collected: userProfile.fairy_souls_collected,
    total: totalSouls,
    progress: userProfile.fairy_souls_collected / totalSouls,
  };
  output.fairy_exchanges = userProfile.fairy_exchanges;

  // levels
  const levelCaps = {
    farming: constants.DEFAULT_SKILL_CAPS.farming + (userProfile.jacob2?.perks?.farming_level_cap || 0),
  };

  const { levels, average_level, average_level_no_progress, total_skill_xp, average_level_rank } = await getLevels(
    userProfile,
    hypixelProfile,
    levelCaps,
    profile.members
  );

  output.levels = levels;
  output.average_level = average_level;
  output.average_level_no_progress = average_level_no_progress;
  output.total_skill_xp = total_skill_xp;
  output.average_level_rank = average_level_rank;
  output.level_caps = levelCaps;

  output.slayer_coins_spent = {};

  // Apply slayer bonuses
  if ("slayer_bosses" in userProfile) {
    const slayers = {};

    if ("slayer_bosses" in userProfile) {
      for (const slayerName in userProfile.slayer_bosses) {
        const slayer = userProfile.slayer_bosses[slayerName];

        if (!("claimed_levels" in slayer)) {
          continue;
        }

        slayers[slayerName] = {
          level: getSlayerLevel(slayer, slayerName),
          kills: {},
        };

        for (const property in slayer) {
          slayers[slayerName][property] = slayer[property];

          if (property.startsWith("boss_kills_tier_")) {
            const tier = parseInt(property.replace("boss_kills_tier_", "")) + 1;

            slayers[slayerName].kills[tier] = slayer[property];

            output.slayer_coins_spent[slayerName] =
              (output.slayer_coins_spent[slayerName] || 0) + slayer[property] * constants.SLAYER_COST[tier];
          }
        }
      }

      for (const slayerName in output.slayer_coins_spent) {
        output.slayer_coins_spent.total =
          (output.slayer_coins_spent.total || 0) + output.slayer_coins_spent[slayerName];
      }

      output.slayer_coins_spent.total = output.slayer_coins_spent.total || 0;
    }

    output.slayer_xp = 0;

    for (const slayer in slayers) {
      if (slayers[slayer]?.level?.currentLevel == undefined) {
        continue;
      }

      output.slayer_xp += slayers[slayer].xp || 0;
    }

    output.slayers = Object.assign({}, slayers);
  }

  if (!items.no_inventory && items.accessory_ids) {
    output.missingAccessories = getMissingAccessories(items.accessory_ids);

    for (const key of Object.keys(output.missingAccessories)) {
      for (const item of output.missingAccessories[key]) {
        const ITEM_PRICE = await helper.getItemPrice(item.name);
        item.extra ??= {};
        item.extra.price = ITEM_PRICE;

        if (ITEM_PRICE === 0) continue;

        item.tag ??= {};
        item.tag.display ??= {};
        item.tag.display.Lore ??= [];
        item.tag.display.Lore.push(
          `§7Price: §6${Math.round(ITEM_PRICE).toLocaleString()} Coins §7(§6${helper.formatNumber(
            ITEM_PRICE / helper.getMagicalPower(item.rarity, item.name)
          )} §7per MP)`
        );
      }
    }

    for (const key of Object.keys(output.missingAccessories)) {
      output.missingAccessories[key].sort((a, b) => {
        const aPrice = a.extra?.price || 0;
        const bPrice = b.extra?.price || 0;

        if (aPrice === 0) return 1;
        if (bPrice === 0) return -1;

        return aPrice - bPrice;
      });
    }
  }

  output.base_stats = Object.assign({}, output.stats);

  output.weapon_stats = {};

  let killsDeaths = [];

  for (const stat in userProfile.stats) {
    if (stat.startsWith("kills_") && userProfile.stats[stat] > 0) {
      killsDeaths.push({ type: "kills", entityId: stat.replace("kills_", ""), amount: userProfile.stats[stat] });
    }

    if (stat.startsWith("deaths_") && userProfile.stats[stat] > 0) {
      killsDeaths.push({ type: "deaths", entityId: stat.replace("deaths_", ""), amount: userProfile.stats[stat] });
    }
  }

  for (const stat of killsDeaths) {
    const { entityId } = stat;

    if (entityId in constants.MOB_NAMES) {
      stat.entityName = constants.MOB_NAMES[entityId];
      continue;
    }

    let entityName = "";

    entityId.split("_").forEach((split, index) => {
      entityName += split.charAt(0).toUpperCase() + split.slice(1);

      if (index < entityId.split("_").length - 1) {
        entityName += " ";
      }
    });

    stat.entityName = entityName;
  }

  if ("kills_guardian_emperor" in userProfile.stats || "kills_skeleton_emperor" in userProfile.stats) {
    killsDeaths.push({
      type: "kills",
      entityId: "sea_emperor",
      entityName: "Sea Emperor",
      amount: (userProfile.stats["kills_guardian_emperor"] || 0) + (userProfile.stats["kills_skeleton_emperor"] || 0),
    });
  }

  if ("kills_chicken_deep" in userProfile.stats || "kills_zombie_deep" in userProfile.stats) {
    killsDeaths.push({
      type: "kills",
      entityId: "monster_of_the_deep",
      entityName: "Monster of the Deep",
      amount: (userProfile.stats["kills_chicken_deep"] || 0) + (userProfile.stats["kills_zombie_deep"] || 0),
    });
  }

  const random = Math.random() < 0.01;

  killsDeaths = killsDeaths.filter((a) => {
    return !["guardian_emperor", "skeleton_emperor", "chicken_deep", "zombie_deep", random ? "yeti" : null].includes(
      a.entityId
    );
  });

  if ("kills_yeti" in userProfile.stats && random) {
    killsDeaths.push({
      type: "kills",
      entityId: "yeti",
      entityName: "Snow Monke",
      amount: userProfile.stats["kills_yeti"] || 0,
    });
  }

  if ("deaths_yeti" in userProfile.stats) {
    killsDeaths.push({
      type: "deaths",
      entityId: "yeti",
      entityName: "Snow Monke",
      amount: userProfile.stats["deaths_yeti"] || 0,
    });
  }

  output.kills = killsDeaths.filter((a) => a.type == "kills").sort((a, b) => b.amount - a.amount);
  output.deaths = killsDeaths.filter((a) => a.type == "deaths").sort((a, b) => b.amount - a.amount);

  const playerObject = await helper.resolveUsernameOrUuid(profile.uuid, db, options.cacheOnly);

  output.display_name = playerObject.display_name;

  if ("wardrobe_equipped_slot" in userProfile) {
    output.wardrobe_equipped_slot = userProfile.wardrobe_equipped_slot;
  }

  const userInfo = await db.collection("usernames").findOne({ uuid: profile.uuid });

  const memberUuids = [];
  for (const [uuid, memberProfile] of Object.entries(profile?.members ?? {})) {
    if (memberProfile?.coop_invitation?.confirmed === false || memberProfile.deletion_notice?.timestamp !== undefined) {
      memberProfile.removed = true;
    }

    memberUuids.push(uuid);
  }

  const members = await Promise.all(
    memberUuids.map(async (a) => {
      return {
        ...(await helper.resolveUsernameOrUuid(a, db, options.cacheOnly)),
        removed: profile.members[a]?.removed || false,
      };
    })
  );

  if (userInfo) {
    output.display_name = userInfo.username;

    members.push({
      uuid: profile.uuid,
      display_name: userInfo.username,
      removed: profile.members[profile.uuid]?.removed || false,
    });

    if ("emoji" in userInfo) {
      output.display_emoji = userInfo.emoji;
    }

    if ("emojiImg" in userInfo) {
      output.display_emoji_img = userInfo.emojiImg;
    }

    if (userInfo.username == "jjww2") {
      output.display_emoji = constants.randomEmoji();
    }
  }

  if (profile.banking?.balance != undefined) {
    output.bank = profile.banking.balance;
  }

  output.guild = await helper.getGuild(profile.uuid, db, options.cacheOnly);

  output.rank_prefix = helper.renderRank(hypixelProfile);
  output.purse = userProfile.coin_purse || 0;
  output.uuid = profile.uuid;
  output.skin_data = playerObject.skin_data;

  output.profile = { profile_id: profile.profile_id, cute_name: profile.cute_name, game_mode: profile.game_mode };
  output.profiles = {};

  for (const sbProfile of allProfiles.filter((a) => a.profile_id != profile.profile_id)) {
    output.profiles[sbProfile.profile_id] = {
      profile_id: sbProfile.profile_id,
      cute_name: sbProfile.cute_name,
      game_mode: sbProfile.game_mode,
    };
  }

  output.members = members.filter((a) => a.uuid != profile.uuid);
  output.minions = getMinions(profile.members);
  output.minion_slots = getMinionSlots(output.minions);
  output.collections = await getCollections(profile.uuid, profile, options.cacheOnly);
  output.bestiary = stats.getBestiary(userProfile);

  output.social = hypixelProfile.socials;

  output.dungeons = await getDungeons(userProfile, hypixelProfile);

  output.essence = getEssence(userProfile, hypixelProfile);

  output.fishing = {
    total: userProfile.stats.items_fished || 0,
    treasure: userProfile.stats.items_fished_treasure || 0,
    treasure_large: userProfile.stats.items_fished_large_treasure || 0,
    shredder_fished: userProfile.stats.shredder_fished || 0,
    shredder_bait: userProfile.stats.shredder_bait || 0,
  };

  //
  //  FARMING
  //

  const farming = {
    talked: userProfile.jacob2?.talked || false,
    pelts: userProfile.trapper_quest?.pelt_count || 0,
  };

  if (farming.talked) {
    // Your current badges
    farming.current_badges = {
      bronze: userProfile.jacob2.medals_inv.bronze || 0,
      silver: userProfile.jacob2.medals_inv.silver || 0,
      gold: userProfile.jacob2.medals_inv.gold || 0,
    };

    // Your total badges
    farming.total_badges = {
      bronze: 0,
      silver: 0,
      gold: 0,
    };

    // Your current perks
    farming.perks = {
      double_drops: userProfile.jacob2.perks?.double_drops || 0,
      farming_level_cap: userProfile.jacob2.perks?.farming_level_cap || 0,
    };

    // Your amount of unique golds
    farming.unique_golds = userProfile.jacob2.unique_golds2?.length || 0;

    // Things about individual crops
    farming.crops = {};

    for (const crop in constants.FARMING_CROPS) {
      farming.crops[crop] = constants.FARMING_CROPS[crop];

      Object.assign(farming.crops[crop], {
        attended: false,
        unique_gold: userProfile.jacob2.unique_golds2?.includes(crop) || false,
        contests: 0,
        personal_best: 0,
        badges: {
          gold: 0,
          silver: 0,
          bronze: 0,
        },
      });
    }

    // Template for contests
    const contests = {
      attended_contests: 0,
      all_contests: [],
    };

    for (const contestId in userProfile.jacob2.contests) {
      const data = userProfile.jacob2.contests[contestId];

      const contestName = contestId.split(":");
      const date = `${contestName[1]}_${contestName[0]}`;
      const crop = contestName.slice(2).join(":");

      if (data.collected < 100) {
        continue; // Contests aren't counted in game with less than 100 collection
      }

      farming.crops[crop].contests++;
      farming.crops[crop].attended = true;
      if (farming.crops[crop].personal_best < data.collected) {
        farming.crops[crop].personal_best = data.collected;
      }

      const contest = {
        date: date,
        crop: crop,
        collected: data.collected,
        claimed: data.claimed_rewards || false,
        medal: null,
      };

      const placing = {};

      if (contest.claimed) {
        placing.position = data.claimed_position || 0;
        placing.percentage = (data.claimed_position / data.claimed_participants) * 100;
        const participants = data.claimed_participants;

        // Use the claimed medal if it exists and is valid
        // This accounts for the farming mayor increased brackets perk
        // Note: The medal brackets are the percentage + 1 extra person
        if (
          contest.claimed_medal === "bronze" ||
          contest.claimed_medal === "silver" ||
          contest.claimed_medal === "gold"
        ) {
          contest.medal = contest.claimed_medal;
        } else if (placing.position <= participants * 0.05 + 1) {
          contest.medal = "gold";
        } else if (placing.position <= participants * 0.25 + 1) {
          contest.medal = "silver";
        } else if (placing.position <= participants * 0.6 + 1) {
          contest.medal = "bronze";
        }

        // Count the medal if it exists
        if (contest.medal) {
          farming.total_badges[contest.medal]++;
          farming.crops[crop].badges[contest.medal]++;
        }
      }

      contest.placing = placing;

      contests.attended_contests++;
      contests.all_contests.push(contest);
    }

    farming.contests = contests;
  }

  output.farming = farming;

  //
  //  ENCHANTING
  //

  // simon = Chronomatron
  // numbers = Ultrasequencer
  // pairings = Superpairs

  const enchanting = {
    experimented:
      (userProfile.experimentation != null && Object.keys(userProfile.experimentation).length >= 1) || false,
    experiments: {},
  };

  if (enchanting.experimented) {
    const enchantingData = userProfile.experimentation;

    for (const game in constants.EXPERIMENTS.games) {
      if (enchantingData[game] == null) continue;
      if (!Object.keys(enchantingData[game]).length >= 1) {
        continue;
      }

      const gameData = enchantingData[game];
      const gameConstants = constants.EXPERIMENTS.games[game];

      const gameOutput = {
        name: gameConstants.name,
        stats: {},
        tiers: {},
      };

      for (const key in gameData) {
        if (key.startsWith("attempts") || key.startsWith("claims") || key.startsWith("best_score")) {
          let statKey = key.split("_");
          let tierValue = parseInt(statKey.pop());
          tierValue =
            game === "numbers" ? tierValue + 2 : game === "simon" ? (tierValue === 5 ? 5 : tierValue + 1) : tierValue;

          statKey = statKey.join("_");
          const tierInfo = _.cloneDeep(constants.EXPERIMENTS.tiers[tierValue]);

          if (!gameOutput.tiers[tierValue]) {
            gameOutput.tiers[tierValue] = tierInfo;
          }

          Object.assign(gameOutput.tiers[tierValue], {
            [statKey]: gameData[key],
          });
          continue;
        }

        if (key == "last_attempt" || key == "last_claimed") {
          if (gameData[key] <= 0) continue;
          const lastTime = {
            unix: gameData[key],
            text: moment(gameData[key]).fromNow(),
          };

          gameOutput.stats[key] = lastTime;
          continue;
        }

        gameOutput.stats[key] = gameData[key];
      }

      enchanting.experiments[game] = gameOutput;
    }

    if (!Object.keys(enchanting.experiments).length >= 1) {
      enchanting.experimented = false;
    }
  }

  output.enchanting = enchanting;

  // MINING

  const mining = {
    commissions: {
      milestone: 0,
      completions: hypixelProfile?.achievements?.skyblock_hard_working_miner || 0,
    },
  };

  if (userProfile?.tutorial) {
    for (const key of userProfile.tutorial) {
      if (key.startsWith("commission_milestone_reward_mining_xp_tier_")) {
        const milestoneTier = key.slice(43);
        if (mining.commissions.milestone < milestoneTier) mining.commissions.milestone = milestoneTier;
      }
    }
  }

  mining.forge = await getForge(userProfile);
  mining.core = getMiningCoreData(userProfile);

  output.mining = mining;

  // CRIMSON ISLES

  const crimsonIsles = {
    kuudra_completed_tiers: {},
    dojo: {},
    factions: {},
    total_dojo_points: 0,
  };

  crimsonIsles.factions.selected_faction = userProfile.nether_island_player_data?.selected_faction ?? "None";
  crimsonIsles.factions.mages_reputation = userProfile.nether_island_player_data?.mages_reputation ?? 0;
  crimsonIsles.factions.barbarians_reputation = userProfile.nether_island_player_data?.barbarians_reputation ?? 0;

  Object.keys(constants.KUUDRA_TIERS).forEach((key) => {
    crimsonIsles.kuudra_completed_tiers[key] = {
      name: constants.KUUDRA_TIERS[key].name,
      head: constants.KUUDRA_TIERS[key].head,
      completions: userProfile.nether_island_player_data?.kuudra_completed_tiers[key] ?? 0,
    };
  });

  Object.keys(constants.DOJO).forEach((key) => {
    key = key.replaceAll("dojo_points_", "").replaceAll("dojo_time_", "");
    crimsonIsles.total_dojo_points += userProfile.nether_island_player_data?.dojo[`dojo_points_${key}`] ?? 0;
    crimsonIsles.dojo[key.toUpperCase()] = {
      name: constants.DOJO[key].name,
      id: constants.DOJO[key].itemId,
      damage: constants.DOJO[key].damage,
      points: userProfile.nether_island_player_data?.dojo[`dojo_points_${key}`] ?? 0,
      time: userProfile.nether_island_player_data?.dojo[`dojo_time_${key}`] ?? 0,
    };
  });

  output.crimsonIsles = crimsonIsles;

  output.trophy_fish = getTrophyFish(userProfile);

  output.abiphone = {
    contacts: userProfile.nether_island_player_data?.abiphone?.contact_data ?? {},
    active: userProfile.nether_island_player_data?.abiphone?.active_contacts?.length || 0,
  };

  output.skyblock_level = {
    xp: userProfile.leveling?.experience || 0,
    level: Math.floor(userProfile.leveling?.experience / 100 || 0),
    maxLevel: 416,
    progress: (userProfile.leveling?.experience % 100) / 100 || 0,
    xpCurrent: userProfile.leveling?.experience % 100 || 0,
    xpForNext: 100,
    rank: await getLeaderboardPosition("skyblock_level_xp", userProfile.leveling?.experience || 0),
  };

  // MISC

  const misc = {};

  output.visited_zones = userProfile.visited_zones || [];
  output.visited_modes = userProfile.visited_modes || [];
  output.perks = userProfile.perks || {};
  misc.milestones = {};
  misc.objectives = {};
  misc.races = {};
  misc.gifts = {};
  misc.winter = {};
  misc.dragons = {};
  misc.protector = {};
  misc.damage = {};
  misc.burrows = {};
  misc.profile_upgrades = {};
  misc.auctions_sell = {};
  misc.auctions_buy = {};
  misc.claimed_items = {};
  misc.effects = {
    active: userProfile.active_effects || [],
    paused: userProfile.paused_effects || [],
    disabled: userProfile.disabled_potion_effects || [],
  };

  if ("ender_crystals_destroyed" in userProfile.stats) {
    misc.dragons["ender_crystals_destroyed"] = userProfile.stats["ender_crystals_destroyed"];
  }

  misc.dragons["last_hits"] = 0;
  misc.dragons["deaths"] = 0;

  if (hypixelProfile.claimed_items) {
    misc.claimed_items = hypixelProfile.claimed_items;
  }

  const burrows = [
    "mythos_burrows_dug_next",
    "mythos_burrows_dug_combat",
    "mythos_burrows_dug_treasure",
    "mythos_burrows_chains_complete",
  ];

  const dug_next = {};
  const dug_combat = {};
  const dug_treasure = {};
  const chains_complete = {};

  for (const key of burrows) {
    if (key in userProfile.stats) {
      misc.burrows[key.replace("mythos_burrows_", "")] = { total: userProfile.stats[key] };
    }
  }

  misc.profile_upgrades = getProfileUpgrades(profile);

  const auctions_buy = ["auctions_bids", "auctions_highest_bid", "auctions_won", "auctions_gold_spent"];
  const auctions_sell = ["auctions_fees", "auctions_gold_earned"];

  const auctions_bought = {};
  const auctions_sold = {};

  for (const key of auctions_sell) {
    if (key in userProfile.stats) {
      misc.auctions_sell[key.replace("auctions_", "")] = userProfile.stats[key];
    }
  }

  for (const key of auctions_buy) {
    if (key in userProfile.stats) {
      misc.auctions_buy[key.replace("auctions_", "")] = userProfile.stats[key];
    }
  }

  misc.objectives.completedRaces = [];

  for (const key in userProfile.objectives) {
    if (key.includes("complete_the_")) {
      const isCompleted = userProfile.objectives[key].status == "COMPLETE";
      const tierNumber = parseInt("" + key.charAt(key.length - 1)) ?? 0;
      const raceName = constants.RACE_OBJECTIVE_TO_STAT_NAME[key.substring(0, key.length - 2)];

      if (tierNumber == 1 && !isCompleted) {
        misc.objectives.completedRaces[raceName] = 0;
      } else if (isCompleted && tierNumber > (misc.objectives.completedRaces[raceName] ?? 0)) {
        misc.objectives.completedRaces[raceName] = tierNumber;
      }
    }
  }

  for (const key in userProfile.stats) {
    if (key.includes("_best_time")) {
      misc.races[key] = userProfile.stats[key];
    } else if (key.includes("gifts_")) {
      misc.gifts[key] = userProfile.stats[key];
    } else if (key.includes("most_winter")) {
      misc.winter[key] = userProfile.stats[key];
    } else if (key.includes("highest_critical_damage")) {
      misc.damage[key] = userProfile.stats[key];
    } else if (key.includes("auctions_sold_")) {
      auctions_sold[key.replace("auctions_sold_", "")] = userProfile.stats[key];
    } else if (key.includes("auctions_bought_")) {
      auctions_bought[key.replace("auctions_bought_", "")] = userProfile.stats[key];
    } else if (key.startsWith("kills_") && key.endsWith("_dragon") && key !== "kills_master_wither_king_dragon") {
      misc.dragons["last_hits"] += userProfile.stats[key];
    } else if (key.startsWith("deaths_") && key.endsWith("_dragon") && key !== "deaths_master_wither_king_dragon") {
      misc.dragons["deaths"] += userProfile.stats[key];
    } else if (key.includes("kills_corrupted_protector")) {
      misc.protector["last_hits"] = userProfile.stats[key];
    } else if (key.includes("deaths_corrupted_protector")) {
      misc.protector["deaths"] = userProfile.stats[key];
    } else if (key.startsWith("pet_milestone_")) {
      misc.milestones[key.replace("pet_milestone_", "")] = userProfile.stats[key];
    } else if (key.startsWith("mythos_burrows_dug_next_")) {
      dug_next[key.replace("mythos_burrows_dug_next_", "").toLowerCase()] = userProfile.stats[key];
    } else if (key.startsWith("mythos_burrows_dug_combat_")) {
      dug_combat[key.replace("mythos_burrows_dug_combat_", "").toLowerCase()] = userProfile.stats[key];
    } else if (key.startsWith("mythos_burrows_dug_treasure_")) {
      dug_treasure[key.replace("mythos_burrows_dug_treasure_", "").toLowerCase()] = userProfile.stats[key];
    } else if (key.startsWith("mythos_burrows_chains_complete_")) {
      chains_complete[key.replace("mythos_burrows_chains_complete_", "").toLowerCase()] = userProfile.stats[key];
    }
  }

  for (const key in misc.dragons) {
    if (misc.dragons[key] == 0) {
      delete misc.dragons[key];
    }
  }

  for (const key in misc) {
    if (Object.keys(misc[key]).length == 0) {
      delete misc[key];
    }
  }

  for (const key in dug_next) {
    misc.burrows.dug_next[key] = dug_next[key];
  }

  for (const key in dug_combat) {
    misc.burrows.dug_combat[key] = dug_combat[key];
  }

  for (const key in dug_treasure) {
    misc.burrows.dug_treasure[key] = dug_treasure[key];
  }

  for (const key in chains_complete) {
    misc.burrows.chains_complete[key] = chains_complete[key];
  }

  for (const key in auctions_bought) {
    misc.auctions_buy["items_bought"] = (misc.auctions_buy["items_bought"] || 0) + auctions_bought[key];
  }

  for (const key in auctions_sold) {
    misc.auctions_sell["items_sold"] = (misc.auctions_sell["items_sold"] || 0) + auctions_sold[key];
  }

  misc.uncategorized = {};

  if ("soulflow" in userProfile) {
    misc.uncategorized.soulflow = {
      raw: userProfile.soulflow,
      formatted: helper.formatNumber(userProfile.soulflow),
    };
  }

  if ("fastest_target_practice" in userProfile) {
    misc.uncategorized.fastest_target_practice = {
      raw: userProfile.fastest_target_practice,
      formatted: `${helper.formatNumber(userProfile.fastest_target_practice)}s`,
    };
  }

  if ("favorite_arrow" in userProfile) {
    misc.uncategorized.favorite_arrow = {
      raw: userProfile.favorite_arrow,
      formatted: `${userProfile.favorite_arrow
        .split("_")
        .map((word) => helper.capitalizeFirstLetter(word.toLowerCase()))
        .join(" ")}`,
    };
  }

  if ("teleporter_pill_consumed" in userProfile) {
    misc.uncategorized.teleporter_pill_consumed = {
      raw: userProfile.teleporter_pill_consumed,
      formatted: userProfile.teleporter_pill_consumed ? "Yes" : "No",
    };
  }

  if ("reaper_peppers_eaten" in userProfile) {
    misc.uncategorized.reaper_peppers_eaten = {
      raw: userProfile.reaper_peppers_eaten,
      formatted: helper.formatNumber(userProfile.reaper_peppers_eaten),
      maxed: userProfile.reaper_peppers_eaten === constants.MAX_REAPER_PEPPERS_EATEN,
    };
  }

  if ("personal_bank_upgrade" in userProfile) {
    misc.uncategorized.bank_cooldown = {
      raw: userProfile.personal_bank_upgrade,
      formatted: constants.BANK_COOLDOWN[userProfile.personal_bank_upgrade] ?? "Unknown",
      maxed: userProfile.personal_bank_upgrade === Object.keys(constants.BANK_COOLDOWN).length,
    };
  }

  if (bingoProfile?.events !== undefined) {
    output.bingo = {
      total: bingoProfile.events.length,
      points: bingoProfile.events.reduce((a, b) => a + b.points, 0),
      completed_goals: bingoProfile.events.reduce((a, b) => a + b.completed_goals.length, 0),
    };
  }

  output.misc = misc;
  output.auctions_bought = auctions_bought;
  output.auctions_sold = auctions_sold;

  const firstJoin = userProfile.first_join;

  const firstJoinText = moment(firstJoin).fromNow();

  if ("current_area" in userProfile) {
    output.current_area = userProfile.current_area;
  }

  if ("current_area_updated" in userProfile) {
    output.current_area_updated = userProfile.current_area_updated;
  }

  output.first_join = {
    unix: firstJoin,
    text: firstJoinText,
  };

  /*

    WEIGHT

  */

  output.weight = {
    senither: calculateSenitherWeight(output),
    lily: calculateLilyWeight(output),
    farming: calculateFarmingWeight(output),
  };

  /*

    NETWORTH

  */

  output.networth = await getPreDecodedNetworth(
    userProfile,
    {
      armor: items.armor,
      equipment: items.equipment,
      wardrobe: items.wardrobe_inventory,
      inventory: items.inventory,
      enderchest: items.enderchest,
      accessories: items.accessory_bag,
      personal_vault: items.personal_vault,
      storage: items.storage.concat(items.storage.map((item) => item.containsItems).flat()),
      fishing_bag: items.fishing_bag,
      potion_bag: items.potion_bag,
      candy_inventory: items.candy_bag,
    },
    output.bank,
    { cache: true, onlyNetworth: true }
  );

  /*
    century cake effects

  */
  const centuryCakes = [];

  if (userProfile.temp_stat_buffs) {
    for (const cake of userProfile.temp_stat_buffs) {
      if (!cake.key.startsWith("cake_")) continue;
      let stat = cake.key.replace("cake_", "");
      if (Object.keys(constants.STAT_MAPPINGS).includes(stat)) {
        stat = constants.STAT_MAPPINGS[stat];
      }
      centuryCakes.push({
        stat: stat == "walk_speed" ? "speed" : stat,
        amount: cake.amount,
      });
    }
  }

  output.century_cakes = centuryCakes;

  output.reaper_peppers_eaten = userProfile.reaper_peppers_eaten ?? 0;

  output.objectives = userProfile.objectives ?? 0;

  output.rift = getRift(userProfile);

  if (!userProfile.pets) {
    userProfile.pets = [];
  }
  userProfile.pets.push(...items.pets);

  if (userProfile.rift?.dead_cats?.montezuma !== undefined) {
    userProfile.pets.push(userProfile.rift.dead_cats.montezuma);
    userProfile.pets.at(-1).active = false;
  }

  for (const pet of userProfile.pets) {
    await getItemNetworth(pet, { cache: true, returnItemData: false });
  }

  output.pets = await getPets(userProfile, output);
  output.missingPets = await getMissingPets(output.pets, profile.game_mode, output);
  output.petScore = getPetScore(output.pets);

  const petScoreRequired = Object.keys(constants.PET_REWARDS).sort((a, b) => parseInt(b) - parseInt(a));

  output.pet_bonus = {};

  for (const score of petScoreRequired) {
    if (parseInt(score) > output.petScore) {
      continue;
    }

    output.pet_score_bonus = Object.assign({}, constants.PET_REWARDS[score]);

    break;
  }

  for (const pet of output.pets) {
    if (pet.price > 0) {
      pet.lore += "<br>";
      pet.lore += helper.renderLore(
        `§7Item Value: §6${Math.round(pet.price).toLocaleString()} Coins §7(§6${helper.formatNumber(pet.price)}§7)`
      );
    }

    if (!pet.active) {
      continue;
    }

    for (const stat in pet.stats) {
      output.pet_bonus[stat] = (output.pet_bonus[stat] || 0) + pet.stats[stat];
    }
  }

  // Apply pet score bonus
  for (const stat in output.pet_score_bonus) {
    output.stats[stat] += output.pet_score_bonus[stat];
  }

  // console.debug(`${options.debugId}: getStats returned. (${Date.now() - timeStarted}ms)`);
  return output;
}

export async function getPets(profile, calculated) {
  let output = [];

  if (!("pets" in profile)) {
    return output;
  }

  // debug pets
  // profile.pets = helper.generateDebugPets("MITHRIL_GOLEM");

  for (const pet of profile.pets) {
    if (!("tier" in pet)) {
      continue;
    }

    const petData = constants.PET_DATA[pet.type] ?? {
      head: "/head/bc8ea1f51f253ff5142ca11ae45193a4ad8c3ab5e9c6eec8ba7a4fcb7bac40",
      type: "???",
      maxTier: "legendary",
      maxLevel: 100,
      emoji: "❓",
    };

    petData.typeGroup = petData.typeGroup ?? pet.type;

    pet.rarity = pet.tier.toLowerCase();
    pet.stats = {};
    pet.ignoresTierBoost = petData.ignoresTierBoost;
    /** @type {string[]} */
    const lore = [];

    // Rarity upgrades
    if (pet.heldItem == "PET_ITEM_TIER_BOOST" && !pet.ignoresTierBoost) {
      pet.rarity =
        constants.RARITIES[
          Math.min(constants.RARITIES.indexOf(petData.maxTier), constants.RARITIES.indexOf(pet.rarity) + 1)
        ];
    }
    if (pet.heldItem == "PET_ITEM_VAMPIRE_FANG" || pet.heldItem == "PET_ITEM_TOY_JERRY") {
      if (constants.RARITIES.indexOf(pet.rarity) === constants.RARITIES.indexOf(petData.maxTier) - 1) {
        pet.rarity = petData.maxTier;
      }
    }

    pet.level = getPetLevel(pet.exp, petData.customLevelExpRarityOffset ?? pet.rarity, petData.maxLevel);

    // Get texture
    if (typeof petData.head === "object") {
      pet.texture_path = petData.head[pet.rarity] ?? petData.head.default;
    } else {
      pet.texture_path = petData.head;
    }

    if (petData.hatching?.level > pet.level.level) {
      pet.texture_path = petData.hatching.head;
    }

    // eslint-disable-next-line no-prototype-builtins
    if (pet.rarity in (petData?.upgrades || {})) {
      pet.texture_path = petData.upgrades[pet.rarity]?.head || pet.texture_path;
    }

    let petSkin = null;
    if (pet.skin && constants.PET_SKINS?.[`PET_SKIN_${pet.skin}`]) {
      pet.texture_path = constants.PET_SKINS[`PET_SKIN_${pet.skin}`].texture;
      petSkin = constants.PET_SKINS[`PET_SKIN_${pet.skin}`].name;
    }

    // Get first row of lore
    const loreFirstRow = ["§8"];

    if (petData.type === "all") {
      loreFirstRow.push("All Skills");
    } else {
      loreFirstRow.push(helper.capitalizeFirstLetter(petData.type), " ", petData.category ?? "Pet");

      if (petData.obtainsExp === "feed") {
        loreFirstRow.push(", feed to gain XP");
      }

      if (petSkin) {
        loreFirstRow.push(`, ${petSkin} Skin`);
      }
    }

    lore.push(loreFirstRow.join(""), "");

    // Get name
    const petName =
      petData.hatching?.level > pet.level.level
        ? petData.hatching.name
        : petData.name
        ? petData.name[pet.rarity] ?? petData.name.default
        : helper.titleCase(pet.type.replaceAll("_", " "));

    const rarity = constants.RARITIES.indexOf(pet.rarity);

    const searchName = pet.type in constants.PET_STATS ? pet.type : "???";
    const petInstance = new constants.PET_STATS[searchName](rarity, pet.level.level, pet.extra, calculated ?? profile);
    pet.stats = Object.assign({}, petInstance.stats);
    pet.ref = petInstance;

    if (pet.heldItem) {
      const { heldItem } = pet;
      let heldItemObj = await db.collection("items").findOne({ id: heldItem });

      if (heldItem in constants.PET_ITEMS) {
        for (const stat in constants.PET_ITEMS[heldItem]?.stats) {
          pet.stats[stat] = (pet.stats[stat] || 0) + constants.PET_ITEMS[heldItem].stats[stat];
        }
        for (const stat in constants.PET_ITEMS[heldItem]?.statsPerLevel) {
          pet.stats[stat] =
            (pet.stats[stat] || 0) + constants.PET_ITEMS[heldItem].statsPerLevel[stat] * pet.level.level;
        }
        for (const stat in constants.PET_ITEMS[heldItem]?.multStats) {
          if (pet.stats[stat]) {
            pet.stats[stat] = (pet.stats[stat] || 0) * constants.PET_ITEMS[heldItem].multStats[stat];
          }
        }
        if ("multAllStats" in constants.PET_ITEMS[heldItem]) {
          for (const stat in pet.stats) {
            pet.stats[stat] *= constants.PET_ITEMS[heldItem].multAllStats;
          }
        }
      }

      // push specific pet lore before stats added
      if (constants.PET_DATA[pet.type]?.subLore !== undefined) {
        lore.push(constants.PET_DATA[pet.type].subLore, " ");
      }

      // push pet lore after held item stats added
      const stats = pet.ref.lore(pet.stats);
      stats.forEach((line) => {
        lore.push(line);
      });

      // then the ability lore
      const abilities = pet.ref.abilities;
      abilities.forEach((ability) => {
        lore.push(" ", ability.name);
        ability.desc.forEach((line) => {
          lore.push(line);
        });
      });

      // now we push the lore of the held items
      heldItemObj = constants.PET_ITEMS[heldItem] ?? constants.PET_ITEMS["???"];

      lore.push("", `§6Held Item: §${constants.RARITY_COLORS[heldItemObj.tier.toLowerCase()]}${heldItemObj.name}`);

      if (heldItem in constants.PET_ITEMS) {
        lore.push(constants.PET_ITEMS[heldItem].description);
      }
      // extra line
      lore.push(" ");
    } else {
      // no held items so push the new stats
      const stats = pet.ref.lore();
      stats.forEach((line) => {
        lore.push(line);
      });

      const abilities = pet.ref.abilities;
      abilities.forEach((ability) => {
        lore.push(" ", ability.name);
        ability.desc.forEach((line) => {
          lore.push(line);
        });
      });

      // extra line
      lore.push(" ");
    }

    // passive perks text
    if (petData.passivePerks) {
      lore.push("§8This pet's perks are active even when the pet is not summoned!", "");
    }

    // always gains exp text
    if (petData.alwaysGainsExp) {
      lore.push("§8This pet gains XP even when not summoned!", "");

      if (typeof petData.alwaysGainsExp === "string") {
        lore.push(`§8This pet only gains XP on the ${petData.alwaysGainsExp}§8!`, "");
      }
    }

    if (pet.level.level < petData.maxLevel) {
      lore.push(`§7Progress to Level ${pet.level.level + 1}: §e${(pet.level.progress * 100).toFixed(1)}%`);

      const progress = Math.ceil(pet.level.progress * 20);
      const numerator = pet.level.xpCurrent.toLocaleString();
      const denominator = helper.formatNumber(pet.level.xpForNext, false);

      lore.push(`§2${"-".repeat(progress)}§f${"-".repeat(20 - progress)} §e${numerator} §6/ §e${denominator}`);
    } else {
      lore.push("§bMAX LEVEL");
    }

    let progress = Math.floor((pet.exp / pet.level.xpMaxLevel) * 100);
    if (isNaN(progress)) {
      progress = 0;
    }

    lore.push(
      "",
      `§7Total XP: §e${helper.formatNumber(pet.exp, true, 1)} §6/ §e${helper.formatNumber(
        pet.level.xpMaxLevel,
        true,
        1
      )} §6(${progress.toLocaleString()}%)`
    );

    if (petData.obtainsExp !== "feed") {
      lore.push(`§7Candy Used: §e${pet.candyUsed || 0} §6/ §e10`);
    }

    pet.lore = "";

    for (const line of lore) {
      pet.lore += '<span class="lore-row wrap">' + helper.renderLore(line) + "</span>";
    }

    pet.display_name = `${petName}${petSkin ? " ✦" : ""}`;
    pet.emoji = petData.emoji;
    pet.ref.profile = null;

    output.push(pet);
  }

  output = output.sort((a, b) => {
    if (a.active === b.active) {
      if (a.rarity == b.rarity) {
        if (a.type == b.type) {
          return a.level.level > b.level.level ? -1 : 1;
        } else {
          let maxPetA = output
            .filter((x) => x.type == a.type && x.rarity == a.rarity)
            .sort((x, y) => y.level.level - x.level.level);

          maxPetA = maxPetA.length > 0 ? maxPetA[0].level.level : null;

          let maxPetB = output
            .filter((x) => x.type == b.type && x.rarity == b.rarity)
            .sort((x, y) => y.level.level - x.level.level);

          maxPetB = maxPetB.length > 0 ? maxPetB[0].level.level : null;

          if (maxPetA && maxPetB && maxPetA == maxPetB) {
            return a.type < b.type ? -1 : 1;
          } else {
            return maxPetA > maxPetB ? -1 : 1;
          }
        }
      } else {
        return constants.RARITIES.indexOf(a.rarity) < constants.RARITIES.indexOf(b.rarity) ? 1 : -1;
      }
    }

    return a.active ? -1 : 1;
  });

  return output;
}

async function getMissingPets(pets, gameMode, userProfile) {
  const profile = {
    pets: [],
  };

  const missingPets = [];

  const ownedPetTypes = pets.map((pet) => constants.PET_DATA[pet.type]?.typeGroup || pet.type);

  for (const [petType, petData] of Object.entries(constants.PET_DATA)) {
    if (
      ownedPetTypes.includes(petData.typeGroup ?? petType) ||
      (petData.bingoExclusive === true && gameMode !== "bingo")
    ) {
      continue;
    }

    const key = petData.typeGroup ?? petType;

    missingPets[key] ??= [];

    missingPets[key].push({
      type: petType,
      active: false,
      exp: helper.getPetExp(constants.PET_DATA[petType].maxTier, constants.PET_DATA[petType].maxLevel),
      tier: constants.PET_DATA[petType].maxTier,
      candyUsed: 0,
      heldItem: null,
      skin: null,
      uuid: helper.generateUUID(),
    });
  }

  for (const pets of Object.values(missingPets)) {
    if (pets.length > 1) {
      // using exp to find the highest tier
      profile.pets.push(pets.sort((a, b) => b.exp - a.exp)[0]);
      continue;
    }

    profile.pets.push(pets[0]);
  }

  profile.rift = userProfile.rift;
  profile.collections = userProfile.collections;

  return await getPets(profile);
}

function getPetScore(pets) {
  const highestRarity = {};
  for (const pet of pets) {
    if (constants.PET_DATA[pet.type]?.ignoredInPetScoreCalculation === true) {
      continue;
    }

    if (!(pet.type in highestRarity) || constants.PET_VALUE[pet.rarity] > highestRarity[pet.type]) {
      highestRarity[pet.type] = constants.PET_VALUE[pet.rarity];
    }
  }

  const highestLevel = {};
  for (const pet of pets) {
    if (constants.PET_DATA[pet.type]?.ignoredInPetScoreCalculation === true) {
      continue;
    }

    if (!(pet.type in highestLevel) || pet.level.level > highestLevel[pet.type]) {
      if (constants.PET_DATA[pet.type] && pet.level.level < constants.PET_DATA[pet.type].maxLevel) {
        continue;
      }

      highestLevel[pet.type] = 1;
    }
  }

  const output =
    Object.values(highestRarity).reduce((a, b) => a + b, 0) + Object.values(highestLevel).reduce((a, b) => a + b, 0);

  return output;
}

function getMissingAccessories(accessories) {
  const ACCESSORIES = constants.getAllAccessories();
  const unique = Object.keys(ACCESSORIES);
  unique.forEach((name) => {
    if (name in constants.accessoryAliases) {
      for (const duplicate of constants.accessoryAliases[name]) {
        if (accessories.includes(duplicate)) {
          accessories[accessories.indexOf(duplicate)] = name;
          break;
        }
      }
    }
  });

  let missing = unique.filter((accessory) => !accessories.includes(accessory));

  missing.forEach((name) => {
    if (constants.getUpgradeList(name)) {
      // if accessory has upgrades
      for (const upgrade of constants
        .getUpgradeList(name)
        .filter(
          (item) => constants.getUpgradeList(name).indexOf(item) > constants.getUpgradeList(name).indexOf(name)
        )) {
        // for (const upgrade of every upgrade after the current tier)
        if (accessories.includes(upgrade)) {
          //if accessories list includes the upgrade
          missing = missing.filter((item) => item !== name);
          break;
        }
      }
    }
  });

  const upgrades = [];
  const other = [];
  missing.forEach(async (accessory) => {
    const object = {
      display_name: null,
      rarity: null,
      texture_path: null,
    };

    object.name ??= accessory;

    // MAIN ACCESSORIES
    if (ACCESSORIES[accessory] != null) {
      const data = ACCESSORIES[accessory];

      object.texture_path = data.texture || null;
      object.display_name = data.name || null;
      object.rarity = data.tier || data.rarity || null;
    } else {
      const data = await db.collection("items").findOne({ id: accessory });

      if (data) {
        object.texture_path = data.texture ? `/head/${data.texture}` : `/item/${accessory}`;
        object.display_name = data.name;
        object.rarity = data.tier.toLowerCase();
      }
    }

    let includes = false;

    if (constants.getUpgradeList(accessory) && constants.getUpgradeList(accessory)[0] !== accessory) {
      includes = true;
    }

    if (includes) {
      upgrades.push(object);
    } else {
      other.push(object);
    }
  });

  return {
    missing: other,
    upgrades: upgrades,
  };
}

export async function getCollections(uuid, profile, cacheOnly = false) {
  const output = {};

  const userProfile = profile.members[uuid];

  if (!("unlocked_coll_tiers" in userProfile) || !("collection" in userProfile)) {
    return output;
  }

  const members = {};

  (await Promise.all(Object.keys(profile.members).map((a) => helper.resolveUsernameOrUuid(a, db, cacheOnly)))).forEach(
    (a) => (members[a.uuid] = a.display_name)
  );

  for (const collection of userProfile.unlocked_coll_tiers) {
    const split = collection.split("_");
    const tier = Math.max(0, parseInt(split.pop()));
    const type = split.join("_");
    const amount = userProfile.collection[type] || 0;
    const amounts = [];
    let totalAmount = 0;

    for (const member in profile.members) {
      const memberProfile = profile.members[member];

      if ("collection" in memberProfile) {
        amounts.push({ username: members[member], amount: memberProfile.collection[type] || 0 });
      }
    }

    for (const memberAmount of amounts) {
      totalAmount += memberAmount.amount;
    }

    if (!(type in output) || tier > output[type].tier) {
      output[type] = { tier, amount, totalAmount, amounts };
    }

    const collectionData = constants.COLLECTION_DATA.find((a) => a.skyblockId == type);

    for (const tier of collectionData?.tiers ?? []) {
      if (totalAmount >= tier.amountRequired) {
        output[type].tier = Math.max(tier.tier, output[type].tier);
      }
    }
  }

  return output;
}

export function getTrophyFish(userProfile) {
  const output = {
    total_caught: 0,
    stage: {
      name: null,
      progress: null,
    },
    fish: [],
  };

  for (const key of Object.keys(constants.TROPHY_FISH)) {
    const id = key.toLowerCase();
    const caught = (userProfile.trophy_fish && userProfile.trophy_fish[id]) || 0;
    const caughtBronze = (userProfile.trophy_fish && userProfile.trophy_fish[`${id}_bronze`]) || 0;
    const caughtSilver = (userProfile.trophy_fish && userProfile.trophy_fish[`${id}_silver`]) || 0;
    const caughtGold = (userProfile.trophy_fish && userProfile.trophy_fish[`${id}_gold`]) || 0;
    const caughtDiamond = (userProfile.trophy_fish && userProfile.trophy_fish[`${id}_diamond`]) || 0;

    const highestType =
      caughtDiamond > 0 ? "diamond" : caughtGold > 0 ? "gold" : caughtSilver > 0 ? "silver" : "bronze";

    output.fish.push({
      id: key,
      name: constants.TROPHY_FISH[key].display_name,
      texture: constants.TROPHY_FISH[key].textures[highestType],
      description: constants.TROPHY_FISH[key].description,
      caught: {
        total: caught,
        bronze: caughtBronze,
        silver: caughtSilver,
        gold: caughtGold,
        diamond: caughtDiamond,
        highestType: highestType,
      },
    });
  }

  output.total_caught = userProfile.trophy_fish?.total_caught || 0;

  const { type: stageType, formatted: stageFormatted } =
    constants.TROPHY_FISH_STAGES[(userProfile.trophy_fish?.rewards || []).length] || {};
  const { type: stageProgressType } = constants.TROPHY_FISH_STAGES[
    (userProfile.trophy_fish?.rewards || []).length + 1
  ] || {
    type: stageType,
  };

  const stageProgress =
    stageType === "diamond"
      ? null
      : stageType
      ? `${
          Object.keys(userProfile.trophy_fish).filter(
            (a) => a.endsWith(stageProgressType) && userProfile.trophy_fish[a] > 0
          ).length
        } / ${Object.keys(constants.TROPHY_FISH).length}`
      : null;

  output.stage = {
    name: stageFormatted || "None",
    type: stageType,
    progress: stageProgress,
  };

  return output;
}

function getRift(userProfile) {
  if (!("rift" in userProfile) || (userProfile.visited_zones && userProfile.visited_zones.includes("rift") === false)) {
    return null;
  }

  const rift = userProfile.rift;

  const killedEyes = [];
  for (const [key, data] of constants.RIFT_EYES.entries()) {
    data.unlocked = rift.wither_cage?.killed_eyes && rift.wither_cage.killed_eyes[key] !== undefined;

    killedEyes.push(data);
  }

  const timecharms = [];
  for (const [key, data] of constants.RIFT_TIMECHARMS.entries()) {
    data.unlocked = rift.gallery?.secured_trophies && rift.gallery.secured_trophies[key]?.type !== undefined;
    data.unlocked_at = rift.gallery?.secured_trophies && rift.gallery.secured_trophies[key]?.timestamp;

    timecharms.push(data);
  }

  return {
    motes: {
      purse: userProfile.motes_purse ?? 0,
      lifetime: userProfile.stats.rift_lifetime_motes_earned ?? 0,
      orbs: userProfile.stats.rift_motes_orb_pickup ?? 0,
    },
    enigma: {
      souls: rift.enigma.found_souls?.length ?? 0,
      total_souls: constants.RIFT_ENIGMA_SOULS,
    },
    wither_cage: {
      killed_eyes: killedEyes,
    },
    timecharms: {
      timecharms: timecharms,
      obtained_timecharms: timecharms.filter((a) => a.unlocked).length,
    },
    dead_cats: {
      montezuma: rift?.dead_cats?.montezuma ?? {},
      found_cats: rift?.dead_cats?.found_cats ?? [],
    },
    castle: {
      grubber_stacks: rift.castle?.grubber_stacks ?? 0,
      max_burgers: constants.MAX_GRUBBER_STACKS,
    },
  };
}

export async function getDungeons(userProfile, hypixelProfile) {
  const output = {};

  const dungeons = userProfile.dungeons;
  if (dungeons == null || Object.keys(dungeons).length === 0) return output;

  const dungeons_data = constants.DUNGEONS;
  if (dungeons.dungeon_types == null || Object.keys(dungeons.dungeon_types).length === 0) return output;

  // Main Dungeons Data
  for (const type of Object.keys(dungeons.dungeon_types)) {
    const dungeon = dungeons.dungeon_types[type];
    if (dungeon == null || Object.keys(dungeon).length === 0) {
      output[type] = { visited: false };
      continue;
    }

    const floors = {};

    for (const key of Object.keys(dungeon)) {
      if (typeof dungeon[key] != "object") continue;
      for (const floor of Object.keys(dungeon[key])) {
        if (!floors[floor]) {
          floors[floor] = {
            name: `floor_${floor}`,
            icon_texture: "908fc34531f652f5be7f27e4b27429986256ac422a8fb59f6d405b5c85c76f7",
            stats: {},
          };
        }

        const id = `${type}_${floor}`; // Floor ID
        if (dungeons_data.floors[id]) {
          if (dungeons_data.floors[id].name) {
            floors[floor].name = dungeons_data.floors[id].name;
          }
          if (dungeons_data.floors[id].texture) {
            floors[floor].icon_texture = dungeons_data.floors[id].texture;
          }
        }

        if (key.startsWith("most_damage")) {
          if (!floors[floor].most_damage || dungeon[key][floor] > floors[floor].most_damage.value) {
            floors[floor].most_damage = {
              class: key.replace("most_damage_", ""),
              value: dungeon[key][floor],
            };
          }
        } else if (key === "best_runs") {
          floors[floor][key] = dungeon[key][floor];
        } else {
          floors[floor].stats[key] = dungeon[key][floor];
        }
      }
    }

    const dungeon_id = `dungeon_${type}`; // Dungeon ID
    const highest_floor = dungeon.highest_tier_completed || 0;
    output[type] = {
      id: dungeon_id,
      visited: true,
      level: getLevelByXp(dungeon.experience, { type: "dungeoneering", ignoreCap: true }),
      highest_floor:
        dungeons_data.floors[`${type}_${highest_floor}`] && dungeons_data.floors[`${type}_${highest_floor}`].name
          ? dungeons_data.floors[`${type}_${highest_floor}`].name
          : `floor_${highest_floor}`,
      floors: floors,
      completions: Object.values(floors).reduce((a, b) => a + (b.stats?.tier_completions ?? 0), 0),
    };

    output[type].level.rank = await getLeaderboardPosition(`dungeons_${type}_xp`, dungeon.experience);
  }

  // Classes
  output.classes = {};
  output.class_average = {};

  let used_classes = false;
  const current_class = dungeons.selected_dungeon_class || "none";
  for (const className of Object.keys(dungeons.player_classes)) {
    const data = dungeons.player_classes[className];

    if (!data.experience) {
      data.experience = 0;
    }

    output.classes[className] = {
      experience: getLevelByXp(data.experience, { type: "dungeoneering", ignoreCap: true }),
      current: false,
    };

    output.classes[className].experience.rank = await getLeaderboardPosition(
      `dungeons_class_${className}_xp`,
      data.experience
    );

    if (data.experience > 0) {
      used_classes = true;
    }
    if (className == current_class) {
      output.classes[className].current = true;
    }

    output.class_average.experience ??= 0;
    output.class_average.experience += output.classes[className].experience.xp;
  }

  output.used_classes = used_classes;
  output.class_average.avrg_level = Object.keys(output.classes)
    .map((key) => output.classes[key].experience.level / Object.keys(output.classes).length)
    .reduce((a, b) => a + b, 0);
  output.class_average.avrg_level_with_progress = Object.keys(output.classes)
    .map((key) => output.classes[key].experience.levelWithProgress / Object.keys(output.classes).length)
    .reduce((a, b) => a + b, 0);
  output.class_average.max =
    Object.keys(output.classes).filter((key) => output.classes[key].experience.level >= 50).length ===
    Object.keys(output.classes).length;

  output.selected_class = current_class;
  output.secrets_found = hypixelProfile.achievements.skyblock_treasure_hunter || 0;

  if (!output.catacombs.visited) return output;

  // Boss Collections
  const collection_data = dungeons_data.boss_collections;
  const boss_data = dungeons_data.bosses;
  const collections = {};

  for (const coll_id in collection_data) {
    const coll = collection_data[coll_id];
    const boss = boss_data[coll.boss];

    for (const floor_id of boss.floors) {
      // This can be done much better. But I didn't want to deal with it.
      const a = floor_id.split("_");
      const dung_floor = a.pop();
      const dung_name = a.join("_");

      // I can't put these two into a single if. Welp, doesn't seem like a problem.
      if (output[dung_name] == null || !output[dung_name]?.visited) continue;
      if (output[dung_name].floors[dung_floor] == null) continue;

      const data = output[dung_name].floors[dung_floor];
      const num = data.stats.tier_completions || 0;

      if (num <= 0) continue;

      if (!collections[coll_id]) {
        collections[coll_id] = {
          name: boss.name,
          texture: boss.texture,
          tier: 0,
          maxed: false,
          killed: num,
          floors: {},
          unclaimed: 0,
          claimed: [],
        };
      } else {
        collections[coll_id].killed += num;
      }

      collections[coll_id].floors[floor_id] = num;
    }

    if (!collections[coll_id]) {
      continue;
    }

    for (const rewardId in coll.rewards) {
      const reward = coll.rewards[rewardId];
      if (collections[coll_id].killed >= reward.required) {
        collections[coll_id].tier = reward.tier;
        if (rewardId != "coming_soon") collections[coll_id].unclaimed++;
      } else {
        break;
      }

      if (collections[coll_id].tier == coll.max_tiers) {
        collections[coll_id].maxed = true;
      }
    }
  }

  const tasks = userProfile.tutorial;
  for (const i in tasks) {
    if (!tasks[i].startsWith("boss_collection_claimed")) continue;
    const task = tasks[i].split("_").splice(3);

    if (!Object.keys(boss_data).includes(task[0])) continue;
    const boss = boss_data[task[0]];

    if (!Object.keys(collection_data).includes(boss.collection)) continue;
    const coll = collection_data[boss.collection];

    const item = coll.rewards[task.splice(1).join("_")];

    if (item == null || boss == null) continue;
    collections[boss.collection].claimed.push(item.name);
    collections[boss.collection].unclaimed--;
  }

  if (Object.keys(collections).length === 0) {
    output.unlocked_collections = false;
  } else {
    output.unlocked_collections = true;
  }

  output.boss_collections = collections;

  // Journal Entries
  const JOURNAL_CONSTANTS = constants.DUNGEONS.journals;
  const journals = {
    pages_collected: 0,
    journals_completed: 0,
    total_pages: 0,
    journal_entries: dungeons.dungeon_journal.unlocked_journals,
  };

  if (dungeons.dungeon_journal.unlocked_journals !== undefined) {
    for (const entryID of dungeons.dungeon_journal.unlocked_journals) {
      journals.journals_completed += 1;
      journals.pages_collected += JOURNAL_CONSTANTS[entryID]?.pages || 0;
    }
  }

  for (const journal in JOURNAL_CONSTANTS) {
    journals.total_pages += JOURNAL_CONSTANTS[journal].pages;
  }

  output.journals = journals;

  // Level Bonuses (Only Catacombs Item Boost right now)
  for (const name in constants.DUNGEONS.level_bonuses) {
    const level_stats = constants.DUNGEONS.level_bonuses[name];
    const steps = Object.keys(level_stats)
      .sort((a, b) => Number(a) - Number(b))
      .map((a) => Number(a));

    let level = 0;
    switch (name) {
      case "dungeon_catacombs":
        level = output.catacombs.level.level;
        output.catacombs.bonuses = {
          item_boost: 0,
        };
        break;
      default:
        continue;
    }

    for (let x = steps[0]; x <= steps[steps.length - 1]; x += 1) {
      if (level < x) {
        break;
      }

      const level_step = steps
        .slice()
        .reverse()
        .find((a) => a <= x);

      const level_bonus = level_stats[level_step];

      for (const bonus in level_bonus) {
        switch (name) {
          case "dungeon_catacombs":
            output.catacombs.bonuses[bonus] += level_bonus[bonus];
        }
      }
    }
  }

  return output;
}

function getEssence(userProfile, hypixelProfile) {
  /** @type {{[key:string]: number}} */
  const output = {};

  for (const essence in constants.ESSENCE) {
    output[essence] = userProfile?.[`essence_${essence}`] ?? 0;
  }

  return output;
}

function getHotmItems(userProfile, packs) {
  const data = userProfile.mining_core;
  const output = [];

  // Filling the space with empty items
  for (let index = 0; index < 7 * 9; index++) {
    output.push(helper.generateItem());
  }

  if (!data) {
    return output;
  }

  const hotmLevelData = data.experience ? getLevelByXp(data.experience, { type: "hotm" }) : 0;
  const nodes = data.nodes
    ? Object.fromEntries(Object.entries(data.nodes).filter(([key, value]) => !key.startsWith("toggle_")))
    : {};
  const toggles = data.nodes
    ? Object.fromEntries(Object.entries(data.nodes).filter(([key, value]) => key.startsWith("toggle_")))
    : {};
  const mcdata = getMiningCoreData(userProfile);

  // Check for missing node classes
  for (const nodeId in nodes) {
    if (constants.HOTM.nodes[nodeId] == undefined) {
      throw new Error(`Missing Heart of the Mountain node: ${nodeId}`);
    }
  }

  // Processing nodes
  for (const nodeId in constants.HOTM.nodes) {
    const enabled = toggles[`toggle_${nodeId}`] ?? true;
    const level = nodes[nodeId] ?? 0;
    const node = new constants.HOTM.nodes[nodeId]({
      level,
      enabled,
      nodes,
      hotmLevelData,
      selectedPickaxeAbility: data.selected_pickaxe_ability,
    });

    output[node.position7x9 - 1] = helper.generateItem({
      display_name: node.name,
      id: node.itemData.id,
      Damage: node.itemData.Damage,
      glowing: node.itemData.glowing,
      tag: {
        display: {
          Name: node.displayName,
          Lore: node.lore,
        },
      },
      position: node.position7x9,
    });
  }

  // Processing HotM tiers
  for (let tier = 1; tier <= constants.HOTM.tiers; tier++) {
    const hotm = new constants.HOTM.hotm(tier, hotmLevelData);

    output[hotm.position7x9 - 1] = helper.generateItem({
      display_name: `Tier ${tier}`,
      id: hotm.itemData.id,
      Damage: hotm.itemData.Damage,
      glowing: hotm.itemData.glowing,
      tag: {
        display: {
          Name: hotm.displayName,
          Lore: hotm.lore,
        },
      },
      position: hotm.position7x9,
    });
  }

  // Processing HotM items (stats, hc crystals, reset)
  for (const itemClass of constants.HOTM.items) {
    const item = new itemClass({
      resources: {
        token_of_the_mountain: mcdata.tokens,
        mithril_powder: mcdata.powder.mithril,
        gemstone_powder: mcdata.powder.gemstone,
      },
      crystals: mcdata.crystal_nucleus.crystals,
      last_reset: mcdata.hotm_last_reset,
    });

    output[item.position7x9 - 1] = helper.generateItem({
      display_name: helper.removeFormatting(item.displayName),
      id: item.itemData.id,
      Damage: item.itemData.Damage,
      glowing: item.itemData.glowing,
      texture_path: item.itemData?.texture_path,
      tag: {
        display: {
          Name: item.displayName,
          Lore: item.lore,
        },
      },
      position: item.position7x9,
    });
  }

  // Processing textures
  output.forEach(async (item) => {
    const customTexture = await getTexture(item, {
      ignore_id: false,
      pack_ids: packs,
    });

    if (customTexture) {
      item.animated = customTexture.animated;
      item.texture_path = "/" + customTexture.path;
      item.texture_pack = customTexture.pack.config;
      item.texture_pack.base_path =
        "/" + path.relative(path.resolve(__dirname, "..", "public"), customTexture.pack.base_path);
    }
  });

  return output;
}

function getMiningCoreData(userProfile) {
  const output = {};
  const data = userProfile.mining_core;

  if (!data) {
    return null;
  }

  output.tier = getLevelByXp(data.experience, { type: "hotm" });

  const totalTokens = helper.calcHotmTokens(output.tier.level, data.nodes?.special_0 || 0);
  output.tokens = {
    total: totalTokens,
    spent: data.tokens_spent || 0,
    available: totalTokens - (data.tokens_spent || 0),
  };

  output.selected_pickaxe_ability = data.selected_pickaxe_ability
    ? constants.HOTM.names[data.selected_pickaxe_ability]
    : null;

  output.powder = {
    mithril: {
      total: (data.powder_mithril || 0) + (data.powder_spent_mithril || 0),
      spent: data.powder_spent_mithril || 0,
      available: data.powder_mithril || 0,
    },
    gemstone: {
      total: (data.powder_gemstone || 0) + (data.powder_spent_gemstone || 0),
      spent: data.powder_spent_gemstone || 0,
      available: data.powder_gemstone || 0,
    },
  };

  const crystals_completed = data.crystals
    ? Object.values(data.crystals)
        .filter((x) => x.total_placed)
        .map((x) => x.total_placed)
    : [];
  output.crystal_nucleus = {
    times_completed: crystals_completed.length > 0 ? Math.min(...crystals_completed) : 0,
    crystals: data.crystals || {},
    goblin: data.biomes?.goblin ?? null,
    precursor: data.biomes?.precursor ?? null,
  };

  output.daily_ores = {
    mined: data.daily_ores_mined,
    day: data.daily_ores_mined_day,
    ores: {
      mithril: {
        day: data.daily_ores_mined_day_mithril_ore,
        count: data.daily_ores_mined_mithril_ore,
      },
      gemstone: {
        day: data.daily_ores_mined_day_gemstone,
        count: data.daily_ores_mined_gemstone,
      },
    },
  };

  output.hotm_last_reset = data.last_reset || 0;

  output.crystal_hollows_last_access = data.greater_mines_last_access || 0;

  output.daily_effect = {
    effect: data.current_daily_effect || null,
    last_changed: data.current_daily_effect_last_changed || null,
  };

  output.nodes = data.nodes || {};

  return output;
}

async function getForge(userProfile) {
  const output = {};

  if (userProfile?.forge?.forge_processes?.forge_1) {
    const forge = Object.values(userProfile.forge.forge_processes.forge_1);
    const processes = [];
    for (const item of forge) {
      const forgeItem = {
        id: item.id,
        slot: item.slot,
        timeFinished: 0,
        timeFinishedText: "",
      };

      if (item.id in constants.FORGE_TIMES) {
        let forgeTime = constants.FORGE_TIMES[item.id] * 60 * 1000; // convert minutes to milliseconds
        const quickForge = userProfile.mining_core?.nodes?.forge_time;
        if (quickForge != null) {
          forgeTime *= constants.QUICK_FORGE_MULTIPLIER[quickForge];
        }
        const dbObject = await db.collection("items").findOne({ id: item.id });

        forgeItem.name = item.id == "PET" ? "[Lvl 1] Ammonite" : dbObject ? dbObject.name : item.id;
        const timeFinished = item.startTime + forgeTime;
        forgeItem.timeFinished = timeFinished;
        forgeItem.timeFinishedText = moment(timeFinished).fromNow();
      } else {
        forgeItem.id = `UNKNOWN-${item.id}`;
      }
      processes.push(forgeItem);
    }
    output.processes = processes;
  }

  return output;
}

function getProfileUpgrades(profile) {
  const output = {};
  for (const upgrade in constants.PROFILE_UPGRADES) {
    output[upgrade] = 0;
  }
  if (profile.community_upgrades?.upgrade_states != undefined) {
    for (const u of profile.community_upgrades.upgrade_states) {
      output[u.upgrade] = Math.max(output[u.upgrade] || 0, u.tier);
    }
  }
  return output;
}

export async function getProfile(
  db,
  paramPlayer,
  paramProfile,
  options = { cacheOnly: false, debugId: `${helper.getClusterId()}/unknown@getProfile` }
) {
  // console.debug(`${options.debugId}: getProfile called.`);
  // const timeStarted = Date.now();

  if (paramPlayer.length != 32) {
    try {
      const { uuid } = await helper.resolveUsernameOrUuid(paramPlayer, db);

      paramPlayer = uuid;
    } catch (e) {
      console.error(e);
      throw e;
    }
  }

  if (paramProfile) {
    paramProfile = paramProfile.toLowerCase();
  }

  const params = {
    key: credentials.hypixel_api_key,
    uuid: paramPlayer,
  };

  let allSkyBlockProfiles = [];

  let profileObject = await db.collection("profileStore").findOne({ uuid: sanitize(paramPlayer) });

  let lastCachedSave = 0;

  if (profileObject) {
    const profileData = db
      .collection("profileCache")
      .find({ profile_id: { $in: Object.keys(profileObject.profiles) } });
    for await (const doc of profileData) {
      if (doc.members?.[paramPlayer] == undefined) {
        continue;
      }

      Object.assign(doc, profileObject.profiles[doc.profile_id]);

      allSkyBlockProfiles.push(doc);
    }
  } else {
    profileObject = { last_update: 0 };
  }

  let response = null;

  lastCachedSave = Math.max(profileObject.last_update, Date.now() || 0);

  if (
    !options.cacheOnly &&
    ((Date.now() - lastCachedSave > 190 * 1000 && Date.now() - lastCachedSave < 300 * 1000) ||
      Date.now() - profileObject.last_update >= 300 * 1000)
  ) {
    try {
      profileObject.last_update = Date.now();
      response = await retry(
        async () => {
          return await hypixel.get("skyblock/profiles", { params });
        },
        { retries: 2 }
      );

      const { data } = response;

      if (!data.success) {
        throw new Error("Request to Hypixel API failed. Please try again!");
      }

      if (data.profiles == null) {
        throw new Error("Player has no SkyBlock profiles.");
      }

      allSkyBlockProfiles = data.profiles;
    } catch (e) {
      if (e?.response?.data?.cause != undefined) {
        throw new Error(`Hypixel API Error: ${e.response.data.cause}.`);
      }

      throw e;
    }
  }

  if (allSkyBlockProfiles.length == 0) {
    throw new Error("Player has no SkyBlock profiles.");
  }

  for (const profile of allSkyBlockProfiles) {
    profile.uuid = paramPlayer;
  }

  let skyBlockProfiles = [];

  if (paramProfile) {
    if (paramProfile.length == 36) {
      skyBlockProfiles = allSkyBlockProfiles.filter((a) => a.profile_id.toLowerCase() == paramProfile);
    } else {
      skyBlockProfiles = allSkyBlockProfiles.filter((a) => a.cute_name.toLowerCase() == paramProfile);
    }
  }

  if (skyBlockProfiles.length == 0) {
    skyBlockProfiles = allSkyBlockProfiles;
  }

  const profiles = [];

  for (const profile of skyBlockProfiles) {
    let memberCount = 0;

    for (let i = 0; i < Object.keys(profile.members).length; i++) {
      memberCount++;
    }

    if (memberCount == 0) {
      if (paramProfile) {
        throw new Error("Uh oh, this SkyBlock profile has no players.");
      }

      continue;
    }

    profiles.push(profile);
  }

  if (profiles.length == 0) {
    throw new Error("No data returned by Hypixel API, please try again!");
  }

  let profile;

  const storeProfiles = {};

  for (const _profile of allSkyBlockProfiles) {
    const userProfile = _profile.members[paramPlayer];

    if (!userProfile) {
      continue;
    }

    if (response && response.request.fromCache !== true) {
      const insertCache = {
        last_update: new Date(),
        members: _profile.members,
      };

      if ("banking" in _profile) {
        insertCache.banking = _profile.banking;
      }

      if ("community_upgrades" in _profile) {
        insertCache.community_upgrades = _profile.community_upgrades;
      }

      db.collection("profileCache")
        .updateOne({ profile_id: _profile.profile_id }, { $set: insertCache }, { upsert: true })
        .catch(console.error);
    }

    storeProfiles[_profile.profile_id] = {
      profile_id: _profile.profile_id ?? null,
      cute_name: _profile.cute_name ?? "Unknown",
      game_mode: _profile.game_mode ?? "normal",
      selected: _profile.selected ?? false,
    };
  }

  for (const _profile of profiles) {
    if (_profile === undefined || _profile === null) {
      return;
    }

    if (
      _profile?.selected ||
      _profile.profile_id.toLowerCase() == paramProfile ||
      _profile.cute_name.toLowerCase() == paramProfile
    ) {
      profile = _profile;
    }
  }

  if (!profile) {
    profile = profiles[0];

    if (!profile) {
      throw new Error("Couldn't find any Skyblock profile that belongs to this player.");
    }
  }

  const userProfile = profile.members[paramPlayer];

  if (profileObject && "current_area" in profileObject) {
    userProfile.current_area = profileObject.current_area;
  }

  userProfile.current_area_updated = true;

  if (response && response.request.fromCache !== true) {
    const apisEnabled =
      "inv_contents" in userProfile &&
      Object.keys(userProfile).filter((a) => a.startsWith("experience_skill_")).length > 0 &&
      "collection" in userProfile;

    const insertProfileStore = {
      last_update: new Date(),
      apis: apisEnabled,
      profiles: storeProfiles,
    };

    try {
      const statusResponse = await hypixel.get("status", {
        params: { uuid: paramPlayer, key: credentials.hypixel_api_key },
      });

      const areaData = statusResponse.data.session;

      if (areaData.online && areaData.gameType == "SKYBLOCK") {
        const areaName = constants.AREA_NAMES[areaData.mode] || helper.titleCase(areaData.mode.replaceAll("_", " "));

        userProfile.current_area = areaName;
        insertProfileStore.current_area = areaName;
      }
    } catch (e) {
      console.error(e);
    }

    updateLeaderboardPositions(db, paramPlayer, allSkyBlockProfiles).catch(console.error);

    db.collection("profileStore")
      .updateOne({ uuid: sanitize(paramPlayer) }, { $set: insertProfileStore }, { upsert: true })
      .catch(console.error);
  }

  // console.debug(`${options.debugId}: getProfile returned. (${Date.now() - timeStarted}ms)`);
  return { profile: profile, allProfiles: allSkyBlockProfiles, uuid: paramPlayer };
}

export async function getBingoProfile(
  db,
  paramPlayer,
  options = { cacheOnly: false, debugId: `${helper.getClusterId()}/unknown@getProfile` }
) {
  console.debug(`${options.debugId}: getBingoProfile called.`);
  const timeStarted = Date.now();

  if (paramPlayer.length != 32) {
    try {
      const { uuid } = await helper.resolveUsernameOrUuid(paramPlayer, db);

      paramPlayer = uuid;
    } catch (e) {
      console.error(e);
      throw e;
    }
  }

  const params = {
    key: credentials.hypixel_api_key,
    uuid: paramPlayer,
  };

  let profileData = (await db.collection("bingoProfilesCache").findOne({ uuid: sanitize(paramPlayer) })) || {
    last_save: 0,
  };

  const lastCachedSave = profileData.last_save ?? 0;
  if (
    (!options.cacheOnly &&
      ((Date.now() - lastCachedSave > 190 * 1000 && Date.now() - lastCachedSave < 300 * 1000) ||
        Date.now() - profileData.last_save >= 300 * 1000)) ||
    lastCachedSave === 0
  ) {
    try {
      const response = await retry(
        async () => {
          return await hypixel.get("skyblock/bingo", { params });
        },
        { retries: 2 }
      );

      const { data } = response;

      if (!data.success) {
        throw new Error("Request to Hypixel API failed. Please try again!");
      }

      profileData = data;
      profileData.last_save = Date.now();

      db.collection("bingoProfilesCache").updateOne(
        { uuid: sanitize(paramPlayer) },
        { $set: profileData },
        { upsert: true }
      );
    } catch (e) {
      if (e?.response?.data?.cause === "No bingo data could be found") {
        return null;
      }

      if (e?.response?.data?.cause != undefined) {
        throw new Error(`Hypixel API Error: ${e.response.data.cause}.`);
      }

      throw e;
    }
  }

  console.debug(`${options.debugId}: getBingoProfile returned. (${Date.now() - timeStarted}ms)`);
  return profileData;
}

async function updateLeaderboardPositions(db, uuid, allProfiles) {
  if (constants.BLOCKED_PLAYERS.includes(uuid)) {
    return;
  }

  const hypixelProfile = await helper.getRank(uuid, db, true);

  const memberProfiles = [];

  for (const singleProfile of allProfiles) {
    const userProfile = singleProfile.members[uuid];

    if (userProfile == null) {
      continue;
    }

    userProfile.levels = await getLevels(userProfile, hypixelProfile);

    let totalSlayerXp = 0;

    userProfile.slayer_xp = 0;

    if (userProfile.slayer_bosses != undefined) {
      for (const slayer in userProfile.slayer_bosses) {
        totalSlayerXp += userProfile.slayer_bosses[slayer].xp || 0;
      }

      userProfile.slayer_xp = totalSlayerXp;

      for (const mountMob in constants.MOB_MOUNTS) {
        const mounts = constants.MOB_MOUNTS[mountMob];

        userProfile.stats[`kills_${mountMob}`] = 0;
        userProfile.stats[`deaths_${mountMob}`] = 0;

        for (const mount of mounts) {
          userProfile.stats[`kills_${mountMob}`] += userProfile.stats[`kills_${mount}`] || 0;
          userProfile.stats[`deaths_${mountMob}`] += userProfile.stats[`deaths_${mount}`] || 0;

          delete userProfile.stats[`kills_${mount}`];
          delete userProfile.stats[`deaths_${mount}`];
        }
      }
    }

    userProfile.skyblock_level = {
      xp: userProfile.leveling?.experience || 0,
      level: Math.floor(userProfile.leveling?.experience / 100 || 0),
    };

    userProfile.pet_score = 0;

    const maxPetRarity = {};
    if (Array.isArray(userProfile.pets)) {
      for (const pet of userProfile.pets) {
        if (!("tier" in pet)) {
          continue;
        }

        maxPetRarity[pet.type] = Math.max(maxPetRarity[pet.type] || 0, constants.PET_VALUE[pet.tier.toLowerCase()]);
      }

      for (const key in maxPetRarity) {
        userProfile.pet_score += maxPetRarity[key];
      }
    }

    memberProfiles.push({
      profile_id: singleProfile.profile_id,
      data: userProfile,
    });
  }

  const values = {};

  values["pet_score"] = getMax(memberProfiles, "data", "pet_score");

  values["fairy_souls"] = getMax(memberProfiles, "data", "fairy_souls_collected");
  values["average_level"] = getMax(memberProfiles, "data", "levels", "average_level");
  values["total_skill_xp"] = getMax(memberProfiles, "data", "levels", "total_skill_xp");

  for (const skill of getAllKeys(memberProfiles, "data", "levels", "levels")) {
    values[`skill_${skill}_xp`] = getMax(memberProfiles, "data", "levels", "levels", skill, "xp");
  }

  values[`skyblock_level_xp`] = getMax(memberProfiles, "data", "skyblock_level", "xp");
  values["slayer_xp"] = getMax(memberProfiles, "data", "slayer_xp");

  for (const slayer of getAllKeys(memberProfiles, "data", "slayer_bosses")) {
    for (const key of getAllKeys(memberProfiles, "data", "slayer_bosses", slayer)) {
      if (!key.startsWith("boss_kills_tier")) {
        continue;
      }

      const tier = key.split("_").pop();

      values[`${slayer}_slayer_boss_kills_tier_${tier}`] = getMax(memberProfiles, "data", "slayer_bosses", slayer, key);
    }

    values[`${slayer}_slayer_xp`] = getMax(memberProfiles, "data", "slayer_bosses", slayer, "xp");
  }

  for (const item of getAllKeys(memberProfiles, "data", "collection")) {
    values[`collection_${item.toLowerCase()}`] = getMax(memberProfiles, "data", "collection", item);
  }

  for (const stat of getAllKeys(memberProfiles, "data", "stats")) {
    values[stat] = getMax(memberProfiles, "data", "stats", stat);
  }

  // Dungeons (Mainly Catacombs now.)
  for (const stat of getAllKeys(memberProfiles, "data", "dungeons", "dungeon_types", "catacombs")) {
    switch (stat) {
      case "best_runs":
      case "highest_tier_completed":
        break;
      case "experience":
        values[`dungeons_catacombs_xp`] = getMax(
          memberProfiles,
          "data",
          "dungeons",
          "dungeon_types",
          "catacombs",
          "experience"
        );
        break;
      default:
        for (const floor of getAllKeys(memberProfiles, "data", "dungeons", "dungeon_types", "catacombs", stat)) {
          const floorId = `catacombs_${floor}`;
          if (!constants.DUNGEONS.floors[floorId] || !constants.DUNGEONS.floors[floorId].name) continue;

          const floorName = constants.DUNGEONS.floors[floorId].name;
          values[`dungeons_catacombs_${floorName}_${stat}`] = getMax(
            memberProfiles,
            "data",
            "dungeons",
            "dungeon_types",
            "catacombs",
            stat,
            floor
          );
        }
    }
  }

  for (const dungeonClass of getAllKeys(memberProfiles, "data", "dungeons", "player_classes")) {
    values[`dungeons_class_${dungeonClass}_xp`] = getMax(
      memberProfiles,
      "data",
      "dungeons",
      "player_classes",
      dungeonClass,
      "experience"
    );
  }

  values[`dungeons_secrets_found`] = hypixelProfile.achievements.skyblock_treasure_hunter || 0;

  const multi = redisClient.pipeline();

  for (const key in values) {
    if (values[key] == null) {
      continue;
    }

    multi.zadd(`lb_${key}`, values[key], uuid);
  }
  for (const singleProfile of allProfiles) {
    if (singleProfile.banking?.balance != undefined) {
      multi.zadd(`lb_bank`, singleProfile.banking.balance, singleProfile.profile_id);
    }

    const minionCrafts = [];

    for (const member in singleProfile.members) {
      if (Array.isArray(singleProfile.members[member].crafted_generators)) {
        minionCrafts.push(...singleProfile.members[member].crafted_generators);
      }
    }

    multi.zadd(`lb_unique_minions`, _.uniq(minionCrafts).length, singleProfile.profile_id);
  }

  try {
    await multi.exec();
  } catch (e) {
    console.error(e);
  }
}

async function init() {
  const response = await axios("https://api.hypixel.net/resources/skyblock/collections");

  if (!response?.data?.collections) {
    return;
  }

  for (const type in response.data.collections) {
    for (const itemType in response.data.collections[type].items) {
      const item = response.data.collections[type].items[itemType];
      try {
        const collectionData = constants.COLLECTION_DATA.find((a) => a.skyblockId == itemType);

        collectionData.maxTier = item.maxTiers;
        collectionData.tiers = item.tiers;
      } catch (e) {
        if (e instanceof TypeError) {
          //Collection Data filter error
        } else {
          //Throw exception unchanged
          throw e;
        }
      }
    }
  }
}

init();

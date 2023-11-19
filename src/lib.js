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
import { calculateLilyWeight } from "./constants/weight/lily-weight.js";
import { calculateSenitherWeight } from "./constants/weight/senither-weight.js";
import { getLeaderboardPosition } from "./helper/leaderboards.js";
import { calculateFarmingWeight } from "./constants/weight/farming-weight.js";

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
    case "skyblock_level":
      return constants.SKYBLOCK_XP;
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
 * @param {{type?: string, cap?: number, skill?: string, ignoreCap?: boolean, infinite?: boolean }} extra
 * @param type the type of levels (used to determine which xp table to use)
 * @param cap override the cap highest level the player can reach
 * @param skill the id of the skill (used to determine the default cap)
 * @param ignoreCap whether to ignore the in-game cap or not
 * @param infinite repeats the last level's experience requirement infinitely
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

  /** adds support for infinite leveling (dungeoneering and skyblock level) */
  if (extra.infinite) {
    const maxExperience = Object.values(xpTable).at(-1);

    uncappedLevel += Math.floor(xpRemaining / maxExperience);
    xpRemaining %= maxExperience;
    xpCurrent = xpRemaining;
  }

  /** the maximum level that any player can achieve (used for gold progress bars) */
  const maxLevel =
    extra.ignoreCap && uncappedLevel >= levelCap ? uncappedLevel : constants.MAXED_SKILL_CAPS[extra.skill] ?? levelCap;

  /** the maximum amount of experience that any player can acheive (used for skyblock level gold progress bar) */
  const maxExperience = constants.MAXED_SKILL_XP[extra.skill];

  // not sure why this is floored but I'm leaving it in for now
  xpCurrent = Math.floor(xpCurrent);

  /** the level as displayed by in game UI */
  const level = extra.ignoreCap ? uncappedLevel : Math.min(levelCap, uncappedLevel);

  /** the amount amount of xp needed to reach the next level (used for calculation progress to next level) */
  const xpForNext =
    level < maxLevel ? Math.ceil(xpTable[level + 1] ?? Object.values(xpTable).at(-1)) : maxExperience ?? Infinity;

  /** the fraction of the way toward the next level */
  const progress = level >= maxLevel ? (extra.ignoreCap ? 1 : 0) : Math.max(0, Math.min(xpCurrent / xpForNext, 1));

  /** a floating point value representing the current level for example if you are half way to level 5 it would be 4.5 */
  const levelWithProgress = level + progress;

  /** a floating point value representing the current level ignoring the in-game unlockable caps for example if you are half way to level 5 it would be 4.5 */
  const unlockableLevelWithProgress = extra.cap ? Math.min(uncappedLevel + progress, maxLevel) : levelWithProgress;

  return {
    xp,
    level,
    maxLevel,
    xpCurrent,
    maxExperience,
    xpForNext,
    progress,
    levelCap,
    uncappedLevel,
    levelWithProgress,
    unlockableLevelWithProgress,
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

export const getItems = async (
  profile,
  paramBingo,
  customTextures = false,
  packs,
  options = { cacheOnly: false, debugId: `${helper.getClusterId()}/unknown@getItems` }
) => {
  const output = {};

  console.debug(`${options.debugId}: getItems called.`);
  const timeStarted = Date.now();

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

  let hotm = /*"mining_core" in profile ? await getHotmItems(profile, packs) :*/ [];

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
  if (paramBingo && paramBingo.events) {
    const bingoData = await helper.getBingoGoals(db, options.cacheOnly);
    if (bingoData === null || bingoData.goals === undefined) {
      throw new Error("Failed to fetch Bingo data. Please try again later.");
    }

    const bingoProfile = paramBingo.events.find((profile) => profile.key === bingoData.id);

    const completedBingoGoals = bingoProfile?.completed_goals ?? [];
    const bingoGoals = bingoData.goals;

    output.bingo_card = bingoProfile !== undefined ? stats.getBingoItems(completedBingoGoals, bingoGoals) : {};
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
    hotm,
    candy_bag
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
    rift_prism: profile.rift?.access?.consumed_prism ? { consumed: true } : null,
  };

  // Modify accessories on armor and add
  for (const accessory of armor.filter((a) => a.categories.includes("accessory"))) {
    const id = helper.getId(accessory);

    if (id === "") {
      continue;
    }

    const insertAccessory = Object.assign({ isUnique: true, isInactive: false }, accessory);

    accessories.push(insertAccessory);
    accessoryIds.push({
      id: id,
      rarity: insertAccessory.rarity,
    });
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
      if (a.isInactive == true) {
        return;
      }

      if (helper.getId(a) === helper.getId(insertAccessory)) {
        insertAccessory.isInactive = true;
        a.isInactive = true;

        // give accessories with higher rarity priority, mark lower rarity as inactive
        if (constants.RARITIES.indexOf(a.rarity) > constants.RARITIES.indexOf(insertAccessory.rarity)) {
          a.isInactive = false;
          a.isUnique = true;
          insertAccessory.isUnique = false;
        } else if (constants.RARITIES.indexOf(insertAccessory.rarity) > constants.RARITIES.indexOf(a.rarity)) {
          insertAccessory.isInactive = false;
          insertAccessory.isUnique = true;
          a.isUnique = false;
        } else {
          insertAccessory.isInactive = false;
          insertAccessory.isUnique = false;
          a.isInactive = true;
          a.isUnique = true;
        }
      }
    });

    // mark accessory aliases as inactive
    const accessoryAliases = constants.accessoryAliases;
    if (id in accessoryAliases || Object.keys(accessoryAliases).find((a) => accessoryAliases[a].includes(id))) {
      let accessoryDuplicates = constants.accessoryAliases[id];
      if (accessoryDuplicates === undefined) {
        const aliases = Object.keys(accessoryAliases).filter((a) => accessoryAliases[a].includes(id));
        accessoryDuplicates = aliases.concat(constants.accessoryAliases[aliases]);
      }

      for (const duplicate of accessoryDuplicates) {
        accessory_bag.concat(inventory.filter((a) => a.categories.includes("accessory"))).map((a) => {
          if (helper.getId(a) === duplicate) {
            a.isInactive = true;
            a.isUnique = false;
          }
        });
      }
    }

    accessories.push(insertAccessory);
    accessoryIds.push({
      id: id,
      rarity: insertAccessory.rarity,
    });
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
      const insertAccessory = Object.assign({ isUnique: false, isInactive: true }, accessory);

      accessories.push(insertAccessory);
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

  if (accessoryRarities.rift_prism?.consumed) {
    accessoryIds.push({
      id: "RIFT_PRISM",
      rarity: "rare",
    });
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

  console.debug(`${options.debugId}: getItems returned. (${Date.now() - timeStarted}ms)`);
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
  packs,
  options = { cacheOnly: false, debugId: `${helper.getClusterId()}/unknown@getStats` }
) {
  const output = {};

  console.debug(`${options.debugId}: getStats called.`);
  const timeStarted = Date.now();

  const userProfile = profile.members[profile.uuid];
  const hypixelProfile = await helper.getRank(profile.uuid, db, options.cacheOnly);

  output.stats = Object.assign({}, constants.BASE_STATS);

  output.fairy_souls = stats.getFairySouls(userProfile, profile);

  output.skills = await stats.getSkills(userProfile, hypixelProfile, profile.members);

  output.slayer = stats.getSlayer(userProfile);

  if (!items.no_inventory && items.accessory_ids) {
    output.missingAccessories = getMissingAccessories(items.accessory_ids);

    for (const key in output.missingAccessories) {
      for (const item of output.missingAccessories[key]) {
        let price = 0;

        if (item.customPrice === true) {
          if (item.upgrade) {
            price = (await helper.getItemPrice(item.upgrade.item)) * item.upgrade.cost[item.rarity];
          }

          if (item.id === "POWER_ARTIFACT") {
            for (const { slot_type: slot } of item.gemstone_slots) {
              price += await helper.getItemPrice(`PERFECT_${slot}_GEM`);
            }
          }
        } else {
          price = await helper.getItemPrice(item.id);
        }

        item.extra = { price };
        if (price > 0) {
          helper.addToItemLore(
            item,
            `§7Price: §6${Math.round(price).toLocaleString()} Coins §7(§6${helper.formatNumber(
              Math.floor(price / helper.getMagicalPower(item.rarity, item.id))
            )} §7per MP)`
          );
        }

        item.tag ??= {};
        item.tag.ExtraAttributes ??= {};
        item.tag.ExtraAttributes.id ??= item.id;
        item.Damage ??= item.damage;
        item.id = item.item_id;

        helper.applyResourcePack(item, packs);
      }

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

  output.kills = stats.getKills(userProfile);
  output.deaths = stats.getDeaths(userProfile);

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

  output.guild = await helper.getGuild(profile.uuid, db, options.cacheOnly);

  output.rank_prefix = helper.renderRank(hypixelProfile);
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

  output.minions = stats.getMinions(profile);

  output.bestiary = stats.getBestiary(userProfile);

  output.social = hypixelProfile.socials;

  output.dungeons = await stats.getDungeons(userProfile, hypixelProfile);

  output.fishing = stats.getFishing(userProfile);

  output.farming = stats.getFarming(userProfile);

  output.enchanting = stats.getEnchanting(userProfile);

  output.mining = await stats.getMining(userProfile, hypixelProfile);

  output.crimson_isle = stats.getCrimsonIsle(userProfile);

  output.collections = await stats.getCollections(
    profile.uuid,
    profile,
    output.dungeons,
    output.crimson_isle,
    options.cacheOnly
  );

  output.skyblock_level = await stats.getSkyBlockLevel(userProfile);

  output.visited_zones = userProfile.player_data.visited_zones || [];

  output.visited_modes = userProfile.player_data.visited_modes || [];

  output.perks = userProfile.player_data.perks || {};

  output.harp_quest = userProfile.quests.harp_quest || {};

  output.misc = stats.getMisc(profile, userProfile, hypixelProfile);

  output.bingo = stats.getBingoData(bingoProfile);

  output.user_data = stats.getUserData(userProfile);

  output.currencies = stats.getCurrenciesData(userProfile, profile);

  output.weight = stats.getWeight(output);

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

  output.temp_stats = stats.getTempStats(userProfile);

  output.rift = stats.getRift(userProfile);

  output.pets = await stats.getPets(userProfile, output, items, profile);

  console.debug(`${options.debugId}: getStats returned. (${Date.now() - timeStarted}ms)`);

  return output;
}

/**
 * Checks if an accessory is present in an array of accessories.
 *
 * @param {Object[]} accessories - The array of accessories to search.
 * @param {Object|string} accessory - The accessory object or ID to find.
 * @param {Object} [options] - The options object.
 * @param {boolean} [options.ignoreRarity=false] - Whether to ignore the rarity of the accessory when searching.
 * @returns {boolean} True if the accessory is found, false otherwise.
 */
function hasAccessory(accessories, accessory, options = { ignoreRarity: false }) {
  const id = typeof accessory === "object" ? accessory.id : accessory;

  if (options.ignoreRarity === false) {
    return accessories.some(
      (a) => a.id === id && constants.RARITIES.indexOf(a.rarity) >= constants.RARITIES.indexOf(accessory.rarity)
    );
  } else {
    return accessories.some((a) => a.id === id);
  }
}

/**
 * Finds an accessory in an array of accessories by its ID.
 *
 * @param {Object[]} accessories - The array of accessories to search.
 * @param {string} accessory - The ID of the accessory to find.
 * @returns {Object|undefined} The accessory object if found, or undefined if not found.
 */
function getAccessory(accessories, accessory) {
  return accessories.find((a) => a.id === accessory);
}

function getMissingAccessories(accessories) {
  const ACCESSORIES = constants.getAllAccessories();
  const unique = ACCESSORIES.map(({ id, tier: rarity }) => ({ id, rarity }));

  for (const { id } of unique) {
    if (id in constants.accessoryAliases === false) continue;

    for (const duplicate of constants.accessoryAliases[id]) {
      if (hasAccessory(accessories, duplicate, { ignoreRarity: true }) === true) {
        getAccessory(accessories, duplicate).id = id;
      }
    }
  }

  let missing = unique.filter((accessory) => hasAccessory(accessories, accessory) === false);
  for (const { id } of missing) {
    const upgrades = constants.getUpgradeList(id);
    if (upgrades === undefined) {
      continue;
    }

    for (const upgrade of upgrades.filter((item) => upgrades.indexOf(item) > upgrades.indexOf(id))) {
      if (hasAccessory(accessories, upgrade) === true) {
        missing = missing.filter((item) => item.id !== id);
      }
    }
  }

  const upgrades = [];
  const other = [];
  for (const { id, rarity } of missing) {
    const ACCESSORY = ACCESSORIES.find((a) => a.id === id && a.tier === rarity);

    const object = {
      ...ACCESSORY,
      display_name: ACCESSORY.name ?? null,
      rarity: rarity,
    };

    if ((constants.getUpgradeList(id) && constants.getUpgradeList(id)[0] !== id) || ACCESSORY.rarities) {
      upgrades.push(object);
    } else {
      other.push(object);
    }
  }

  return {
    missing: other,
    upgrades: upgrades,
  };
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
      ExtraAttributes: {
        id: node.id,
        enabled: node.enabled,
        level: node.level,
        max_level: node.max_level,
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

export async function getProfile(
  db,
  paramPlayer,
  paramProfile,
  options = { cacheOnly: false, debugId: `${helper.getClusterId()}/unknown@getProfile` }
) {
  console.debug(`${options.debugId}: getProfile called.`);
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
          return await hypixel.get("v2/skyblock/profiles", { params });
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

  console.debug(`${options.debugId}: getProfile returned. (${Date.now() - timeStarted}ms)`);
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

/*
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
*/

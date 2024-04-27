import { getTexture } from "../../custom-resources.js";
import { getLevelByXp } from "../skills/leveling.js";
import * as constants from "../../constants.js";
import * as helper from "../../helper.js";
import * as stats from "../../stats.js";
import { fileURLToPath } from "url";
import path from "path";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export function getHotmItems(userProfile, packs) {
  const data = userProfile.mining_core;
  const output = [];

  // Filling the space with empty items
  for (let index = 0; index < 10 * 9; index++) {
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
  const mcdata = stats.getMiningCoreData(userProfile);

  // Check for missing node classes
  for (const nodeId in nodes) {
    if (constants.HOTM.nodes[nodeId] == undefined) {
      // throw new Error(`Missing Heart of the Mountain node: ${nodeId}`);
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

    output[node.position10x9 - 1] = helper.generateItem({
      display_name: node.name,
      id: node.itemData.id,
      Damage: node.itemData.Damage,
      glowing: node.itemData.glowing,
      tag: {
        display: {
          Name: node.displayName,
          Lore: node.lore,
        },
        ExtraAttributes: {
          id: getHotMPerkId(node),
        },
      },
      position: node.position10x9,
    });
  }

  // Processing HotM tiers
  for (let tier = 1; tier <= constants.HOTM.tiers; tier++) {
    const hotm = new constants.HOTM.hotm(tier, hotmLevelData);

    output[hotm.position10x9 - 1] = helper.generateItem({
      display_name: `Tier ${tier}`,
      id: hotm.itemData.id,
      Damage: hotm.itemData.Damage,
      glowing: hotm.itemData.glowing,
      tag: {
        display: {
          Name: hotm.displayName,
          Lore: hotm.lore,
        },
        ExtraAttributes: {
          id: getHOTMLevelId(hotm),
        },
      },
      position: hotm.position10x9,
    });
  }

  // Processing HotM items (stats, hc crystals, reset)
  for (const itemClass of constants.HOTM.items) {
    const item = new itemClass({
      resources: {
        token_of_the_mountain: mcdata.tokens,
        mithril_powder: mcdata.powder.mithril,
        gemstone_powder: mcdata.powder.gemstone,
        glacite_powder: mcdata.powder.glacite,
      },
      crystals: mcdata.crystal_nucleus.crystals,
      last_reset: mcdata.hotm_last_reset,
    });

    output[item.position10x9 - 1] = helper.generateItem({
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
        ExtraAttributes: {
          id: item.itemData.skyblock_id,
        },
      },
      position: item.position10x9,
    });
  }

  // Processing textures
  output.forEach((item) => {
    const customTexture = getTexture(item, {
      ignore_id: false,
      pack_ids: packs,
      hotm: true,
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

/**
 * Returns the level ID of a HOTM based on the progress. Created to improve performance by avoiding regex and string operations.
 * @param {Object} hotm - The HOTM object containing tier, level, xpCurrent, and xpForNext properties.
 * @returns {string} - The level ID of the HOTM.
 */
function getHOTMLevelId(hotm) {
  const progress = hotm.tier <= hotm.level ? 1 : hotm.level + 1 === hotm.tier ? hotm.xpCurrent / hotm.xpForNext : 0;
  if (hotm.tier === 1 || hotm.tier === 10) {
    return `hotm_level_${hotm.tier}_${getHOTMLvLTier(progress)}`;
  }

  return `hotm_level_${getHOTMLvLTier(progress)}`;
}

/**
 * Returns the HotM perk ID based on the given perk object.
 * @param {Object} perk - The perk object containing level and max_level properties.
 * @returns {string} - The HotM perk ID.
 */
function getHotMPerkId(perk) {
  const progress = perk.level / perk.max_level;

  return `hotm_perk_${perk.positionType}_${perk.positionType === "cross" ? Math.ceil(getHotMPerkTier(progress) / 2) : getHotMPerkTier(progress)}`;
}

function getHOTMLvLTier(progress) {
  const tiers = [0, 0.125, 0.25, 0.375, 0.5, 0.625, 0.875, 1];
  if (progress === 0) {
    return 0;
  }

  for (let i = 0; i < tiers.length; i++) {
    if (progress < tiers[i]) {
      return i;
    }
  }
  return tiers.length;
}

function getHotMPerkTier(progress) {
  const tiers = [0.01, 0.125, 0.25, 0.375, 0.5, 0.625, 0.875, 1];
  if (progress === 0) {
    return 0;
  }

  for (let i = 0; i < tiers.length; i++) {
    if (progress < tiers[i]) {
      return i + 1;
    }
  }

  return 9;
}

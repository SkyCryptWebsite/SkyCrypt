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
  const mcdata = stats.getMiningCoreData(userProfile);

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
      ignore_id: true,
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

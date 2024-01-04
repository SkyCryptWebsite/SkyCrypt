import { db } from "../mongo.js";

export const TYPE_TO_CATEGORIES = {
  helmet: ["armor", "helmet"],
  chestplate: ["armor", "chestplate"],
  leggings: ["armor", "leggings"],
  boots: ["armor", "boots"],
  sword: ["weapon", "sword"],
  bow: ["weapon", "bow"],
  longsword: ["weapon", "longsword", "sword"],
  wand: ["weapon", "wand"],
  hatccessory: ["armor", "helmet", "accessory", "hatccessory"],
  gauntlet: ["weapon", "mining_tool", "tool", "gauntlet"],
  pickaxe: ["mining_tool", "tool", "pickaxe"],
  drill: ["mining_tool", "tool", "drill"],
  axe: ["foraging_tool", "tool", "axe"],
  hoe: ["farming_tool", "tool", "hoe"],
  "fishing rod": ["fishing_tool", "tool"],
  "fishing weapon": ["fishing_tool", "tool", "weapon"],
  shovel: ["tool", "shovel"],
  shears: ["tool", "shears"],
  bait: ["bait"],
  item: ["item"],
  accessory: ["accessory"],
  arrow: ["arrow"],
  "reforge stone": ["reforge_stone"],
  cosmetic: ["cosmetic"],
  "pet item": ["pet_item"],
  "travel scroll": ["travel_scroll"],
  belt: ["belt"],
  cloak: ["cloak"],
  necklace: ["necklace"],
  gloves: ["gloves"],
  bracelet: ["bracelet"],
  deployable: ["deployable"],
  "trophy fish": ["trophy_fish"],
};

export const ENCHANTMENTS_TO_CATEGORIES = {
  farming_tool: [
    "cultivating",
    "dedication",
    "delicate",
    "harvesting",
    "replenish",
    "sunder",
    "turbo_cacti",
    "turbo_cane",
    "turbo_carrot",
    "turbo_coco",
    "turbo_mushrooms",
    "turbo_potato",
    "turbo_warts",
    "turbo_wheat",
  ],
};

export const ITEMS = new Map();

async function updateItems() {
  const items = await db.collection("items").find().toArray();
  for (const item of items) {
    ITEMS.set(item.id, item);
  }
}

updateItems();
setTimeout(updateItems, 1000 * 60 * 60 * 12); // 12 hours

export const typeToCategories = {
  helmet: ["armor", "helmet"],
  chestplate: ["armor", "chestplate"],
  leggings: ["armor", "leggings"],
  boots: ["armor", "boots"],
  sword: ["weapon", "sword"],
  bow: ["weapon", "bow"],
  longsword: ["weapon", "longsword"],
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

/** @typedef {"common"|"uncommon"|"rare"|"epic"|"legendary"|"mythic"|"divine"|"supreme"|"special"|"very_special"} Rarity */

/** @type {Rarity[]} */
export const rarities = [
  "common",
  "uncommon",
  "rare",
  "epic",
  "legendary",
  "mythic",
  "divine",
  "supreme",
  "special",
  "very_special",
];

/** @typedef {"0"|"1"|"2"|"3"|"4"|"5"|"6"|"7"|"8"|"9"|"a"|"b"|"c"|"d"|"e"|"f"} ColorCode */

/** @type {{[key:Rarity]:ColorCode}} */
export const rarityColors = {
  common: "f",
  uncommon: "a",
  rare: "9",
  epic: "5",
  legendary: "6",
  mythic: "d",
  divine: "b",
  supreme: "4",
  special: "c",
  very_special: "c",
};

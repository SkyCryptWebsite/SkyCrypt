/** @typedef {"common"|"uncommon"|"rare"|"epic"|"legendary"|"mythic"|"divine"|"supreme"|"special"|"very_special"} Rarity */

/** @type {Rarity[]} */
export const RARITIES = [
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
  "admin",
];

/** @typedef {"0"|"1"|"2"|"3"|"4"|"5"|"6"|"7"|"8"|"9"|"a"|"b"|"c"|"d"|"e"|"f"} ColorCode */

/** @type {{[key:Rarity]:ColorCode}} */
export const RARITY_COLORS = {
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

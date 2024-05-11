import type { ColorCode, Rarity } from "$lib/types/globals";

export const RARITIES: Rarity[] = ["common", "uncommon", "rare", "epic", "legendary", "mythic", "divine", "supreme", "special", "very_special", "admin"];

export const RARITY_COLORS: { [key in Rarity]: ColorCode } = {
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
  admin: "4"
};

import { RARITY_COLORS, STATS_DATA } from "$lib/constants";
import type { Item, ItemStats } from "$lib/types/globals";

/**
 * Removes Minecraft formatting codes from a string
 * @param {string} string
 * @returns {string}
 */
export function removeFormatting(string: string): string {
  return string.replaceAll(/§[0-9a-z]/g, "");
}

/**
 * Gets the stats from an item
 * @param  {Item} piece
 * @returns {ItemStats}
 */
export function getStatsFromItem(piece: Item): ItemStats {
  const regex = /^([A-Za-z ]+): ([+-]([0-9]+(?:,[0-9]{3})*(?:\.[0-9]{0,2})?))/;
  const stats = {};

  if (!piece) {
    return stats;
  }

  const lore = (piece.tag.display.Lore || []).map((line) => removeFormatting(line));

  for (const line of lore) {
    const match = regex.exec(line);

    if (match == null) {
      continue;
    }

    const statName = Object.keys(STATS_DATA).find((key) => STATS_DATA[key].nameLore === match[1]);
    const statValue = parseFloat(match[2].replace(/,/g, ""));

    if (statName) {
      stats[statName] ??= 0;
      stats[statName] += statValue;
    }
  }

  return stats;
}

/**
 * Capitalizes the first letter of a string
 * @param {string} string
 * @returns {string}
 * @deprecated Use CSS text-transform: capitalize; (capitalize in Tailwind CSS) instead.
 * @DO_NOT_USE
 */
export function capitalizeFirstLetter(string: string): string {
  return string.charAt(0).toUpperCase() + string.slice(1);
}

/**
 * Converts a string to title case
 * @param {string} string
 * @returns {string}
 */
export function titleCase(string: string): string {
  const split = string.toLowerCase().split(" ");

  for (let i = 0; i < split.length; i++) {
    split[i] = split[i].charAt(0).toUpperCase() + split[i].substring(1);
  }

  return split.join(" ");
}

/**
 * Rounds a number to a certain number of decimal places
 * @param {number} num the number to be rounded
 * @param {number} decimals the number of decimal places to round to
 * @returns {number} the rounded number
 * @deprecated Use format from "numerable" instead.
 */
export function round(num: number, decimals: number = 0): number {
  return Math.round(Math.pow(10, decimals) * num) / Math.pow(10, decimals);
}

/**
 * Returns the tailwind css color class for a rarity
 * @param {string} rarity the rarity of the item
 * @param {"bg" | "text"} type the type of color to get
 * @returns {string} the tailwind css color class
 */
export function getRarityClass(rarity: string, type: "bg" | "text"): string {
  const rarityColor = RARITY_COLORS[rarity as keyof typeof RARITY_COLORS];
  // minecraft colors are safelisted in the tailwind config, so they are always generated
  return rarityColor ? `${type}-minecraft-${rarityColor}` : "";
}

/**
 * Checks if an item is enchanted
 * @param {Item} item The item to check
 * @returns  {boolean} Whether the item is enchanted
 */
export function isEnchanted(item: Item): boolean {
  // heads
  if ([397].includes(item.id)) {
    return false;
  }

  // enchanted book, bottle o' enchanting, nether star
  if ([403, 384, 399].includes(item.id)) {
    return true;
  }

  //potions with actual effects (not water bottles)
  if (item.id === 373 && item.Damage !== 0) {
    return true;
  }

  if ("tag" in item && Array.isArray(item.tag.ench)) {
    return true;
  }

  if (item.glowing) {
    return true;
  }

  return false;
}

import * as constants from "./constants.js";

/**
 * removes Minecraft formatting codes from a string
 * @param {string} string
 * @returns {string}
 */
export function removeFormatting(string) {
  return string.replaceAll(/§[0-9a-z]/g, "");
}
/**
 * @param  {Item} piece
 * @returns {ItemStats}
 */
export function getStatsFromItem(piece) {
  const regex = /^([A-Za-z ]+): ([+-]([0-9]+\.?[0-9]*))/;
  const stats = {};

  const lore = (piece.tag.display.Lore || []).map((line) => removeFormatting(line));

  for (const line of lore) {
    const match = regex.exec(line);

    if (match == null) {
      continue;
    }

    const statName = constants.statNames[match[1]];
    const statValue = parseFloat(match[2]);

    if (statName) {
      stats[statName] ??= 0;
      stats[statName] += statValue;
    }
  }

  return stats;
}

/**
 * @param {string} word
 * @returns {string}
 * @example
 * // returns "Hello world"
 * capitalizeFirstLetter("hello world");
 */
export function capitalizeFirstLetter(word) {
  return word.charAt(0).toUpperCase() + word.slice(1);
}

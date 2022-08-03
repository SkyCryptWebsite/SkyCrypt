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

    const statName = Object.keys(constants.statsData).find((key) => constants.statsData[key].nameLore === match[1]);
    const statValue = parseFloat(match[2].replace(/,/g, ""));

    if (statName) {
      stats[statName] ??= 0;
      stats[statName] += statValue;
    }
  }

  return stats;
}

/**
 * @param {string} string
 * @returns {string}
 */
export function capitalizeFirstLetter(string) {
  return string.charAt(0).toUpperCase() + string.slice(1);
}

/**
 * @param {string} string
 * @returns {string}
 */
export function titleCase(string) {
  const split = string.toLowerCase().split(" ");

  for (let i = 0; i < split.length; i++) {
    split[i] = split[i].charAt(0).toUpperCase() + split[i].substring(1);
  }

  return split.join(" ");
}

/**
 * rounds a number to a certain number of decimal places
 * @param {number} num the number to be rounded
 * @param {number} decimals the number of decimal places to round to
 * @returns {number} the rounded number
 */
export function round(num, decimals = 0) {
  return Math.round(Math.pow(10, decimals) * num) / Math.pow(10, decimals);
}

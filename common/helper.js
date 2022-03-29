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
 * @returns {{[key: string]: number}}
 */
export function getStatsFromItem(piece) {
  const regex = /^([A-Za-z ]+): ([+|-]\d+)/;
  const stats = {};

  const lore = (piece.tag.display.Lore || []).map((line) => removeFormatting(line));

  for (const line of lore) {
    // Breaking after the first empty line for performance (stats are in the first block only)
    if (line === "") {
      break;
    }

    const match = regex.exec(line);

    if (match == null) {
      continue;
    }

    const statName = constants.statNames[match[1]];
    const statValue = parseInt(match[2]);

    if (statName) {
      stats[statName] ??= 0;
      stats[statName] += statValue;
    }
  }

  return stats;
}

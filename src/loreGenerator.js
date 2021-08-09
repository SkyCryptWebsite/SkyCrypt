const { statNames } = require("./constants/misc");

/**
 * adds a "+" to the beginning of positive numbers
 * @param {number} num
 * @returns {string}
 */
function addSign(num) {
  if (num >= 0) {
    return "+" + num;
  } else {
    return String(num);
  }
}

module.exports = {
  /**
   * update item Lore to match item stats
   * @param {{tag?:{display?:{Lore?:string}},stats:{[key:string]:number},extra?:{hpbs?:number}}} item
   * @returns {void}
   */
  makeLore: function (item) {
    const lore_raw = item?.tag?.display?.Lore;

    if (lore_raw == undefined) {
      return;
    }

    for (let i = 0; i < lore_raw.length; ++i) {
      if (!lore_raw[i].includes(":")) {
        continue;
      }

      let split = lore_raw[i].split(":")[1].split(" ");

      if (split.length < 2) {
        continue;
      }

      const statType = lore_raw[i].split(":")[0];

      const statName = statType.substring(2);

      if (statName in statNames) {
        const statValue = split[1].substring(0, 2) + addSign(item.stats[statNames[statName]]);

        if (statName === "Health" && item.equipmentType == "armor" && item.extra?.hpbs > 0) {
          const hpbString = `HP §e(+${item.extra.hpbs * 4} HP)`;
          lore_raw[i] = statType + ": " + statValue + " " + hpbString + " " + split.slice(5).join(" ");
        } else if (statName === "Defense" && item.equipmentType == "armor" && item.extra?.hpbs > 0) {
          const hpbString = `§e(+${item.extra.hpbs * 2})`;
          lore_raw[i] = statType + ": " + statValue + " " + hpbString + " " + split.slice(3).join(" ");
        } else {
          lore_raw[i] = statType + ": " + statValue + " " + split.slice(2).join(" ");
        }
      }
    }
  },
};

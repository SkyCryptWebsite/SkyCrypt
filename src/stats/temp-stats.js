import * as constants from "../constants.js";

export function getTempStats(userProfile) {
  const output = {};
  if (userProfile.player_data === undefined) {
    return;
  }

  output.century_cakes = [];
  if (userProfile.player_data.temp_stat_buffs) {
    for (const cake of userProfile.player_data.temp_stat_buffs) {
      if (cake.key.startsWith("cake_") === false) {
        continue;
      }

      const id = cake.key.replace("cake_", "");

      const stat = constants.CENTURY_CAKE_STATS[id] || id;

      output.century_cakes.push({
        stat: stat,
        amount: cake.amount,
      });
    }
  }

  return output;
}

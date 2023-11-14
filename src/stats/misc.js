import * as constants from "../constants.js";

/**
 * Returns an object containing the number of fairy souls collected by the user, the total number of fairy souls available to collect, the progress made towards collecting all fairy souls, and the number of fairy exchanges made by the user.
 * @param {object} userProfile - The user's profile object.
 * @param {object} profile - The user's game profile object.
 * @returns {{collected: number, total: number, progress: number, fairy_exchanges: number}} - An object containing the number of fairy souls collected by the user, the total number of fairy souls available to collect, the progress made towards collecting all fairy souls, and the number of fairy exchanges made by the user.
 * */

export function getFairySouls(userProfile, profile) {
  try {
    if (isNaN(userProfile.fairy_soul.total_collected)) {
      return {
        collected: 0,
        total: 0,
        progress: 0,
        fairy_exchanges: 0,
      };
    }

    const totalSouls =
      profile.game_mode === "island" ? constants.FAIRY_SOULS.max.stranded : constants.FAIRY_SOULS.max.normal;

    return {
      collected: userProfile.fairy_soul.total_collected,
      total: totalSouls,
      progress: ((userProfile.fairy_soul.total_collected / totalSouls) * 100).toFixed(2),
      fairy_exchanges: userProfile.fairy_soul.fairy_exchanges,
    };
  } catch (error) {
    console.error(error);
  }
}

import * as constants from "../constants.js";
import * as helper from "../helper.js";
import moment from "moment";

/**
 * Returns an object containing the user's first join date and current area information.
 * @param {Object} userProfile - The user's profile object.
 * @returns {{
 *  first_join: {
 *    unix: number,
 *    text: string
 *  },
 *  current_area: {
 *    current_area: string,
 *    current_area_updated: number
 *  }
 * }} - An object containing the user's first join date and current area information.
 */
export function getUserData(userProfile) {
  return {
    first_join: {
      unix: userProfile.profile.first_join,
      text: moment(userProfile.profile.first_join).fromNow(),
    },
    current_area: {
      current_area: userProfile.current_area,
      current_area_updated: userProfile.current_area_updated,
    },
  };
}

/**
 * Returns an object containing the bank and purse currencies data of a user.
 *
 * @param {Object} userProfile - The user profile object.
 * @param {Object} profile - The profile object.
 * @returns {{
 *  bank: number,
 *  purse: number
 * }} An object containing the bank and purse currencies data of a user.
 */
export function getCurrenciesData(userProfile, profile) {
  return {
    bank: profile.banking?.balance ?? 0,
    purse: userProfile.currencies.coin_purse || 0,
  };
}

/**
 * Returns an array of objects containing kill statistics for a given user profile.
 * @param {Object} userProfile - The user profile to retrieve kill statistics for.
 * @returns {{
 *  type: string,
 *  entity_id: string,
 *  amount: number,
 *  entity_name: string
 * }[]} An array of objects containing kill statistics.
 */
export function getKills(userProfile) {
  const output = {
    kills: [],
    total: 0,
  };

  for (const entityId in userProfile.player_stats.kills) {
    if (userProfile.player_stats.kills[entityId] === 0 || entityId === "total") {
      continue;
    }

    const entityName =
      constants.MOB_NAMES[entityId] ??
      entityId
        .split("_")
        .map((s) => helper.capitalizeFirstLetter(s))
        .join(" ");

    output.kills.push({
      type: "kills",
      entity_id: entityId,
      amount: userProfile.player_stats.kills[entityId],
      entity_name: entityName,
    });
  }

  output.kills = output.kills.sort((a, b) => b.amount - a.amount);
  output.total = userProfile.player_stats.kills.total;

  return output;
}

/**
 * Returns an array of objects containing death statistics for a given user profile.
 * @param {Object} userProfile - The user profile to retrieve death statistics for.
 * @returns {{
 *  type: string,
 *  entity_id: string,
 *  amount: number,
 *  entity_name: string
 * }[]} An array of objects containing death statistics.
 */
export function getDeaths(userProfile) {
  const output = {
    deaths: [],
    total: 0,
  };

  for (const entityId in userProfile.player_stats.deaths) {
    if (userProfile.player_stats.deaths[entityId] === 0 || entityId === "total") {
      continue;
    }

    const entityName =
      constants.MOB_NAMES[entityId] ??
      entityId
        .split("_")
        .map((s) => helper.capitalizeFirstLetter(s))
        .join(" ");

    output.deaths.push({
      type: "deaths",
      entity_id: entityId,
      amount: userProfile.player_stats.deaths[entityId],
      entity_name: entityName,
    });
  }

  output.deaths = output.deaths.sort((a, b) => b.amount - a.amount);
  output.total = userProfile.player_stats.deaths.total;

  return output;
}

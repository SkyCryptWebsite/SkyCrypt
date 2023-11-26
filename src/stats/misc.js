import moment from "moment";
import * as constants from "../constants.js";
import * as helper from "../helper.js";

/**
 * Returns an object containing the number of fairy souls collected by the user, the total number of fairy souls available to collect, the progress made towards collecting all fairy souls, and the number of fairy exchanges made by the user.
 * @param {object} userProfile - The user's profile object.
 * @param {object} profile - The user's game profile object.
 * @returns {{collected: number, total: number, progress: number, fairy_exchanges: number}} - An object containing the number of fairy souls collected by the user, the total number of fairy souls available to collect, the progress made towards collecting all fairy souls, and the number of fairy exchanges made by the user.
 * */

export function getFairySouls(userProfile, profile) {
  try {
    if (userProfile.fairy_soul === undefined) {
      return;
    }

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

function getProfileUpgrades(profile) {
  const output = {};
  for (const upgrade in constants.PROFILE_UPGRADES) {
    output[upgrade] = 0;
  }

  if (profile.community_upgrades?.upgrade_states != undefined) {
    for (const u of profile.community_upgrades.upgrade_states) {
      output[u.upgrade] = Math.max(output[u.upgrade] || 0, u.tier);
    }
  }

  return output;
}

function getMiscUncategorized(userProfile) {
  const output = {};

  if ("soulflow" in userProfile.item_data) {
    const soulflow = userProfile.item_data.soulflow;

    output.soulflow = {
      raw: soulflow,
      formatted: helper.formatNumber(soulflow),
    };
  }

  if ("fastest_target_practice" in userProfile) {
    output.fastest_target_practice = {
      raw: userProfile.fastest_target_practice,
      formatted: `${helper.formatNumber(userProfile.fastest_target_practice)}s`,
    };
  }

  if ("favorite_arrow" in userProfile.item_data) {
    const favoriteArrow = userProfile.item_data.favorite_arrow;

    output.favorite_arrow = {
      raw: favoriteArrow,
      formatted: `${helper.titleCase(favoriteArrow.replace("_", " "))}`,
    };
  }

  if ("teleporter_pill_consumed" in userProfile.item_data) {
    const teleporterPill = userProfile.item_data.teleporter_pill_consumed;

    output.teleporter_pill_consumed = {
      raw: teleporterPill,
      formatted: teleporterPill ? "Yes" : "No",
    };
  }

  if (userProfile?.player_data && "reaper_peppers_eaten" in userProfile.player_data) {
    const reaperPeppersEaten = userProfile.player_data.reaper_peppers_eaten;

    output.reaper_peppers_eaten = {
      raw: reaperPeppersEaten,
      formatted: reaperPeppersEaten,
      maxed: reaperPeppersEaten === constants.MAX_REAPER_PEPPERS_EATEN,
    };
  }

  if ("personal_bank_upgrade" in userProfile.profile) {
    const personalBankUpgrade = userProfile.profile.personal_bank_upgrade;

    output.bank_cooldown = {
      raw: personalBankUpgrade,
      formatted: constants.BANK_COOLDOWN[personalBankUpgrade] ?? "Unknown",
      maxed: personalBankUpgrade === Object.keys(constants.BANK_COOLDOWN).length,
    };
  }

  return output;
}

function getPetMilestone(type, amount) {
  return {
    amount: amount ?? 0,
    rarity: constants.MILESTONE_RARITIES[constants.PET_MILESTONES[type].findLastIndex((x) => amount >= x)] ?? "common",
    total: constants.PET_MILESTONES[type].at(-1),
    progress: Math.min((amount / constants.PET_MILESTONES[type].at(-1)) * 100, 100).toFixed(2),
  };
}

export function getMisc(profile, userProfile, hypixelProfile) {
  if (userProfile.player_stats === undefined) {
    return;
  }

  const misc = {};
  if ("races" in userProfile.player_stats) {
    misc.races = {};
    const races = userProfile.player_stats.races;
    for (const key in userProfile.objectives) {
      if (key.startsWith("complete_the_") === false) {
        continue;
      }

      const raceTimeID = `${key.replace("complete_the_", "").split("_").slice(0, -1).join("_")}_best_time`;
      const customRaceID = constants.CUSTOM_RACE_IDS[raceTimeID];
      const tier = parseInt(key.split("_").at(-1));

      const raceTime = races[raceTimeID] ?? races[customRaceID];
      let actualRaceId = (customRaceID ?? raceTimeID).split("_").slice(0, 2).join("_");
      if (raceTime) {
        misc.races.other ??= { name: "Other", races: {} };
        misc.races.other.races[actualRaceId] = {
          name: constants.RACE_NAMES[actualRaceId],
          time: moment.duration(raceTime, "milliseconds").format("m:ss.SSS"),
          tier: tier,
        };
      } else {
        // Thank you Hypxiel
        actualRaceId = actualRaceId.replace("_race", "");
        const categoryRaceID = raceTimeID.replace(`${actualRaceId}_`, "").replace("_best_time", "");

        misc.races[actualRaceId] ??= {
          name: constants.RACE_NAMES[actualRaceId],
          races: {
            no_return: {},
            with_return: {},
          },
        };

        const raceId = raceTimeID.replace("_race", "");
        if (categoryRaceID.endsWith("no_return_race")) {
          const subcategoryRaceId = categoryRaceID.replace("_no_return_race", "");
          const raceName = helper.titleCase(subcategoryRaceId.replace("_", " "));

          misc.races[actualRaceId].races.with_return[subcategoryRaceId] = {
            name: raceName,
            time: moment.duration(races.dungeon_hub[raceId], "milliseconds").format("m:ss.SSS"),
            tier: tier,
          };
        } else {
          const subcategoryRaceId = categoryRaceID.replace("_with_return_race", "");
          const raceName = helper.titleCase(subcategoryRaceId.replace("_", " "));

          misc.races[actualRaceId].races.no_return[subcategoryRaceId] = {
            name: raceName,
            time: moment.duration(races.dungeon_hub[raceId], "milliseconds").format("m:ss.SSS"),
            tier: tier,
          };
        }
      }
    }
  }

  if ("gifts" in userProfile.player_stats) {
    misc.gifts = {
      given: userProfile.player_stats.gifts.total_given ?? 0,
      received: userProfile.player_stats.gifts.total_received ?? 0,
    };
  }

  if ("winter" in userProfile.player_stats) {
    misc.winter = {
      most_snowballs_hit: userProfile.player_stats.winter.most_snowballs_hit ?? 0,
      most_damage_dealt: userProfile.player_stats.winter.most_damage_dealt ?? 0,
      most_magma_damage_dealt: userProfile.player_stats.winter.most_magma_damage_dealt ?? 0,
      most_cannonballs_hit: userProfile.player_stats.winter.most_cannonballs_hit ?? 0,
    };
  }

  if (userProfile.player_stats.end_island?.dragon_fight !== undefined && userProfile.player_stats?.kills) {
    const dragonKills = Object.keys(userProfile.player_stats.kills)
      .filter((key) => key.endsWith("_dragon") && !key.startsWith("master_wither_king"))
      .reduce((obj, key) => ({ ...obj, [key.replace("_dragon", "")]: userProfile.player_stats.kills[key] }), {});

    dragonKills.total = Object.values(dragonKills).reduce((a, b) => a + b, 0);

    const dragonDeaths = Object.keys(userProfile.player_stats.deaths)
      .filter((key) => key.endsWith("_dragon") && !key.startsWith("master_wither_king"))
      .reduce((obj, key) => ({ ...obj, [key.replace("_dragon", "")]: userProfile.player_stats.deaths[key] }), {});

    dragonDeaths.total = Object.values(dragonDeaths).reduce((a, b) => a + b, 0);

    misc.dragons = {
      ender_crystals_destroyed: userProfile.player_stats.end_island.dragon_fight.ender_crystals_destroyed,
      most_damage: userProfile.player_stats.end_island.dragon_fight.most_damage,
      fastest_kill: userProfile.player_stats.end_island.dragon_fight.fastest_kill,
      kills: dragonKills,
      deaths: dragonDeaths,
    };
  }

  if (
    userProfile.player_stats.kills?.corrupted_protector !== undefined ||
    userProfile.player_stats.deaths?.corrupted_protector !== undefined
  ) {
    misc.endstone_protector = {
      kills: userProfile.player_stats.kills.corrupted_protector ?? 0,
      deaths: userProfile.player_stats.deaths.corrupted_protector ?? 0,
    };
  }

  if ("highest_critical_damage" in userProfile.player_stats) {
    misc.damage = {
      highest_critical_damage: userProfile.player_stats.highest_critical_damage,
    };
  }

  if (userProfile.player_stats.pets?.milestone !== undefined) {
    misc.pet_milestones = {
      sea_creatures_killed: getPetMilestone(
        "sea_creatures_killed",
        userProfile.player_stats.pets.milestone.sea_creatures_killed
      ),
      ores_mined: getPetMilestone("ores_mined", userProfile.player_stats.pets.milestone.ores_mined),
    };
  }

  if ("mythos" in userProfile.player_stats) {
    misc.mythological_event = userProfile.player_stats.mythos;
  }

  if (
    userProfile.player_data.active_effects !== undefined ||
    userProfile.player_data.paused_effects !== undefined ||
    userProfile.player_data.disabled_potion_effects !== undefined
  ) {
    misc.effects = {
      active: userProfile.player_data.active_effects || [],
      paused: userProfile.player_data.paused_effects || [],
      disabled: userProfile.player_data.disabled_potion_effects || [],
    };
  }

  misc.profile_upgrades = getProfileUpgrades(profile);

  if ("auctions" in userProfile.player_stats) {
    misc.auctions = userProfile.player_stats.auctions;
  }

  if (hypixelProfile.claimed_items) {
    misc.claimed_items = hypixelProfile.claimed_items;
  }

  if ("item_data" in userProfile) {
    misc.uncategorized = getMiscUncategorized(userProfile);
  }

  return misc;
}

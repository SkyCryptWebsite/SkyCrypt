// TODO: Full rewrite needed

/*
import { redisClient } from "../redis.js";
import * as helper from "../helper.js";
import * as constants from "../constants.js";
import * as stats from "../stats.js";
import _ from "lodash";

function getMinMax(profiles, min, ...path) {
  let output = null;

  const compareValues = profiles.map((a) => helper.getPath(a, ...path)).filter((a) => !isNaN(a));

  if (compareValues.length == 0) {
    return output;
  }

  if (min) {
    output = Math.min(...compareValues);
  } else {
    output = Math.max(...compareValues);
  }

  if (isNaN(output)) {
    return null;
  }

  return output;
}

function getMax(profiles, ...path) {
  return getMinMax(profiles, false, ...path);
}

function getAllKeys(profiles, ...path) {
  return _.uniq([].concat(...profiles.map((a) => _.keys(helper.getPath(a, ...path)))));
}

async function updateLeaderboardPositions(db, uuid, allProfiles) {
  if (constants.BLOCKED_PLAYERS.includes(uuid)) {
    return;
  }

  const hypixelProfile = await helper.getRank(uuid, db, true);

  const memberProfiles = [];

  for (const singleProfile of allProfiles) {
    const userProfile = singleProfile.members[uuid];

    if (userProfile == null) {
      continue;
    }

    userProfile.levels = await stats.getSkills(userProfile, hypixelProfile);

    let totalSlayerXp = 0;

    userProfile.slayer_xp = 0;

    if (userProfile.slayer_bosses != undefined) {
      for (const slayer in userProfile.slayer_bosses) {
        totalSlayerXp += userProfile.slayer_bosses[slayer].xp || 0;
      }

      userProfile.slayer_xp = totalSlayerXp;

      for (const mountMob in constants.MOB_MOUNTS) {
        const mounts = constants.MOB_MOUNTS[mountMob];

        userProfile.stats[`kills_${mountMob}`] = 0;
        userProfile.stats[`deaths_${mountMob}`] = 0;

        for (const mount of mounts) {
          userProfile.stats[`kills_${mountMob}`] += userProfile.stats[`kills_${mount}`] || 0;
          userProfile.stats[`deaths_${mountMob}`] += userProfile.stats[`deaths_${mount}`] || 0;

          delete userProfile.stats[`kills_${mount}`];
          delete userProfile.stats[`deaths_${mount}`];
        }
      }
    }

    userProfile.skyblock_level = {
      xp: userProfile.leveling?.experience || 0,
      level: Math.floor(userProfile.leveling?.experience / 100 || 0),
    };

    userProfile.pet_score = 0;

    const maxPetRarity = {};
    if (Array.isArray(userProfile.pets)) {
      for (const pet of userProfile.pets) {
        if (!("tier" in pet)) {
          continue;
        }

        maxPetRarity[pet.type] = Math.max(maxPetRarity[pet.type] || 0, constants.PET_VALUE[pet.tier.toLowerCase()]);
      }

      for (const key in maxPetRarity) {
        userProfile.pet_score += maxPetRarity[key];
      }
    }

    memberProfiles.push({
      profile_id: singleProfile.profile_id,
      data: userProfile,
    });
  }

  const values = {};

  values["pet_score"] = getMax(memberProfiles, "data", "pet_score");

  values["fairy_souls"] = getMax(memberProfiles, "data", "fairy_souls_collected");
  values["average_level"] = getMax(memberProfiles, "data", "levels", "average_level");
  values["total_skill_xp"] = getMax(memberProfiles, "data", "levels", "total_skill_xp");

  for (const skill of getAllKeys(memberProfiles, "data", "levels", "levels")) {
    values[`skill_${skill}_xp`] = getMax(memberProfiles, "data", "levels", "levels", skill, "xp");
  }

  values[`skyblock_level_xp`] = getMax(memberProfiles, "data", "skyblock_level", "xp");
  values["slayer_xp"] = getMax(memberProfiles, "data", "slayer_xp");

  for (const slayer of getAllKeys(memberProfiles, "data", "slayer_bosses")) {
    for (const key of getAllKeys(memberProfiles, "data", "slayer_bosses", slayer)) {
      if (!key.startsWith("boss_kills_tier")) {
        continue;
      }

      const tier = key.split("_").pop();

      values[`${slayer}_slayer_boss_kills_tier_${tier}`] = getMax(memberProfiles, "data", "slayer_bosses", slayer, key);
    }

    values[`${slayer}_slayer_xp`] = getMax(memberProfiles, "data", "slayer_bosses", slayer, "xp");
  }

  for (const item of getAllKeys(memberProfiles, "data", "collection")) {
    values[`collection_${item.toLowerCase()}`] = getMax(memberProfiles, "data", "collection", item);
  }

  for (const stat of getAllKeys(memberProfiles, "data", "stats")) {
    values[stat] = getMax(memberProfiles, "data", "stats", stat);
  }

  // Dungeons (Mainly Catacombs now.)
  for (const stat of getAllKeys(memberProfiles, "data", "dungeons", "dungeon_types", "catacombs")) {
    switch (stat) {
      case "best_runs":
      case "highest_tier_completed":
        break;
      case "experience":
        values[`dungeons_catacombs_xp`] = getMax(
          memberProfiles,
          "data",
          "dungeons",
          "dungeon_types",
          "catacombs",
          "experience"
        );
        break;
      default:
        for (const floor of getAllKeys(memberProfiles, "data", "dungeons", "dungeon_types", "catacombs", stat)) {
          const floorId = `catacombs_${floor}`;
          if (!constants.DUNGEONS.floors[floorId] || !constants.DUNGEONS.floors[floorId].name) continue;

          const floorName = constants.DUNGEONS.floors[floorId].name;
          values[`dungeons_catacombs_${floorName}_${stat}`] = getMax(
            memberProfiles,
            "data",
            "dungeons",
            "dungeon_types",
            "catacombs",
            stat,
            floor
          );
        }
    }
  }

  for (const dungeonClass of getAllKeys(memberProfiles, "data", "dungeons", "player_classes")) {
    values[`dungeons_class_${dungeonClass}_xp`] = getMax(
      memberProfiles,
      "data",
      "dungeons",
      "player_classes",
      dungeonClass,
      "experience"
    );
  }

  values[`dungeons_secrets_found`] = hypixelProfile.achievements.skyblock_treasure_hunter || 0;

  const multi = redisClient.pipeline();

  for (const key in values) {
    if (values[key] == null) {
      continue;
    }

    multi.zadd(`lb_${key}`, values[key], uuid);
  }
  for (const singleProfile of allProfiles) {
    if (singleProfile.banking?.balance != undefined) {
      multi.zadd(`lb_bank`, singleProfile.banking.balance, singleProfile.profile_id);
    }

    const minionCrafts = [];

    for (const member in singleProfile.members) {
      if (Array.isArray(singleProfile.members[member].crafted_generators)) {
        minionCrafts.push(...singleProfile.members[member].crafted_generators);
      }
    }

    multi.zadd(`lb_unique_minions`, _.uniq(minionCrafts).length, singleProfile.profile_id);
  }

  try {
    await multi.exec();
  } catch (e) {
    console.error(e);
  }
}
*/

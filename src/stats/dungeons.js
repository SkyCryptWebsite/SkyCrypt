import { getLeaderboardPosition } from "../helper/leaderboards.js";
import { getLevelByXp } from "./skills/leveling.js";
import * as constants from "../constants.js";

function getFloors(type, dungeon) {
  const floors = {};
  for (const key of Object.keys(dungeon)) {
    if (typeof dungeon[key] != "object") {
      continue;
    }

    for (const floor of Object.keys(dungeon[key])) {
      if (!floors[floor]) {
        floors[floor] = {
          name: `floor_${floor}`,
          icon_texture: "908fc34531f652f5be7f27e4b27429986256ac422a8fb59f6d405b5c85c76f7",
          stats: {},
        };
      }

      const id = `${type}_${floor}`;
      if (constants.DUNGEONS.floors[id]) {
        floors[floor].name = constants.DUNGEONS.floors[id].name;

        floors[floor].icon_texture = constants.DUNGEONS.floors[id].texture;
      }

      if (key.startsWith("most_damage")) {
        if (!floors[floor].most_damage || dungeon[key][floor] > floors[floor].most_damage.value) {
          floors[floor].most_damage = {
            class: key.replace("most_damage_", ""),
            value: dungeon[key][floor],
          };
        }
      } else if (key === "best_runs") {
        floors[floor][key] = dungeon[key][floor];
      } else {
        floors[floor].stats[key] = dungeon[key][floor];
      }
    }
  }

  return floors;
}

function getEssence(userProfile) {
  const output = {};
  if (userProfile.currencies === undefined || userProfile.currencies.essence == undefined) {
    return;
  }

  for (const essence in constants.ESSENCE) {
    if (userProfile.currencies.essence[essence.toUpperCase()] == undefined) {
      output[essence] = 0;
      continue;
    }

    output[essence] = userProfile.currencies.essence[essence.toUpperCase()]?.current ?? 0;
  }

  return output;
}

export async function getDungeons(userProfile, hypixelProfile) {
  const dungeons = userProfile.dungeons;
  if (dungeons == null || Object.keys(dungeons).length === 0 || dungeons.dungeon_types == undefined) {
    return;
  }

  const output = {};
  for (const type of Object.keys(dungeons.dungeon_types)) {
    const dungeon = dungeons.dungeon_types[type];
    if (dungeon == null || Object.keys(dungeon).length === 0) {
      output[type] = { visited: false };
      continue;
    }

    const id = `dungeon_${type}`;
    const floors = getFloors(type, dungeon);
    const completions = Object.values(floors).reduce((a, b) => a + (b.stats?.tier_completions ?? 0), 0);
    if (completions === 0) {
      output[type] = { visited: false };
      continue;
    }

    output[type] = {
      id: id,
      visited: true,
      level: getLevelByXp(dungeon.experience, {
        type: "dungeoneering",
        skill: "dungeoneering",
        ignoreCap: true,
        infinite: true,
      }),
      highest_floor: `floor_${dungeon.highest_tier_completed ?? 0}`,
      floors: floors,
      completions: completions,
    };

    output[type].level.rank = await getLeaderboardPosition(`dungeons_${type}_xp`, dungeon.experience);
  }

  output.floor_completions = (output.catacombs?.completions ?? 0) + (output.master_catacombs?.completions ?? 0);

  // Classes
  output.classes = {
    selected_class: dungeons.selected_dungeon_class ?? "none",
    classes: {},
  };

  for (const className of Object.keys(dungeons?.player_classes ?? {})) {
    const data = dungeons.player_classes[className];
    if (isNaN(data.experience) === true) {
      data.experience = 0;
    }

    output.classes.classes[className] = {
      level: getLevelByXp(data.experience, {
        type: "dungeoneering",
        skill: "dungeoneering",
        ignoreCap: true,
        infinite: true,
      }),
      current: false,
    };

    output.classes.classes[className].level.rank = await getLeaderboardPosition(
      `dungeons_class_${className}_xp`,
      data.experience
    );

    output.classes.classes[className].current = className == output.classes.selected_class;
  }

  const classValues = Object.values(output.classes.classes);
  const classLength = classValues.length;

  output.classes.experience = classValues.reduce((a, b) => a + b.level.xp, 0);

  output.classes.average_level = classValues.reduce((a, b) => a + b.level.level, 0) / classLength;

  output.classes.average_level_with_progress =
    classValues.reduce((a, b) => a + b.level.levelWithProgress, 0) / classLength;

  output.classes.maxed = classValues.filter((a) => a.level.level >= 50).length === classLength;

  output.secrets_found = hypixelProfile.achievements.skyblock_treasure_hunter || 0;

  // TODO: Fix this, constants are incorrect and hypixel has completely changed the system
  /*
  // Journal Entries
  const JOURNAL_CONSTANTS = constants.DUNGEONS.journals;
  const journals = {
    pages_collected: 0,
    journals_completed: 0,
    total_pages: 0,
    journal_entries: dungeons.dungeon_journal.unlocked_journals,
  };

  if (dungeons.dungeon_journal.unlocked_journals !== undefined) {
    for (const entryID of dungeons.dungeon_journal.unlocked_journals) {
      journals.journals_completed += 1;
      journals.pages_collected += JOURNAL_CONSTANTS[entryID]?.pages || 0;
    }
  }

  for (const journal in JOURNAL_CONSTANTS) {
    journals.total_pages += JOURNAL_CONSTANTS[journal].pages;
  }

  output.journals = journals;
  */

  output.essence = getEssence(userProfile);

  return output;
}

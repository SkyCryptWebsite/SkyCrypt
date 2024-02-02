import * as constants from "../constants.js";

function getSlayerLevel(slayer, slayerName) {
  // eslint-disable-next-line
  const { xp = 0, claimed_levels } = slayer;

  if (constants.SLAYER_XP[slayerName] === undefined) {
    return {
      currentLevel: 0,
      xp: 0,
      maxLevel: 0,
      progress: 0,
      xpForNext: 0,
      unclaimed: false,
    };
  }

  let currentLevel = 0;
  let progress = 0;
  let xpForNext = 0;
  let unclaimed = false;

  const maxLevel = Object.keys(constants.SLAYER_XP[slayerName]).length;
  for (const levelName in claimed_levels) {
    // Ignoring legacy levels for zombie
    if (slayerName === "zombie" && ["level_7", "level_8", "level_9"].includes(levelName)) {
      continue;
    }

    const level = parseInt(levelName.split("_")[1]);

    if (level > currentLevel) {
      currentLevel = level;
    }
  }

  if (currentLevel < maxLevel) {
    const nextLevel = constants.SLAYER_XP[slayerName][currentLevel + 1];

    progress = xp / nextLevel;
    xpForNext = nextLevel;
  } else {
    progress = 1;
  }

  if (progress >= 1 && currentLevel < maxLevel) {
    unclaimed = true;
  }

  return { currentLevel, xp, maxLevel, progress, xpForNext, unclaimed };
}

export function getSlayer(userProfile) {
  if (userProfile.slayer === undefined || "slayer_bosses" in userProfile.slayer === false) {
    return;
  }

  const output = { slayers: {} };
  for (const slayerName in userProfile.slayer.slayer_bosses) {
    const slayer = userProfile.slayer.slayer_bosses[slayerName];
    if ("claimed_levels" in slayer === false) {
      continue;
    }

    output.slayers[slayerName] = {
      level: getSlayerLevel(slayer, slayerName),
      coins_spent: 0,
      kills: {},
    };

    for (const property in slayer) {
      if (property.startsWith("boss_kills_tier_")) {
        const tier = parseInt(property.split("_").at(-1)) + 1;

        output.slayers[slayerName].kills[tier] = slayer[property];

        output.slayers[slayerName].coins_spent += slayer[property] * constants.SLAYER_COST[tier];
      }
    }

    output.slayers[slayerName].kills.total ??= Object.values(output.slayers[slayerName].kills).reduce(
      (a, b) => a + b,
      0,
    );

    Object.assign(output.slayers[slayerName], constants.SLAYER_INFO[slayerName]);
  }

  output.total_slayer_xp = Object.values(output.slayers).reduce((a, b) => a + b.level.xp, 0);
  output.total_coins_spent = Object.values(output.slayers).reduce((a, b) => a + b.coins_spent, 0);

  return output;
}

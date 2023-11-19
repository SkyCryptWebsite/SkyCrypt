import * as constants from "../../constants.js";

/**
 * gets the xp table for the given type
 * @param {string} type
 * @returns {{[key: number]: number}}
 */
function getXpTable(type) {
  switch (type) {
    case "runecrafting":
      return constants.RUNECRAFTING_XP;
    case "social":
      return constants.SOCIAL_XP;
    case "dungeoneering":
      return constants.DUNGEONEERING_XP;
    case "hotm":
      return constants.HOTM_XP;
    case "skyblock_level":
      return constants.SKYBLOCK_XP;
    default:
      return constants.LEVELING_XP;
  }
}

/**
 * estimates the xp based on the level
 * @param {number} uncappedLevel
 * @param {{type?: string, cap?: number, skill?: string}} extra
 * @param type the type of levels (used to determine which xp table to use)
 * @param cap override the cap highest level the player can reach
 * @param skill the key of default_skill_caps
 */
export function getXpByLevel(uncappedLevel, extra = {}) {
  const xpTable = getXpTable(extra.type);

  if (typeof uncappedLevel !== "number" || isNaN(uncappedLevel)) {
    uncappedLevel = 0;
  }

  /** the level that this player is caped at */
  const levelCap =
    extra.cap ??
    Math.max(uncappedLevel, constants.DEFAULT_SKILL_CAPS[extra.skill]) ??
    Math.max(...Object.keys(xpTable).map((a) => Number(a)));

  /** the maximum level that any player can achieve (used for gold progress bars) */
  const maxLevel = constants.MAXED_SKILL_CAPS[extra.skill] ?? levelCap;

  /** the amount of xp over the amount required for the level (used for calculation progress to next level) */
  const xpCurrent = 0;

  /** the sum of all levels including level */
  let xp = 0;

  for (let x = 1; x <= uncappedLevel; x++) {
    xp += xpTable[x];
  }

  /** the level as displayed by in game UI */
  const level = Math.min(levelCap, uncappedLevel);

  /** the amount amount of xp needed to reach the next level (used for calculation progress to next level) */
  const xpForNext = level < maxLevel ? Math.ceil(xpTable[level + 1]) : Infinity;

  /** the fraction of the way toward the next level */
  const progress = level < maxLevel ? 0.05 : 0;

  /** a floating point value representing the current level for example if you are half way to level 5 it would be 4.5 */
  const levelWithProgress = level + progress;

  return {
    xp,
    level,
    maxLevel,
    xpCurrent,
    xpForNext,
    progress,
    levelCap,
    uncappedLevel,
    levelWithProgress,
  };
}

/**
 * gets the level and some other information from an xp amount
 * @param {number} xp
 * @param {{type?: string, cap?: number, skill?: string, ignoreCap?: boolean, infinite?: boolean }} extra
 * @param type the type of levels (used to determine which xp table to use)
 * @param cap override the cap highest level the player can reach
 * @param skill the id of the skill (used to determine the default cap)
 * @param ignoreCap whether to ignore the in-game cap or not
 * @param infinite repeats the last level's experience requirement infinitely
 * @param skill the key of default_skill_caps
 */
export function getLevelByXp(xp, extra = {}) {
  const xpTable = getXpTable(extra.type);

  if (typeof xp !== "number" || isNaN(xp)) {
    xp = 0;
  }

  /** the level that this player is caped at */
  const levelCap =
    extra.cap ?? constants.DEFAULT_SKILL_CAPS[extra.skill] ?? Math.max(...Object.keys(xpTable).map(Number));

  /** the level ignoring the cap and using only the table */
  let uncappedLevel = 0;

  /** the amount of xp over the amount required for the level (used for calculation progress to next level) */
  let xpCurrent = xp;

  /** like xpCurrent but ignores cap */
  let xpRemaining = xp;

  while (xpTable[uncappedLevel + 1] <= xpRemaining) {
    uncappedLevel++;
    xpRemaining -= xpTable[uncappedLevel];
    if (uncappedLevel <= levelCap) {
      xpCurrent = xpRemaining;
    }
  }

  /** adds support for infinite leveling (dungeoneering and skyblock level) */
  if (extra.infinite) {
    const maxExperience = Object.values(xpTable).at(-1);

    uncappedLevel += Math.floor(xpRemaining / maxExperience);
    xpRemaining %= maxExperience;
    xpCurrent = xpRemaining;
  }

  /** the maximum level that any player can achieve (used for gold progress bars) */
  const maxLevel =
    extra.ignoreCap && uncappedLevel >= levelCap ? uncappedLevel : constants.MAXED_SKILL_CAPS[extra.skill] ?? levelCap;

  /** the maximum amount of experience that any player can acheive (used for skyblock level gold progress bar) */
  const maxExperience = constants.MAXED_SKILL_XP[extra.skill];

  // not sure why this is floored but I'm leaving it in for now
  xpCurrent = Math.floor(xpCurrent);

  /** the level as displayed by in game UI */
  const level = extra.ignoreCap ? uncappedLevel : Math.min(levelCap, uncappedLevel);

  /** the amount amount of xp needed to reach the next level (used for calculation progress to next level) */
  const xpForNext =
    level < maxLevel ? Math.ceil(xpTable[level + 1] ?? Object.values(xpTable).at(-1)) : maxExperience ?? Infinity;

  /** the fraction of the way toward the next level */
  const progress = level >= maxLevel ? (extra.ignoreCap ? 1 : 0) : Math.max(0, Math.min(xpCurrent / xpForNext, 1));

  /** a floating point value representing the current level for example if you are half way to level 5 it would be 4.5 */
  const levelWithProgress = level + progress;

  /** a floating point value representing the current level ignoring the in-game unlockable caps for example if you are half way to level 5 it would be 4.5 */
  const unlockableLevelWithProgress = extra.cap ? Math.min(uncappedLevel + progress, maxLevel) : levelWithProgress;

  return {
    xp,
    level,
    maxLevel,
    xpCurrent,
    maxExperience,
    xpForNext,
    progress,
    levelCap,
    uncappedLevel,
    levelWithProgress,
    unlockableLevelWithProgress,
  };
}

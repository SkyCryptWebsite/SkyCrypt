// Weight Calculation by Senither (https://github.com/Senither/)

const level50SkillExp = 55172425;
const level60SkillExp = 111672425;

// Skill Weight
const skillWeight = {
  // Maxes out mining at 1,750 points at 60.
  mining: {
    exponent: 1.18207448,
    divider: 259634,
    maxLevel: 60,
  },
  // Maxes out foraging at 850 points at level 50.
  foraging: {
    exponent: 1.232826,
    divider: 259634,
    maxLevel: 50,
  },
  // Maxes out enchanting at 450 points at level 60.
  enchanting: {
    exponent: 0.96976583,
    divider: 882758,
    maxLevel: 60,
  },
  // Maxes out farming at 2,200 points at level 60.
  farming: {
    exponent: 1.217848139,
    divider: 220689,
    maxLevel: 60,
  },
  // Maxes out combat at 1,500 points at level 60.
  combat: {
    exponent: 1.15797687265,
    divider: 275862,
    maxLevel: 60,
  },
  // Maxes out fishing at 2,500 points at level 50.
  fishing: {
    exponent: 1.406418,
    divider: 88274,
    maxLevel: 50,
  },
  // Maxes out alchemy at 200 points at level 50.
  alchemy: {
    exponent: 1.0,
    divider: 1103448,
    maxLevel: 50,
  },
  // Maxes out taming at 500 points at level 50.
  taming: {
    exponent: 1.14744,
    divider: 441379,
    maxLevel: 50,
  },
  // Sets up carpentry and runecrafting without any weight components.
  carpentry: {
    maxLevel: 50,
  },
  runecrafting: {
    maxLevel: 25,
  },
  social: {
    maxLevel: 25,
  },
};

/**
 * Calculates the weight of a skill based on its skill group, level, and experience.
 *
 * @param {Object} skillGroup - The skill group object containing exponent, divider, and maxLevel properties.
 * @param {number} level - The level of the skill.
 * @param {number} experience - The experience of the skill.
 * @returns {{ weight: number, weight_overflow: number }} The weight and overflow weight of the skill.
 */
function calcSkillWeight(skillGroup, level, experience) {
  if (!skillGroup.exponent || !skillGroup.divider || !level) {
    return { weight: 0, weight_overflow: 0 };
  }

  const maxSkillLevelXP = skillGroup.maxLevel === 60 ? level60SkillExp : level50SkillExp;

  let base = Math.pow(level * 10, 0.5 + skillGroup.exponent + level / 100) / 1250;
  base = experience > maxSkillLevelXP ? Math.round(base) : base;

  return {
    weight: base,
    weight_overflow:
      experience <= maxSkillLevelXP ? 0 : Math.pow((experience - maxSkillLevelXP) / skillGroup.divider, 0.968),
  };
}

// Dungeons Weight
const dungeonsWeight = {
  catacombs: 0.0002149604615,
  healer: 0.0000045254834,
  mage: 0.0000045254834,
  berserk: 0.0000045254834,
  archer: 0.0000045254834,
  tank: 0.0000045254834,
};

/**
 * Calculates the weight and weight overflow of a dungeon type based on the level and experience.
 * @param {string} type - The type of dungeon.
 * @param {number} level - The level of the dungeon.
 * @param {number} experience - The experience of the dungeon.
 * @returns {{weight: number, weight_overflow: number}} - The weight and weight overflow of the dungeon type.
 */
function calcDungeonsWeight(type, level, experience) {
  if (type.startsWith("master_")) {
    return { weight: 0, weight_overflow: 0 };
  }

  const percentageModifier = dungeonsWeight[type];
  const level50Experience = 569809640;
  const base = Math.pow(level, 4.5) * percentageModifier;

  if (experience <= level50Experience) {
    return { weight: base, weight_overflow: 0 };
  }

  const remaining = experience - level50Experience;
  const splitter = (4 * level50Experience) / base;

  return {
    weight: Math.floor(base),
    weight_overflow: Math.pow(remaining / splitter, 0.968),
    total_weight: Math.floor(base) + Math.pow(remaining / splitter, 0.968),
  };
}

// Slayer Weight
const slayerWeight = {
  zombie: {
    divider: 2208,
    modifier: 0.15,
  },
  spider: {
    divider: 2118,
    modifier: 0.08,
  },
  wolf: {
    divider: 1962,
    modifier: 0.015,
  },
  enderman: {
    divider: 1430,
    modifier: 0.017,
  },
};

/**
 * Calculates the weight of a slayer type based on the experience gained.
 * @param {string} type - The type of slayer.
 * @param {number} experience - The amount of experience gained.
 * @returns {{ weight: number, weight_overflow: number }} The weight and overflow weight of the slayer.
 */
function calcSlayerWeight(type, experience) {
  const sw = slayerWeight[type];

  if (!sw) {
    return { weight: 0, weight_overflow: 0 };
  }

  if (!experience || experience <= 1000000) {
    return { weight: experience ? experience / sw.divider : 0, weight_overflow: 0 };
  }

  const base = 1000000 / sw.divider;
  let remaining = experience - 1000000;
  let modifier = sw.modifier;
  let overflow = 0;

  while (remaining > 0) {
    const left = Math.min(remaining, 1000000);
    overflow += Math.pow(left / (sw.divider * (1.5 + modifier)), 0.942);
    modifier += sw.modifier;
    remaining -= left;
  }

  return { weight: base, weight_overflow: overflow };
}

export function calculateSenitherWeight(profile) {
  const output = {
    overall: 0,
    dungeon: {
      total: 0,
      dungeons: {},
      classes: {},
    },
    skill: {
      total: 0,
      skills: {},
    },
    slayer: {
      total: 0,
      slayers: {},
    },
  };

  // skill
  for (const skill in profile.skills.skills) {
    const skillData = profile.skills.skills[skill];

    const sw = calcSkillWeight(skillWeight[skill], skillData.unlockableLevelWithProgress, skillData.xp);

    output.skill.skills[skill] = {
      weight: sw.weight,
      overflow_weight: sw.weight_overflow,
      total_weight: sw.weight + sw.weight_overflow,
    };

    output.skill.total += output.skill.skills[skill].total_weight;
  }

  // dungeon weight
  const dungeons = profile.dungeons;

  if (dungeons?.catacombs?.visited) {
    const xp = dungeons.catacombs.level;
    const dungeonLevelWithProgress = Math.min(xp.levelWithProgress, 50);

    const dungeonsWeight = calcDungeonsWeight("catacombs", dungeonLevelWithProgress, xp.xp);
    output.dungeon.total += dungeonsWeight.weight + dungeonsWeight.weight_overflow ?? 0;
    output.dungeon.dungeons.catacombs = dungeonsWeight;
  }

  // dungeon classes
  if (dungeons?.classes?.classes) {
    for (const className of Object.keys(dungeons.classes.classes)) {
      const dungeonClass = dungeons.classes.classes[className];
      const xp = dungeonClass.level;

      const levelWithProgress = xp.levelWithProgress;

      const classWeight = calcDungeonsWeight(className, levelWithProgress, xp.xp);

      output.dungeon.classes[className] = classWeight;

      output.dungeon.total += classWeight.weight + classWeight.weight_overflow ?? 0;
    }
  }

  // slayer
  for (const slayerName in profile.slayer?.slayers) {
    const slayer = profile.slayer.slayers[slayerName];

    const sw = calcSlayerWeight(slayerName, slayer.level.xp);

    output.slayer.slayers[slayerName] = {
      weight: sw.weight,
      overflow_weight: sw.weight_overflow,
      total_weight: sw.weight + sw.weight_overflow,
    };

    output.slayer.total += output.slayer.slayers[slayerName].total_weight;
  }

  output.overall = [output.dungeon.total, output.skill.total, output.slayer.total]
    .filter((x) => x >= 0)
    .reduce((total, value) => total + value);

  return output;
}

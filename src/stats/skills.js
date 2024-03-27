import { getLeaderboardPosition } from ".././helper/leaderboards.js";
import { getXpByLevel, getLevelByXp } from "./skills/leveling.js";
import * as constants from "../constants.js";

async function getLevels(userProfile, profileMembers, hypixelProfile, levelCaps) {
  const skillLevels = {};
  if (userProfile?.player_data && ("experience" in userProfile.player_data ?? {})) {
    const SKILL = userProfile.player_data.experience;

    const socialExperience = Object.keys(profileMembers).reduce((a, b) => {
      return a + (profileMembers[b].player_data?.experience?.SKILL_SOCIAL ?? 0);
    }, 0);

    Object.assign(skillLevels, {
      taming: getLevelByXp(SKILL.SKILL_TAMING, {skill: "taming", cap: levelCaps.taming }),
      farming: getLevelByXp(SKILL.SKILL_FARMING, { skill: "farming", cap: levelCaps.farming }),
      mining: getLevelByXp(SKILL.SKILL_MINING, { skill: "mining" }),
      combat: getLevelByXp(SKILL.SKILL_COMBAT, { skill: "combat" }),
      foraging: getLevelByXp(SKILL.SKILL_FORAGING, { skill: "foraging" }),
      fishing: getLevelByXp(SKILL.SKILL_FISHING, { skill: "fishing" }),
      enchanting: getLevelByXp(SKILL.SKILL_ENCHANTING, { skill: "enchanting" }),
      alchemy: getLevelByXp(SKILL.SKILL_ALCHEMY, { skill: "alchemy" }),
      carpentry: getLevelByXp(SKILL.SKILL_CARPENTRY, { skill: "carpentry" }),
      runecrafting: getLevelByXp(SKILL.SKILL_RUNECRAFTING, { type: "runecrafting", cap: levelCaps.runecrafting }),
      social: getLevelByXp(socialExperience, { type: "social" }),
    });
  } else {
    const achievementSkills = {
      farming: hypixelProfile.achievements.skyblock_harvester || 0,
      mining: hypixelProfile.achievements.skyblock_excavator || 0,
      combat: hypixelProfile.achievements.skyblock_combat || 0,
      foraging: hypixelProfile.achievements.skyblock_gatherer || 0,
      fishing: hypixelProfile.achievements.skyblock_angler || 0,
      enchanting: hypixelProfile.achievements.skyblock_augmentation || 0,
      alchemy: hypixelProfile.achievements.skyblock_concoctor || 0,
      taming: hypixelProfile.achievements.skyblock_domesticator || 0,
      carpentry: 0,
    };

    for (const skill in achievementSkills) {
      skillLevels[skill] = getXpByLevel(achievementSkills[skill], { skill: skill });
    }
  }

  const totalSkillXp = Object.keys(skillLevels)
    .filter((skill) => constants.COSMETIC_SKILLS.includes(skill) === false)
    .reduce((total, skill) => total + skillLevels[skill].xp, 0);

  const nonCosmeticSkills = Math.max(Object.keys(skillLevels).length - constants.COSMETIC_SKILLS.length, 9);

  const averageSkillLevel =
    Object.keys(skillLevels)
      .filter((skill) => constants.COSMETIC_SKILLS.includes(skill) === false)
      .reduce((total, skill) => total + skillLevels[skill].level + skillLevels[skill].progress, 0) / nonCosmeticSkills;

  const averageSkillLevelWithoutProgress =
    Object.keys(skillLevels)
      .filter((skill) => constants.COSMETIC_SKILLS.includes(skill) === false)
      .reduce((total, skill) => total + skillLevels[skill].level, 0) / nonCosmeticSkills;

  for (const skill in skillLevels) {
    skillLevels[skill].rank = await getLeaderboardPosition(`skill_${skill}_xp`, skillLevels[skill].xp);
  }

  return {
    skills: skillLevels,
    averageSkillLevel,
    averageSkillLevelWithoutProgress,
    totalSkillXp,
  };
}

export async function getSkills(userProfile, hypixelProfile, profileMembers) {
  const levelCaps = {
    farming: constants.DEFAULT_SKILL_CAPS.farming + (userProfile.jacobs_contest?.perks?.farming_level_cap ?? 0),
    carpentry: hypixelProfile.rankText
      ? constants.DEFAULT_SKILL_CAPS.runecrafting
          : constants.NON_RUNECRAFTING_LEVEL_CAP,
    taming: Math.max(hypixelProfile.achievements.skyblock_domesticator, 50),
  };

  return await getLevels(userProfile, profileMembers, hypixelProfile, levelCaps);
}

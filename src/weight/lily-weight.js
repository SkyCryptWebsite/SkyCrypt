import LilyWeight from "lilyweight";

const skillOrder = ["enchanting", "taming", "alchemy", "mining", "farming", "foraging", "combat", "fishing"];
const slayerOrder = ["zombie", "spider", "wolf", "enderman"];

/**
 * converts a dungeon floor into a completion map
 * @param {{[key:string]:{stats:{tier_completions:number}}}} floors
 * @returns {{[key:string]:number}}
 */
function getTierCompletions(floors = {}) {
  return Object.fromEntries(Object.entries(floors).map(([key, value]) => [key, value.stats.tier_completions ?? 0]));
}

export function calculateLilyWeight(profile) {
  const skillLevels = skillOrder.map((key) => profile.levels[key].uncappedLevel);
  const skillXP = skillOrder.map((key) => profile.levels[key].xp);

  const cataCompletions = getTierCompletions(profile.dungeons?.catacombs?.floors ?? {});
  const masterCataCompletions = getTierCompletions(profile.dungeons?.master_catacombs?.floors ?? {});
  const cataXP = profile.dungeons?.catacombs?.level?.xp ?? 0;

  const slayerXP = slayerOrder.map((key) => profile.slayers?.[key]?.level?.xp ?? 0);

  // todo: remove this when lilyweight updates, fixing M7 breaking the completions weight
  delete masterCataCompletions["7"];

  return LilyWeight.getWeightRaw(skillLevels, skillXP, cataCompletions, masterCataCompletions, cataXP, slayerXP);
}

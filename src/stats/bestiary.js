import * as constants from "../constants.js";

function formatBestiaryMobs(userProfile, mobs) {
  const output = [];
  for (const mob of mobs) {
    const mobBracket = constants.BESTIARY_BRACKETS[mob.bracket];

    const totalKills = mob.mobs.reduce((acc, cur) => {
      return acc + (userProfile.bestiary.kills[cur] ?? 0);
    }, 0);

    const maxKills = mob.cap;
    const nextTierKills = mobBracket.find((tier) => totalKills < tier && tier <= maxKills);
    const tier = nextTierKills ? mobBracket.indexOf(nextTierKills) : mobBracket.indexOf(maxKills) + 1;

    output.push({
      name: mob.name,
      texture: mob.texture,
      kills: totalKills,
      nextTierKills: nextTierKills ?? null,
      maxKills: maxKills,
      tier: tier,
      maxTier: mobBracket.indexOf(maxKills) + 1,
    });
  }

  return output;
}

export function getBestiary(userProfile) {
  if (userProfile.bestiary?.kills === undefined) {
    return;
  }

  const output = {};
  for (const [category, data] of Object.entries(constants.BESTIARY)) {
    output[category] = {
      name: data.name,
      texture: data.texture,
      mobs: formatBestiaryMobs(userProfile, data.mobs),
    };

    output[category].mobsUnlocked = output[category].mobs.length;
    output[category].mobsMaxed = output[category].mobs.filter((mob) => mob.tier === mob.maxTier).length;
  }

  const mobs = Object.values(output).flatMap((category) => Object.values(category.mobs));

  const maxMilestone = mobs.map((mob) => mob.maxTier).reduce((acc, cur) => acc + cur, 0);
  const milestone = mobs.map((mob) => mob.tier).reduce((acc, cur) => acc + cur, 0);
  const familiesMaxed = mobs.filter((mob) => mob.tier === mob.maxTier).length;
  const familiesUnlocked = mobs.filter((mob) => mob.kills > 0).length;
  const totalFamilies = mobs.length;

  return {
    categories: output,
    milestone,
    maxMilestone,
    familiesUnlocked,
    totalFamilies,
    familiesMaxed,
  };
}

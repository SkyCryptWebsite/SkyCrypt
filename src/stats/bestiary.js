import * as constants from "../constants.js";

/**
 * Returns a Bestiary object containing information about a player's bestiary progress.
 *
 * @param {string} uuid - The UUID of the player to get the Bestiary for.
 * @param {object} profile - The player's SkyBlock profile object.
 * @returns {object} The Bestiary object.
 * @property {object} categories - An object containing information about each bestiary category.
 * @property {object} categories.island - An object containing information about the bestiary mobs on the given island.
 * @property {string} categories.island.name - The name of the island.
 * @property {string} categories.island.texture - The texture of the island.
 * @property {object} categories.island.mobs - An object containing information about each bestiary mob on the given island.
 * @property {string} categories.island.mobs.ID - The ID of the mob.
 * @property {string} categories.island.mobs.name - The name of the mob.
 * @property {string} categories.island.mobs.texture - The texture of the mob.
 * @property {string} categories.island.mobs.itemId - The ID of the item for mob texture.
 * @property {number} categories.island.mobs.damage - The damage of item for mob texture.
 * @property {number} categories.island.mobs.tier - The tier of the mob in the bestiary.
 * @property {number} categories.island.mobs.maxTier - The maximum tier of the mob in the bestiary.
 * @property {number} categories.island.mobs.kills - The number of kills of the mob in the bestiary.
 * @property {number} categories.island.mobs.currentTier - The number of kills required to reach the current tier of the mob in the bestiary.
 * @property {number} categories.island.mobs.nextTier - The number of kills required to reach the next tier of the mob in the bestiary.
 * @property {number} categories.island.maxedAmount - The number of mobs on the island that are maxed out in the bestiary.
 * @property {number} categories.island.totalAmount - The total number of mobs on the island in the bestiary.
 * @property {boolean} categories.island.maxed - Whether all of the mobs on the island are maxed out in the bestiary.
 * @property {number} tiers - The total number of unlocked bestiary tiers for the player.
 * @property {number} maxTiers - The total number of possible bestiary tiers for the player.
 * @property {number} level - The current bestiary level of the player.
 * @property {number} bonus - The health bonus from bestiary level.
 */

export function getBestiary(userProfile) {
  if (userProfile.bestiary === undefined) {
    return {};
  }

  const bestiaryFamilies = Object.entries(userProfile.bestiary)
    .filter(([name]) => name.startsWith("kills_family_"))
    .reduce((families, [name, value]) => ({ ...families, [name.substring(13)]: value }), {});

  const output = {
    categories: Object.entries(constants.BESTIARY).reduce(
      (categories, [island, { name, texture, mobs }]) => ({
        ...categories,
        [island]: {
          name,
          texture,
          mobs: mobs
            .map(({ id, ...mob }) => {
              const ID = id.substring(13);
              const kills = bestiaryFamilies[ID] || 0;
              const boss = mob.boss ? "boss" : "regular";
              const maxTier = mob.maxTier ?? 41;
              const tier = Math.min(constants.BESTIARY_KILLS[boss].filter((k) => k <= kills).length, maxTier);
              const currentTier = constants.BESTIARY_KILLS[boss][tier - 1];
              const nextTier = constants.BESTIARY_KILLS[boss][tier] || 0;
              return { ...mob, name: mob.name, kills, tier, maxTier, currentTier, nextTier, id: ID };
            })
            .reduce((mobMap, mob) => ({ ...mobMap, [mob.id]: mob }), {}),
          maxedAmount: 0,
          totalAmount: mobs.length,
          maxed: false,
        },
      }),
      {}
    ),
  };

  Object.values(output.categories).forEach((category) => {
    category.maxedAmount = Object.values(category.mobs).filter((mob) => mob.tier >= mob.maxTier).length;
    category.maxed = category.maxedAmount === category.totalAmount;
  });

  const unlockedBestiaryTiers = Object.values(output.categories)
    .flatMap((category) => Object.values(category.mobs))
    .reduce((acc, mob) => acc + mob.tier, 0);
  const totalBestiaryTiers = Object.values(constants.BESTIARY)
    .flatMap((category) => category.mobs)
    .reduce((acc, mob) => acc + (mob.maxTier || 41), 0);

  return {
    ...output,
    tiers: unlockedBestiaryTiers,
    maxTiers: totalBestiaryTiers,
    level: unlockedBestiaryTiers / 10,
    bonus: Math.floor(unlockedBestiaryTiers / 5),
  };
}

import * as constants from "../constants.js";

/**
 * @typedef {Object} Mob
 * @property {string} name - The name of the mob.
 * @property {string} texture - The texture of the mob.
 * @property {number} itemId - The itemId of the mob item texture.
 * @property {number} damage - The damage of an mob's item texture.
 * @property {number} kills - The kills of the mob.
 * @property {number} tier - The tier of the mob.
 * @property {number} maxTier - The maximum tier of the mob.
 * @property {number} currentTier - The current tier of the mob.
 * @property {number} nextTier - The next tier of the mob.
 * @property {string} id - The id of the mob.
 */

/**
 * @typedef {Object} Category
 * @property {string} name - The name of the category.
 * @property {string} texture - The texture of the category.
 * @property {Mob[]} mobs - The mobs in the category.
 * @property {number} maxedAmount - The maximum amount of the category that can be maxed.
 * @property {number} totalAmount - The total amount of the category.
 * @property {boolean} maxed - Whether the category is maxed or not.
 */

/**
 * @typedef {Object} Bestiary
 * @property {Object.<string, Category>} categories - The categories.
 * @property {number} tiers - Amount of tiers unlocked by player.
 * @property {number} maxTiers - The maximum amount of tiers.
 * @property {number} maxedAmount - The maximum amount of the mob that can be maxed.
 * @property {number} totalAmount - The total amount of the mob player has maxed.
 * @property {number} level - The level.
 * @property {number} bonus - The bonus.
 */

/**
 * Returns a Bestiary object containing information about a player's bestiary progress.
 *
 * @param {string} uuid - The UUID of the player to get the Bestiary for.
 * @returns {Bestiary} - The Bestiary object.
 */

export function getBestiary(userProfile) {
  try {
    if (userProfile.bestiary === undefined) {
      return null;
    }

    const bestiaryFamilies = Object.entries(userProfile.bestiary)
      .filter(([name]) => name.startsWith("kills_family_"))
      .reduce((families, [name, value]) => ({ ...families, [name]: value }), {});

    const output = {};
    for (const category in constants.BESTIARY) {
      const { name, texture } = constants.BESTIARY[category];
      for (const mob of constants.BESTIARY[category].mobs) {
        const boss = mob.boss ? "boss" : "regular";
        const mobName = mob.name;

        const maxTier = mob.maxTier ?? 41;
        const kills = bestiaryFamilies[mob.id] ?? 0;
        const tier = Math.min(constants.BESTIARY_KILLS[boss].filter((k) => k <= kills).length, maxTier);
        const nextTier = constants.BESTIARY_KILLS[boss][tier];
        const maxed = tier >= maxTier;

        output[category] ??= {
          name,
          texture,
          mobs: [],
        };
        output[category].mobs.push({
          name: mobName,
          texture: mob.texture,
          itemId: mob.itemId,
          damage: mob.damage,
          boss,
          kills,
          tier,
          maxTier,
          currentTier: tier,
          nextTier,
          maxed,
        });
      }

      output[category].maxedAmount = output[category].mobs.filter((mob) => mob.maxed).length;
      output[category].totalAmount = output[category].mobs.length;
      output[category].maxed = output[category].maxedAmount === output[category].totalAmount;
    }

    const tiers = Object.values(output)
      .map((category) => category.mobs.map((mob) => mob.tier))
      .flat()
      .reduce((a, b) => a + b, 0);

    const maxTiers = Object.values(output)
      .map((category) => category.mobs.map((mob) => mob.maxTier))
      .flat()
      .reduce((a, b) => a + b, 0);

    const unlockedBestiaries = Object.values(output)
      .map((category) => category.mobs.filter((mob) => mob.maxed).length)
      .reduce((a, b) => a + b, 0);
    const totalBestiaries = Object.values(output)
      .map((category) => category.mobs.length)
      .reduce((a, b) => a + b, 0);

    return {
      categories: output,
      tiers: unlockedBestiaries,
      maxTiers: totalBestiaries,
      level: tiers / 10,
      maxLevel: maxTiers / 10,
      bonus: Math.floor(tiers / 5),
    };
  } catch (error) {
    console.log(error);
    return null;
  }
}

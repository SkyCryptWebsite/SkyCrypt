import * as constants from "../constants.js";
import * as helper from "../helper.js";
import { db } from "../mongo.js";

/**
 * Retrieves the collection data for a given player UUID.
 *
 * @async
 * @function
 * @param {string} uuid - The UUID of the player to retrieve collection data for.
 * @param {Object} profile - The player's profile object.
 * @param {boolean} [cacheOnly=false] - Whether to only use cached data.
 * @returns {Promise<{[key: string]: {
 *   name: string,
 *   id: string,
 *   texture: string,
 *   amount: number,
 *   totalAmount: number,
 *   tier: number,
 *   maxTier: number,
 *   amounts: {username: string, amount: number}[],
 * }[]}>} An object containing the player's collection data, with each collection's data organized by its ID.
 */
export async function getCollections(uuid, profile, calculated, cacheOnly = false) {
  const output = {};

  const userProfile = profile.members[uuid];
  if (
    (userProfile?.player_data && !("unlocked_coll_tiers" in (userProfile?.player_data ?? {}))) ||
    !("collection" in userProfile)
  ) {
    return;
  }

  const members = (
    await Promise.all(Object.keys(profile.members).map((a) => helper.resolveUsernameOrUuid(a, db, cacheOnly)))
  ).reduce((acc, a) => ((acc[a.uuid] = a.display_name), acc), {});

  const { collections: collectionData } = await db.collection("collections").findOne({ _id: "collections" });
  for (const [categoryId, categoryData] of Object.entries(collectionData)) {
    const category = categoryId.toLowerCase();
    output[category] ??= {
      name: categoryData.name,
      collections: [],
    };

    for (const collection of categoryData.items) {
      const { id, maxTier, name, texture } = collection;

      const amount = userProfile.collection[id] || 0;

      const amounts = Object.keys(profile.members).map((uuid) => {
        return {
          username: members[uuid],
          amount: (profile.members[uuid].collection && profile.members[uuid].collection[id]) ?? 0,
        };
      });

      const totalAmount = amounts.reduce((a, b) => a + b.amount, 0);

      const tier = collection.tiers.findLast((a) => a.amountRequired <= totalAmount)?.tier ?? 0;

      output[category].collections.push({
        name,
        id: id,
        texture,
        amount,
        totalAmount,
        tier,
        maxTier,
        amounts,
      });
    }

    output[category].totalTiers = output[category].collections.length;

    output[category].maxTiers = output[category].collections.filter((a) => a.tier === a.maxTier).length;
  }

  const dungeons = calculated.dungeons ?? {};
  const kuudra = calculated.crimson_isle?.kuudra ?? {};
  const bossCollections = getBossCollections(dungeons, kuudra);
  output["BOSS"] = {
    name: "Boss Collections",
    collections: bossCollections,
    totalTiers: bossCollections.length,
    maxTiers: bossCollections.filter((a) => a.tier === a.maxTier).length,
  };

  output.totalCollections = Object.values(output).reduce((a, b) => a + b.collections.length, 0);

  output.maxedCollections = Object.values(output)
    .map((a) => a.collections)
    .flat()
    .filter((a) => a && a.tier === a.maxTier).length;

  return output;
}

function getBossCollections(dungeons, kuudra) {
  const output = [];
  if (dungeons?.catacombs?.floors === undefined) {
    return output;
  }

  const bossCompletions = {};
  for (const [floor, data] of Object.entries(dungeons.catacombs.floors)) {
    bossCompletions[floor] ??= 0;
    bossCompletions[floor] += data.stats.tier_completions ?? 0;
  }

  if (dungeons.master_catacombs?.floors) {
    for (const [floor, data] of Object.entries(dungeons.master_catacombs.floors)) {
      bossCompletions[floor] ??= 0;
      bossCompletions[floor] += (data.stats.tier_completions ?? 0) * 2;
    }
  }

  for (const collection of constants.BOSS_COLLECTIONS) {
    const index = constants.BOSS_COLLECTIONS.indexOf(collection) + 1;

    const { name, texture } = collection;

    let amount = bossCompletions[index] ?? 0;
    if (name === "Kuudra" && kuudra.tiers !== undefined) {
      amount = Object.values(kuudra.tiers).reduce((a, b, index) => {
        return a + (index + 1) * b.completions;
      }, 0);
    }

    const maxAmount = collection.rewards[collection.rewards.length - 1]?.required;

    const tier = collection.rewards.filter((a) => a.required <= amount).length ?? 0;

    const maxTier = collection.rewards.length;

    const rewards = collection.rewards.filter((reward) => reward.required <= amount);

    output.push({
      name,
      texture,
      amount,
      maxAmount,
      tier,
      maxTier,
      rewards,
    });
  }

  return output;
}

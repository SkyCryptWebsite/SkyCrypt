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
 *   texture: string,
 *   amount: number,
 *   totalAmount: number,
 *   tier: number,
 *   maxTier: number,
 *   amounts: {username: string, amount: number}[],
 * }[]}>} An object containing the player's collection data, with each collection's data organized by its ID.
 */
export async function getCollections(uuid, profile, cacheOnly = false) {
  try {
    const output = {};
    const userProfile = profile.members[uuid];
    if (!("unlocked_coll_tiers" in userProfile) || !("collection" in userProfile)) {
      return null;
    }

    const members = (
      await Promise.all(Object.keys(profile.members).map((a) => helper.resolveUsernameOrUuid(a, db, cacheOnly)))
    ).reduce((acc, a) => ((acc[a.uuid] = a.display_name), acc), {});

    const { collections: collectionData } = await db.collection("collections").findOne({ _id: "collections" });
    for (const [category, categoryData] of Object.entries(collectionData)) {
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

    output.totalCollections = Object.values(output).reduce((a, b) => a + b.collections.length, 0);
    output.maxedCollections = Object.values(output)
      .map((a) => a.collections)
      .flat()
      .filter((a) => a && a.tier === a.maxTier).length;

    return output;
  } catch (e) {
    return null;
  }
}

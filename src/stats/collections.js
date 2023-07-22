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
 *   tier: number,
 *   maxTier: number,
 *   amount: number,
 *   totalAmount: number,
 *   amounts: {username: string, amount: number}[],
 *   category: string,
 *   skyblockId: string,
 *   id: number,
 *   name: string,
 *   tiers: {tier: number, amountRequired: number, unlocks: string[]}[]
 * }[]}>} An object containing the player's collection data, with each collection's data organized by its ID.
 */
export async function getCollections(uuid, profile, cacheOnly = false) {
  try {
    const userProfile = profile.members[uuid];
    const output = {};

    if (!("unlocked_coll_tiers" in userProfile) || !("collection" in userProfile)) {
      return null;
    }

    const members = {};
    (
      await Promise.all(Object.keys(profile.members).map((a) => helper.resolveUsernameOrUuid(a, db, cacheOnly)))
    ).forEach((a) => (members[a.uuid] = a.display_name));

    const collectionData = constants.COLLECTION_DATA;
    for (const collection of collectionData) {
      const { skyblockId: ID, maxTier, category } = collection;
      const amount = userProfile.collection[ID] ?? 0;
      if (category === undefined) {
        continue;
      }

      const amounts = [];
      for (const member in profile.members) {
        const memberProfile = profile.members[member];
        if ("collection" in memberProfile === false) {
          continue;
        }

        amounts.push({ username: members[member], amount: memberProfile.collection[ID] || 0 });
      }

      const totalAmount = amounts.reduce((a, b) => a + b.amount, 0);
      const tier = collection.tiers.findLast((a) => a.amountRequired <= totalAmount)?.tier ?? 0;

      output[ID] = { tier, maxTier, amount, totalAmount, amounts, category };

      Object.assign(
        output[ID],
        collectionData.find((a) => a.skyblockId === ID)
      );
    }

    return output;
  } catch (e) {
    console.log(e);
    return null;
  }
}

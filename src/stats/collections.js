import * as constants from "../constants.js";
import * as helper from "../helper.js";
import { db } from "../mongo.js";

/**
 * Returns an object containing information about a player's collection progress.
 * @async
 * @function
 * @param {string} uuid - The UUID of the player to get the collection for.
 * @param {object} profile - The player's SkyBlock profile object.
 * @param {boolean} [cacheOnly=false] - Whether to only use cached data.
 * @returns {object} The collection object.
 * @property {object} [ID] - An object containing information about each collection item.
 * @property {number} [ID.tier] - The player's current tier for the collection item.
 * @property {number} [ID.maxTier] - The maximum tier for the collection item.
 * @property {number} [ID.amount] - The player's current amount for the collection item.
 * @property {number} [ID.totalAmount] - The total amount of the collection item across all players.
 * @property {array} [ID.amounts] - An array of objects containing information about the collection item for each player in co-op.
 * @property {string} [ID.amounts.username] - The username of the player.
 * @property {number} [ID.amounts.amount] - The amount of the collection item for the player.
 * @property {string} [ID.category] - The category of the collection item.
 */

export async function getCollections(uuid, profile, cacheOnly = false) {
  const userProfile = profile.members[uuid];
  const output = {};

  if (!("unlocked_coll_tiers" in userProfile) || !("collection" in userProfile)) {
    return output;
  }

  const members = {};
  (await Promise.all(Object.keys(profile.members).map((a) => helper.resolveUsernameOrUuid(a, db, cacheOnly)))).forEach(
    (a) => (members[a.uuid] = a.display_name)
  );

  const collectionData = constants.COLLECTION_DATA;
  for (const collection of collectionData) {
    const { skyblockId: ID, maxTier, category } = collection;
    const amount = userProfile.collection[ID] || 0;
    const amounts = [];

    if (category === undefined) continue;

    for (const member in profile.members) {
      const memberProfile = profile.members[member];

      if ("collection" in memberProfile === false) continue;

      amounts.push({ username: members[member], amount: memberProfile.collection[ID] || 0 });
    }

    const totalAmount = amounts.reduce((a, b) => a + b.amount, 0);
    const tier =
      collection.tiers
        .filter((a) => a.amountRequired <= totalAmount)
        .sort((a, b) => b.amountRequired - a.amountRequired)[0]?.tier || 0;

    output[ID] = { tier, maxTier, amount, totalAmount, amounts, category };

    Object.assign(
      output[ID],
      collectionData.find((a) => a.skyblockId === ID)
    );
  }

  return output;
}

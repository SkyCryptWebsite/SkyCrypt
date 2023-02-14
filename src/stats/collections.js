import * as constants from "../constants.js";
import * as helper from "../helper.js";
import { db } from "../mongo.js";

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
    const ID = collection.skyblockId;
    const maxTier = collection.maxTier;
    const category = collection.category;
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

import * as stats from "../../stats.js";
import * as helper from "../../helper.js";
import { db } from "../../mongo.js";

export async function getBingoCard(paramBingo, cacheOnly) {
  if (paramBingo && paramBingo.events) {
    const bingoData = await helper.getBingoGoals(db, cacheOnly);
    if (bingoData === null || bingoData.goals === undefined) {
      throw new Error("Failed to fetch Bingo data. Please try again later.");
    }

    const bingoProfile = paramBingo.events.find((profile) => profile.key === bingoData.id);

    const completedBingoGoals = bingoProfile?.completed_goals ?? [];
    const bingoGoals = bingoData.goals;

    return bingoProfile !== undefined ? stats.getBingoItems(completedBingoGoals, bingoGoals) : [];
  }

  return [];
}

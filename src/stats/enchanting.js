import * as constants from "../constants.js";
import moment from "moment";
import _ from "lodash";

// simon = Chronomatron
// numbers = Ultrasequencer
// pairings = Superpairs

export function getEnchanting(userProfile) {
  const enchanting = {
    unlocked: userProfile.experimentation !== undefined,
    experiments: {},
  };

  if (enchanting.unlocked) {
    for (const game in constants.EXPERIMENTS.games) {
      if (userProfile.experimentation[game] === undefined) {
        continue;
      }

      const gameConstants = constants.EXPERIMENTS.games[game];
      const gameData = userProfile.experimentation[game];

      const gameOutput = {
        name: gameConstants.name,
        stats: {},
        tiers: {},
      };

      for (const key in gameData) {
        if (key.startsWith("attempts") || key.startsWith("claims") || key.startsWith("best_score")) {
          let stat = key.split("_");
          const tierValue = parseInt(stat.pop());
          const tier = game === "numbers" ? tierValue + 2 : game === "simon" ? Math.min(tierValue + 1, 5) : tierValue;

          const tierInfo = _.cloneDeep(constants.EXPERIMENTS.tiers[tier]);
          if (gameOutput.tiers[tier] === undefined) {
            gameOutput.tiers[tier] = tierInfo;
          }

          stat = stat.join("_");
          Object.assign(gameOutput.tiers[tier], {
            [stat]: gameData[key],
          });
          continue;
        }

        if (key == "last_attempt" || key == "last_claimed") {
          if (gameData[key] <= 0) {
            continue;
          }

          gameOutput.stats[key] = {
            unix: gameData[key],
            text: moment(gameData[key]).fromNow(),
          };

          continue;
        }

        gameOutput.stats[key] = gameData[key];
      }

      enchanting.experiments[game] = gameOutput;
    }
  }

  return enchanting;
}

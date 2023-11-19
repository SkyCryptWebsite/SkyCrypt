import { calculateSenitherWeight } from "../constants/weight/senither-weight.js";
import { calculateFarmingWeight } from "../constants/weight/farming-weight.js";
import { calculateLilyWeight } from "../constants/weight/lily-weight.js";

export function getWeight(userProfile) {
  return {
    senither: calculateSenitherWeight(userProfile),
    lily: calculateLilyWeight(userProfile),
    farming: calculateFarmingWeight(userProfile),
  };
}

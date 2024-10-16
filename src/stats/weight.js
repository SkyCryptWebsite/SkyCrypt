import { calculateFarmingWeight } from "../constants/weight/farming-weight.js";

export function getWeight(userProfile) {
  return {
    farming: calculateFarmingWeight(userProfile),
  };
}

const CROP_TO_PEST = {
  CACTUS: "Mite",
  CARROT_ITEM: "Cricket",
  "INK_SACK:3": "Moth",
  MELON: "Earthworm",
  MUSHROOM_COLLECTION: "Slug",
  NETHER_STALK: "Beetle",
  POTATO_ITEM: "Locust",
  PUMPKIN: "Rat",
  SUGAR_CANE: "Mosquito",
  WHEAT: "Fly",
};

const PEST_COLLECTION_BRACKETS = [0, 50, 100, 250, 500, 750, 1000];

const PEST_COLLECTION_ADJUSTMENTS = {
  Mite: {
    0: 0,
    50: 1285.333312988281,
    100: 1898.6666259765625,
    250: 2512,
    500: 3125.333251953125,
    750: 3493.333251953125,
    1000: 3861.3333740234375,
  },
  Cricket: {
    0: 0,
    50: 1430.3999755859375,
    100: 2086.399951171875,
    250: 2742.4,
    500: 3398.39990234375,
    750: 3791.99990234375,
    1000: 4185.600048828125,
  },
  Moth: {
    0: 0,
    50: 1430.3999755859375,
    100: 2086.399951171875,
    250: 2742.4,
    500: 3398.39990234375,
    750: 3791.99990234375,
    1000: 4185.600048828125,
  },
  Earthworm: {
    0: 0,
    50: 2010.6666259765625,
    100: 2837.333251953125,
    250: 3664,
    500: 4490.66650390625,
    750: 4986.66650390625,
    1000: 5482.666748046875,
  },
  Slug: {
    0: 0,
    50: 632.5333312988281,
    100: 1053.8666625976562,
    250: 1475.2,
    500: 1896.5333251953125,
    750: 2149.3333251953127,
    1000: 2402.133337402344,
  },
  Beetle: {
    0: 0,
    50: 1647.9999694824216,
    100: 2367.9999389648438,
    250: 3088,
    500: 3807.9998779296875,
    750: 4239.9998779296875,
    1000: 4672.000061035156,
  },
  Locust: {
    0: 0,
    50: 1647.9999694824216,
    100: 2367.9999389648438,
    250: 3088,
    500: 3807.9998779296875,
    750: 4239.9998779296875,
    1000: 4672.000061035156,
  },
  Rat: {
    0: 0,
    50: 922.6666564941406,
    100: 1429.333312988281,
    250: 1936,
    500: 2442.6666259765625,
    750: 2746.6666259765625,
    1000: 3050.6666870117188,
  },
  Mosquito: {
    0: 0,
    50: 1285.333312988281,
    100: 1898.6666259765625,
    250: 2512,
    500: 3125.333251953125,
    750: 3493.333251953125,
    1000: 3861.3333740234375,
  },
  Fly: {
    0: 0,
    50: 7179.839925842285,
    100: 11197.43985168457,
    250: 15215.04,
    500: 19232.63970336914,
    750: 21643.19970336914,
    1000: 24053.76014831543,
  },
};

const crops = {
  CACTUS: {
    name: "Cactus",
    weight: 177_254.45,
  },
  CARROT_ITEM: {
    name: "Carrot",
    weight: 302_061.86,
  },
  "INK_SACK:3": {
    name: "Cocoa Bean",
    weight: 267_174.04,
  },
  MELON: {
    name: "Melon",
    weight: 485_308.47,
  },
  MUSHROOM_COLLECTION: {
    name: "Mushroom",
    weight: 90_178.06,
  },
  NETHER_STALK: {
    name: "Nether Wart",
    weight: 250_000,
  },
  POTATO_ITEM: {
    name: "Potato",
    weight: 300_000,
  },
  PUMPKIN: {
    name: "Pumpkin",
    weight: 98_284.71,
  },
  SUGAR_CANE: {
    name: "Sugar Cane",
    weight: 200_000,
  },
  WHEAT: {
    name: "Wheat",
    weight: 100_000,
  },
};
function calculatePestCrops(pest) {
  let kills = pest?.kills ?? 0;
  let pestCount = 0;
  let pestCropCount = 0;
  for (let i = 0; i < PEST_COLLECTION_BRACKETS.length; i++) {
    const bracket = PEST_COLLECTION_BRACKETS[i];

    if (kills <= 0) break;

    const bracketCrops = PEST_COLLECTION_ADJUSTMENTS[pest.name][bracket];

    if (i === PEST_COLLECTION_BRACKETS.length - 1) {
      pestCropCount += Math.ceil(bracketCrops * kills);
      break;
    }

    const nextBracket = PEST_COLLECTION_BRACKETS.at(i + 1);

    pestCount = Math.min(nextBracket - pestCount, kills);

    if (bracketCrops === 0) {
      kills -= pestCount;
      continue;
    }

    kills -= pestCount;
    pestCropCount += Math.ceil(bracketCrops * pestCount);
  }
  return pestCropCount;
}

export function calculateFarmingWeight(userProfile) {
  const output = {
    weight: 0,
    crops: {},
    bonuses: {
      level: {
        level: 0,
        weight: 0,
      },
    },
  };

  const farmingCollection = userProfile?.collections?.farming?.collections;
  const pests = userProfile?.bestiary?.categories?.garden?.mobs;
  if (farmingCollection !== undefined) {
    let weight = 0;
    for (const [name, crop] of Object.entries(crops)) {
      const { amount = 0 } = farmingCollection.find((a) => a.id === name);

      const pest = pests.find((a) => a.name === CROP_TO_PEST[name]);
      const pestCrops = calculatePestCrops(pest);

      const calculated = Math.max(amount - pestCrops, 0) / crop.weight;

      output.crops[name] = {
        name: crop.name,
        weight: calculated,
      };

      weight += calculated;
    }

    output.weight += weight;

    const mushroomScaling = 90_178.06;

    const mushroomCollection = farmingCollection.find((a) => a.id === "MUSHROOM_COLLECTION")?.amount ?? 0;

    const total = output.weight;
    const doubleBreakRatio = total <= 0 ? 0 : (output.crops.CACTUS.weight + output.crops.SUGAR_CANE.weight) / total;
    const normalRatio = total <= 0 ? 0 : (total - output.crops.CACTUS.weight - output.crops.SUGAR_CANE.weight) / total;

    const mushroomWeight =
      doubleBreakRatio * (mushroomCollection / (2 * mushroomScaling)) +
      normalRatio * (mushroomCollection / mushroomScaling);

    output.weight -= output.crops.MUSHROOM_COLLECTION.weight;
    output.crops.MUSHROOM_COLLECTION.weight = mushroomWeight;
    output.weight += mushroomWeight;
  }

  output.crop_weight = output.weight;

  let bonus = 0;

  const farmingSkill = userProfile?.skills?.skills?.farming;
  if (farmingSkill) {
    if (farmingSkill.level >= 50) {
      output.bonuses.level.level = 50;
      output.bonuses.level.weight += 100;
      bonus += 100;
    }
    if (farmingSkill.level >= 60) {
      output.bonuses.level.level = 60;
      output.bonuses.level.weight += 150;
      bonus += 150;
    }
  }

  if (userProfile?.farming) {
    const doubleDrops = userProfile.farming?.perks?.double_drops ?? 0;
    output.bonuses.double_drops = {
      double_drops: doubleDrops,
      weight: doubleDrops * 2,
    };

    bonus += doubleDrops * 2;

    const maxMedals = 1000;
    const medals = userProfile.farming?.total_badges;
    const diamondMedals = medals?.diamond ?? 0;
    const platinumMedals = Math.min(medals?.platinum ?? 0, maxMedals - diamondMedals);
    const goldMedals = Math.min(medals?.gold ?? 0, maxMedals - diamondMedals - platinumMedals);

    const diamondMedalBonus = diamondMedals * 0.75;
    const platinumMedalBonus = platinumMedals * 0.5;
    const goldMedalBonus = goldMedals * 0.25;

    const contestMedals = goldMedals + platinumMedals + diamondMedals;
    const contestMedalBonus = goldMedalBonus + platinumMedalBonus + diamondMedalBonus;

    output.bonuses.contest_medals = {
      medals: contestMedals,
      weight: contestMedalBonus,
    };

    bonus += contestMedalBonus;
  }

  if (userProfile.minions !== undefined) {
    const FARMING_MINIONS = [
      "WHEAT",
      "CARROT",
      "POTATO",
      "PUMPKIN",
      "MELON",
      "MUSHROOM",
      "COCOA",
      "CACTUS",
      "SUGAR_CANE",
      "NETHER_WARTS",
    ];

    let count = 0;
    for (const minion of userProfile.minions.minions.farming.minions) {
      if (FARMING_MINIONS.includes(minion.id) === false) {
        continue;
      }

      if (minion.tier == 12) {
        count++;
        bonus += 5;
      }
    }

    output.bonuses.minions = {
      count: count,
      weight: count * 5,
    };
  }

  output.bonus_weight = bonus;

  output.weight += bonus;

  return output;
}

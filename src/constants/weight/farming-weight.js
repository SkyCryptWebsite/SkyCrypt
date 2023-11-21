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
  if (farmingCollection !== undefined) {
    let weight = 0;
    for (const [name, crop] of Object.entries(crops)) {
      const { amount = 0 } = farmingCollection.find((a) => a.id === name);

      const calculated = amount / crop.weight;

      output.crops[name] = {
        name: crop.name,
        weight: calculated,
      };

      weight += calculated;
    }

    output.weight += weight;

    const mushroomScaling = 90_178.06;

    const mushroomCollection = farmingCollection.find((a) => a.id === "MUSHROOM_COLLECTION")?.amount ?? 0;

    const total = output.weight + mushroomCollection / mushroomScaling;
    const doubleBreakRatio = total <= 0 ? 0 : (output.crops.CACTUS.weight + output.crops.SUGAR_CANE.weight) / total;
    const normalRatio = total <= 0 ? 0 : (total - output.crops.CACTUS.weight - output.crops.SUGAR_CANE.weight) / total;

    const mushroomWeight =
      doubleBreakRatio * (mushroomCollection / (2 * mushroomScaling)) +
      normalRatio * (mushroomCollection / mushroomScaling);

    output.crops.MUSHROOM = {
      name: "Mushroom",
      weight: mushroomWeight,
    };
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

    const goldMedals = userProfile.farming?.total_badges?.gold ?? 0;
    const goldMedalBonus = Math.min(Math.floor(goldMedals / 50) * 25, 500);
    output.bonuses.gold_medals = {
      medals: goldMedals,
      weight: goldMedalBonus,
    };

    bonus += goldMedalBonus;
  }

  if (userProfile?.minions) {
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

      if (minion.maxLevel == 12) {
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

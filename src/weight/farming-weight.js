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

export function calculateFarmingWeight(profile) {
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

  if (profile?.collections) {
    let weight = 0;
    for (const [name, crop] of Object.entries(crops)) {
      let total = profile.collections[name]?.amount ?? 0;
      let calculated = total / crop.weight;
      weight += calculated;
      output.crops[name] = {
        name: crop.name,
        weight: calculated,
      };
    }

    output.weight += weight;

    const mushroom_scaling = 90_178.06;

    let mushroom_collection = profile?.collections?.MUSHROOM_COLLECTION?.amount ?? 0;

    let total = output.weight + mushroom_collection / mushroom_scaling;
    let double_break_ratio = total <= 0 ? 0 : (output.crops.CACTUS.weight + output.crops.SUGAR_CANE.weight) / total;
    let normal_ratio = total <= 0 ? 0 : (total - output.crops.CACTUS.weight - output.crops.SUGAR_CANE.weight) / total;

    let mushroom_weight =
      double_break_ratio * (mushroom_collection / (2 * mushroom_scaling)) +
      normal_ratio * (mushroom_collection / mushroom_scaling);

    output.crops.MUSHROOM = {
      name: "Mushroom",
      weight: mushroom_weight,
    };
    output.weight += mushroom_weight;
  }

  output.crop_weight = output.weight;

  let bonus = 0;

  if (profile?.levels?.farming) {
    if (profile.levels.farming.level >= 50) {
      output.bonuses.level.level = 50;
      output.bonuses.level.weight += 100;
      bonus += 100;
    }
    if (profile.levels.farming.level >= 60) {
      output.bonuses.level.level = 60;
      output.bonuses.level.weight += 150;
      bonus += 150;
    }
  }

  if (profile?.farming) {
    let double_drops = profile.farming?.perks?.double_drops ?? 0;
    output.bonuses.double_drops = {
      double_drops: double_drops,
      weight: double_drops * 2,
    };
    bonus += double_drops * 2;

    let gold_medals = profile.farming?.total_badges?.gold ?? 0;
    let gold_medal_bonus = Math.min(Math.floor(gold_medals / 50) * 25, 500);
    output.bonuses.gold_medals = {
      medals: gold_medals,
      weight: gold_medal_bonus,
    };
    bonus += gold_medal_bonus;
  }

  if (profile?.minions) {
    const farming_minions = [
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

    profile.minions.forEach((minion) => {
      if (farming_minions.includes(minion.id)) {
        if (minion.maxLevel == 12) {
          count++;
          bonus += 5;
        }
      }
    });
    output.bonuses.minions = {
      count: count,
      weight: count * 5,
    };
  }

  output.bonus_weight = bonus;

  output.weight += bonus;

  return output;
}

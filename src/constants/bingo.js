import * as helper from "../helper.js";

function getBingoItemId(item, completed) {
  if (item?.tiers !== undefined) {
    const completed = item.progress >= item.tiers[0];

    return completed ? 133 : 42;
  }

  return completed ? 351 : 339;
}

function getBingoItemDamage(item, completed) {
  if (item?.tiers !== undefined) {
    return 0;
  }

  return completed ? 10 : 0;
}

function formatBingOItemLore(item, bingoData, { completed = false, custom = false }) {
  const output = [];
  // Personal Goal
  if (item.tiers === undefined && item.id !== undefined) {
    if (custom === false) {
      output.push("§8Personal Goal");
      output.push("");
    }
    if (Array.isArray(item.lore)) {
      output.push(...item.lore);
    } else {
      output.push(item.lore);
    }

    if (custom === false) {
      output.push("");
      output.push("§7Reward");
      output.push(`§61 Bingo Point`);
      output.push("");
      if (item.requiredAmount) {
        output.push(`§7Progress:`);
        output.push(
          `§a${completed ? item.requiredAmount.toLocaleString() : "NaN"} §7/ §6${item.requiredAmount.toLocaleString()}`
        );
        output.push("");
      }

      if (completed) {
        output.push("§aGOAL REACHED");
      } else {
        output.push("§cYou have not reached this goal!");
      }
    }
  } else {
    // Community Goal
    output.push("§8Community Goal");
    output.push("");
    const total = item.progress;
    const nextTierAmount = item.tiers.find((tier) => tier > item.progress) || item.tiers[item.tiers.length - 1];
    const nextTier = item.tiers.indexOf(item.tiers.find((tier) => tier > item.progress)) || item.tiers.length;
    const percentage = (total / nextTierAmount) * 100;
    output.push(
      `§7Progress to ${item.name} ${helper.romanize(nextTier)}: §e${
        percentage > 100 ? 100 : percentage.toLocaleString()
      }§6%`
    );

    let progress = "";
    for (let i = 0; i < 20; i++) {
      if (i < (total / nextTierAmount) * 20) {
        progress += "§a§l§m⎯";
      } else {
        progress += "§7§l§m⎯";
      }
    }
    progress += `§r §e ${total.toLocaleString()} §6/ §e${helper.formatNumber(nextTierAmount)}`;

    output.push(progress);

    const index = bingoData.filter((goal) => goal.tiers !== undefined).indexOf(item);

    output.push("");
    output.push("§7Contribution Rewards");
    output.push(...bingoCommunityRewards[index].description);
    output.push("");
    output.push(
      "§7§oCommunity Goals are",
      "§7§ocollaborative - anyone with a",
      "§7§oBingo profile can help to reach",
      "§7§othe goal!",
      "",
      "§7§oThe more you contribute",
      "§7§otowards the goal, the more you",
      "§7§owill be rewarded!"
    );

    if (percentage >= 100) {
      output.push("");
      output.push("§aGOAL REACHED");
    }
  }

  return output;
}

const bingoCardSlots = [
  {
    slots: [1, 10, 19, 28, 37],
    name: "Row #",
    lore: [
      "§7Completed all of the goals in the",
      "§7row to the right to earn a",
      "§7bonus reward!",
      "",
      "§7Bonus Reward",
      "§65 Bingo Points",
    ],
    id: 160,
    damage: 0,
    rarity: "legendary",
  },
  {
    slots: [7, 16, 25, 34, 43],
    name: "Row #",
    lore: [
      "§7Completed all of the goals in the",
      "§7row to the left to earn a",
      "§7bonus reward!",
      "",
      "§7Bonus Reward",
      "§65 Bingo Points",
    ],
    id: 160,
    damage: 0,
    rarity: "legendary",
  },
  {
    slots: [46],
    name: "Diagonal",
    lore: [
      "§7Completed all of the goals in the",
      "§7diagonal from bottom-left to",
      "§7top-right to earn a bonus",
      "§7reward!",
      "",
      "§7Bonus Reward",
      "§610 Bingo Points",
    ],
    id: 160,
    damage: 0,
    rarity: "legendary",
  },
  {
    slots: [52],
    name: "Community Diagonal",
    lore: [
      "§7Reach §aTier I §7for all of the",
      "§6Community Goals §7to earn a",
      "§7bonus reward!",
      "",
      "§7Bonus Reward",
      "§65 Bingo Points",
    ],
    id: 160,
    damage: 0,
    rarity: "legendary",
  },
  {
    slots: [47, 48, 49, 50, 51],
    name: "Column #",
    lore: [
      "§7Completed all of the goals in the",
      "§7column above to earn a bonus",
      "§7reward!",
      "",
      "§7Bonus Reward",
      "§65 Bingo Points",
    ],
    id: 160,
    damage: 0,
    rarity: "legendary",
  },
  {
    slots: [44],
    name: "Item Transfer",
    lore: [
      "§7Transfer up to §a10 items §7from",
      "§7your Bingo profile to any of",
      "§7your other profiles!",
      "",
      "§7Items Transferred: §aNaN / 10",
    ],
    id: 54,
    damage: 0,
    rarity: "uncommon",
  },
  {
    slots: [53],
    name: "Bingo Shop",
    lore: [
      "§7Spend §6Bingo Points §7on",
      "§7limited-time items, only",
      "§7obtainable during the Bingo",
      "§7event!",
      "",
      "§7Upgrade your §6Bingo Rank §7to",
      "§7improve your profile icon and",
      "§7unlock even more shop items!",
      "",
      "§6Your Bingo Account",
      "  §7Bingo Points: §6NaN",
      "§7Bingo Rank: §cUnknown",
    ],
    id: 388,
    damage: 0,
    rarity: "divine",
  },
];

const bingoCommunityRewards = [
  {
    description: [
      "§fTop §e1% §8- §69 Bingo Points",
      "§fTop §e5% §8- §67 Bingo Points",
      "§fTop §e10% §8- §65 Bingo Points",
      "§fTop §e25% §8- §63 Bingo Points",
      "§fAll Contributors §8- §61 Bingo Points",
    ],
  },
  {
    description: [
      "§fTop §e1% §8- §615 Bingo Points",
      "§fTop §e5% §8- §612 Bingo Points",
      "§fTop §e10% §8- §69 Bingo Points",
      "§fTop §e25% §8- §67 Bingo Points",
      "§fAll Contributors §8- §64 Bingo Points",
    ],
  },
  {
    description: [
      "§fTop §e1% §8- §67 Bingo Points",
      "§fTop §e5% §8- §65 Bingo Points",
      "§fTop §e10% §8- §64 Bingo Points",
      "§fTop §e25% §8- §63 Bingo Points",
      "§fAll Contributors §8- §61 Bingo Points",
    ],
  },
  {
    description: [
      "§fTop §e1% §8- §612 Bingo Points",
      "§fTop §e5% §8- §610 Bingo Points",
      "§fTop §e10% §8- §67 Bingo Points",
      "§fTop §e25% §8- §65 Bingo Points",
      "§fAll Contributors §8- §62 Bingo Points",
    ],
  },
  {
    description: [
      "§fTop §e1% §8- §67 Bingo Points",
      "§fTop §e5% §8- §65 Bingo Points",
      "§fTop §e10% §8- §64 Bingo Points",
      "§fTop §e25% §8- §63 Bingo Points",
      "§fAll Contributors §8- §61 Bingo Points",
    ],
  },
];

const bingoPositions = [3, 4, 5, 6, 7, 12, 13, 14, 15, 16, 21, 22, 23, 24, 25, 30, 31, 32, 33, 34, 39, 40, 41, 42, 43];

export function getBingoItems(userProfile, bingoData) {
  const bingoGoals = userProfile.completed_goals;
  const output = [];

  // NOTE: Not sure why but without this it doesn't work
  for (let i = 0; i < 6 * 9; i++) {
    output[i] = helper.generateItem({
      id: undefined,
    });
  }

  for (const itemData of bingoCardSlots) {
    for (const slot of itemData.slots) {
      const name =
        itemData.name.endsWith("#") === true ? `${itemData.name}${itemData.slots.indexOf(slot) + 1}` : itemData.name;

      output[slot] = helper.generateItem({
        display_name: name,
        id: itemData.id,
        Damage: itemData.damage,
        rarity: itemData.rarity || "common",
        tag: {
          display: {
            Name: name,
            Lore: formatBingOItemLore(itemData, bingoData, { completed: false, custom: true }),
          },
        },
        position: slot,
      });
    }
  }

  for (const item of bingoData) {
    const position = bingoPositions[bingoData.indexOf(item)] - 1;
    const completed = item?.tiers ? item.progress >= item.tiers[0] : bingoGoals.includes(item.id) || false;

    output[position] = helper.generateItem({
      display_name: item.name,
      id: getBingoItemId(item, completed),
      Damage: getBingoItemDamage(item, completed),
      rarity: "uncommon",
      tag: {
        display: {
          Name: item.name,
          Lore: formatBingOItemLore(item, bingoData, { completed: completed, custom: false }),
        },
      },
      position: position,
      completed: completed,
    });
  }

  return output;
}

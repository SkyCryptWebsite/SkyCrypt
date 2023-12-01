import * as constants from "../constants.js";
import * as helper from "../helper.js";

function getBingoItemId(item, completed) {
  if (item.tiers !== undefined) {
    return item.progress >= item.tiers[0] ? 133 : 42;
  }

  return completed ? 351 : 339;
}

function getBingoItemDamage(completed) {
  return completed ? 10 : 0;
}

function formatBingOItemLore(item, bingoData, completed = false) {
  const output = [];

  // Personal Goal
  if (item.tiers === undefined) {
    if (Array.isArray(item.lore)) {
      output.push(...item.lore);
    } else {
      output.push("§8Personal Goal");
      output.push("");
      output.push(item.lore);
      output.push("");
      output.push("§7Reward");
      output.push("§61 Bingo Point");

      if (item.requiredAmount) {
        output.push("", "§7Progress:");
        output.push(
          `§a${completed ? item.requiredAmount.toLocaleString() : "???"} §7/ §6${item.requiredAmount.toLocaleString()}`
        );
      }

      if (completed) {
        output.push("", "§aGOAL REACHED");
      } else {
        output.push("", "§cYou have not reached this goal!");
      }
    }
  } else {
    // Community Goal
    output.push("§8Community Goal");
    output.push("");

    const total = item.progress;
    const nextTierAmount = item.tiers.find((tier) => total < tier) || item.tiers[item.tiers.length - 1];
    const nextTier = item.tiers.indexOf(nextTierAmount) + 1;

    const percentage = (total / nextTierAmount) * 100;
    output.push(
      `§7Progress to ${item.name} ${helper.romanize(nextTier)}: §e${Math.min(percentage, 100).toFixed(2)}§6%`
    );

    output.push(
      `${helper.formatProgressBar(total, nextTierAmount)} §e${total.toLocaleString()} §6/ §e${helper.formatNumber(
        nextTierAmount
      )}`
    );

    const index = bingoData.filter((goal) => goal.tiers !== undefined).indexOf(item);

    output.push("");
    output.push("§7Contribution Rewards");
    output.push(...constants.BINGO_COMMUNITY_REWARDS[index].description);
    output.push("");
    output.push(
      "§7§oCommunity Goals are",
      "§7§ocollaborative - anyone with a",
      "§7§othe goal!",
      "",
      "§7§oBingo profile can help to reach",
      "§7§oThe more you contribute",
      "§7§otowards the goal, the more you",
      "§7§owill be rewarded!"
    );

    if (percentage >= 100) {
      output.push("", "§aGOAL REACHED");
    }
  }

  return output;
}

export function getBingoItems(completedGoals, bingoData) {
  const output = [];
  for (let i = 0; i < 6 * 9; i++) {
    output[i] = helper.generateItem({
      id: undefined,
    });
  }

  for (let slot = 0, index = 0; slot <= 6 * 9; slot++) {
    if ([0, 1, 7, 8].includes(slot % 9) || !bingoData[index]) continue;

    const item = bingoData[index];
    const completed = item.tiers ? item.progress >= item.tiers[0] : completedGoals.includes(item.id);

    output[slot] = helper.generateItem({
      display_name: item.name,
      id: getBingoItemId(item, completed),
      Damage: getBingoItemDamage(completed),
      rarity: "uncommon",
      tag: { display: { Name: item.name, Lore: formatBingOItemLore(item, bingoData, completed) } },
      position: slot,
      completed,
    });

    index++;
  }

  for (const itemData of constants.BINGO_CARD_SLOTS) {
    for (const slot of itemData.positions) {
      if (Array.isArray(itemData.lore)) {
        itemData.lore = helper.renderLore(itemData.lore.join("<br>"));
      }

      itemData.display_name = itemData.display_name.split(/[0-9]/)[0];
      if (itemData.display_name.endsWith("#")) {
        itemData.display_name += parseInt(itemData.positions.indexOf(slot)) + 1;
      }

      output[slot] = helper.generateItem({
        ...itemData,
        tag: {
          display: {
            Name: itemData.display_name,
            Lore: itemData.lore,
          },
        },
        position: slot,
      });
    }
  }

  return output;
}

export function getBingoData(bingoProfile) {
  if (bingoProfile?.events === undefined) {
    return;
  }

  return {
    total: bingoProfile.events.length,
    points: bingoProfile.events.reduce((a, b) => a + b.points, 0),
    completed_goals: bingoProfile.events.reduce((a, b) => a + b.completed_goals.length, 0),
  };
}

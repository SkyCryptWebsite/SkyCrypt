import * as constants from "../constants.js";
import * as helper from "../helper.js";
import _ from "lodash";

function getProfileMinions(coopMembers) {
  const minions = [];

  const craftedGenerators = [];
  for (const member in coopMembers) {
    if (
      coopMembers[member]?.player_data === undefined ||
      "crafted_generators" in coopMembers[member].player_data === false
    ) {
      continue;
    }

    craftedGenerators.push(...coopMembers[member].player_data.crafted_generators);
  }

  for (const generator of craftedGenerators) {
    const split = generator.split("_");

    const minionLevel = parseInt(split.pop());
    const minionName = split.join("_");

    const minion = minions.find((a) => a.id == minionName);

    if (minion == undefined) {
      minions.push({ id: minionName, tiers: [minionLevel] });
    } else {
      minion.tiers.push(minionLevel);
    }
  }

  const output = {};
  for (const category in constants.MINIONS) {
    output[category] ??= {
      minions: [],
    };

    const categoryMinions = minions.filter((a) => Object.keys(constants.MINIONS[category]).includes(a.id));
    for (const minion of categoryMinions) {
      const minionData = constants.MINIONS[category][minion.id];

      output[category].minions.push({
        id: minion.id,
        name: minionData.name ?? helper.titleCase(minion.id.replace("_", " ")),
        texture: minionData.texture,
        tiers: _.uniq(minion.tiers.sort((a, b) => a - b)),
        tier: minion.tiers.length > 0 ? Math.max(...minion.tiers) : 0,
        maxTier: minionData.maxTier ?? 11,
      });
    }

    output[category].totalMinions = output[category].minions.length;
    output[category].maxedMinions = output[category].minions.filter((m) => m.tier === m.maxTier).length;

    output[category].totalTiers = output[category].minions.reduce((a, b) => a + b.tiers.length, 0);
    output[category].maxedTiers = output[category].minions.reduce((a, b) => a + b.maxTier, 0);
  }

  return output;
}

function getMinionSlots(minions) {
  const output = { current: 5 };

  const uniquesRequired = Object.keys(constants.MINION_SLOTS).sort((a, b) => parseInt(a) - parseInt(b));
  for (const [index, uniques] of uniquesRequired.entries()) {
    if (parseInt(uniques) <= minions.maxedTiers) {
      continue;
    }

    output.current = constants.MINION_SLOTS[uniquesRequired[index - 1]];
    output.next = uniquesRequired[index] - minions.maxedTiers;
    break;
  }

  return output;
}

export function getMinions(profile) {
  const output = {};
  output.minions = getProfileMinions(profile.members);

  output.totalMinions = Object.values(output.minions).reduce((a, b) => a + b.totalMinions, 0);
  output.maxedMinions = Object.values(output.minions).reduce((a, b) => a + b.maxedMinions, 0);

  output.totalTiers = Object.values(output.minions).reduce((a, b) => a + b.totalTiers, 0);
  output.maxedTiers = Object.values(output.minions).reduce((a, b) => a + b.maxedTiers, 0);

  output.minion_slots = getMinionSlots(output);

  return output;
}

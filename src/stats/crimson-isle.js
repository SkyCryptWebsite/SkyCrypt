import * as constants from "../constants.js";
import * as helper from "../helper.js";

function getTrophyFish(userProfile) {
  const output = {};
  if (userProfile.trophy_fish === undefined) {
    return;
  }

  output.fish = [];
  const tiers = ["bronze", "silver", "gold", "diamond"];
  for (const fish in constants.TROPHY_FISH) {
    const trophyFish = {
      total: userProfile.trophy_fish[fish.toLowerCase()] ?? 0,
    };

    for (const tier of tiers) {
      trophyFish[tier] = userProfile.trophy_fish[`${fish.toLowerCase()}_${tier}`] ?? 0;
    }

    trophyFish.highest_tier = [...tiers].reverse().find((tier) => trophyFish[tier] >= 1);

    trophyFish.texture = constants.TROPHY_FISH[fish].textures[trophyFish.highest_tier];

    output.fish.push(Object.assign(trophyFish, constants.TROPHY_FISH[fish]));
  }

  output.total_caught = userProfile.trophy_fish?.total_caught || 0;

  output.maxed = output.fish.filter((fish) => fish["diamond"] > 0).length === output.fish.length;

  const stage = userProfile.trophy_fish.rewards ? userProfile.trophy_fish.rewards.length - 1 : 0;
  output.stage = constants.TROPHY_FISH_STAGES[stage];

  return output;
}

export function getCrimsonIsle(userProfile) {
  const output = {};

  const data = userProfile.nether_island_player_data;
  if (data === undefined) {
    return;
  }

  output.factions = {
    selected_faction: data.selected_faction ? helper.capitalizeFirstLetter(data.selected_faction) : "None",
    mages_reputation: data.mages_reputation ?? 0,
    barbarians_reputation: data.barbarians_reputation ?? 0,
  };

  if (data.kuudra_completed_tiers !== undefined) {
    output.kuudra = {
      tiers: {},
      total: 0,
    };
    for (const tier in constants.KUUDRA_TIERS) {
      output.kuudra.tiers[tier] = {
        name: constants.KUUDRA_TIERS[tier].name,
        head: constants.KUUDRA_TIERS[tier].head,
        completions: data.kuudra_completed_tiers[tier] ?? 0,
      };
    }

    output.kuudra.total = Object.values(output.kuudra.tiers).reduce((a, b) => a + b.completions, 0);
  }

  if (data.dojo !== undefined) {
    output.dojo = {
      dojo: {},
      total_points: 0,
    };

    for (const key in constants.DOJO) {
      const dojo = constants.DOJO[key];
      output.dojo.dojo[key.toUpperCase()] = {
        name: dojo.name,
        id: dojo.itemId,
        damage: dojo.damage,
        points: data.dojo?.[`dojo_points_${key}`] ?? 0,
        time: data.dojo?.[`dojo_time_${key}`] ?? 0,
      };
    }

    output.dojo.total_points = Object.values(output.dojo.dojo).reduce((a, b) => a + b.points, 0);
  }

  output.trophy_fish = getTrophyFish(userProfile);

  output.abiphone = {
    contacts: data.abiphone?.contact_data ?? {},
    active: data.abiphone?.active_contacts?.length || 0,
  };

  return output;
}

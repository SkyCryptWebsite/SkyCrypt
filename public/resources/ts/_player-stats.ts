/*
 * Missing stuff that would improve stats:
 * ! Century cakes
 * - Potion effects
 * - Dungeon shop upgrades
 * - Cake bag bonus +1hp per cake
 * - Pet score magic find bonus
 *
 * [!] impossible to calculate
 * [-] can be included in the calculation
 */

import * as helper from "../../../common/helper.js";
import * as constants from "../../../common/constants.js";

// todo: reorder these based on https://wiki.hypixel.net/Stats#Player_Stats ?
const stats: PlayerStats = {
  health: { base: 100 },
  defense: { base: 0 },
  strength: { base: 0 },
  speed: { base: 100 },
  crit_chance: { base: 30 },
  crit_damage: { base: 50 },
  bonus_attack_speed: { base: 0 },
  intelligence: { base: 0 },
  sea_creature_chance: { base: 20 },
  magic_find: { base: 0 },
  pet_luck: { base: 0 },
  ferocity: { base: 0 },
  ability_damage: { base: 0 },
  mining_speed: { base: 0 },
  mining_fortune: { base: 0 },
  farming_fortune: { base: 0 },
  foraging_fortune: { base: 0 },
  pristine: { base: 0 },
  true_defense: { base: 0 },
};

// Active armor stats
for (const piece of items.armor) {
  const bonusStats: ItemStats = helper.getStatsFromItem(piece as Item);

  for (const [name, value] of Object.entries(bonusStats)) {
    stats[name] ??= {};
    stats[name].armor ??= 0;
    stats[name].armor += value;
  }
}

// Active pet stats
{
  const activePet = calculated.pets.find((pet) => pet.active);

  if (activePet) {
    for (const [name, value] of Object.entries(activePet.stats)) {
      stats[name] ??= {};
      stats[name].pet ??= 0;
      stats[name].pet += value;
    }
  }
}

// Held item stats
{
  const bonusStats: ItemStats = helper.getStatsFromItem(items.highest_rarity_sword as Item);

  for (const [name, value] of Object.entries(bonusStats)) {
    stats[name] ??= {};
    stats[name].held_item ??= 0;
    stats[name].held_item += value;
  }
}

// Active accessories stats
for (const item of items.talismans.filter((item) => !item.isInactive)) {
  const bonusStats: ItemStats = helper.getStatsFromItem(item as Item);

  for (const [name, value] of Object.entries(bonusStats)) {
    stats[name] ??= {};
    stats[name].accessories ??= 0;
    stats[name].accessories += value;
  }
}

// Skill bonus stats
for (const [skill, data] of Object.entries(calculated.levels)) {
  const bonusStats: ItemStats = getBonusStat(data.level, `skill_${skill}`, data.maxLevel, 1);

  for (const [name, value] of Object.entries(bonusStats)) {
    stats[name] ??= {};
    stats[name][`skill_${skill}`] ??= 0;
    stats[name][`skill_${skill}`] += value;
  }
}

// Dungeoneering stats
{
  const bonusStats: ItemStats = getBonusStat(
    calculated.dungeons.catacombs.level.level,
    "skill_dungeoneering",
    calculated.dungeons.catacombs.level.maxLevel,
    1
  );

  for (const [name, value] of Object.entries(bonusStats)) {
    stats[name] ??= {};
    stats[name]["skill_dungeoneering"] ??= 0;
    stats[name]["skill_dungeoneering"] += value;
  }
}

// Slayer bonus stats
for (const [slayer, data] of Object.entries(calculated.slayers)) {
  const bonusStats: ItemStats = getBonusStat(data.level.currentLevel, `slayer_${slayer}`, data.level.maxLevel, 1);

  for (const [name, value] of Object.entries(bonusStats)) {
    stats[name] ??= {};
    stats[name][`slayer_${slayer}`] ??= 0;
    stats[name][`slayer_${slayer}`] += value;
  }
}

// Fairy souls
{
  const bonusStats: ItemStats = getFairyBonus(calculated.fairy_exchanges);

  for (const [name, value] of Object.entries(bonusStats)) {
    stats[name] ??= {};
    stats[name].fairy_souls ??= 0;
    stats[name].fairy_souls += value;
  }
}

// New year cake bag
{
  const cakeBag = items.talisman_bag.find((x) => x.tag.ExtraAttributes.id === "NEW_YEAR_CAKE_BAG");

  if (cakeBag && cakeBag.containsItems.length > 0) {
    stats.health ??= {};
    stats.health.new_year_cake_bag = cakeBag.containsItems.length;
  }
}

console.log(stats);

// Print the stats
const parent = document.createElement("div");
parent.id = "base_stats_container";
parent.style.marginTop = "30px";

document.querySelector("#base_stats_container")?.parentNode?.appendChild(parent);

for (const stat in stats) {
  const node = document.createElement("player-stats");

  node.setAttribute("stat", stat);
  node.setAttribute(
    "value",
    Object.values(stats[stat])
      .reduce((a, b) => a + b, 0)
      .toString()
  );
  node.setAttribute("data", btoa(JSON.stringify(stats[stat])));

  parent?.appendChild(node);
}

// todo: move these somewhere else?
function getBonusStat(level: number, key: string, max: number, incremention: number) {
  const stat_template: { [key: string]: number } = {};
  for (const stat in stats) {
    stat_template[stat] = 0;
  }
  const bonus = Object.assign({}, stat_template);

  const skill_stats = constants.stats_bonus[key];

  if (!skill_stats) {
    return bonus;
  }

  const steps = Object.keys(skill_stats)
    .sort((a, b) => Number(a) - Number(b))
    .map((a) => Number(a));

  for (let x = steps[0]; x <= max; x += incremention) {
    if (level < x) {
      break;
    }

    const skill_step = steps
      .slice()
      .reverse()
      .find((a) => a <= x);

    const skill_bonus = skill_stats[skill_step];

    for (const skill in skill_bonus) {
      bonus[skill] += skill_bonus[skill];
    }
  }

  const removeZero = (item: { [key: string]: number }) =>
    Object.keys(item)
      .filter((key) => item[key] !== 0)
      .reduce((newObj, key) => {
        newObj[key] = item[key];
        return newObj;
      }, {});
  return removeZero(bonus);
}

function getFairyBonus(fairyExchanges: number) {
  const bonus: ItemStats = {
    speed: 0,
    health: 0,
    defense: 0,
    strength: 0,
  };

  bonus.speed = Math.floor(fairyExchanges / 10);

  for (let i = 0; i < fairyExchanges; i++) {
    bonus.strength += (i + 1) % 5 == 0 ? 2 : 1;
    bonus.defense += (i + 1) % 5 == 0 ? 2 : 1;
    bonus.health += 3 + Math.floor(i / 2);
  }

  return bonus;
}

// function getPetScore(pets) {
//   const highestRarity = {};

//   // * we can use pet.ref.rarity (number), pet.rarity is string from calculated.pets

//   for (const pet of pets) {
//     if (!(pet.type in highestRarity) || constants.pet_value[pet.rarity] > highestRarity[pet.type]) {
//       highestRarity[pet.type] = constants.pet_value[pet.rarity];
//     }
//   }

//   return Object.values(highestRarity).reduce((a, b) => a + b, 0);
// }

// function getPetScoreBonus() {
//   output.petScore = await getPetScore(output.pets);

//   const petScoreRequired = Object.keys(constants.pet_rewards).sort((a, b) => parseInt(b) - parseInt(a));

//   output.pet_bonus = {};

//   // eslint-disable-next-line no-unused-vars
//   for (const [index, score] of petScoreRequired.entries()) {
//     if (parseInt(score) > output.petScore) {
//       continue;
//     }

//     output.pet_score_bonus = Object.assign({}, constants.pet_rewards[score]);

//     break;
//   }
// }

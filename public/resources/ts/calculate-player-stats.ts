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

export function getPlayerStats() {
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
      stats[name].armor ??= 0;
      stats[name].armor += value;
    }
  }

  // Active pet stats
  {
    const activePet = calculated.pets.find((pet) => pet.active);

    if (activePet) {
      for (const [name, value] of Object.entries(activePet.stats)) {
        stats[name].pet ??= 0;
        stats[name].pet += value;
      }
    }
  }

  // Held item stats
  {
    const bonusStats: ItemStats = helper.getStatsFromItem(items.highest_rarity_sword as unknown as Item);

    for (const [name, value] of Object.entries(bonusStats)) {
      stats[name].held_item ??= 0;
      stats[name].held_item += value;
    }
  }

  // Active accessories stats
  for (const item of items.talismans.filter((item) => !(item as Item).isInactive)) {
    const bonusStats: ItemStats = helper.getStatsFromItem(item as Item);

    for (const [name, value] of Object.entries(bonusStats)) {
      stats[name].accessories ??= 0;
      stats[name].accessories += value;
    }
  }

  // Skill bonus stats
  for (const [skill, data] of Object.entries(calculated.levels)) {
    const bonusStats: ItemStats = getBonusStat(data.level, `skill_${skill}`, data.maxLevel, 1);

    for (const [name, value] of Object.entries(bonusStats)) {
      stats[name][`skill_${skill}`] ??= 0;
      stats[name][`skill_${skill}`] += value;
    }
  }

  // Dungeoneering stats
  {
    const bonusStats: ItemStats = getBonusStat(
      calculated.dungeons.catacombs.level.level,
      "skill_dungeoneering",
      calculated.dungeons.catacombs.level.maxLevel
    );

    for (const [name, value] of Object.entries(bonusStats)) {
      stats[name]["skill_dungeoneering"] ??= 0;
      stats[name]["skill_dungeoneering"] += value;
    }
  }

  // Slayer bonus stats
  for (const [slayer, data] of Object.entries(calculated.slayers)) {
    const bonusStats: ItemStats = getBonusStat(data.level.currentLevel, `slayer_${slayer}`, data.level.maxLevel);

    for (const [name, value] of Object.entries(bonusStats)) {
      stats[name][`slayer_${slayer}`] ??= 0;
      stats[name][`slayer_${slayer}`] += value;
    }
  }

  // Fairy souls
  {
    const bonusStats: ItemStats = getFairyBonus(calculated.fairy_exchanges);

    for (const [name, value] of Object.entries(bonusStats)) {
      stats[name].fairy_souls ??= 0;
      stats[name].fairy_souls += value;
    }
  }

  // New year cake bag
  {
    const cakeBag = items.talisman_bag.find((x) => (x as Item).tag.ExtraAttributes?.id === "NEW_YEAR_CAKE_BAG");

    if (cakeBag && (cakeBag as Backpack).containsItems?.length > 0) {
      stats.health.new_year_cake_bag = (cakeBag as Backpack).containsItems.length;
    }
  }

  return stats;
}

function getBonusStat(level: number, key: string, max: number) {
  const bonus: ItemStats = {};
  const skill_stats: StatBonusType = constants.stats_bonus[key as BonusType];

  if (!skill_stats) {
    return bonus;
  }

  const steps = Object.keys(skill_stats)
    .sort((a, b) => Number(a) - Number(b))
    .map((a) => Number(a));

  for (let x = steps[0]; x <= max; x += 1) {
    if (level < x) {
      break;
    }

    const step = steps
      .slice()
      .reverse()
      .find((a) => a <= x);

    if (step) {
      const skill_bonus = skill_stats[step];

      for (const skill in skill_bonus) {
        bonus[skill] ??= 0;
        bonus[skill] += skill_bonus[skill];
      }
    }
  }

  return bonus;
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

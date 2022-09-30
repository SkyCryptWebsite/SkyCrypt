import * as helper from "../../../common/helper.js";
import * as bonuses from "../../../common/constants/bonuses.js";
import { STATS_BONUS } from "../../../common/constants.js";
import { FORBIDDEN_STATS } from "../../../src/constants";
import { HARP_QUEST } from "../../../src/constants";

export function getPlayerStats() {
  const stats: PlayerStats = {
    health: { base: 100 },
    defense: { base: 0 },
    strength: { base: 0 },
    speed: { base: 100 },
    crit_chance: { base: 30 },
    crit_damage: { base: 50 },
    intelligence: { base: 0 },
    bonus_attack_speed: { base: 0 },
    sea_creature_chance: { base: 20 },
    magic_find: { base: 0 },
    pet_luck: { base: 0 },
    true_defense: { base: 0 },
    ferocity: { base: 0 },
    ability_damage: { base: 0 },
    mining_speed: { base: 0 },
    mining_fortune: { base: 0 },
    farming_fortune: { base: 0 },
    foraging_fortune: { base: 0 },
    pristine: { base: 0 },
    fishing_speed: { base: 0 },
    health_regen: { base: 100 },
    vitality: { base: 100 },
    mending: { base: 100 },
    combat_wisdom: { base: 0 },
    mining_wisdom: { base: 0 },
    farming_wisdom: { base: 0 },
    foraging_wisdom: { base: 0 },
    fishing_wisdom: { base: 0 },
    enchanting_wisdom: { base: 0 },
    alchemy_wisdom: { base: 0 },
    carpentry_wisdom: { base: 0 },
    runecrafting_wisdom: { base: 0 },
    social_wisdom: { base: 0 },
  };
  const allowedStats = Object.keys(stats);
  const temp = {};

  try {
    // Bestiary Level 
    if (calculated.bestiary?.bonus) {
      stats.health.bestiary ??= 0;
      stats.health.bestiary += calculated.bestiary.bonus;
    }
  
    // Unique Pets
    if (calculated.pet_score_bonus.magic_find > 0) {
      stats.magic_find.pet_score ??= 0;
      stats.magic_find.pet_score += calculated.pet_score_bonus.magic_find;
    }
  
    // Jacob's Farming Shop
    if (calculated.farming?.perks?.double_drops > 0) {
      stats.farming_fortune.jacob_double_drops ??= 0;
      stats.farming_fortune.jacob_double_drops += calculated.farming.perks.double_drops * 2;
    }
  
    // Slayer Completion
    for (const type of Object.keys(calculated.slayers) || []) {
      for (const tiers of Object.keys(calculated.slayers[type]?.kills)) {
        if (parseInt(tiers) <= 3) {
            temp[type] ??= 0;
            temp[type] += 1;
        } else if (parseInt(tiers) == 5) { // Hypixel admins forgot to add tier 5 bosses to Wisdom calculation :/
            temp[type] ??= 0;
            temp[type] += 2;
        }
      }
    }

    for (const type of Object.keys(temp)) {
      stats.combat_wisdom.slayer ??= 0;
      stats.combat_wisdom.slayer += temp[type];
    }   

    // ? Doesn't work, not sure why
    // Harp
    /*
    for (const harp in calculated.harp_quest || []) {
      if (!harp.endsWith('_best_completion')) continue;
      stats['intelligence'].harp_quest ??= 0;
      stats['intelligence'].harp_quest += HARP_QUEST[`${harp}`];
    } 
    */
 
    // Dungeon Essence Shop
    /*
    if (Object.keys(calculated.perks).length > 0) {
      for (let [name, perkData] of Object.entries(calculated.perks)) {
        name = name.replaceAll('permanent_', '')
        if (Object.keys(FORBIDDEN_STATS).includes(name)) {
          console.log(name, perkData)
          stats[name].essence_shop_perk ??= 0;
          stats[name].essence_shop_perk += perkData * FORBIDDEN_STATS[name];
        }
      }
    }
    */


  } catch (error) {
    console.error(error);
  }

  // Active armor stats
  for (const piece of items.armor) {
    const bonusStats: ItemStats = helper.getStatsFromItem(piece as Item);

    for (const [name, value] of Object.entries(bonusStats)) {
      if (!allowedStats.includes(name)) {
        continue;
      }

      stats[name].armor ??= 0;
      stats[name].armor += value;
    }
  }

  // Active pet stats
  {
    const activePet = calculated.pets.find((pet) => pet.active);

    if (activePet) {
      for (const [name, value] of Object.entries(activePet.stats)) {
        if (!allowedStats.includes(name)) {
          continue;
        }

        stats[name].pet ??= 0;
        stats[name].pet += value;
      }
    }
  }

  // Active accessories stats
  let accessoryDuplicates = [];
  for (const item of items.accessories.filter((item) => !(item as Item).isInactive)) {
    if (accessoryDuplicates.includes(item.tag?.ExtraAttributes?.id)) continue;
    accessoryDuplicates.push(item.tag?.ExtraAttributes?.id)

    const bonusStats: ItemStats = helper.getStatsFromItem(item as Item);

    for (const [name, value] of Object.entries(bonusStats)) {
      if (!allowedStats.includes(name)) {
        continue;
      }

      stats[name].accessories ??= 0;
      stats[name].accessories += value;

      if (item.tag?.ExtraAttributes?.id == 'NIGHT_CRYSTAL' || item.tag?.ExtraAttributes?.id == 'DAY_CRYSTAL') {
        accessoryDuplicates.push(item.tag?.ExtraAttributes?.id);
        stats.health.accessories += 5;
        stats.strength.accessories += 5;
      } 
    }
  }

  // Skill bonus stats
  for (const [skill, data] of Object.entries(calculated.levels)) {
    const bonusStats: ItemStats = getBonusStat(data.level, `skill_${skill}` as BonusType, data.maxLevel);

    for (const [name, value] of Object.entries(bonusStats)) {
      if (!allowedStats.includes(name)) {
        continue;
      }

      stats[name][`skill_${skill}`] ??= 0;
      stats[name][`skill_${skill}`] += value;
    }
  }

  // Dungeoneering stats
  if (calculated.dungeons?.catacombs?.level?.level) {
    const bonusStats: ItemStats = getBonusStat(
      calculated.dungeons.catacombs.level.level,
      "skill_dungeoneering",
      calculated.dungeons.catacombs.level.maxLevel
    );

    for (const [name, value] of Object.entries(bonusStats)) {
      if (!allowedStats.includes(name)) {
        continue;
      }

      stats[name].skill_dungeoneering ??= 0;
      stats[name].skill_dungeoneering += value;
    }
  }

  // Slayer bonus stats
  for (const [slayer, data] of Object.entries(calculated.slayers)) {
    const bonusStats: ItemStats = getBonusStat(
      data.level.currentLevel,
      `slayer_${slayer}` as BonusType,
      data.level.maxLevel
    );

    for (const [name, value] of Object.entries(bonusStats)) {
      if (!allowedStats.includes(name)) {
        continue;
      }

      stats[name][`slayer_${slayer}`] ??= 0;
      stats[name][`slayer_${slayer}`] += value;
    }
  }

  // Fairy souls
  if (calculated.fairy_exchanges) {
    const bonusStats: ItemStats = getFairyBonus(calculated.fairy_exchanges);

    for (const [name, value] of Object.entries(bonusStats)) {
      if (!allowedStats.includes(name)) {
        continue;
      }

      stats[name].fairy_souls ??= 0;
      stats[name].fairy_souls += value;
    }
  }

  // New year cake bag
  {
    const cakeBag = items.accessory_bag.find((x) => (x as Item).tag?.ExtraAttributes?.id === "NEW_YEAR_CAKE_BAG");

    if (cakeBag && (cakeBag as Backpack).containsItems) {
      const totalCakes = (cakeBag as Backpack).containsItems.filter((x) => x.display_name).length;

      if (totalCakes > 0) {
        stats.health.new_year_cake_bag = totalCakes;
      }
    }
  }

  if (calculated.century_cakes) {
    for (const century_cake of calculated.century_cakes) {
      if (!allowedStats.includes(century_cake.stat)) {
        continue;
      }

      stats[century_cake.stat].cakes ??= 0;
      stats[century_cake.stat].cakes += century_cake.amount;
    }
  }

  // Reaper peppers
  if (calculated.reaper_peppers_eaten > 0) {
    stats.health.reaper_peppers = calculated.reaper_peppers_eaten;
  }

  return stats;
}

function getBonusStat(level: number, key: BonusType, max: number) {
  const bonus: ItemStats = {};
  const objOfLevelBonuses: StatBonusType = STATS_BONUS[key];

  if (!objOfLevelBonuses) {
    return bonus;
  }

  const steps = Object.keys(objOfLevelBonuses)
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
      const stepBonuses: ItemStats = objOfLevelBonuses[step];

      for (const statNameString in stepBonuses) {
        const statName: StatName = statNameString as StatName;
        bonus[statName] ??= 0;
        bonus[statName] = (bonus[statName] || 0) + (stepBonuses?.[statName] ?? 0);
      }
    }
  }

  return bonus;
}

function getFairyBonus(fairyExchanges: number) {
  const bonus: ItemStats = {};

  bonus.speed = Math.floor(fairyExchanges / 10);
  bonus.health = 0;
  bonus.defense = 0;
  bonus.strength = 0;

  for (let i = 0; i < fairyExchanges; i++) {
    bonus.health += 3 + Math.floor(i / 2);
    bonus.defense += (i + 1) % 5 == 0 ? 2 : 1;
    bonus.strength += (i + 1) % 5 == 0 ? 2 : 1;
  }

  return bonus;
}

import * as helper from "../../../common/helper.js";
import { STATS_BONUS, FORBIDDEN_STATS, HARP_QUEST, POTION_EFFECTS } from "../../../common/constants.js";

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

  // Skyblock Level
  if (calculated.skyblock_level.level && calculated.skyblock_level.level > 0) {
    stats.health.skyblock_level = calculated.skyblock_level.level * 5;
    stats.strength.skyblock_level = Math.floor(calculated.skyblock_level.level / 5);
  }

  // Bestiary
  if (calculated.bestiary?.milestone !== undefined) {
    stats.health.bestiary = Math.floor(calculated.bestiary.milestone / 10);
  }

  // Unique Pets
  if (calculated.pets?.pet_score?.amount !== undefined) {
    stats.magic_find.pet_score = calculated.pets.pet_score.amount;
  }

  // Jacob's Farming Shop
  if (calculated?.farming?.perks?.double_drops !== undefined) {
    stats.farming_fortune.jacob_double_drops = calculated.farming.perks.double_drops * 4;
  }

  // Slayer Completion
  if (calculated.slayer && calculated.slayer.slayers) {
    for (const value of Object.values(calculated.slayer.slayers ?? {})) {
      stats.combat_wisdom.slayer ??= 0;
      for (const tier in value.kills) {
        if (parseInt(tier) <= 3) {
          stats.combat_wisdom.slayer += 1;
          continue;
        }

        stats.combat_wisdom.slayer += 2;
      }
    }
  }

  // Heart of the Mountain
  for (const ability of items.hotm) {
    const item = ability as Item;
    if (item.tag?.ExtraAttributes === undefined || item.tag.ExtraAttributes?.enabled === false) {
      continue;
    }

    const maxLevel = item.tag.ExtraAttributes?.max_level as number;
    const level = item.tag.ExtraAttributes?.level as number;
    const id = item.tag.ExtraAttributes?.id as string;

    const bonusStats: ItemStats = getBonusStat(level, `HOTM_perk_${id}` as BonusType, maxLevel);
    for (const [name, value] of Object.entries(bonusStats)) {
      if (!allowedStats.includes(name)) {
        continue;
      }

      stats[name].heart_of_the_mountain ??= 0;
      stats[name].heart_of_the_mountain += value;
    }
  }

  // Active armor stats
  for (const piece of items.armor.armor) {
    const bonusStats: ItemStats = helper.getStatsFromItem(piece as Item);

    for (const [name, value] of Object.entries(bonusStats)) {
      if (!allowedStats.includes(name)) {
        continue;
      }

      stats[name].armor ??= 0;
      stats[name].armor += value;
    }
  }

  // Harp Quest
  for (const harp in calculated.harp_quest || {}) {
    const harpID = harp as HarpQuestSongs;
    if (harpID.endsWith("_best_completion") === false) {
      continue;
    }

    stats.intelligence.harp ??= 0;
    stats.intelligence.harp += HARP_QUEST[harpID];
  }

  console.log(calculated.perks);
  // Essence Shop
  for (const perk in calculated.perks ?? {}) {
    if (perk in FORBIDDEN_STATS === false && perk !== "unbreaking") {
      continue;
    }

    if (perk === "unbreaking") {
      stats.vitality.essence_shop ??= 0;
      stats.vitality.essence_shop += calculated.perks[perk] * 2;
      continue;
    }

    const name = perk.split("_")[1];
    if (!allowedStats.includes(name)) {
      continue;
    }

    stats[name].essence_shop ??= 0;
    stats[name].essence_shop += calculated.perks[perk] * FORBIDDEN_STATS[perk as keyof typeof FORBIDDEN_STATS];
  }

  // Active equipment stats
  for (const piece of items.equipment.equipment) {
    const bonusStats: ItemStats = helper.getStatsFromItem(piece as Item);

    for (const [name, value] of Object.entries(bonusStats)) {
      if (!allowedStats.includes(name)) {
        continue;
      }

      stats[name].equipment ??= 0;
      stats[name].equipment += value;
    }
  }

  // Active pet stats
  if (calculated.pets?.pets !== undefined) {
    const activePet = calculated.pets.pets.find((pet) => pet.active);

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
  for (const item of items.accessories.accessories.filter((item) => !(item as Item).isInactive)) {
    const bonusStats: ItemStats = helper.getStatsFromItem(item as Item);

    for (const [name, value] of Object.entries(bonusStats)) {
      if (!allowedStats.includes(name)) {
        continue;
      }

      stats[name].accessories ??= 0;
      stats[name].accessories += value;
    }
  }

  // Skill bonus stats
  for (const [skill, data] of Object.entries(calculated.skills.skills)) {
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
      Math.min(calculated.dungeons?.catacombs?.level?.maxLevel, 50),
      "skill_dungeoneering",
      calculated.dungeons.catacombs.level.maxLevel,
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
  if (calculated.slayer?.slayers !== undefined) {
    for (const [slayer, data] of Object.entries(calculated.slayer.slayers)) {
      const bonusStats: ItemStats = getBonusStat(
        data.level.currentLevel,
        `slayer_${slayer}` as BonusType,
        data.level.maxLevel,
      );

      for (const [name, value] of Object.entries(bonusStats)) {
        if (!allowedStats.includes(name)) {
          continue;
        }

        stats[name][`slayer_${slayer}`] ??= 0;
        stats[name][`slayer_${slayer}`] += value;
      }
    }
  }

  // New year cake bag
  {
    const cakeBag = items.accessories.accessories.find(
      (x) => (x as Item).tag?.ExtraAttributes?.id === "NEW_YEAR_CAKE_BAG",
    );

    if (cakeBag && (cakeBag as Backpack).containsItems) {
      const totalCakes = (cakeBag as Backpack).containsItems.filter((x) => x.display_name).length;

      if (totalCakes > 0) {
        stats.health.new_year_cake_bag = totalCakes;
      }
    }
  }

  if (calculated.century_cakes) {
    for (const centuryCake of calculated.century_cakes) {
      if (!allowedStats.includes(centuryCake.stat)) {
        continue;
      }

      stats[centuryCake.stat].cakes ??= 0;
      stats[centuryCake.stat].cakes += centuryCake.amount;
    }
  }

  // Reaper peppers
  if (calculated?.misc?.uncategorized?.reaper_peppers_eaten?.raw !== undefined) {
    stats.health.reaper_peppers = calculated.misc.uncategorized.reaper_peppers_eaten.raw as number;
  }

  // Active Potion Effects
  if (calculated?.misc?.effects?.active) {
    for (const effect of calculated.misc.effects.active) {
      if (effect.effect in POTION_EFFECTS === false) {
        console.log(`Unknown potion effect: ${effect.effect}`);
        continue;
      }

      const effectLevel = effect.level;
      const effectID = effect.effect as PotionEffectIDs;
      for (const [name, value] of Object.entries(POTION_EFFECTS[effectID].bonuses)) {
        if (!allowedStats.includes(name)) {
          continue;
        }

        stats[name].potion ??= 0;
        stats[name].potion += value[effectLevel - 1];
      }
    }
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

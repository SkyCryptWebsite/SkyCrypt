import * as helper from "../../../common/helper.js";
import { STATS_BONUS } from "../../../common/constants.js";

const HARP_QUEST = {
  song_hymn_joy_best_completion: 1,
  song_frere_jacques_best_completion: 1,
  song_amazing_grace_best_completion: 1,
  song_brahms_best_completion: 2,
  song_happy_birthday_best_completion: 2,
  song_greensleeves_best_completion: 2,
  song_jeopardy_best_completion: 3,
  song_minuet_best_completion: 3,
  song_joy_world_best_completion: 3,
  song_pure_imagination_best_completion: 4,
  song_vie_en_rose_best_completion: 4,
  song_fire_and_flames_best_completion: 1,
  song_pachelbel_best_completion: 1,
};
const FORBIDDEN_STATS = {
  speed: 1,
  intelligence: 2,
  health: 2,
  defense: 1,
  strength: 1,
};

const ARMOR_SETS = {
  SUPERIOR_DRAGON_ARMOR: {
    name: "Superior Dragon Armor",
    helmet: "SUPERIOR_DRAGON_HELMET",
    chestplate: "SUPERIOR_DRAGON_CHESTPLATE",
    leggings: "SUPERIOR_DRAGON_LEGGINGS",
    boots: "SUPERIOR_DRAGON_BOOTS",
    bonus: {
      statsMultiplier: 0.05,
    },
  },
  YOUNG_DRAGON_ARMOR: {
    name: "Young Dragon Armor",
    helmet: "YOUNG_DRAGON_HELMET",
    chestplate: "YOUNG_DRAGON_CHESTPLATE",
    leggings: "YOUNG_DRAGON_LEGGINGS",
    boots: "YOUNG_DRAGON_BOOTS",
    bonus: {
      speed: 75,
      speed_cap: 500,
    },
  },
  HOLY_DRAGON_ARMOR: {
    name: "Holy Dragon Armor",
    helmet: "HOLY_DRAGON_HELMET",
    chestplate: "HOLY_DRAGON_CHESTPLATE",
    leggings: "HOLY_DRAGON_LEGGINGS",
    boots: "HOLY_DRAGON_BOOTS",
    bonus: {
      health_regen: 200,
    },
  },
  LAPIS_ARMOR: {
    name: "Lapis Armor",
    helmet: "LAPIS_ARMOR_HELMET",
    chestplate: "LAPIS_ARMOR_CHESTPLATE",
    leggings: "LAPIS_ARMOR_LEGGINGS",
    boots: "LAPIS_ARMOR_BOOTS",
    bonus: {
      health: 60,
    },
  },
  CHEAP_TUXEDO_ARMOR: {
    name: "Cheap Tuxedo Armor",
    helmet: "CHEAP_TUXEDO_HELMET",
    chestplate: "CHEAP_TUXEDO_CHESTPLATE",
    leggings: "CHEAP_TUXEDO_LEGGINGS",
    boots: "CHEAP_TUXEDO_BOOTS",
    bonus: {
      health_cap: 75,
    },
  },
  FANCY_TUXEDO_ARMOR: {
    name: "Fancy Tuxedo Armor",
    helmet: "FANCY_TUXEDO_HELMET",
    chestplate: "FANCY_TUXEDO_CHESTPLATE",
    leggings: "FANCY_TUXEDO_LEGGINGS",
    boots: "FANCY_TUXEDO_BOOTS",
    bonus: {
      health_cap: 150,
    },
  },
  ELEGANT_TUXEDO_ARMOR: {
    name: "Elegant Tuxedo Armor",
    helmet: "ELEGANT_TUXEDO_HELMET",
    chestplate: "ELEGANT_TUXEDO_CHESTPLATE",
    leggings: "ELEGANT_TUXEDO_LEGGINGS",
    boots: "ELEGANT_TUXEDO_BOOTS",
    bonus: {
      health_cap: 250,
    },
  },
};

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
    speed_cap: { base: 0},
    health_cap: { base: 0},
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
        } else if (parseInt(tiers) == 5) {
          // Hypixel admins forgot to add tier 5 bosses to Wisdom calculation :/
          temp[type] ??= 0;
          temp[type] += 2;
        }
      }
    }

    for (const type of Object.keys(temp)) {
      stats.combat_wisdom.slayer ??= 0;
      stats.combat_wisdom.slayer += temp[type];
    }

    // Heart Of The Mountain
    for (const a of calculated?.hotm || []) {
      if (
        a?.display_name == "Mining Speed I" ||
        a?.display_name == "Mining Speed II" ||
        a?.display_name == "Mining Fortune I" ||
        a?.display_name == "Mining Fortune II" ||
        a?.display_name == "Mining Madness" ||
        a?.display_name == "Seasoned Mineman"
      ) {
        a.level = a.tag.display.Lore[1].split(" ")[1] || 0;
        a.disabled = a.tag.display.Lore[a.tag.display?.Lore.length - 1].includes("ENABLED") ? false : true || false;
        if (a?.display_name == "Mining Speed I" && a.disabled == false) {
          stats.mining_speed.heart_of_the_mountain ??= 0;
          stats.mining_speed.heart_of_the_mountain += a.level * 20;
        }
        if (a?.display_name == "Mining Speed II" && a.disabled == false) {
          stats.mining_speed.heart_of_the_mountain ??= 0;
          stats.mining_speed.heart_of_the_mountain += a.level * 40;
        }
        if (a?.display_name == "Mining Fortune I" && a.disabled == false) {
          stats.mining_fortune.heart_of_the_mountain ??= 0;
          stats.mining_fortune.heart_of_the_mountain += a.level * 5;
        }
        if (a?.display_name == "Mining Fortune II" && a.disabled == false) {
          stats.mining_fortune.heart_of_the_mountain ??= 0;
          stats.mining_fortune.heart_of_the_mountain += a.level * 5;
        }
        if (a?.display_name == "Seasoned Mineman" && a.disabled == false) {
          stats.mining_wisdom.heart_of_the_mountain ??= 0;
          stats.mining_wisdom.heart_of_the_mountain += 5 + a.level * 0.1;
        }
        if (a?.display_name == "Mining Madness" && a.disabled == false) {
          stats.mining_speed.heart_of_the_mountain ??= 0;
          stats.mining_speed.heart_of_the_mountain += 50;
          stats.mining_fortune.heart_of_the_mountain ??= 0;
          stats.mining_fortune.heart_of_the_mountain += 50;
        }
      }
    }

    // Harp Quest
    for (const harp in calculated.harp_quest || []) {
      if (harp?.endsWith("_best_completion")) {
        stats.intelligence.harp ??= 0;
        stats.intelligence.harp += HARP_QUEST[harp];
      }
    }

    // Dungeon Essence Shop
    if (Object.keys(calculated.perks).length > 0) {
      for (let [name, perkData] of Object.entries(calculated.perks)) {
        name = name.replaceAll("permanent_", "");
        if (Object.keys(FORBIDDEN_STATS).includes(name)) {
          stats[name].essence_shop_perk ??= 0;
          stats[name].essence_shop_perk += perkData * FORBIDDEN_STATS[name];
        }
      }
    }
    
    // Armor Abiltiies
    let boots, leggings, chestplate, helmet;
    for (const piece of items.armor) {
      if (piece.categories.includes("boots")) boots = piece;
      if (piece.categories.includes("leggings")) leggings = piece;
      if (piece.categories.includes("chestplate")) chestplate = piece;
      if (piece.categories.includes("helmet")) helmet = piece;
    } 
    
    for (const armorSet of Object.keys(ARMOR_SETS)) {
      if (helmet?.tag.ExtraAttributes.id == ARMOR_SETS[armorSet].helmet && chestplate?.tag.ExtraAttributes.id == ARMOR_SETS[armorSet].chestplate && leggings?.tag.ExtraAttributes.id == ARMOR_SETS[armorSet].leggings && boots?.tag.ExtraAttributes.id == ARMOR_SETS[armorSet].boots) {
          for (const [stat, value] of Object.entries(ARMOR_SETS[armorSet].bonus)) { 
            console.log(armorSet, stat, value)
            stats[stat].armor ??= 0;
            stat.includes('_cap') ? stats[stat].armor = value : stats[armor] += value;
          }
      }
      

      // TODO: Make Special Abilities work with format above
      // ? Mastiff Armor
      if (helmet?.tag.ExtraAttributes.id == 'MASTIFF_HELMET' && chestplate?.tag.ExtraAttributes.id == 'MASTIFF_CHESTPLATE' && leggings?.tag.ExtraAttributes.id == 'MASTIFF_LEGGINGS' && boots?.tag.ExtraAttributes.id == 'MASTIFF_BOOTS') {
          stats.health.armor += (stats.crit_damage || 0) * 50;
          stats.crit_damage.armor = stats['crit_damage'] / 2;
      }

      // ? Obsidian Chestplate
      /*
      if (chestplate?.tag.ExtraAttributes.id == 'OBSIDIAN_CHESTPLATE') {
        stats.speed.armor += itemCount.OBSIDIAN.armor / 20 ? (itemCount.OBSIDIAN.armor / 20).toFixed(0) : 0;
      }
      */

      // ? Glacite Armor
      if (helmet?.tag.ExtraAttributes.id == 'GLACITE_HELMET' && chestplate?.tag.ExtraAttributes.id == 'GLACITE_CHESTPLATE' && leggings?.tag.ExtraAttributes.id == 'GLACITE_LEGGINGS' && boots?.tag.ExtraAttributes.id == 'GLACITE_BOOTS') {
        stats.mining_speed.armor += calculated.levels.mining.level * 2;
      }

      // ? Fairy Armor
      if (helmet?.tag.ExtraAttributes.id == 'FAIRY_HELMET' && chestplate?.tag.ExtraAttributes.id == 'FAIRY_CHESTPLATE' && leggings?.tag.ExtraAttributes.id == 'FAIRY_LEGGINGS' && boots?.tag.ExtraAttributes.id == 'FAIRY_BOOTS') {
        stats.health.armor += calculated.fairy_souls.collected || 0;
      }

      // ? Emerald Armor
      if (helmet?.tag.ExtraAttributes.id == 'EMERALD_ARMOR_HELMET' && chestplate?.tag.ExtraAttributes.id == 'EMERALD_ARMOR_CHESTPLATE' && leggings?.tag.ExtraAttributes.id == 'EMERALD_ARMOR_LEGGINGS' && boots?.tag.ExtraAttributes.id == 'EMERALD_ARMOR_BOOTS') {
        const amount = calculated.collections.EMERALD.amount || 0;
        stats.health.armor ??= 0;
        stats.health.armor += (amount / 3000).toFixed(0) > 350 ? 350 : (amount / 3000).toFixed(0);
        stats.defense.armor ??= 0;
        stats.defense.armor += (amount / 3000).toFixed(0) > 350 ? 350 : (amount / 3000).toFixed(0);
      }
  }

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
    accessoryDuplicates.push(item.tag?.ExtraAttributes?.id);

    const bonusStats: ItemStats = helper.getStatsFromItem(item as Item);

    for (const [name, value] of Object.entries(bonusStats)) {
      if (!allowedStats.includes(name)) {
        continue;
      }

      stats[name].accessories ??= 0;
      stats[name].accessories += value;

      if (item.tag?.ExtraAttributes?.id == "NIGHT_CRYSTAL" || item.tag?.ExtraAttributes?.id == "DAY_CRYSTAL") {
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

import * as helper from "../../../common/helper.js";
import * as CONSTANTS from "../../../common/constants.js";

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
    speed_cap: { base: 0 },
    health_cap: { base: 0 },
  };
  const allowedStats = Object.keys(stats);
  const temp: { [key: string]: number; } = {};
  let statsMultiplier = 0,
    healthMultiplier = 0,
    defenseMultiplier = 0,
    strengthMultiplier = 0,
    bonusAttackSpeedMultiplier = 0,
    ferocityMultiplier = 0;

  // Bestiary Level
  if (calculated?.bestiary.bonus > 0) {
    stats.health.bestiary ??= 0;
    stats.health.bestiary += calculated.bestiary.bonus;
  }

  // Unique Pets
  if (calculated.pet_score_bonus.magic_find || 0 > 0) {
    stats.magic_find.pet_score ??= 0;
    stats.magic_find.pet_score += calculated.pet_score_bonus.magic_find || 0;
  }

  // Jacob's Farming Shop
  if (calculated.farming?.perks?.double_drops > 0) {
    stats.farming_fortune.jacob_double_drops ??= 0;
    stats.farming_fortune.jacob_double_drops += calculated.farming.perks.double_drops * 2;
  }

  // Slayer Completion
  for (const type of Object.keys(calculated.slayers) || []) {
    for (const tiers of Object.keys(calculated.slayers[type as keyof typeof calculated.slayers]?.kills) || []) {
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
  for (const a of calculated.hotm) {
    if (
      a.display_name == "Mining Speed I" ||
      a.display_name == "Mining Speed II" ||
      a.display_name == "Mining Fortune I" ||
      a.display_name == "Mining Fortune II" ||
      a.display_name == "Mining Madness" ||
      a.display_name == "Seasoned Mineman"
    ) {
      a.level = a.tag.display.Lore[1].split(" ")[1] || 0;
      a.disabled = a.tag.display.Lore[a.tag.display?.Lore.length - 1].includes("ENABLED") ? false : true || false;
      if (a.display_name == "Mining Speed I" && a.disabled == false) {
        stats.mining_speed.heart_of_the_mountain ??= 0;
        stats.mining_speed.heart_of_the_mountain += a.level * 20;
      }
      if (a.display_name == "Mining Speed II" && a.disabled == false) {
        stats.mining_speed.heart_of_the_mountain ??= 0;
        stats.mining_speed.heart_of_the_mountain += a.level * 40;
      }
      if (a.display_name == "Mining Fortune I" && a.disabled == false) {
        stats.mining_fortune.heart_of_the_mountain ??= 0;
        stats.mining_fortune.heart_of_the_mountain += a.level * 5;
      }
      if (a.display_name == "Mining Fortune II" && a.disabled == false) {
        stats.mining_fortune.heart_of_the_mountain ??= 0;
        stats.mining_fortune.heart_of_the_mountain += a.level * 5;
      }
      if (a.display_name == "Seasoned Mineman" && a.disabled == false) {
        stats.mining_wisdom.heart_of_the_mountain ??= 0;
        stats.mining_wisdom.heart_of_the_mountain += 5 + parseInt(a.level.toString().split("/")[1]) * 0.1 || 0;
      }
      if (a.display_name == "Mining Madness" && a.disabled == false) {
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
      stats.intelligence.harp += CONSTANTS.HARP_QUEST[harp];
    }
  }

  // Dungeon Essence Shop
  if (Object.keys(calculated.perks).length > 0) {
    for (let [name, perkData] of Object.entries(calculated.perks)) {
      name = name.replaceAll("permanent_", "");
      if (Object.keys(CONSTANTS.FORBIDDEN_STATS).includes(name)) {
        stats[name].essence_shop ??= 0;
        stats[name].essence_shop += perkData * CONSTANTS.FORBIDDEN_STATS[name];
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

  for (const armorSet of Object.keys(CONSTANTS.CUSTOM_ARMOR_ABILTIES)) {
    if (
      helmet?.tag.ExtraAttributes.id == CONSTANTS.CUSTOM_ARMOR_ABILTIES[armorSet].helmet &&
      chestplate?.tag.ExtraAttributes.id == CONSTANTS.CUSTOM_ARMOR_ABILTIES[armorSet].chestplate &&
      leggings?.tag.ExtraAttributes.id == CONSTANTS.CUSTOM_ARMOR_ABILTIES[armorSet].leggings &&
      boots?.tag.ExtraAttributes.id == CONSTANTS.CUSTOM_ARMOR_ABILTIES[armorSet].boots
    ) {
      for (const [stat, value] of Object.entries(CONSTANTS.CUSTOM_ARMOR_ABILTIES[armorSet].bonus)) {
        console.log(armorSet, stat, value);
        stats[stat].armor ??= 0;
        stat.includes("_cap") ? (stats[stat].armor = value as keyof typeof value) : (stats[stat].armor += value as keyof typeof value);
      }
    }

    // TODO: Make Special Abilities work with format above
    // ? Mastiff Armor
    if (
      helmet?.tag.ExtraAttributes.id == "MASTIFF_HELMET" &&
      chestplate?.tag.ExtraAttributes.id == "MASTIFF_CHESTPLATE" &&
      leggings?.tag.ExtraAttributes.id == "MASTIFF_LEGGINGS" &&
      boots?.tag.ExtraAttributes.id == "MASTIFF_BOOTS"
    ) {
      stats.health.armor += stats.crit_damage * 50;
      stats.crit_damage.armor = stats["crit_damage"] / 2;
    }

    // ? Obsidian Chestplate
    /*
    if (chestplate?.tag.ExtraAttributes.id == 'OBSIDIAN_CHESTPLATE') {
      stats.speed.armor += itemCount.OBSIDIAN.armor / 20 ? (itemCount.OBSIDIAN.armor / 20).toFixed(0) : 0;
    }
    */

    // ? Glacite Armor
    if (
      helmet?.tag.ExtraAttributes.id == "GLACITE_HELMET" &&
      chestplate?.tag.ExtraAttributes.id == "GLACITE_CHESTPLATE" &&
      leggings?.tag.ExtraAttributes.id == "GLACITE_LEGGINGS" &&
      boots?.tag.ExtraAttributes.id == "GLACITE_BOOTS"
    ) {
      stats.mining_speed.armor += calculated.levels.mining.level * 2;
    }

    // ? Fairy Armor
    if (
      helmet?.tag.ExtraAttributes.id == "FAIRY_HELMET" &&
      chestplate?.tag.ExtraAttributes.id == "FAIRY_CHESTPLATE" &&
      leggings?.tag.ExtraAttributes.id == "FAIRY_LEGGINGS" &&
      boots?.tag.ExtraAttributes.id == "FAIRY_BOOTS"
    ) {
      stats.health.armor += calculated.fairy_souls.collected || 0;
    }

    // ? Emerald Armor
    if (
      helmet?.tag.ExtraAttributes.id == "EMERALD_ARMOR_HELMET" &&
      chestplate?.tag.ExtraAttributes.id == "EMERALD_ARMOR_CHESTPLATE" &&
      leggings?.tag.ExtraAttributes.id == "EMERALD_ARMOR_LEGGINGS" &&
      boots?.tag.ExtraAttributes.id == "EMERALD_ARMOR_BOOTS"
    ) {
      const amount: number = calculated.collections.EMERALD.amount;
      stats.health.armor ??= 0;
      stats.health.armor += parseInt((amount / 3000).toFixed(0)) > 350 ? 350 : parseInt((amount / 3000).toFixed(0));
      stats.defense.armor ??= 0;
      stats.defense.armor += parseInt((amount / 3000).toFixed(0)) > 350 ? 350 : parseInt((amount / 3000).toFixed(0));
    }
  }

  // Custom pet abilities
  const petStats = getPetData(
    stats,
    calculated.pets.find((a) => a.active),
    calculated
  );

  Object.assign(stats, petStats.stats);

  statsMultiplier += petStats.statsMultiplier || 0;
  bonusAttackSpeedMultiplier += petStats.bonusAttackSpeedMultiplier || 0;
  ferocityMultiplier += petStats.ferocityMultiplier || 0;
  defenseMultiplier += petStats.defenseMultiplier || 0;
  healthMultiplier += petStats.healthMultiplier || 0;
  strengthMultiplier += petStats.strengthMultiplier || 0;
  statsMultiplier += petStats.statsMultiplier || 0;

  // Reforge
  const rarities = items.accessory_rarities;
  const playerMagicalPower: { [key: string]: number; } = {};

  for (const rarity in CONSTANTS.MAGICAL_POWER) {
    playerMagicalPower[rarity] = 0;
    playerMagicalPower[rarity] += rarities[rarity] * CONSTANTS.MAGICAL_POWER[rarity];
  }

  const mpHegemony: number = rarities.hegemony ? CONSTANTS.MAGICAL_POWER[rarities.hegemony.rarity] : 0;
  const mpTotal: number = Object.values(playerMagicalPower).reduce((a, b) => a + b) + mpHegemony;

  // ? Accessory reforge
  if (calculated.selected_reforge && CONSTANTS.REFORGES[calculated.selected_reforge]?.reforge) {
    for (const [stat, value] of Object.entries(CONSTANTS.REFORGES[calculated.selected_reforge].reforge)) {
      stats[stat].reforge ??= 0;
      stats[stat].reforge += value as number * mpTotal;
    }

    // ? Power Bonus from Reforge
    for (const [stat, value] of Object.entries(CONSTANTS.REFORGES[calculated.selected_reforge].power_bonus)) {
      stats[stat].reforge ??= 0;
      stats[stat].reforge += value as number;
    }
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

  // Active equipment stats
  for (const piece of items.equipment) {
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
  const accessoryDuplicates: string[] = [];
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

  stats.health ??= 0;
  stats.ferocity ??= 0;
  stats.defense ??= 0;
  stats.strength ??= 0;
  stats.bonus_attack_speed ??= 0;
  stats.health = healthMultiplier > 0 ? stats.health + stats.health * healthMultiplier : stats.health;
  stats.ferocity = ferocityMultiplier > 0 ? stats.ferocity + stats.ferocity * ferocityMultiplier : stats.ferocity;
  stats.defense = defenseMultiplier > 0 ? stats.defense + stats.defense * defenseMultiplier : stats.defense;
  stats.strength = strengthMultiplier > 0 ? stats.strength + stats.strength * strengthMultiplier : stats.strength;
  stats.bonus_attack_speed =
    bonusAttackSpeedMultiplier > 0
      ? stats.bonus_attack_speed + stats.bonus_attack_speed * bonusAttackSpeedMultiplier
      : stats.bonus_attack_speed;

  if (statsMultiplier > 0) {
    for (const stat of Object.keys(stats)) {
      if (stat.includes("fortune" || stat == "pristine" || stat == "effective_health")) continue;
      stats.stat += stats.stat * statsMultiplier;
    }
  }

  // Speed Cap
  stats.speed = stats.speed > stats.speed_cap ? (stats.speed = stats.speed_cap) : stats.speed;

  // Health Cap
  stats.health = stats.health > stats.health_cap ? (stats.health = stats.health_cap) : stats.health;

  // Potion Effects
  for (const effect of calculated.active_effects) {
    if (!effect.effect || !CONSTANTS.POTION_EFFECTS[effect.effect][effect.level]?.bonus) continue;
    for (const [stat, value] of Object.entries(CONSTANTS.POTION_EFFECTS[effect.effect][effect.level]?.bonus) || []) {
      stats[stat].potion ??= 0;
      stats[stat].potion += value;
    }
  }

  return stats;
}

function getBonusStat(level: number, key: BonusType, max: number) {
  const bonus: ItemStats = {};
  const objOfLevelBonuses: StatBonusType = CONSTANTS.STATS_BONUS[key];

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

function getPetData(stats, pet, calculated) {
  let statsMultiplier = 0,
    healthMultiplier = 0,
    defenseMultiplier = 0,
    strengthMultiplier = 0,
    bonusAttackSpeedMultiplier = 0,
    ferocityMultiplier = 0;

  if (!pet) {
    return {
      stats: stats,
      statsMultiplier: 0,
      healthMultiplier: 0,
      defenseMultiplier: 0,
      strengthMultiplier: 0,
      bonusAttackSpeedMultiplier: 0,
      ferocityMultiplier: 0,
    };
  }

  // ? OVERALL
  if (pet.type == "ENDER_DRAGON") {
    if (pet.tier != "LEGENDARY") {
      statsMultiplier += 0.001 * pet.level.level;
    }
  }

  // ? HEALTH
  if (pet.type == "BLUE_WHALE") {
    if (pet.tier == "LEGENDARY") {
      healthMultiplier += 0.002 * pet.level.level;
    }
  }

  // ? DEFENSE (SPEED, HEALTH, FARMING FORTUNE, TRUE DEFENSE)
  if (pet.type == "AMMONITE") {
    if (pet.tier == "LEGENDARY") {
      stats.defense.pet ??= 0;
      stats.defense.pet +=
        calculated.levels.mining.level * (0.02 * pet.level.level) +
        calculated.levels.fishing.level * (0.02 * pet.level.level);
      stats.speed.pet ??= 0;
      stats.speed.pet +=
        calculated.levels.mining.level * (0.02 * pet.level.level) +
        calculated.levels.fishing.level * (0.02 * pet.level.level);
    }
  }

  if (pet.type == "ELEPHANT") {
    if (pet.tier == "COMMON" || pet.tier == "UNCOMMON") {
      stats.defense.pet ??= 0;
      stats.defense.pet += (stats.speed.pet / 100) * 0.15 * pet.level.level;
    }
    if (pet.tier == "RARE") {
      stats.defense.pet ??= 0;
      stats.health.pet ??= 0;
      stats.defense.pet += (stats.speed / 100) * 0.15 * pet.level.level;
      stats.health.pet += (stats.defense / 10) * 0.01 * pet.level.level;
    }
    if (pet.tier == "EPIC") {
      stats.defense.pet ??= 0;
      stats.health.pet ??= 0;
      stats.defense.pet += (stats.speed / 100) * 0.2 * pet.level.level;
      stats.health.pet += (stats.defense / 10) * 0.01 * pet.level.level;
    }
    if (pet.tier == "LEGENDARY") {
      stats.defense.pet ??= 0;
      stats.health.pet ??= 0;
      stats.defense.pet += (stats.speed / 100) * 0.2 * pet.level.level;
      stats.health.pet += (stats.defense / 10) * 0.01 * pet.level.level;
    }
  }

  if (pet.type == "BABY_YETI") {
    if (pet.tier == "EPIC") {
      stats.defense.pet ??= 0;
      stats.defense.pet += stats.strength / (0.5 * pet.level.level);
    }
    if (pet.tier == "LEGENDARY") {
      stats.defense.pet ??= 0;
      stats.defense.pet += stats.strength / (0.75 * pet.level.level);
    }
  }

  if (pet.type == "SILVERFISH") {
    if (pet.tier == "COMMON") {
      stats.true_defense.pet ??= 0;
      stats.true_defense.pet += 0.05 * pet.level.level;
    }
    if (pet.tier == "UNCOMMON") {
      stats.true_defense.pet ??= 0;
      stats.true_defense.pet += 0.1 * pet.level.level;
    }
    if (pet.tier == "RARE") {
      stats.true_defense.pet ??= 0;
      stats.mining_wisdom.pet ??= 0;
      stats.true_defense.pet += 0.1 * pet.level.level;
      stats.mining_wisdom.pet += 0.25 * pet.level.level;
    }
    if (pet.tier == "EPIC" || pet.tier == "LEGENDARY") {
      stats.true_defense.pet ??= 0;
      stats.mining_wisdom.pet ??= 0;
      stats.true_defense.pet += 0.15 * pet.level.level;
      stats.mining_wisdom.pet += 0.3 * pet.level.level;
    }
  }

  if (pet.type == "TURTLE") {
    if (pet.tier == "EPIC" || pet.tier == "LEGENDARY") {
      defenseMultiplier += 0.33 + 0.27 * pet.level.level;
    }
  }

  // ? TRUE DEFENSE (DEFENSE, COMBAT WISDOM)
  if (pet.type == "DROPLET_WISP") {
    stats.combat_wisdom.pet ??= 0;
    stats.combat_wisdom.pet += 0.3 * pet.level.level;
  }

  if (pet.type == "FROST_WISP") {
    stats.combat_wisdom.pet ??= 0;
    stats.combat_wisdom.pet += 0.4 * pet.level.level;
  }

  if (pet.type == "GLACIAL_WISP") {
    stats.combat_wisdom.pet ??= 0;
    stats.combat_wisdom.pet += 0.45 * pet.level.level;
  }

  if (pet.type == "SUBZERO_WISP") {
    stats.combat_wisdom.pet ??= 0;
    stats.combat_wisdom.pet += 0.5 * pet.level.level;
  }

  // ? STRENGTH (MAGIC FIND)
  if (pet.type == "GRIFFIN") {
    if (pet.tier == "LEGENDARY") {
      strengthMultiplier += 1 + 0.14 * pet.level.level;
    }
  }

  // ? SPEED (MINING SPEED, MAGIC FIND, PET LUCK, SPEED CAP)

  if (pet.type == "BLACK_CAT") {
    if (pet.tier == "LEGENDARY") {
      stats.speed.pet ??= 0;
      stats.speed.pet += pet.level.level;
      stats.magic_find.pet ??= 0;
      stats.magic_find.pet += 0.15 * pet.level.level;
      stats.pet_luck.pet ??= 0;
      stats.pet_luck.pet += 0.15 * pet.level.level;
      stats.speed_cap.pet = 500;
    }
  }

  if (pet.type == "ARMADILO") {
    if (pet.tier == "LEGENDARY") {
      stats.speed.pet ??= 0;
      stats.speed.pet += stats.defense.pet / (100 - pet.level.level * 0.5);
      stats.mining_speed.pet ??= 0;
      stats.mining_speed.pet += stats.defense.pet / (100 - pet.level.level * 0.5);
    }
  }

  // ? FEROCITY
  if (pet.type == "TIGER") {
    if (pet.tier == "COMMON") {
      ferocityMultiplier += 0.1 * pet.level.level;
    }
    if (pet.tier == "UNCOMMON" || pet.tier == "RARE") {
      ferocityMultiplier += 0.2 * pet.level.level;
    }
    if (pet.tier == "EPIC" || pet.tier == "LEGENDARY") {
      ferocityMultiplier += 0.3 * pet.level.level;
    }
  }

  // ? VITALITY
  if (pet.type == "GHOUL") {
    if (pet.tier == "EPIC" || pet.tier == "LEGENDARY") {
      stats.vitality.pet ??= 0;
      stats.vitality.pet += 0.25 * pet.level.level;
    }
  }

  // ? BONUS ATTACK SPEED
  if (pet.type == "HOUND") {
    if (pet.tier == "LEGENDARY") {
      bonusAttackSpeedMultiplier += 0.1 * pet.level.level;
    }
  }
  // ? MINING FORTUNE
  if (pet.type == "SCATHA") {
    if (pet.tier == "LEGENDARY") {
      stats.mining_fortune.pet ??= 0;
      stats.mining_fortune.pet += 1.25 * pet.level.level;
    }
  }

  // ? FISHING SPEED
  if (pet.type == "FLYING_FIISH") {
    if (pet.tier == "RARE") {
      stats.fishing_speed.pet ??= 0;
      stats.fishing_speed.pet += 0.6 * pet.level.level;
    }
    if (pet.tier == "EPIC" || pet.tier == "LEGENDARY" || pet.tier == "MYTHIC") {
      stats.fishing_speed.pet ??= 0;
      stats.fishing_speed.pet += 0.75 * pet.level.level;
    }
  }

  // ? SEA CREATURE CHANCE
  if (pet.type == "AMMONITE") {
    if (pet.tier == "LEGENDARY") {
      stats.sea_creature_chance.pet ??= 0;
      stats.sea_creature_chance.pet += calculated.hotm[0].display_name.split(" ")[1];
    }
  }

  // ? FORAGING FORTUNE
  if (pet.type == "MONKEY") {
    if (pet.tier == "COMMON") {
      stats.foraging_fortune.pet ??= 0;
      stats.foraging_fortune.pet += 0.4 * pet.level.level;
    }
    if (pet.tier == "UNCOMMON" || pet.tier == "RARE") {
      stats.foraging_fortune.pet ??= 0;
      stats.foraging_fortune.pet += 0.5 * pet.level.level;
    }
    if (pet.tier == "EPIC" || pet.tier == "LEGENDARY") {
      stats.foraging_fortune.pet ??= 0;
      stats.foraging_fortune.pet += 0.6 * pet.level.level;
    }
  }

  // ? FARMING FORTUNE
  if (pet.type == "ELEPHANT") {
    if (pet.tier == "LEGENDARY") {
      stats.farming_fortune.pet ??= 0;
      stats.farming_fortune.pet += 1.8 * 100;
    }
  }

  if (pet.type == "MOOSHROOM_COW") {
    if (pet.tier == "LEGENDARY") {
      stats.farming_fortune.pet ??= 0;
      stats.farming_fortune.pet += stats.strength.pet / (40 - pet.level.level * 0.2);
    }
  }

  return {
    stats: stats,
    statsMultiplier: statsMultiplier,
    healthMultiplier: healthMultiplier,
    defenseMultiplier: defenseMultiplier,
    strengthMultiplier: strengthMultiplier,
    bonusAttackSpeedMultiplier: bonusAttackSpeedMultiplier,
    ferocityMultiplier: ferocityMultiplier,
  };
}

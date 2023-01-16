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
  const temp: { [key: string]: number } = {};
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
      a.level = parseInt(a.tag.display.Lore[1].split(" ")[1]);
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
      stats.intelligence.harp += CONSTANTS.HARP_QUEST[harp as keyof typeof CONSTANTS.HARP_QUEST];
    }
  }

  // Dungeon Essence Shop
  if (Object.keys(calculated.perks).length > 0) {
    for (let [name, perkData] of Object.entries(calculated.perks)) {
      name = name.replaceAll("permanent_", "");
      if (Object.keys(CONSTANTS.FORBIDDEN_STATS).includes(name)) {
        stats[name].essence_shop ??= 0;
        stats[name].essence_shop +=
          perkData * CONSTANTS.FORBIDDEN_STATS[name as keyof typeof CONSTANTS.FORBIDDEN_STATS];
      }
    }
  }

  // Armor Abiltiies
  let boots: Item | undefined, leggings: Item | undefined, chestplate: Item | undefined, helmet: Item | undefined;
  for (const piece of items.armor) {
    if (piece.categories.includes("boots")) boots = piece as Item;
    if (piece.categories.includes("leggings")) leggings = piece as Item;
    if (piece.categories.includes("chestplate")) chestplate = piece as Item;
    if (piece.categories.includes("helmet")) helmet = piece as Item;
  }

  for (const armorSet of Object.keys(CONSTANTS.CUSTOM_ARMOR_ABILTIES)) {
    if (
      helmet?.tag?.ExtraAttributes?.id ==
        CONSTANTS.CUSTOM_ARMOR_ABILTIES[armorSet as keyof typeof CONSTANTS.CUSTOM_ARMOR_ABILTIES].helmet &&
      chestplate?.tag?.ExtraAttributes?.id ==
        CONSTANTS.CUSTOM_ARMOR_ABILTIES[armorSet as keyof typeof CONSTANTS.CUSTOM_ARMOR_ABILTIES].chestplate &&
      leggings?.tag?.ExtraAttributes?.id ==
        CONSTANTS.CUSTOM_ARMOR_ABILTIES[armorSet as keyof typeof CONSTANTS.CUSTOM_ARMOR_ABILTIES].leggings &&
      boots?.tag?.ExtraAttributes?.id ==
        CONSTANTS.CUSTOM_ARMOR_ABILTIES[armorSet as keyof typeof CONSTANTS.CUSTOM_ARMOR_ABILTIES].boots
    ) {
      for (const [stat, value] of Object.entries(
        CONSTANTS.CUSTOM_ARMOR_ABILTIES[armorSet as keyof typeof CONSTANTS.CUSTOM_ARMOR_ABILTIES].bonus
      )) {
        if (stat.endsWith("Multiplier")) continue;

        stats[stat].armor ??= 0;
        if (stat.includes("_cap")) {
          stats[stat].armor = value;
        } else {
          stats[stat].armor += value;
        }
      }
    }

    // TODO: Make Special Abilities work with format above
    // ? Mastiff Armor
    if (
      helmet?.tag?.ExtraAttributes?.id == "MASTIFF_HELMET" &&
      chestplate?.tag?.ExtraAttributes?.id == "MASTIFF_CHESTPLATE" &&
      leggings?.tag?.ExtraAttributes?.id == "MASTIFF_LEGGINGS" &&
      boots?.tag?.ExtraAttributes?.id == "MASTIFF_BOOTS"
    ) {
      stats.health.armor =
        Object.keys(stats.crit_damage)
          .map((key) => stats.crit_damage[key])
          .reduce((a, b) => a + b, 0) * 50;
      stats.crit_damage.armor =
        Object.keys(stats.crit_damage)
          .map((key) => stats.crit_damage[key])
          .reduce((a, b) => a + b, 0) / 2;
    }

    // ? Obsidian Chestplate
    /*
    if (chestplate?.tag?.ExtraAttributes?.id == 'OBSIDIAN_CHESTPLATE') {
      stats.speed.armor += itemCount.OBSIDIAN.armor / 20 ? (itemCount.OBSIDIAN.armor / 20).toFixed(0) : 0;
    }
    */

    // ? Glacite Armor
    if (
      helmet?.tag?.ExtraAttributes?.id == "GLACITE_HELMET" &&
      chestplate?.tag?.ExtraAttributes?.id == "GLACITE_CHESTPLATE" &&
      leggings?.tag?.ExtraAttributes?.id == "GLACITE_LEGGINGS" &&
      boots?.tag?.ExtraAttributes?.id == "GLACITE_BOOTS"
    ) {
      stats.mining_speed.armor += calculated.levels.mining.level * 2;
    }

    // ? Fairy Armor
    if (
      helmet?.tag?.ExtraAttributes?.id == "FAIRY_HELMET" &&
      chestplate?.tag?.ExtraAttributes?.id == "FAIRY_CHESTPLATE" &&
      leggings?.tag?.ExtraAttributes?.id == "FAIRY_LEGGINGS" &&
      boots?.tag?.ExtraAttributes?.id == "FAIRY_BOOTS"
    ) {
      stats.health.armor += calculated.fairy_souls.collected || 0;
    }

    // ? Emerald Armor
    if (
      helmet?.tag?.ExtraAttributes?.id == "EMERALD_ARMOR_HELMET" &&
      chestplate?.tag?.ExtraAttributes?.id == "EMERALD_ARMOR_CHESTPLATE" &&
      leggings?.tag?.ExtraAttributes?.id == "EMERALD_ARMOR_LEGGINGS" &&
      boots?.tag?.ExtraAttributes?.id == "EMERALD_ARMOR_BOOTS"
    ) {
      const amount: number = calculated.collections.EMERALD.amount;
      stats.health.armor ??= 0;
      stats.health.armor += parseInt((amount / 3000).toFixed(0)) > 350 ? 350 : parseInt((amount / 3000).toFixed(0));
      stats.defense.armor ??= 0;
      stats.defense.armor += parseInt((amount / 3000).toFixed(0)) > 350 ? 350 : parseInt((amount / 3000).toFixed(0));
    }
  }

  // Custom pet abilities
  const activePet = calculated.pets.find((a) => a.active === true) as Pet;
  const petStats = getPetData(stats, activePet, calculated);

  Object.assign(stats, petStats.stats);

  statsMultiplier += petStats.statsMultiplier || 0;
  bonusAttackSpeedMultiplier += petStats.bonusAttackSpeedMultiplier || 0;
  ferocityMultiplier += petStats.ferocityMultiplier || 0;
  defenseMultiplier += petStats.defenseMultiplier || 0;
  healthMultiplier += petStats.healthMultiplier || 0;
  strengthMultiplier += petStats.strengthMultiplier || 0;
  statsMultiplier += petStats.statsMultiplier || 0;

  // Reforge
  const playerMagicalPower: { [key: string]: number } = {};

  for (const rarity of Object.keys(CONSTANTS.MAGICAL_POWER)) {
    const rarityNumber: number = parseInt(rarity);
    playerMagicalPower[rarityNumber] = 0;
    playerMagicalPower[rarityNumber] +=
      (CONSTANTS.MAGICAL_POWER as any)[rarity] *
      CONSTANTS.MAGICAL_POWER[rarity as keyof typeof CONSTANTS.MAGICAL_POWER];
  }

  const mpTotal: number = Object.values(playerMagicalPower).reduce((a, b) => a + b);

  // ? Accessory reforge
  if (
    calculated.selected_reforge &&
    Object.keys(CONSTANTS.REFORGES).find((a) => a === calculated.selected_reforge.toString())
  ) {
    for (const [stat, value] of Object.entries(
      (CONSTANTS as any).REFORGES[calculated.selected_reforge]?.reforge || {}
    )) {
      const valueInt: number = parseFloat(value as string);
      stats[stat].reforge ??= 0;
      stats[stat].reforge += valueInt * mpTotal;
    }

    // ? Power Bonus from Reforge
    if ((CONSTANTS as any).REFORGES[calculated.selected_reforge].power_bonus !== undefined) {
      for (const [stat, value] of Object.entries(
        (CONSTANTS as any).REFORGES[calculated.selected_reforge].power_bonus
      )) {
        stats[stat].reforge ??= 0;
        stats[stat].reforge += value as number;
      }
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
  for (const item of items.accessories.filter((item) => (item as Item).isInactive === false)) {
    const itemData: Item = item as Item;
    if (accessoryDuplicates.includes(itemData.tag?.ExtraAttributes?.id || "")) continue;
    accessoryDuplicates.push(itemData.tag?.ExtraAttributes?.id || "");

    const bonusStats: ItemStats = helper.getStatsFromItem(item as Item);

    for (const [name, value] of Object.entries(bonusStats)) {
      if (!allowedStats.includes(name)) {
        continue;
      }

      stats[name].accessories ??= 0;
      stats[name].accessories += value;

      if (itemData.tag?.ExtraAttributes?.id == "NIGHT_CRYSTAL" || itemData.tag?.ExtraAttributes?.id == "DAY_CRYSTAL") {
        accessoryDuplicates.push(itemData.tag?.ExtraAttributes?.id);
        stats.health.accessories += 5;
        stats.strength.accessories += 5;
      }
    }
  }

  // Skill bonus stats
  for (const [skill, data] of Object.entries(calculated.levels as Level)) {
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

  if (healthMultiplier > 0) {
    stats.health.stats_multiplier ??= 0;
    const totalHealth = Object.keys(stats.health)
      .map((key) => stats.health[key as keyof ItemStats["health"]] ?? 0)
      .reduce((a, b) => a + b, 0);
    stats.health.stats_multiplier = healthMultiplier > 0 ? totalHealth + totalHealth * healthMultiplier : 0;
  }

  if (ferocityMultiplier > 0) {
    stats.ferocity.stats_multiplier ??= 0;
    const totalFerocity = Object.keys(stats.ferocity)
      .map((key) => stats.ferocity[key as keyof ItemStats["ferocity"]] ?? 0)
      .reduce((a, b) => a + b, 0);
    stats.ferocity.stats_multiplier = ferocityMultiplier > 0 ? totalFerocity + totalFerocity * ferocityMultiplier : 0;
  }

  if (defenseMultiplier > 0) {
    stats.defense.stats_multiplier ??= 0;
    const totalDefense = Object.keys(stats.defense)
      .map((key) => stats.defense[key as keyof ItemStats["defense"]] ?? 0)
      .reduce((a, b) => a + b, 0);
    stats.defense.stats_multiplier = defenseMultiplier > 0 ? totalDefense + totalDefense * defenseMultiplier : 0;
  }

  if (strengthMultiplier > 0) {
    stats.strength.stats_multiplier ??= 0;
    const totalStrength = Object.keys(stats.strength)
      .map((key) => stats.strength[key as keyof ItemStats["strength"]] ?? 0)
      .reduce((a, b) => a + b, 0);
    stats.strength.stats_multiplier = strengthMultiplier > 0 ? totalStrength + totalStrength * strengthMultiplier : 0;
  }

  if (bonusAttackSpeedMultiplier > 0) {
    stats.bonus_attack_speed.stats_multiplier ??= 0;
    const totalBonusAttackSpeed = Object.keys(stats.bonus_attack_speed)
      .map((key) => stats.bonus_attack_speed[key as keyof ItemStats["bonus_attack_speed"]] ?? 0)
      .reduce((a, b) => a + b, 0);
    stats.bonus_attack_speed.stats_multiplier =
      bonusAttackSpeedMultiplier > 0 ? totalBonusAttackSpeed + totalBonusAttackSpeed * bonusAttackSpeedMultiplier : 0;
  }

  if (statsMultiplier > 0) {
    for (const stat of Object.keys(stats)) {
      if (stat.includes("fortune" || stat == "pristine" || stat == "effective_health")) continue;

      stats[stat as keyof ItemStats].stat ??= 0;
      const totalStat = Object.keys(stats[stat as keyof ItemStats])
        .map((key) => stats[stat as keyof ItemStats][key] ?? 0)
        .reduce((a, b) => a + b, 0);
      stats[stat as keyof ItemStats].stat += totalStat * statsMultiplier;
    }
  }

  // Speed Cap
  stats.speed = stats.speed > stats.speed_cap ? (stats.speed = stats.speed_cap) : stats.speed;

  // Health Cap
  stats.health = stats.health > stats.health_cap ? (stats.health = stats.health_cap) : stats.health;

  // Potion Effects
  for (const effect of calculated.active_effects) {
    if (
      effect.effect === undefined ||
      (CONSTANTS as any).POTION_EFFECTS[effect.effect as string]?.[effect.level as number]?.bonus === undefined
    ) {
      console.log("If you're seeing this, please report this to the developer, thanks.");
      console.log("Potion effect data:");
      console.log(effect);
      continue;
    }
    for (const [stat, value] of Object.entries((CONSTANTS as any).POTION_EFFECTS[effect.effect][effect.level]?.bonus) ||
      []) {
      stats[stat].potion ??= 0;
      stats[stat].potion += value as number;
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

function getPetData(stats: PlayerStats, pet: Pet, calculated: SkyCryptPlayer) {
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
      stats.defense.pet +=
        (Object.keys(stats.speed)
          .map((key) => stats.speed[key])
          .reduce((a, b) => a + b, 0) /
          100) *
        0.15 *
        pet.level.level;
      stats.health.pet +=
        (Object.keys(stats.defense)
          .map((key) => stats.defense[key])
          .reduce((a, b) => a + b, 0) /
          10) *
        0.01 *
        pet.level.level;
    }
    if (pet.tier == "EPIC") {
      stats.defense.pet ??= 0;
      stats.health.pet ??= 0;
      stats.defense.pet +=
        (Object.keys(stats.speed)
          .map((key) => stats.speed[key])
          .reduce((a, b) => a + b, 0) /
          100) *
        0.2 *
        pet.level.level;
      stats.health.pet +=
        (Object.keys(stats.defense)
          .map((key) => stats.defense[key])
          .reduce((a, b) => a + b, 0) /
          10) *
        0.01 *
        pet.level.level;
    }
    if (pet.tier == "LEGENDARY") {
      stats.defense.pet ??= 0;
      stats.health.pet ??= 0;
      stats.defense.pet +=
        (Object.keys(stats.speed)
          .map((key) => stats.speed[key])
          .reduce((a, b) => a + b, 0) /
          100) *
        0.2 *
        pet.level.level;
      stats.health.pet +=
        (Object.keys(stats.defense)
          .map((key) => stats.defense[key])
          .reduce((a, b) => a + b, 0) /
          10) *
        0.01 *
        pet.level.level;
    }
  }

  if (pet.type == "BABY_YETI") {
    const totalDefense = Object.keys(stats.defense)
      .map((key) => stats.defense[key])
      .reduce((a, b) => a + b, 0);
    if (pet.tier == "EPIC") {
      stats.defense.pet ??= 0;
      stats.defense.pet += totalDefense / (0.5 * pet.level.level);
    }
    if (pet.tier == "LEGENDARY") {
      stats.defense.pet ??= 0;
      stats.defense.pet += totalDefense / (0.75 * pet.level.level);
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
      calculated.hotm[0].display_name.split(" ")[1];
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

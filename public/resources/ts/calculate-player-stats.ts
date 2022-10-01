import * as helper from "../../../common/helper.js";
import { STATS_BONUS } from "../../../common/constants.js";
import { STATS_DATA } from "../../../common/constants/stats.js";
const symbols = STATS_DATA;

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

const MAXED_EFFECTS = {
  true_defense: {
    4: {
      name: "True Resistance 4 Potion",
      description: `Increases ${symbols.true_defense.symbol} True Defense, which reduces true damage you receive.`,
      bonus: {
        true_defense: 20,
      },
    },
  },
  strength: {
    8: {
      name: "Strength 8 Potion",
      Description: `Increases ${symbols.strength.symbol} Strength.`,
      bonus: {
        strength: 75,
      },
    },
  },
  regeneration: {
    9: {
      name: "Regeneration 9 Potion",
      description: `Grants ${symbols.health_regen} Health Regen.`,
      bonus: {
        health_regen: 63,
      },
    },
  },
  enchanting_xp_boost: {
    3: {
      name: "Enchanting XP Boost III Potion",
      description: `Grants +20 ${symbols.enchanting_wisdom.symbol} Enchanting Wisdom.`,
      bonus: {
        enchanting_wisdom: 20,
      },
    },
  },
  stun: {
    4: {
      name: "Stun 4 Potion",
      description:
        "When applied to yourself, your hits have a 40% chance to stun enemies for 1s. When splashed, enemies are stunned for 1.75s.",
      bonus: {},
    },
  },
  experience: {
    4: {
      name: "Experience 4 Potion",
      description: "Gain 40% more experience orbs.",
      bonus: {
        combat_wisdom: 10,
      },
    },
  },
  rabbit: {
    6: {
      name: "Rabbit 6 Potion",
      description: `Grants Jump Boost III and +60 ${symbols.speed.symbol} Speed.`,
      bonus: {
        speed: 60,
      },
    },
  },
  magic_find: {
    4: {
      name: "Magic Find 4 Potion",
      description: `Increases the chanfe of finding rare items.`,
      bonus: {
        magic_find: 75,
      },
    },
  },
  night_vision: {
    1: {
      name: "Night Vision Potion",
      description: `Grants greater visiblity at night.`,
      bonus: {},
    },
  },
  absorption: {
    8: {
      name: "Absorption 8 Potion",
      description: `Grants a boost to absorption health.`,
      bonus: {
        //absorption: 375,
      },
    },
  },
  water_breathing: {
    6: {
      name: "Water Breathing 6 Potion",
      description: `Grants a chance of not taking drowning damage.`,
      bonus: {},
    },
  },
  combat_xp_boost: {
    3: {
      name: "Combat XP Boost III Potion",
      description: `Grants +20 ${symbols.combat_wisdom.symbol} Combat Wisdom.`,
      bonus: {
        combat_wisdom: 20,
      },
    },
  },
  fire_resistance: {
    1: {
      name: "Fire Resistance Potion",
      description: `Receive a 10% reduced damage from fire and lava.`,
      bonus: {},
    },
  },
  jump_boost: {
    4: {
      name: "Jump Boost 4 Potion",
      description: `Increases your jump height.`,
      bonus: {},
    },
  },
  resistance: {
    8: {
      name: "Resistance 8 Potion",
      description: `Increases ${symbols.defense.symbol} Defense.`,
      bonus: {
        defense: 66,
      },
    },
  },
  fishing_xp_boost: {
    3: {
      name: "Fishing XP Boost III Potion",
      description: `Grants +20 ${symbols.fishing_wisdom.symbol} Fishing Wisdom.`,
      bonus: {
        fishing_wisdom: 20,
      },
    },
  },
  agility: {
    4: {
      name: "Agility 4 Potion",
      description: `Grants a ${symbols.speed.symbol} Speed boost and increases the chance for mob attacks to miss.`,
      bonus: {
        speed: 40,
      },
    },
  },
  archery: {
    4: {
      name: "Archery 4 Potion",
      description: `Increases bow damage by 75%.`,
      bonus: {},
    },
  },
  critical: {
    4: {
      name: "Critical 4 Potion",
      description: `Increases ${symbols.crit_chance.symbol} Crit Change by 25% and ${symbols.crit_damage.symbol} Crit Damage by 40%.`,
      bonus: {
        crit_chance: 25,
        crit_damage: 40,
        magic_find: 10,
      },
    },
  },
  speed: {
    8: {
      name: "Speed 8 Potion",
      description: `Grants +40 ${symbols.speed.symbol} Speed.`,
      bonus: {
        speed: 48,
      },
    },
  },
  farming_xp_boost: {
    3: {
      name: "Farming XP Boost III Potion",
      description: `Grants +20 ${symbols.farming_wisdom.symbol} Farming Wisdom.`,
      bonus: {
        farming_wisdom: 20,
      },
    },
  },
  adrenaline: {
    8: {
      name: "Adrenaline 8 Potion",
      description: `Grants 300 absorption and +40 ${symbols.speed.symbol} Speed.`,
      bonus: {
        //absorption: 300,
        speed: 40,
      },
    },
  },
  spelunker: {
    5: {
      name: "Spelunker 5 Potion",
      description: `Increases 25 ${symbols.mining_fortune.symbol} Mining Fortune.`,
      bonus: {
        mining_fortune: 25,
      },
    },
  },
  dodge: {
    4: {
      name: "Dodge 4 Potion",
      description: `Mobs attacks have a 40% chance to miss.`,
      bonus: {},
    },
  },
  spirit: {
    4: {
      name: "Spirit 4 Potion",
      description: `Grants +40 ${symbols.speed.symbol} Speed and +40 ${symbols.crit_damage.symbol} Crit Damage.`,
      bonus: {
        speed: 40,
        crit_damage: 40,
      },
    },
  },
  pet_luck: {
    4: {
      name: "Pet Luck 4 Potion",
      description: `Increases how many pets you can find and gives you better luck in crafting pets.`,
      bonus: {
        pet_luck: 20,
      },
    },
  },
  mining_xp_boost: {
    3: {
      name: "Mining XP Boost III Potion",
      description: `Grants +20 ${symbols.mining_wisdom.symbol} Mining Wisdom.`,
      bonus: {
        mining_wisdom: 20,
      },
    },
  },
  haste: {
    4: {
      name: "Haste 4 Potion",
      description: `Increases your mining speed by 80%.`,
      bonus: {},
    },
  },
  burning: {
    4: {
      name: "Burning 4 Potion",
      description: `Increases the duration of fire damage that you inflict on enemies by 20%.`,
      bonus: {},
    },
  },
  mana: {
    8: {
      name: "Mana 8 Potion",
      description: `Grants 8 ${symbols.intelligence.symbol} Mana per second.`,
      bonus: {},
    },
  },
  foraging_xp_boost: {
    3: {
      name: "Foraging XP Boost III Potion",
      description: `Grants +20 ${symbols.foraging_wisdom.symbol} Foraging Wisdom.`,
      bonus: {
        foraging_wisdom: 20,
      },
    },
  },
  alchemy_xp_boost: {
    3: {
      name: "Alchemy XP Boost III Potion",
      description: `Grants +20 ${symbols.alchemy_wisdom.symbol} Alchemy Wisdom.`,
      bonus: {
        alchemy_wisdom: 20,
      },
    },
  },
  invisibility: {
    1: {
      name: "Invisibility Potion",
      description: `Grants invisibility from players and mobs.`,
      bonus: {},
    },
  },
  jerry_candy: {
    1: {
      name: "Jerry Candy",
      description: `Grants +100 ${symbols.health.symbol} Health, +20 ${symbols.strength.symbol} Strength, +2 ${symbols.ferocity.symbol} Ferocity, +100 ${symbols.intelligence.symbol} Inteligence, +3 ${symbols.magic_find.symbol} Magic Find`,
      bonus: {
        health: 100,
        strength: 20,
        ferocity: 2,
        intelligence: 100,
        magic_find: 3,
      },
    },
  },
  GABAGOEY: {
    1: {
      name: "Gabagoey Mixin",
      description: `Increases your ${symbols.true_defense.symbol} True Defense by 5.`,
      bonus: {
        true_defense: 5,
      },
    },
  },
  END_PORTAL_FUMES: {
    1: {
      name: "End Portal Fumes",
      description: `${symbols.soulflow.symbol} Soulflow conversions provide +30% more ${symbols.overflow_mana.symbol} Overflow.`,
      bonus: {},
    },
  },
  SPIDER_EGG: {
    1: {
      name: "Spider Egg Mixin",
      description: `Gain 5% dodge chance!`,
      bonus: {},
    },
  },
  ZOMBIE_BRAIN: {
    1: {
      name: "Zombie Brain Mixin",
      description: `Gain +10 ${symbols.ferocity.symbol} Ferocity!`,
      description: {
        ferocity: 10,
      },
    },
  },
  WOLF_FUR: {
    1: {
      name: "Wolf Fur Mixin",
      Description: `Gain +7 ${symbols.magic_find.symbol} Magic Find when slaying monsters in one hit!`,
      bonus: {},
    },
  },
};

const REFORGES = {
  // ! FREE
  lucky: {
      prefix: "Lucky",
      name: null,
      reforge: {
          crit_chance: 42/250,
          crit_damage: 46/250,
          health: 32/250,
          defense: 12/250,
          strength: 46/250,
      }
  },
  warrior: {
      prefix: "Warrior",
      name: null,
      reforge : {
          crit_chance: 23/250,
          crit_damage: 58/250,
          health: 32/250,
          defense: 12/250,
          strength: 81/250,
      }
  },
  pretty: {
      prefix: "Pretty",
      name: null,
      reforge: {
          crit_chance: 44/250,
          speed: 6/250,
          crit_damage: 46/250,
          health: 16/250,
          defense: 12/250,
          strength: 46/250,
          intelligence: 104/250,
      }
  },
  protected: {
      prefix: "Protected",
      name: null,
      reforge: {
          crit_chance: 5/250,
          crit_damage: 12/250,
          health: 113/250,
          defense: 104/250,
          strength: 23/250,
      }
  },
  simple: {
      prefix: "Simple",
      name: null,
      reforge: {
          crit_chance: 14/250,
          speed: 12/250,
          crit_damage: 35/250,
          health: 49/250,
          defense: 35/250,
          strength: 32/250,
          intelligence: 52/250,
      }
  },
  disciplined: {
      prefix: "Disciplined",
      name: null,
      reforge: {
          crit_chance: 14/250,
          crit_damage: 69/250,
          health: 49/250,
          defense: 23/250,
          strength: 69/250,
      }
  },
  commando: {
      prefix: "Commando",
      name: null,
      reforge: {
          crit_chance: 5/250,
          crit_damage: 81/250,
          health: 49/250,
          defense: 23/250,
          strength: 81/250,
      }
  },
  inspired: {
      prefix: "Inspired",
      name: null,
      reforge: {
          crit_chance: 9/250,
          crit_damage: 35/250,
          health: 16/250,
          defense: 12/250,
          strength: 46/250,
          intelligence: 156/250,
      }
  },
  prepared: {
      prefix: "Prepared",
      name: null,
      reforge: {
          crit_chance: 4/250,
          crit_damage: 9/250,
          health: 120/250,
          defense: 109/250,
          strength: 19/250,
      }
  },
  ominous: {
      prefix: "Ominous",
      name: null,
      reforge: {
          crit_chance: 14/250,
          speed: 9/250,
          bonus_attack_speed: 14,
          crit_damage: 35/250,
          health: 49/250,
          strength: 35/250,
          intelligence: 42/250,
      }
  },

  // ! PAID
  silky: {
      prefix: "Silky",
      name: "Luxurious Spool",
      power_bonus: { 
          bonus_attack_speed: 5
      },
      reforge: { 
          speed: 6/250,
          crit_damage: 220/250,
      }
  },
  sweet: {
      prefix: "Sweet",
      name: "Rock Candy",
      power_bonus: {
          speed: 5
      },
      reforge: {
          speed: 0.048,
          health: 0.584,
          defense: 0.416,
      }
  },
  bloody: {
      prefix: "Bloody",
      name: "Beating Heart",
      power_bonus: {
          bonus_attack_speed: 10
      },
      reforge: {
          strength: 0.416,
          crit_damage: 0.416,
          intelligence: 0.14,
      }
  },
  itchy: {
      prefix: "Itchy",
      name: "Furball",
      power_bonus: {
          strength: 15,
          crit_damage: 15,
      },
      reforge: {
          speed: 6/250,
          bonus_attack_speed: 21/250,
          crit_damage: 81/250,
          strength: 69/250,
      }
  },
  sighted: {
      prefix: "Sighted",
      name: "Ender Monocle",
      power_bonus: {
          ability_damage: 3,
      },
      reforge: {
          intelligence: 1.388,
      }
  },
  adept: {
      prefix: "Adept",
      name: "End Stone Shulker",
      power_bonus: {
          health: 100,
          defense: 50,
      },
      reforge: {
          health: 0.648,
          defense: 0.372,
          intelligence: 0.14
      }
  },
  mythical: {
      prefix: "Mythical",
      name: "Obsidian Tablet",
      power_bonus: {
          health: 150,
          strength: 40,
      },
      reforge: {
          crit_chance: 0.064,
          speed: 0.036,
          crit_damage: 0.156,
          health: 0.22,
          defense: 0.156,
          strength: 0.156,
          intelligence: 0.236,
      }
  },
  forceful: {
      prefix: "Forceful",
      name: "Acacia Birdhouse",
      power_bonus: {
          ferocity: 4
      },
      reforge: {
          crit_damage: 0.184,
          health: 0.064,
          strength: 0.696,
      }
  },
  shaded: {
      prefix: "Shaded",
      name: "Dark Orb",
      power_bonus: {
          bonus_attack_speed: 3,
          ferocity: 3,
      },
      reforge: {
          speed: 0.024,
          crit_damage: 0.696,
          strength: 0.184,
      }
  },
  strong: {
      prefix: "Strong",
      name: "Mandraa",
      power_bonus: {
          strength: 25,
          crit_damage: 25
      },
      reforge: {
          crit_damage: 0.464,
          strength: 0.464,
      }
  },
  demonic: {
      prefix: "Demonic",
      name: "Horns of Torment",
      power_bonus: {
          crit_damage: 50,
      },
      reforge: {
          strenght: 0.212,
          intelligence: 1.068,
      }
  },
  pleasent: {
      prefix: "Pleasant",
      name: "Precious Pearl",
      power_bonus: {
          health_regen: 10,
          //vitality: 10,
      },
      reforge: {
          health: 0.52,
          defense: 0.556,
      }
  },
  hurtful: {
      prefix: "Hurtful",
      name: "Magma Urchin",
      power_bonus: {
          bonus_attack_speed: 15,
      },
      reforge: {
          crit_damage: 0.74,
          strength: 0.184,
      }
  },
  bizarre: {
      prefix: "Bizarre",
      name: "Eccentric Painting",
      power_bonus: {
          ability_damage: 5,
      },
      reforge: {
          crit_damage: -0.092,
          strength: -0.092,
          intelligence: 1.668,
      }
  },
  healthy: {
      prefix: "Healthy",
      name: "Vitamin Death",
      power_bonus: {
          health: 200,
      },
      reforge: {
          health: 1.296
      }
  },
  slender: {
      prefix: "Slender",
      name: "Hazmat Enderman",
      power_bonus: {
          defense: 100,
          strenght: 50,
      },
      reforge: {
          speed: 6/250,
          bonus_attack_speed: 10/250,
          crit_damage: 58/250,
          health: 81/250,
          defense: 58/250,
          strenght: 58/250,
          intelligence: 87/250,
      }
  },
  scorching: {
      prefix: "Scorching",
      name: "Scorched Books",
      power_bonus: {
          ferocity: 7
      },
      reforge: {
          bonus_attack_speed: 0.068,
          crit_damage: 0.372,
          strength: 0.324,
      }
  }
}

const MAGICAL_POWER = {
  common: 3,
  uncommon: 5,
  rare: 8,
  epic: 12,
  legendary: 16,
  mythic: 22,
  special: 3,
  very_special: 5,
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
    speed_cap: { base: 0 },
    health_cap: { base: 0 },
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
          stats.mining_wisdom.heart_of_the_mountain += 5 + a.level.split("/")[1] * 0.1 || 0;
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
          stats[name].essence_shop ??= 0;
          stats[name].essence_shop += perkData * FORBIDDEN_STATS[name];
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
      if (
        helmet?.tag.ExtraAttributes.id == ARMOR_SETS[armorSet].helmet &&
        chestplate?.tag.ExtraAttributes.id == ARMOR_SETS[armorSet].chestplate &&
        leggings?.tag.ExtraAttributes.id == ARMOR_SETS[armorSet].leggings &&
        boots?.tag.ExtraAttributes.id == ARMOR_SETS[armorSet].boots
      ) {
        for (const [stat, value] of Object.entries(ARMOR_SETS[armorSet].bonus)) {
          console.log(armorSet, stat, value);
          stats[stat].armor ??= 0;
          stat.includes("_cap") ? (stats[stat].armor = value) : (stats[armor] += value);
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
        stats.health.armor += (stats.crit_damage || 0) * 50;
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
        const amount = calculated.collections.EMERALD.amount || 0;
        stats.health.armor ??= 0;
        stats.health.armor += (amount / 3000).toFixed(0) > 350 ? 350 : (amount / 3000).toFixed(0);
        stats.defense.armor ??= 0;
        stats.defense.armor += (amount / 3000).toFixed(0) > 350 ? 350 : (amount / 3000).toFixed(0);
      }
    }

    // Custom pet abilities
    const petStats = getPetData(
      stats,
      calculated.pets.find((a) => a.active),
      calculated
    );
    Object.assign(stats, petStats.stats);

    // Potion Effects
    for (const effect of calculated.active_effects) {
      if (!effect.effect || !MAXED_EFFECTS[effect.effect][effect.level]?.bonus) continue;
      for (const [stat, value] of Object.entries(MAXED_EFFECTS[effect.effect][effect.level]?.bonus) || []) {
        stats[stat].potion ??= 0;
        stats[stat].potion += value;
      }
    }

    // Reforge 
    // REFORGES

    const rarities = items.accessory_rarities;
    const player_magical_power = {}

    for (const rarity in MAGICAL_POWER) {
      player_magical_power[rarity] = 0
      player_magical_power[rarity] += rarities[rarity] * MAGICAL_POWER[rarity];
    }

    const mp_hegemony = rarities.hegemony ? MAGICAL_POWER[rarities.hegemony.rarity] : 0
    const mp_total = Object.values(player_magical_power).reduce((a, b) => a + b) + mp_hegemony;

    // ? Accessory reforge
    if (calculated.selected_reforge && REFORGES[calculated.selected_reforge]?.reforge) {
      for (const [stat, value] of Object.entries(REFORGES[calculated.selected_reforge].reforge)) {
        stats[stat].reforge ??= 0;
        stats[stat].reforge += value * mp_total || 0;
      }
  
      // ? Power Bonus from Reforge
      for (const [stat, value] of Object.entries(REFORGES[calculated.selected_reforge].power_bonus)) {
        stats[stat].reforge ??= 0;
        stats[stat].reforge += value || 0;
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

function getPetData(stats, pet, calculated) {
  let statsMultiplier = 0,
    healthMultiplier = 0,
    defenseMultiplier = 0,
    strengthMultiplier = 0,
    bonusAttackSpeedMultiplier = 0;

  if (!pet) {
    return {
      stats: stats,
      statsMultiplier: statsMultiplier,
      healthMultiplier: healthMultiplier,
      defenseMultiplier: defenseMultiplier,
      strengthMultiplier: strengthMultiplier,
      bonusAttackSpeedMultiplier: bonusAttackSpeedMultiplier,
    }
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
        calculated.levels.mining.level * (0.02 * pet.level.level) + calculated.levels.fishing.level * (0.02 * pet.level.level);
      stats.speed.pet ??= 0;
      stats.speed.pet +=
        calculated.levels.mining.level * (0.02 * pet.level.level) + calculated.levels.fishing.level * (0.02 * pet.level.level);
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
      stats.sea_creature_chance.pet += mining.hotM_tree.level ?? 0;
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
  };
}

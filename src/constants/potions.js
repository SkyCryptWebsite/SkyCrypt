import { STATS_DATA } from "../../common/constants/stats.js";
const symbols = STATS_DATA;

export const POTION_EFFECTS = {
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

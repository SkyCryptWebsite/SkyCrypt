import { SYMBOLS } from "./stats.js";

export const POTION_COLORS = {
  0: "375cc4", // None
  1: "cb5ba9", // Regeneration
  2: "420a09", // Speed
  3: "e19839", // Poison
  4: "4d9130", // Fire Resistance
  5: "f52423", // Instant Health
  6: "1f1f9e", // Night Vision
  7: "22fc4b", // Jump Boost
  8: "474c47", // Weakness
  9: "912423", // Strength
  10: "5c6e83", // Slowness
  11: "f500f5", // Uncraftable
  12: "420a09", // Instant Damage
  13: "2f549c", // Water Breathing
  14: "818595", // Invisibility
  15: "f500f5", // Uncraftable
};

export const POTION_EFFECTS = {
  true_defense: {
    1: {
      name: "True Resistance I Potion",
      description: `Increases ${SYMBOLS.true_defense} True Defense, which reduces true damage you receive.`,
      bonus: {
        true_defense: 5,
      },
    },
    2: {
      name: "True Resistance II Potion",
      description: `Increases ${SYMBOLS.true_defense} True Defense, which reduces true damage you receive.`,
      bonus: {
        true_defense: 10,
      },
    },
    3: {
      name: "True Resistance III Potion",
      description: `Increases ${SYMBOLS.true_defense} True Defense, which reduces true damage you receive.`,
      bonus: {
        true_defense: 15,
      },
    },
    4: {
      name: "True Resistance IV Potion",
      description: `Increases ${SYMBOLS.true_defense} True Defense, which reduces true damage you receive.`,
      bonus: {
        true_defense: 20,
      },
    },
  },
  strength: {
    1: {
      name: "Strength I Potion",
      description: `Increases ${SYMBOLS.strength} Strength.`,
      bonus: {
        strength: 5,
      },
    },
    2: {
      name: "Strength II Potion",
      description: `Increases ${SYMBOLS.strength} Strength.`,
      bonus: {
        strength: 12.5,
      },
    },
    3: {
      name: "Strength III Potion",
      description: `Increases ${SYMBOLS.strength} Strength.`,
      bonus: {
        strength: 20,
      },
    },
    4: {
      name: "Strength IV Potion",
      description: `Increases ${SYMBOLS.strength} Strength.`,
      bonus: {
        strength: 30,
      },
    },
    5: {
      name: "Strength V Potion",
      description: `Increases ${SYMBOLS.strength} Strength.`,
      bonus: {
        strength: 40,
      },
    },
    6: {
      name: "Strength VI Potion",
      description: `Increases ${SYMBOLS.strength} Strength.`,
      bonus: {
        strength: 50,
      },
    },
    7: {
      name: "Strength VII Potion",
      description: `Increases ${SYMBOLS.strength} Strength.`,
      bonus: {
        strength: 60,
      },
    },
    8: {
      name: "Strength VIII Potion",
      description: `Increases ${SYMBOLS.strength} Strength.`,
      bonus: {
        strength: 75,
      },
    },
  },
  regeneration: {
    1: {
      name: "Regeneration I Potion",
      description: `Grants ${SYMBOLS.health_regen} Health Regen.`,
      bonus: {
        health_regen: 5,
      },
    },
    2: {
      name: "Regeneration II Potion",
      description: `Grants ${SYMBOLS.health_regen} Health Regen.`,
      bonus: {
        health_regen: 10,
      },
    },
    3: {
      name: "Regeneration III Potion",
      description: `Grants ${SYMBOLS.health_regen} Health Regen.`,
      bonus: {
        health_regen: 15,
      },
    },
    4: {
      name: "Regeneration IV Potion",
      description: `Grants ${SYMBOLS.health_regen} Health Regen.`,
      bonus: {
        health_regen: 20,
      },
    },
    5: {
      name: "Regeneration V Potion",
      description: `Grants ${SYMBOLS.health_regen} Health Regen.`,
      bonus: {
        health_regen: 25,
      },
    },
    6: {
      name: "Regeneration VI Potion",
      description: `Grants ${SYMBOLS.health_regen} Health Regen.`,
      bonus: {
        health_regen: 30,
      },
    },
    7: {
      name: "Regeneration VII Potion",
      description: `Grants ${SYMBOLS.health_regen} Health Regen.`,
      bonus: {
        health_regen: 40,
      },
    },
    8: {
      name: "Regeneration VIII Potion",
      description: `Grants ${SYMBOLS.health_regen} Health Regen.`,
      bonus: {
        health_regen: 50,
      },
    },
    9: {
      name: "Regeneration IX Potion",
      description: `Grants ${SYMBOLS.health_regen} Health Regen.`,
      bonus: {
        health_regen: 63,
      },
    },
  },
  enchanting_xp_boost: {
    1: {
      name: "Enchanting XP Boost I Potion",
      description: `Grants +5 ${SYMBOLS.enchanting_wisdom} Enchanting Wisdom.`,
      bonus: {
        enchanting_wisdom: 5,
      },
    },
    2: {
      name: "Enchanting XP Boost II Potion",
      description: `Grants +10 ${SYMBOLS.enchanting_wisdom} Enchanting Wisdom.`,
      bonus: {
        enchanting_wisdom: 10,
      },
    },
    3: {
      name: "Enchanting XP Boost III Potion",
      description: `Grants +20 ${SYMBOLS.enchanting_wisdom} Enchanting Wisdom.`,
      bonus: {
        enchanting_wisdom: 20,
      },
    },
  },
  stun: {
    1: {
      name: "Stun I Potion",
      description:
        "When applied to yourself, your hits have a 10% chance to stun enemies for 1s. When splashed, enemies are stunned for 1s.",
      bonus: {},
    },
    2: {
      name: "Stun II Potion",
      description:
        "When applied to yourself, your hits have a 20% chance to stun enemies for 1s. When splashed, enemies are stunned for 1.25s.",
      bonus: {},
    },
    3: {
      name: "Stun III Potion",
      description:
        "When applied to yourself, your hits have a 30% chance to stun enemies for 1s. When splashed, enemies are stunned for 1.5s.",
      bonus: {},
    },
    4: {
      name: "Stun IV Potion",
      description:
        "When applied to yourself, your hits have a 40% chance to stun enemies for 1s. When splashed, enemies are stunned for 1.75s.",
      bonus: {},
    },
  },
  experience: {
    1: {
      name: "Experience I Potion",
      description: "Gain 10% more experience orbs.",
      bonus: {},
    },
    2: {
      name: "Experience II Potion",
      description: "Gain 20% more experience orbs.",
      bonus: {},
    },
    3: {
      name: "Experience III Potion",
      description: "Gain 30% more experience orbs.",
      bonus: {},
    },
    4: {
      name: "Experience IV Potion",
      description: "Gain 40% more experience orbs.",
      bonus: {
        combat_wisdom: 10,
      },
    },
  },
  rabbit: {
    1: {
      name: "Rabbit I Potion",
      description: `Grants Jump Boost I and +10 ${SYMBOLS.speed} Speed.`,
      bonus: {
        speed: 10,
      },
    },
    2: {
      name: "Rabbit II Potion",
      description: `Grants Jump Boost I and +20 ${SYMBOLS.speed} Speed.`,
      bonus: {
        speed: 20,
      },
    },
    3: {
      name: "Rabbit III Potion",
      description: `Grants Jump Boost II and +30 ${SYMBOLS.speed} Speed.`,
      bonus: {
        speed: 30,
      },
    },
    4: {
      name: "Rabbit IV Potion",
      description: `Grants Jump Boost II and +40 ${SYMBOLS.speed} Speed.`,
      bonus: {
        speed: 40,
      },
    },
    5: {
      name: "Rabbit V Potion",
      description: `Grants Jump Boost III and +50 ${SYMBOLS.speed} Speed.`,
      bonus: {
        speed: 50,
      },
    },
    6: {
      name: "Rabbit VI Potion",
      description: `Grants Jump Boost III and +60 ${SYMBOLS.speed} Speed.`,
      bonus: {
        speed: 60,
      },
    },
  },
  magic_find: {
    1: {
      name: "Magic Find I Potion",
      description: `Increases the chanfe of finding rare items.`,
      bonus: {
        magic_find: 10,
      },
    },
    2: {
      name: "Magic Find II Potion",
      description: `Increases the chanfe of finding rare items.`,
      bonus: {
        magic_find: 25,
      },
    },
    3: {
      name: "Magic Find III Potion",
      description: `Increases the chanfe of finding rare items.`,
      bonus: {
        magic_find: 50,
      },
    },
    4: {
      name: "Magic Find IV Potion",
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
    1: {
      name: "Absorption I Potion",
      description: `Grants a boost to absorption health.`,
      bonus: {},
    },
    2: {
      name: "Absorption II Potion",
      description: `Grants a boost to absorption health.`,
      bonus: {},
    },
    3: {
      name: "Absorption III Potion",
      description: `Grants a boost to absorption health.`,
      bonus: {},
    },
    4: {
      name: "Absorption IV Potion",
      description: `Grants a boost to absorption health.`,
      bonus: {},
    },
    5: {
      name: "Absorption V Potion",
      description: `Grants a boost to absorption health.`,
      bonus: {},
    },
    6: {
      name: "Absorption VI Potion",
      description: `Grants a boost to absorption health.`,
      bonus: {},
    },
    7: {
      name: "Absorption VII Potion",
      description: `Grants a boost to absorption health.`,
      bonus: {},
    },
    8: {
      name: "Absorption VIII Potion",
      description: `Grants a boost to absorption health.`,
      bonus: {},
    },
  },
  water_breathing: {
    1: {
      name: "Water Breathing I Potion",
      description: `Grants a chance of not taking drowning damage.`,
      bonus: {},
    },
    2: {
      name: "Water Breathing II Potion",
      description: `Grants a chance of not taking drowning damage.`,
      bonus: {},
    },
    3: {
      name: "Water Breathing III Potion",
      description: `Grants a chance of not taking drowning damage.`,
      bonus: {},
    },
    4: {
      name: "Water Breathing IV Potion",
      description: `Grants a chance of not taking drowning damage.`,
      bonus: {},
    },
    5: {
      name: "Water Breathing V Potion",
      description: `Grants a chance of not taking drowning damage.`,
      bonus: {},
    },
    6: {
      name: "Water Breathing VI Potion",
      description: `Grants a chance of not taking drowning damage.`,
      bonus: {},
    },
  },
  combat_xp_boost: {
    1: {
      name: "Combat XP Boost I Potion",
      description: `Grants +5 ${SYMBOLS.combat_wisdom} Combat Wisdom.`,
      bonus: {
        combat_wisdom: 5,
      },
    },
    2: {
      name: "Combat XP Boost II Potion",
      description: `Grants +10 ${SYMBOLS.combat_wisdom} Combat Wisdom.`,
      bonus: {
        combat_wisdom: 10,
      },
    },
    3: {
      name: "Combat XP Boost III Potion",
      description: `Grants +20 ${SYMBOLS.combat_wisdom} Combat Wisdom.`,
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
    1: {
      name: "Jump Boost I Potion",
      description: `Increases your jump height.`,
      bonus: {},
    },
    2: {
      name: "Jump Boost II Potion",
      description: `Increases your jump height.`,
      bonus: {},
    },
    3: {
      name: "Jump Boost III Potion",
      description: `Increases your jump height.`,
      bonus: {},
    },
    4: {
      name: "Jump Boost IV Potion",
      description: `Increases your jump height.`,
      bonus: {},
    },
  },
  resistance: {
    1: {
      name: "Resistance I Potion",
      description: `Increases ${SYMBOLS.defense} Defense.`,
      bonus: {
        defense: 5,
      },
    },
    2: {
      name: "Resistance II Potion",
      description: `Increases ${SYMBOLS.defense} Defense.`,
      bonus: {
        defense: 10,
      },
    },
    3: {
      name: "Resistance III Potion",
      description: `Increases ${SYMBOLS.defense} Defense.`,
      bonus: {
        defense: 15,
      },
    },
    4: {
      name: "Resistance IV Potion",
      description: `Increases ${SYMBOLS.defense} Defense.`,
      bonus: {
        defense: 20,
      },
    },
    5: {
      name: "Resistance V Potion",
      description: `Increases ${SYMBOLS.defense} Defense.`,
      bonus: {
        defense: 30,
      },
    },
    6: {
      name: "Resistance VI Potion",
      description: `Increases ${SYMBOLS.defense} Defense.`,
      bonus: {
        defense: 40,
      },
    },
    7: {
      name: "Resistance VII Potion",
      description: `Increases ${SYMBOLS.defense} Defense.`,
      bonus: {
        defense: 50,
      },
    },
    8: {
      name: "Resistance VIII Potion",
      description: `Increases ${SYMBOLS.defense} Defense.`,
      bonus: {
        defense: 66,
      },
    },
  },
  fishing_xp_boost: {
    1: {
      name: "Fishing XP Boost I Potion",
      description: `Grants +5 ${SYMBOLS.fishing_wisdom} Fishing Wisdom.`,
      bonus: {
        fishing_wisdom: 5,
      },
    },
    2: {
      name: "Fishing XP Boost II Potion",
      description: `Grants +10 ${SYMBOLS.fishing_wisdom} Fishing Wisdom.`,
      bonus: {
        fishing_wisdom: 10,
      },
    },
    3: {
      name: "Fishing XP Boost III Potion",
      description: `Grants +20 ${SYMBOLS.fishing_wisdom} Fishing Wisdom.`,
      bonus: {
        fishing_wisdom: 20,
      },
    },
  },
  agility: {
    1: {
      name: "Agility I Potion",
      description: `Grants a ${SYMBOLS.speed} Speed boost and increases the chance for mob attacks to miss.`,
      bonus: {
        speed: 10,
      },
    },
    2: {
      name: "Agility II Potion",
      description: `Grants a ${SYMBOLS.speed} Speed boost and increases the chance for mob attacks to miss.`,
      bonus: {
        speed: 20,
      },
    },
    3: {
      name: "Agility III Potion",
      description: `Grants a ${SYMBOLS.speed} Speed boost and increases the chance for mob attacks to miss.`,
      bonus: {
        speed: 30,
      },
    },
    4: {
      name: "Agility IV Potion",
      description: `Grants a ${SYMBOLS.speed} Speed boost and increases the chance for mob attacks to miss.`,
      bonus: {
        speed: 40,
      },
    },
  },
  archery: {
    1: {
      name: "Archery I Potion",
      description: `Increases bow damage by 12.5%.`,
      bonus: {},
    },
    2: {
      name: "Archery II Potion",
      description: `Increases bow damage by 25%.`,
      bonus: {},
    },
    3: {
      name: "Archery III Potion",
      description: `Increases bow damage by 50%.`,
      bonus: {},
    },
    4: {
      name: "Archery IV Potion",
      description: `Increases bow damage by 75%.`,
      bonus: {},
    },
  },
  critical: {
    1: {
      name: "Critical I Potion",
      description: `Increases ${SYMBOLS.crit_chance} Crit Chance by 10% and ${SYMBOLS.crit_damage} Crit Damage by 10%.`,
      bonus: {
        crit_chance: 10,
        crit_damage: 10,
      },
    },
    2: {
      name: "Critical II Potion",
      description: `Increases ${SYMBOLS.crit_chance} Crit Chance by 15% and ${SYMBOLS.crit_damage} Crit Damage by 20%.`,
      bonus: {
        crit_chance: 15,
        crit_damage: 20,
      },
    },
    3: {
      name: "Critical III Potion",
      description: `Increases ${SYMBOLS.crit_chance} Crit Chance by 20% and ${SYMBOLS.crit_damage} Crit Damage by 30%.`,
      bonus: {
        crit_chance: 20,
        crit_damage: 30,
      },
    },
    4: {
      name: "Critical IV Potion",
      description: `Increases ${SYMBOLS.crit_chance} Crit Chance by 25% and ${SYMBOLS.crit_damage} Crit Damage by 40%.`,
      bonus: {
        crit_chance: 25,
        crit_damage: 40,
        magic_find: 10,
      },
    },
  },
  speed: {
    1: {
      name: "Speed I Potion",
      description: `Grants + ${SYMBOLS.speed} Speed.`,
      bonus: {
        speed: 5,
      },
    },
    2: {
      name: "Speed II Potion",
      description: `Grants + ${SYMBOLS.speed} Speed.`,
      bonus: {
        speed: 10,
      },
    },
    3: {
      name: "Speed III Potion",
      description: `Grants + ${SYMBOLS.speed} Speed.`,
      bonus: {
        speed: 15,
      },
    },
    4: {
      name: "Speed IV Potion",
      description: `Grants + ${SYMBOLS.speed} Speed.`,
      bonus: {
        speed: 20,
      },
    },
    5: {
      name: "Speed V Potion",
      description: `Grants + ${SYMBOLS.speed} Speed.`,
      bonus: {
        speed: 25,
      },
    },
    6: {
      name: "Speed VI Potion",
      description: `Grants + ${SYMBOLS.speed} Speed.`,
      bonus: {
        speed: 30,
      },
    },
    7: {
      name: "Speed VII Potion",
      description: `Grants + ${SYMBOLS.speed} Speed.`,
      bonus: {
        speed: 35,
      },
    },
    8: {
      name: "Speed VIII Potion",
      description: `Grants + ${SYMBOLS.speed} Speed.`,
      bonus: {
        speed: 48,
      },
    },
  },
  farming_xp_boost: {
    1: {
      name: "Farming XP Boost I Potion",
      description: `Grants +5 ${SYMBOLS.farming_wisdom} Farming Wisdom.`,
      bonus: {
        farming_wisdom: 5,
      },
    },
    2: {
      name: "Farming XP Boost II Potion",
      description: `Grants +10 ${SYMBOLS.farming_wisdom} Farming Wisdom.`,
      bonus: {
        farming_wisdom: 10,
      },
    },
    3: {
      name: "Farming XP Boost III Potion",
      description: `Grants +20 ${SYMBOLS.farming_wisdom} Farming Wisdom.`,
      bonus: {
        farming_wisdom: 20,
      },
    },
  },
  adrenaline: {
    1: {
      name: "Adrenaline I Potion",
      description: `Grants 300 absorption and +40 ${SYMBOLS.speed} Speed.`,
      bonus: {
        speed: 5,
      },
    },
    2: {
      name: "Adrenaline II Potion",
      description: `Grants 300 absorption and +40 ${SYMBOLS.speed} Speed.`,
      bonus: {
        speed: 10,
      },
    },
    3: {
      name: "Adrenaline III Potion",
      description: `Grants 300 absorption and +40 ${SYMBOLS.speed} Speed.`,
      bonus: {
        speed: 15,
      },
    },
    4: {
      name: "Adrenaline IV Potion",
      description: `Grants 300 absorption and +40 ${SYMBOLS.speed} Speed.`,
      bonus: {
        speed: 20,
      },
    },
    5: {
      name: "Adrenaline V Potion",
      description: `Grants 300 absorption and +40 ${SYMBOLS.speed} Speed.`,
      bonus: {
        speed: 25,
      },
    },
    6: {
      name: "Adrenaline VI Potion",
      description: `Grants 300 absorption and +40 ${SYMBOLS.speed} Speed.`,
      bonus: {
        speed: 30,
      },
    },
    7: {
      name: "Adrenaline VII Potion",
      description: `Grants 300 absorption and +40 ${SYMBOLS.speed} Speed.`,
      bonus: {
        speed: 35,
      },
    },
    8: {
      name: "Adrenaline VIII Potion",
      description: `Grants 300 absorption and +40 ${SYMBOLS.speed} Speed.`,
      bonus: {
        speed: 40,
      },
    },
  },
  spelunker: {
    1: {
      name: "Spelunker I Potion",
      description: `Increases 5 ${SYMBOLS.mining_fortune} Mining Fortune.`,
      bonus: {
        mining_fortune: 5,
      },
    },
    2: {
      name: "Spelunker II Potion",
      description: `Increases 10 ${SYMBOLS.mining_fortune} Mining Fortune.`,
      bonus: {
        mining_fortune: 10,
      },
    },
    3: {
      name: "Spelunker III Potion",
      description: `Increases 15 ${SYMBOLS.mining_fortune} Mining Fortune.`,
      bonus: {
        mining_fortune: 15,
      },
    },
    4: {
      name: "Spelunker IV Potion",
      description: `Increases 20 ${SYMBOLS.mining_fortune} Mining Fortune.`,
      bonus: {
        mining_fortune: 20,
      },
    },
    5: {
      name: "Spelunker V Potion",
      description: `Increases 25 ${SYMBOLS.mining_fortune} Mining Fortune.`,
      bonus: {
        mining_fortune: 25,
      },
    },
  },
  dodge: {
    1: {
      name: "Dodge I Potion",
      description: `Mobs attacks have a 10% chance to miss.`,
      bonus: {},
    },
    2: {
      name: "Dodge II Potion",
      description: `Mobs attacks have a 20% chance to miss.`,
      bonus: {},
    },
    3: {
      name: "Dodge III Potion",
      description: `Mobs attacks have a 30% chance to miss.`,
      bonus: {},
    },
    4: {
      name: "Dodge IV Potion",
      description: `Mobs attacks have a 40% chance to miss.`,
      bonus: {},
    },
  },
  spirit: {
    1: {
      name: "Spirit I Potion",
      description: `Grants +10 ${SYMBOLS.speed} Speed and +10 ${SYMBOLS.crit_damage} Crit Damage.`,
      bonus: {
        speed: 10,
        crit_damage: 10,
      },
    },
    2: {
      name: "Spirit II Potion",
      description: `Grants +20 ${SYMBOLS.speed} Speed and +20 ${SYMBOLS.crit_damage} Crit Damage.`,
      bonus: {
        speed: 20,
        crit_damage: 20,
      },
    },
    3: {
      name: "Spirit III Potion",
      description: `Grants +30 ${SYMBOLS.speed} Speed and +30 ${SYMBOLS.crit_damage} Crit Damage.`,
      bonus: {
        speed: 30,
        crit_damage: 30,
      },
    },
    4: {
      name: "Spirit IV Potion",
      description: `Grants +40 ${SYMBOLS.speed} Speed and +40 ${SYMBOLS.crit_damage} Crit Damage.`,
      bonus: {
        speed: 40,
        crit_damage: 40,
      },
    },
  },
  pet_luck: {
    1: {
      name: "Pet Luck I Potion",
      description: `Increases how many pets you can find and gives you better luck in crafting pets.`,
      bonus: {
        pet_luck: 5,
      },
    },
    2: {
      name: "Pet Luck II Potion",
      description: `Increases how many pets you can find and gives you better luck in crafting pets.`,
      bonus: {
        pet_luck: 10,
      },
    },
    3: {
      name: "Pet Luck III Potion",
      description: `Increases how many pets you can find and gives you better luck in crafting pets.`,
      bonus: {
        pet_luck: 15,
      },
    },
    4: {
      name: "Pet Luck IV Potion",
      description: `Increases how many pets you can find and gives you better luck in crafting pets.`,
      bonus: {
        pet_luck: 20,
      },
    },
  },
  mining_xp_boost: {
    1: {
      name: "Mining XP Boost I Potion",
      description: `Grants +5 ${SYMBOLS.mining_wisdom} Mining Wisdom.`,
      bonus: {
        mining_wisdom: 5,
      },
    },
    2: {
      name: "Mining XP Boost II Potion",
      description: `Grants +10 ${SYMBOLS.mining_wisdom} Mining Wisdom.`,
      bonus: {
        mining_wisdom: 10,
      },
    },
    3: {
      name: "Mining XP Boost III Potion",
      description: `Grants +20 ${SYMBOLS.mining_wisdom} Mining Wisdom.`,
      bonus: {
        mining_wisdom: 20,
      },
    },
  },
  haste: {
    1: {
      name: "Haste I Potion",
      description: `Increases your mining speed by 20%.`,
      bonus: {},
    },
    2: {
      name: "Haste II Potion",
      description: `Increases your mining speed by 40%.`,
      bonus: {},
    },
    3: {
      name: "Haste III Potion",
      description: `Increases your mining speed by 60%.`,
      bonus: {},
    },
    4: {
      name: "Haste IV Potion",
      description: `Increases your mining speed by 80%.`,
      bonus: {},
    },
  },
  burning: {
    1: {
      name: "Burning I Potion",
      description: `Increases the duration of fire damage that you inflict on enemies by 5%.`,
      bonus: {},
    },
    2: {
      name: "Burning II Potion",
      description: `Increases the duration of fire damage that you inflict on enemies by 10%.`,
      bonus: {},
    },
    3: {
      name: "Burning III Potion",
      description: `Increases the duration of fire damage that you inflict on enemies by 15%.`,
      bonus: {},
    },
    4: {
      name: "Burning IV Potion",
      description: `Increases the duration of fire damage that you inflict on enemies by 20%.`,
      bonus: {},
    },
  },
  mana: {
    1: {
      name: "Mana I Potion",
      description: `Grants 1 ${SYMBOLS.intelligence} Mana per second.`,
      bonus: {},
    },
    2: {
      name: "Mana II Potion",
      description: `Grants 2 ${SYMBOLS.intelligence} Mana per second.`,
      bonus: {},
    },
    3: {
      name: "Mana III Potion",
      description: `Grants 3 ${SYMBOLS.intelligence} Mana per second.`,
      bonus: {},
    },
    4: {
      name: "Mana IV Potion",
      description: `Grants 4 ${SYMBOLS.intelligence} Mana per second.`,
      bonus: {},
    },
    5: {
      name: "Mana V Potion",
      description: `Grants 5 ${SYMBOLS.intelligence} Mana per second.`,
      bonus: {},
    },
    6: {
      name: "Mana VI Potion",
      description: `Grants 6 ${SYMBOLS.intelligence} Mana per second.`,
      bonus: {},
    },
    7: {
      name: "Mana VI Potion",
      description: `Grants 7 ${SYMBOLS.intelligence} Mana per second.`,
      bonus: {},
    },
    8: {
      name: "Mana VII Potion",
      description: `Grants 8 ${SYMBOLS.intelligence} Mana per second.`,
      bonus: {},
    },
  },
  foraging_xp_boost: {
    1: {
      name: "Foraging XP Boost III Potion",
      description: `Grants +5 ${SYMBOLS.foraging_wisdom} Foraging Wisdom.`,
      bonus: {
        foraging_wisdom: 5,
      },
    },
    2: {
      name: "Foraging XP Boost III Potion",
      description: `Grants +10 ${SYMBOLS.foraging_wisdom} Foraging Wisdom.`,
      bonus: {
        foraging_wisdom: 10,
      },
    },
    3: {
      name: "Foraging XP Boost III Potion",
      description: `Grants +20 ${SYMBOLS.foraging_wisdom} Foraging Wisdom.`,
      bonus: {
        foraging_wisdom: 20,
      },
    },
  },
  alchemy_xp_boost: {
    1: {
      name: "Alchemy XP Boost I Potion",
      description: `Grants +5 ${SYMBOLS.alchemy_wisdom} Alchemy Wisdom.`,
      bonus: {
        alchemy_wisdom: 5,
      },
    },
    2: {
      name: "Alchemy XP Boost II Potion",
      description: `Grants +10 ${SYMBOLS.alchemy_wisdom} Alchemy Wisdom.`,
      bonus: {
        alchemy_wisdom: 10,
      },
    },
    3: {
      name: "Alchemy XP Boost III Potion",
      description: `Grants +20 ${SYMBOLS.alchemy_wisdom} Alchemy Wisdom.`,
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
      description: `Grants +100 ${SYMBOLS.health} Health, +20 ${SYMBOLS.strength} Strength, +2 ${SYMBOLS.ferocity} Ferocity, +100 ${SYMBOLS.intelligence} Inteligence, +3 ${SYMBOLS.magic_find} Magic Find`,
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
      description: `Increases your ${SYMBOLS.true_defense} True Defense by 5.`,
      bonus: {
        true_defense: 5,
      },
    },
  },
  END_PORTAL_FUMES: {
    1: {
      name: "End Portal Fumes",
      description: `${SYMBOLS.soulflow} Soulflow conversions provide +30% more ${SYMBOLS.overflow_mana} Overflow.`,
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
      description: `Gain +10 ${SYMBOLS.ferocity} Ferocity!`,
      bonus: {
        ferocity: 10,
      },
    },
  },
  WOLF_FUR: {
    1: {
      name: "Wolf Fur Mixin",
      Description: `Gain +7 ${SYMBOLS.magic_find} Magic Find when slaying monsters in one hit!`,
      bonus: {},
    },
  },
};

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
  15: "f500f5" // Uncraftable
};

export const POTION_EFFECTS = {
  true_defense: {
    name: "True Resistance Potion",
    bonuses: {
      true_defense: [5, 10, 15, 20]
    }
  },
  strength: {
    name: "Strength Potion",
    bonuses: {
      strength: [5, 12.5, 20, 30, 40, 50, 60, 75]
    }
  },
  regeneration: {
    name: "Regeneration Potion",
    bonuses: {
      health_regen: [5, 10, 15, 20, 25, 30, 40, 50, 63]
    }
  },
  enchanting_xp_boost: {
    name: "Enchanting XP Boost Potion",
    bonuses: {
      enchanting_wisdom: [5, 10, 20]
    }
  },
  stun: {
    name: "Stun Potion",
    bonuses: {}
  },
  experience: {
    name: "Experience Potion",
    bonuses: {
      combat_wisdom: [0, 0, 0, 10]
    }
  },
  rabbit: {
    name: "Rabbit Potion",
    bonuses: {
      speed: [10, 20, 30, 40, 50, 60]
    }
  },
  magic_find: {
    name: "Magic Find Potion",
    bonuses: {
      magic_find: [10, 25, 50, 75]
    }
  },
  night_vision: {
    name: "Night Vision Potion",
    bonuses: {}
  },
  absorption: {
    name: "Absorption Potion",
    bonuses: {}
  },
  water_breathing: {
    name: "Water Breathing Potion",
    bonuses: {}
  },
  combat_xp_boost: {
    name: "Combat XP Boost Potion",
    bonuses: {
      combat_wisdom: [5, 10, 20]
    }
  },
  fire_resistance: {
    name: "Fire Resistance Potion",
    bonuses: {}
  },
  jump_boost: {
    name: "Jump Boost Potion",
    bonuses: {}
  },
  resistance: {
    name: "Resistance Potion",
    bonuses: {
      defense: [5, 10, 15, 20, 30, 40, 50, 66]
    }
  },
  fishing_xp_boost: {
    name: "Fishing XP Boost Potion",
    bonuses: {
      fishing_wisdom: [5, 10, 20]
    }
  },
  agility: {
    name: "Agility Potion",
    bonuses: {
      speed: [10, 20, 30, 40]
    }
  },
  archery: {
    name: "Archery Potion",
    bonuses: {}
  },
  critical: {
    name: "Critical Potion",
    bonuses: {
      crit_chance: [10, 15, 20, 25],
      crit_damage: [10, 20, 30, 40],
      magic_find: [0, 0, 0, 10]
    }
  },
  speed: {
    name: "Speed Potion",
    bonuses: {
      speed: [5, 10, 15, 20, 25, 30, 35, 48]
    }
  },
  farming_xp_boost: {
    name: "Farming XP Boost Potion",
    bonuses: {
      farming_wisdom: [5, 10, 20]
    }
  },
  adrenaline: {
    name: "Adrenaline Potion",
    bonuses: {
      speed: [5, 10, 15, 20, 25, 30, 35, 40]
    }
  },
  spelunker: {
    name: "Spelunker Potion",
    bonuses: {
      mining_fortune: [5, 10, 15, 20, 25]
    }
  },
  dodge: {
    name: "Dodge Potion",
    bonuses: {}
  },
  spirit: {
    name: "Spirit Potion",
    bonuses: {
      speed: [10, 20, 30, 40],
      crit_damage: [10, 20, 30, 40]
    }
  },
  pet_luck: {
    name: "Pet Luck Potion",
    bonuses: {
      pet_luck: [5, 10, 15, 20]
    }
  },
  mining_xp_boost: {
    name: "Mining XP Boost Potion",
    bonuses: {
      mining_wisdom: [5, 10, 20]
    }
  },
  haste: {
    name: "Haste Potion",
    bonuses: {}
  },
  burning: {
    name: "Burning Potion",
    bonuses: {}
  },
  mana: {
    name: "Mana Potion",
    bonuses: {}
  },
  foraging_xp_boost: {
    name: "Foraging XP Boost Potion",
    bonuses: {
      foraging_wisdom: [5, 10, 20]
    }
  },
  alchemy_xp_boost: {
    name: "Alchemy XP Boost Potion",
    bonuses: {
      alchemy_wisdom: [5, 10, 20]
    }
  },
  invisibility: {
    name: "Invisibility Potion",
    bonuses: {}
  },
  jerry_candy: {
    name: "Jerry Candy",
    bonuses: {
      health: [100],
      strength: [20],
      ferocity: [2],
      intelligence: [100],
      magic_find: [3]
    }
  },
  GABAGOEY: {
    name: "Gabagoey Mixin",
    bonuses: {
      true_defense: [5]
    }
  },
  END_PORTAL_FUMES: {
    name: "End Portal Fumes",
    bonuses: {}
  },
  SPIDER_EGG: {
    name: "Spider Egg Mixin",
    bonuses: {}
  },
  ZOMBIE_BRAIN: {
    name: "Zombie Brain Mixin",
    bonuses: {
      ferocity: [10]
    }
  },
  WOLF_FUR: {
    name: "Wolf Fur Mixin",
    bonuses: {
      magic_find: [7]
    }
  },
  mushed_glowy_tonic: {
    name: "Mushed Glowy Tonic",
    bonuses: {
      fishing_speed: [30]
    }
  },
  DEEPTERROR: {
    name: "Deepterror Mixin",
    bonuses: {}
  },
  goblin_king_scent: {
    name: "Goblin King Scent",
    bonuses: {}
  }
};

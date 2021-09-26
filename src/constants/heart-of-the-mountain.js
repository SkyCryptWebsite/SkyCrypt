export const hotm_tree_size = {
  columns: 7,
  rows: 7,
};

export const nodes = [
  {
    id: "mining_speed",
    position: 46,
    max_level: 50,
    name: "Mining Speed",
    description: ["Grants +%BONUS% ⸕ Mining Speed."],
    upgrade_type: "mithril_powder",
    upgradeCost(level) {
      return Math.floor(Math.pow(level + 1, 3));
    },
    upgradeBonus(level) {
      return level * 20;
    },
  },
  {
    id: "mining_fortune",
    position: 39,
    max_level: 50,
  },
  {
    id: "daily_powder",
    position: 32,
    max_level: 100,
  },
  {
    id: "efficient_miner",
    position: 25,
    max_level: 100,
  },
  {
    id: "fortunate",
    position: 12,
    max_level: 20,
  },
  {
    id: "great_explorer",
    position: 13,
    max_level: 20,
  },
  {
    id: "lonesome_miner",
    position: 9,
    max_level: 45,
  },
  {
    id: "mining_experience",
    position: 24,
    max_level: 100,
  },
  {
    id: "mining_fortune_2",
    position: 6,
    max_level: 50,
  },
  {
    id: "mining_madness",
    position: 23,
    max_level: 1,
  },
  {
    id: "mining_speed_2",
    position: 2,
    max_level: 50,
  },
  {
    id: "mining_speed_boost",
    position: 37,
    max_level: 1,
  },
  {
    id: "mole",
    position: 11,
    max_level: 190,
  },
  {
    id: "professional",
    position: 10,
    max_level: 140,
  },
  {
    id: "special_0",
    position: 18,
    max_level: 5,
  },
  {
    id: "titanium_insanium",
    position: 38,
    max_level: 50,
  },
  {
    id: "quick_forge", // FIX: to be confirmed!
    position: 40,
    max_level: 20,
  },
  {
    id: "pickobulus", // FIX: to be confirmed!
    position: 41,
    max_level: 1,
  },
  {
    id: "crystallized", // FIX: to be confirmed!
    position: 34,
    max_level: 30,
  },
  {
    id: "front_loaded", // FIX: to be confirmed!
    position: 27,
    max_level: 1,
  },
  {
    id: "precision_mining", // FIX: to be confirmed!
    position: 28,
    max_level: 1,
  },
  {
    id: "orbiter", // FIX: to be confirmed!
    position: 26,
    max_level: 80,
  },
  {
    id: "star_powder", // FIX: to be confirmed!
    position: 20,
    max_level: 1,
  },
  {
    id: "maniac_miner", // FIX: to be confirmed!
    position: 14,
    max_level: 1,
  },
  {
    id: "powder_buff", // FIX: to be confirmed!
    position: 4,
    max_level: 50,
  },
  {
    id: "vein_seeker", // FIX: to be confirmed!
    position: 8,
    max_level: 1,
  },
  {
    id: "goblin_killer", // FIX: to be confirmed!
    position: 16,
    max_level: 1,
  },
  {
    id: "sky_mall", // FIX: to be confirmed!
    position: 22,
    max_level: 1,
  },
  {
    id: "luck_of_the_cave", // FIX: to be confirmed!
    position: 30,
    max_level: 45,
  },
];

class Perk {
  constructor(node, level) {
    this.node = node;
    this.level = level;
  }
}

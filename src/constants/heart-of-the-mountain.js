export const hotm_tree_size = {
  columns: 7,
  rows: 7,
};

export const nodes = [
  {
    id: "mining_speed_2",
    name: "Mining Speed II",
    position: 2,
    max_level: 50,
    upgrade_type: "gemstone_powder",
  },
  {
    id: "powder_buff",
    name: "Powder Buff", // FIX: to be confirmed!
    position: 4,
    max_level: 50,
  },
  {
    id: "mining_fortune_2",
    name: "Mining Fortune II",
    position: 6,
    max_level: 50,
    upgrade_type: "gemstone_powder",
  },
  {
    id: "vein_seeker",
    name: "Vein Seeker", // FIX: to be confirmed!
    position: 8,
    max_level: 1,
    upgrade_type: null,
  },
  {
    id: "lonesome_miner",
    name: "Lonesome Miner",
    position: 9,
    max_level: 45,
    upgrade_type: "gemstone_powder",
  },
  {
    id: "professional",
    name: "Professional",
    position: 10,
    max_level: 140,
    upgrade_type: "gemstone_powder",
  },
  {
    id: "mole",
    name: "Mole",
    position: 11,
    max_level: 190,
    upgrade_type: "gemstone_powder",
  },
  {
    id: "fortunate",
    name: "Fortunate",
    position: 12,
    max_level: 20,
    upgrade_type: "unknown",
  },
  {
    id: "great_explorer",
    name: "Great Explorer",
    position: 13,
    max_level: 20,
    upgrade_type: "gemstone_powder",
  },
  {
    id: "maniac_miner",
    name: "Maniac Miner", // FIX: to be confirmed!
    position: 14,
    max_level: 1,
    upgrade_type: null,
  },
  {
    id: "goblin_killer",
    name: "Goblin Killer", // FIX: to be confirmed!
    position: 16,
    max_level: 1,
    upgrade_type: null,
  },
  {
    id: "special_0",
    name: "Peark of the Mountain",
    position: 18,
    max_level: 5,
    upgrade_type: "mithril_powder",
  },
  {
    id: "star_powder",
    name: "Star Powder", // FIX: to be confirmed!
    position: 20,
    max_level: 1,
    upgrade_type: null,
  },
  {
    id: "sky_mall",
    name: "Sky Mall", // FIX: to be confirmed!
    position: 22,
    max_level: 1,
    upgrade_type: null,
  },
  {
    id: "mining_madness",
    name: "Mining Madness",
    position: 23,
    max_level: 1,
    upgrade_type: null,
  },
  {
    id: "mining_experience",
    name: "Seasoned Mineman",
    position: 24,
    max_level: 100,
    upgrade_type: "mithril_powder",
  },
  {
    id: "efficient_miner",
    name: "Efficient Miner",
    position: 25,
    max_level: 100,
    upgrade_type: "mithril_powder",
  },
  {
    id: "orbiter",
    name: "Orbiter", // FIX: to be confirmed!
    position: 26,
    max_level: 80,
  },
  {
    id: "front_loaded",
    name: "Front Loaded", // FIX: to be confirmed!
    position: 27,
    max_level: 1,
    upgrade_type: null,
  },
  {
    id: "precision_mining",
    name: "Precision Mining", // FIX: to be confirmed!
    position: 28,
    max_level: 1,
    upgrade_type: null,
  },
  {
    id: "luck_of_the_cave",
    name: "Luck Of The Cave", // FIX: to be confirmed!
    position: 30,
    max_level: 45,
  },
  {
    id: "daily_powder",
    name: "Daily Powder",
    position: 32,
    max_level: 100,
    upgrade_type: "mithril_powder",
  },
  {
    id: "crystallized",
    name: "Crystallized", // FIX: to be confirmed!
    position: 34,
    max_level: 30,
  },
  {
    id: "mining_speed_boost",
    name: "Mining Speed Boost",
    position: 37,
    max_level: 1,
    upgrade_type: null,
  },
  {
    id: "titanium_insanium",
    name: "Titanium Insanium",
    position: 38,
    max_level: 50,
    upgrade_type: "mithril_powder",
  },
  {
    id: "mining_fortune",
    name: "Mining Fortune",
    position: 39,
    max_level: 50,
    upgrade_type: "mithril_powder",
  },
  {
    id: "quick_forge",
    name: "Quick Forge", // FIX: to be confirmed!
    position: 40,
    max_level: 20,
    upgrade_type: "mithril_powder",
  },
  {
    id: "pickobulus",
    name: "Pickobulus", // FIX: to be confirmed!
    position: 41,
    max_level: 1,
    upgrade_type: null,
  },
  {
    id: "mining_speed",
    name: "Mining Speed",
    position: 46,
    max_level: 50,
    upgrade_type: "mithril_powder",
    upgradeCost(level) {
      return Math.floor(Math.pow(level + 1, 3));
    },
    description(level) {
      return [`Grants +${level * 20} ⸕ Mining Speed.`];
    },
  },
];

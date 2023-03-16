// prevent specific players from appearing in leaderboards
export const BLOCKED_PLAYERS = [
  "20934ef9488c465180a78f861586b4cf", // Minikloon (Admin)
  "f025c1c7f55a4ea0b8d93f47d17dfe0f", // Plancke (Admin)
  "c552c04a40fb4a17bf549a031b3ab1a1", // LandonHP (Admin)
];

// Number of kills required for each level of expertise
export const EXPERTISE_KILLS_LADDER = [50, 100, 250, 500, 1000, 2500, 5500, 10000, 15000];

// Walking distance required for each rarity level of the prehistoric egg
export const PREHISTORIC_EGG_BLOCKS_WALKED_LADDER = [4000, 10000, 20000, 40000, 100000];

// Number of S runs required for each level of hecatomb
export const hecatomb_s_runs_ladder = [2, 5, 10, 20, 30, 40, 60, 80, 100];

// xp required for each level of champion
export const champion_xp_ladder = [50000, 100000, 250000, 500000, 1000000, 1500000, 2000000, 2500000, 3000000];

export const cultivating_crops_ladder = [1000, 5000, 25000, 100000, 300000, 1500000, 5000000, 20000000, 100000000];

// api names and their max value from the profile upgrades
export const PROFILE_UPGRADES = {
  island_size: 10,
  minion_slots: 5,
  guests_count: 5,
  coop_slots: 3,
  coins_allowance: 5,
};

// Player stats on a completely new profile
export const BASE_STATS = {
  health: 100,
  defense: 0,
  effective_health: 100,
  strength: 0,
  speed: 100,
  crit_chance: 30,
  crit_damage: 50,
  bonus_attack_speed: 0,
  intelligence: 0,
  sea_creature_chance: 20,
  magic_find: 0,
  pet_luck: 0,
  ferocity: 0,
  ability_damage: 0,
  mining_speed: 0,
  mining_fortune: 0,
  farming_fortune: 0,
  foraging_fortune: 0,
  pristine: 0,
  damage: 0,
  damage_increase: 0,
};

export const STAT_TEMPLATE = {
  health: 0,
  defense: 0,
  effective_health: 0,
  strength: 0,
  speed: 0,
  crit_chance: 0,
  crit_damage: 0,
  bonus_attack_speed: 0,
  intelligence: 0,
  sea_creature_chance: 0,
  magic_find: 0,
  pet_luck: 0,
  ferocity: 0,
  ability_damage: 0,
  mining_speed: 0,
  mining_fortune: 0,
  farming_fortune: 0,
  foraging_fortune: 0,
  pristine: 0,
  damage: 0,
  damage_increase: 0,
};

export const SLAYER_COST = {
  1: 2000,
  2: 7500,
  3: 20000,
  4: 50000,
  5: 100000,
};

export const MOB_MOUNTS = {
  sea_emperor: ["guardian_emperor", "skeleton_emperor"],
  monster_of_the_deep: ["zombie_deep", "chicken_deep"],
};

export const MOB_NAMES = {
  pond_squid: "Squid",
  unburried_zombie: "Crypt Ghoul",
  zealot_enderman: "Zealot",
  invisible_creeper: "Sneaky Creeper",
  generator_ghast: "Minion Ghast",
  generator_magma_cube: "Minion Magma Cube",
  generator_slime: "Minion Slime",
  brood_mother_spider: "Brood Mother",
  obsidian_wither: "Obsidian Defender",
  sadan_statue: "Terracotta",
  diamond_guy: "Angry Archaeologist",
  tentaclees: "Fels",
  master_diamond_guy: "Master Angry Archaeologist",
  master_sadan_statue: "Master Terracotta",
  master_tentaclees: "Master Fels",
  maxor: "Necron",
};

export const RACE_OBJECTIVE_TO_STAT_NAME = {
  complete_the_end_race: "end_race_best_time",
  complete_the_woods_race: "foraging_race_best_time",
  complete_the_chicken_race: "chicken_race_best_time_2",
  complete_the_giant_mushroom_anything_with_return_race: "dungeon_hub_giant_mushroom_anything_with_return_best_time",
  complete_the_giant_mushroom_no_pearls_with_return_race: "dungeon_hub_giant_mushroom_no_pearls_with_return_best_time",
  complete_the_giant_mushroom_no_abilities_with_return_race:
    "dungeon_hub_giant_mushroom_no_abilities_with_return_best_time",
  complete_the_giant_mushroom_nothing_with_return_race: "dungeon_hub_giant_mushroom_nothing_with_return_best_time",
  complete_the_precursor_ruins_anything_with_return_race: "dungeon_hub_precursor_ruins_anything_with_return_best_time",
  complete_the_precursor_ruins_no_pearls_with_return_race:
    "dungeon_hub_precursor_ruins_no_pearls_with_return_best_time",
  complete_the_precursor_ruins_no_abilities_with_return_race:
    "dungeon_hub_precursor_ruins_no_abilities_with_return_best_time",
  complete_the_precursor_ruins_nothing_with_return_race: "dungeon_hub_precursor_ruins_nothing_with_return_best_time",
  complete_the_crystal_core_anything_with_return_race: "dungeon_hub_crystal_core_anything_with_return_best_time",
  complete_the_crystal_core_no_pearls_with_return_race: "dungeon_hub_crystal_core_no_pearls_with_return_best_time",
  complete_the_crystal_core_no_abilities_with_return_race:
    "dungeon_hub_crystal_core_no_abilities_with_return_best_time",
  complete_the_crystal_core_nothing_with_return_race: "dungeon_hub_crystal_core_nothing_with_return_best_time",
  complete_the_giant_mushroom_anything_no_return_race: "dungeon_hub_giant_mushroom_anything_no_return_best_time",
  complete_the_giant_mushroom_no_pearls_no_return_race: "dungeon_hub_giant_mushroom_no_pearls_no_return_best_time",
  complete_the_giant_mushroom_no_abilities_no_return_race:
    "dungeon_hub_giant_mushroom_no_abilities_no_return_best_time",
  complete_the_giant_mushroom_nothing_no_return_race: "dungeon_hub_giant_mushroom_nothing_no_return_best_time",
  complete_the_precursor_ruins_anything_no_return_race: "dungeon_hub_precursor_ruins_anything_no_return_best_time",
  complete_the_precursor_ruins_no_pearls_no_return_race: "dungeon_hub_precursor_ruins_no_pearls_no_return_best_time",
  complete_the_precursor_ruins_no_abilities_no_return_race:
    "dungeon_hub_precursor_ruins_no_abilities_no_return_best_time",
  complete_the_precursor_ruins_nothing_no_return_race: "dungeon_hub_precursor_ruins_nothing_no_return_best_time",
  complete_the_crystal_core_anything_no_return_race: "dungeon_hub_crystal_core_anything_no_return_best_time",
  complete_the_crystal_core_no_pearls_no_return_race: "dungeon_hub_crystal_core_no_pearls_no_return_best_time",
  complete_the_crystal_core_no_abilities_no_return_race: "dungeon_hub_crystal_core_no_abilities_no_return_best_time",
  complete_the_crystal_core_nothing_no_return_race: "dungeon_hub_crystal_core_nothing_no_return_best_time",
};

export const AREA_NAMES = {
  dynamic: "Private Island",
  hub: "Hub",
  mining_1: "Gold Mine",
  mining_2: "Deep Caverns",
  mining_3: "Dwarven Mines",
  combat_1: "Spider's Den",
  crimson_isle: "Crimson Isle",
  combat_3: "The End",
  farming_1: "The Farming Islands",
  foraging_1: "The Park",
  dungeon: "Dungeon",
  dungeon_hub: "Dungeon Hub",
  winter: "Jerry's Workshop",
  instanced: "Kuudra's End",
  garden: "The Garden",
};

export const COLOR_NAMES = {
  BLACK: "0",
  DARK_BLUE: "1",
  DARK_GREEN: "2",
  DARK_AQUA: "3",
  DARK_RED: "4",
  DARK_PURPLE: "5",
  GOLD: "6",
  GRAY: "7",
  DARK_GRAY: "8",
  BLUE: "9",
  GREEN: "a",
  AQUA: "b",
  RED: "c",
  LIGHT_PURPLE: "d",
  YELLOW: "e",
  WHITE: "f",
};

export const RANKS = {
  OWNER: {
    color: "c",
    tag: "OWNER",
  },

  ADMIN: {
    color: "c",
    tag: "ADMIN",
  },

  GAME_MASTER: {
    color: "2",
    tag: "GM",
  },

  YOUTUBER: {
    color: "c",
    tag: "YOUTUBE",
  },

  SUPERSTAR: {
    color: "6",
    tag: "MVP",
    plus: "++",
    plusColor: "c",
  },

  MVP_PLUS: {
    color: "b",
    tag: "MVP",
    plus: "+",
    plusColor: "c",
  },

  MVP: {
    color: "b",
    tag: "MVP",
  },

  VIP_PLUS: {
    color: "a",
    tag: "VIP",
    plus: "+",
    plusColor: "6",
  },

  VIP: {
    color: "a",
    tag: "VIP",
  },

  "PIG+++": {
    color: "d",
    tag: "PIG",
    plus: "+++",
    plusColor: "b",
  },

  MAYOR: {
    color: "d",
    tag: "MAYOR",
  },

  MINISTER: {
    color: "c",
    tag: "MINISTER",
  },

  NONE: null,
};

export const FARMING_CROPS = {
  "INK_SACK:3": {
    name: "Cocoa Beans",
    icon: "351_3",
  },
  POTATO_ITEM: {
    name: "Potato",
    icon: "392_0",
  },
  CARROT_ITEM: {
    name: "Carrot",
    icon: "391_0",
  },
  CACTUS: {
    name: "Cactus",
    icon: "81_0",
  },
  SUGAR_CANE: {
    name: "Sugar Cane",
    icon: "338_0",
  },
  MUSHROOM_COLLECTION: {
    name: "Mushroom",
    icon: "40_0",
  },
  PUMPKIN: {
    name: "Pumpkin",
    icon: "86_0",
  },
  NETHER_STALK: {
    name: "Nether Wart",
    icon: "372_0",
  },
  WHEAT: {
    name: "Wheat",
    icon: "296_0",
  },
  MELON: {
    name: "Melon",
    icon: "360_0",
  },
};

export const EXPERIMENTS = {
  games: {
    simon: {
      name: "Chronomatron",
    },
    numbers: {
      name: "Ultrasequencer",
    },
    pairings: {
      name: "Superpairs",
    },
  },
  tiers: [
    {
      name: "Beginner",
      icon: "351:12",
    },
    {
      name: "High",
      icon: "351:10",
    },
    {
      name: "Grand",
      icon: "351:11",
    },
    {
      name: "Supreme",
      icon: "351:14",
    },
    {
      name: "Transcendent",
      icon: "351:1",
    },
    {
      name: "Metaphysical",
      icon: "351:13",
    },
  ],
};

export const MAX_FAVORITES = 10;

export const INCREASE_MOST_STATS_EXCLUDE = [
  "mining_speed",
  "mining_fortune",
  "farming_fortune",
  "foraging_fortune",
  "pristine",
];

export const FAIRY_SOULS = {
  max: {
    normal: 239,
    stranded: 3,
  },
};

export const ESSENCE = {
  // Catacombs essences
  ice: {
    name: "Ice",
    head: "/head/ddba642efffa13ec3730eafc5914ab68115c1f998803f74452e2e0cd26af0b8",
  },
  wither: {
    name: "Wither",
    head: "/head/c4db4adfa9bf48ff5d41707ae34ea78bd2371659fcd8cd8934749af4cce9b",
  },
  spider: {
    name: "Spider",
    head: "/head/16617131250e578333a441fdf4a5b8c62163640a9d06cd67db89031d03accf6",
  },
  undead: {
    name: "Undead",
    head: "/head/71d7c816fc8c636d7f50a93a0ba7aaeff06c96a561645e9eb1bef391655c531",
  },
  diamond: {
    name: "Diamond",
    head: "/head/964f25cfff754f287a9838d8efe03998073c22df7a9d3025c425e3ed7ff52c20",
  },
  dragon: {
    name: "Dragon",
    head: "/head/33ff416aa8bec1665b92701fbe68a4effff3d06ed9147454fa77712dd6079b33",
  },
  gold: {
    name: "Gold",
    head: "/head/8816606260779b23ed15f87c56c932240db745f86f683d1f4deb83a4a125fa7b",
  },
  // Nether essences
  crimson: {
    name: "Crimson",
    head: "/head/67c41930f8ff0f2b0430e169ae5f38e984df1244215705c6f173862844543e9d",
  },
};

export const STAT_MAPPINGS = {
  walk_speed: "speed",
};

export const KUUDRA_TIERS = {
  none: {
    name: "Basic",
    head: "bfd3e71838c0e76f890213120b4ce7449577736604338a8d28b4c86db2547e71",
  },
  hot: {
    name: "Hot",
    head: "c0259e8964c3deb95b1233bb2dc82c986177e63ae36c11265cb385180bb91cc0",
  },
  burning: {
    name: "Burning",
    head: "330f6f6e63b245f839e3ccdce5a5f22056201d0274411dfe5d94bbe449c4ece",
  },
  fiery: {
    name: "Fiery",
    head: "bd854393bbf9444542502582d4b5a23cc73896506e2fc739d545bc35bc7b1c06",
  },
  infernal: {
    name: "Infernal",
    head: "82ee25414aa7efb4a2b4901c6e33e5eaa705a6ab212ebebfd6a4de984125c7a0",
  },
};

export const DOJO = {
  sword_swap: {
    name: "Discipline",
    itemId: 276,
    damage: 0,
  },
  fireball: {
    name: "Tenacity",
    itemId: 385,
    damage: 0,
  },
  archer: {
    name: "Mastery",
    itemId: 261,
    damage: 0,
  },
  lock_head: {
    name: "Control",
    itemId: 381,
    damage: 0,
  },
  snake: {
    name: "Swiftness",
    itemId: 420,
    damage: 0,
  },
  wall_jump: {
    name: "Stamina",
    itemId: 414,
    damage: 0,
  },
  mob_kb: {
    name: "Force",
    itemId: 280,
    damage: 0,
  },
};

export const MAX_REAPER_PEPPERS_EATEN = 5;

export const ESSENCE_SHOP = {
  undead: {
    catacombs_boss_luck: {
      name: "Boss Luck",
      description: "Increases the quality of boss rewards in The Catacombs by 1-10%.",
      maxLevel: 4,
    },
    catacombs_looting: {
      name: "Looting",
      description: "Increases the quality of mob loot drops in The Catacombs by 1-10%.",
      maxLevel: 5,
    },
    revive_stone: {
      name: "Help of the Fairies",
      description: "Start every run in The Catacombs with an invisible Revive Stone.",
      maxLevel: 1,
    },
    catacombs_health: {
      name: "Health Essence",
      description: "Increases your base Health while in The Catacombs by 25-125.",
      maxLevel: 5,
    },
    catacombs_defense: {
      name: "Defense Essence",
      description: "Increases your base Defense while in The Catacombs by 10-50.",
      maxLevel: 5,
    },
    catacombs_strength: {
      name: "Strength Essence",
      description: "Increases your base Strength while in The Catacombs by 10-50.",
      maxLevel: 5,
    },
    catacombs_intelligence: {
      name: "Intelligence Essence",
      description: "Increases your base Intelligence while in The Catacombs by 15-75.",
      maxLevel: 5,
    },
    catacombs_crit_damage: {
      name: "Critical Damage Essence",
      description: "Increases your base Critical Damage while in The Catacombs by 10-50.",
      maxLevel: 5,
    },
  },
  wither: {
    permanent_health: {
      name: "Forbidden Health",
      description: "Increases your Health by 2-10.",
      maxLevel: 5,
      bonus: 2,
    },
    permanent_defense: {
      name: "Forbidden Defense",
      description: "Increases your Defense by 1-5.",
      maxLevel: 5,
      bonus: 1,
    },
    permanent_speed: {
      name: "Forbidden Speed",
      description: "Increases your Speed by 1-2.",
      maxLevel: 2,
      bonus: 1,
    },
    permanent_intelligence: {
      name: "Forbidden Intelligence",
      description: "Increases your Intelligence by 2-10.",
      maxLevel: 5,
      bonus: 2,
    },
    permanent_strength: {
      name: "Forbidden Strength",
      description: "Increases your Strength by 1-5.",
      maxLevel: 5,
      bonus: 1,
    },
    forbidden_blessing: {
      name: "Forbidden Blessing",
      description: "Blessings are 1-10% more effective on you.",
      maxLevel: 10,
    },
  },
  dragon: {
    inc_zealots_odds: {
      name: "Zealuck",
      description: "Increases the chance to find a special Zealot by 2-10%.",
      maxLevel: 5,
    },
    combat_wisdom_in_end: {
      name: "Ender Training",
      description: "Gain + 3 - 7 Combat Wisdom while in The End.",
      maxLevel: 2,
    },
    edrag_cd: {
      name: "Infused Dragon",
      description: "Increases the Crit Damage of your Ender Dragon Pet by + 2 - 10 CD.",
      maxLevel: 5,
    },
    dragon_reforges_buff: {
      name: "Two-Headed Strike",
      description: "Renowed and Spiked Reforges apply an extra 2-10 Bonus Attack Speed on your gear.",
      maxLevel: 4,
    },
    fero_vs_dragons: {
      name: "Rageborn",
      description: "Gain +2-10 Ferocity against Dragons.",
      maxLevel: 5,
    },
    mana_after_ender_kill: {
      name: "Recharge",
      description: "Regain 2-20 Mana after killing an Enderman or Endermite.",
      maxLevel: 10,
    },
    flat_damage_vs_ender: {
      name: "One Punch",
      description:
        "After all other damage, add 500 - 2,500 damage to the first strike against Endermen and Endermites.",
      maxLevel: 5,
    },
    increased_sup_chances: {
      name: "Dragon Piper",
      description:
        "Gain +10% chance to spawn a Superior Dragon if you placed a Summoning Eye.\nThis perk only applies once per dragon across players.",
      maxLevel: 1,
    },
  },
  spider: {
    empowered_agility: {
      name: "Empowered Agility",
      description: "Reduces the Mana cost of some movement abilities by 1-10%.",
      maxLevel: 10,
    },
    bane: {
      name: "Bane",
      description: "Increases damage dealt to Spiders by 3-15%.",
      maxLevel: 5,
    },
    vermin_control: {
      name: "Vermin Control",
      description: "Receive 3-15% less damage from Spiders.",
      maxLevel: 5,
    },
    spider_training: {
      name: "Spider Training",
      description: "Increases your Combat Wisdom by 3-10 while on the Spider's Den.",
      maxLevel: 3,
    },
  },
  ice: {
    cold_efficiency: {
      name: "Cold Efficiency",
      description: "Increases the Mage class experience by 2-10%.",
      maxLevel: 5,
    },
    cooled_forges: {
      name: "Cooled Forges",
      description: "4-20% chance to get double essence when salvaging.",
      maxLevel: 5,
    },
    frozen_skin: {
      name: "Frozen Skin",
      description: "Increases your Defense by 2-10 while on Jerry's Workshop.",
      maxLevel: 5,
    },
    season_of_joy: {
      name: "Season of Joy",
      description: "Gain 1-10% extra Gifts from the Gift Attack event.",
      maxLevel: 10,
    },
  },
  crimson: {
    strongarm_kuudra: {
      name: "Strongarm",
      description: "Your Fishing Rods pull Supplies and Fuel Cells 10-25% further during the Kuudra Boss Fight.",
      maxLevel: 2,
    },
    fresh_tools_kuudra: {
      name: "Fresh Tools",
      description: "2-15% chance to double the speed of repairing Elle's Ballista for 5s during the Kuudra Boss Fight.",
      maxLevel: 5,
    },
    headstart_kuudra: {
      name: "Headstart",
      description: "Start the Kuudra Boss Fight with 10-50 Tokens.",
      maxLevel: 5,
    },
    master_kuudra: {
      name: "Kuudra Master",
      description:
        "Deal 0.1% increased damage to Kuudra's Minions, multiplied by the highest defeated wave in that tier or higher. Max 10%.",
      maxLevel: 1,
    },
    fungus_fortuna: {
      name: "Fungus Fortuna",
      description: "Gain 2-20 Mining Fortune when mining Mycelium.",
      maxLevel: 10,
    },
    harena_fortuna: {
      name: "Harena Fortuna",
      description: "Gain 2-20 Mining Fortune when mining Red Sand.",
      maxLevel: 10,
    },
    crimson_training: {
      name: "Crimson Training",
      description: "Increases your Combat Wisdom by 3-10 while on the Crimson Isle and in the Kuudra Boss Fight.",
      maxLevel: 3,
    },
    wither_piper: {
      name: "Wither Piper",
      description: "2-10% increased chance to find Vanquishers on the Crimson Isle.",
      maxLevel: 5,
    },
  },
};

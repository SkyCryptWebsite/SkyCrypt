import { SYMBOLS } from "../../common/constants.js";

// prevent specific players from appearing in leaderboards
export const BLOCKED_PLAYERS = [
  "20934ef9488c465180a78f861586b4cf", // Minikloon (Admin)
  "f025c1c7f55a4ea0b8d93f47d17dfe0f", // Plancke (Admin)
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
  combat_2: "Blazing Fortress",
  combat_3: "The End",
  farming_1: "The Barn",
  farming_2: "Mushroom Desert",
  foraging_1: "The Park",
  winter: "Jerry's Workshop",
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
    normal: 238,
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
  // TODO: Add the rest of the tiers when update comes out (IDs might not be acurrate)
  /*
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
  */
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

export const TROPHY_FISH = {
  BLOBFISH: {
    name: "Blobfish",
    head: "/head/3e77a61f2a25f19bb047be985b965f069d857502881bea3f9682d00bfd5cc3e7",
    description: "Caught everywhere.",
  },
  FLYFISH: {
    name: "Flyfish",
    head: "/head/5140c42fc3a1ba2fe77c45b975fa87e8f54a1b1833bc76e6339b4c262304011d",
    description: "Caught from 8 blocks or higher above lava in the Blazing Volcano.",
  },
  GOLDEN_FISH: {
    name: "Golden Fish",
    head: "/head/fcfa31d81eae819936834e6664430daf8affbff30b48a1daa7ca1b4c20e3fe7d",
    description:
      "Has a chance to spawn after 15 minutes of fishing, increasing linearly until reaching 100% at 20 minutes. The Golden Fish is rolled when your fishing hook is thrown out, regardless of if you catch a fish or not. You are not required to Trophy Fish to catch this one.",
  },
  GUSHER: {
    name: "Gusher",
    head: "/head/afb8c51bfcd996840010bcce2a3575ae26352e00446d3ec313fcbf1f88108512",
    description: "Caught within 7-16 minutes after a Blazing Volcano eruption.",
  },
  KARATE_FISH: {
    name: "Karate Fish",
    head: "/head/901ef47164aba899674cac1e04dda29895ba670807a162e888681c6428e42a83",
    description:
      "Caught in the lava pools near the Dojo. Note - Half of the lava pools do not actually count as being in the Dojo area. If you stand in the same place as your bobber and do not see 'Dojo' in the sidebar, you cannot catch the Karate Fish there.",
  },
  LAVA_HORSE: {
    name: "Lava Horse",
    head: "/head/1176ea86635c4e849469ed694b3c0c3f7ec7677ed0682bee5ef6d59ea669677f",
    description: "Caught everywhere.",
  },
  MANA_RAY: {
    name: "Mana Ray",
    head: "/head/fdb2cad06f475b036ad71d61469b8e670e189204350adab6079dc85e1f7d58f2",
    description: `Caught when you have at least 1,200 ${SYMBOLS.intelligence} Mana.`,
  },
  MOLDFIN: {
    name: "Moldfin",
    head: "/head/54f33dc405ba447b35926b48d90600302aeebb140ad330d885886cb1029a8af",
    description: "Caught in the Mystic Marsh.",
  },
  OBFUSCATED_FISH_1: {
    name: "Obfuscated 1",
    head: "/head/e1f4d91e1bf8d3c4258fe0f28ec2fa40670e25ba06ac4b5cb1abf52a83731a9c",
    description: "Caught with Corrupted Bait.",
  },
  OBFUSCATED_FISH_2: {
    name: "Obfuscated 2",
    head: "/head/4fbf7111609f2ec23d9b3f285e1755b62193bd7c3d770576e2b18c48afeb0e29",
    description: "Caught whilst using Obfuscated 1 as bait.",
  },
  OBFUSCATED_FISH_3: {
    name: "Obfuscated 3",
    head: "/head/df478663687d16f79b9c32546a7c3ec2736e87ce69779991e52deaf622abd8c2",
    description: "Caught with Obfuscated 2 as bait.",
  },
  SKELETON_FISH: {
    name: "Skeleton Fish",
    head: "/head/923e0a25048b60a2cc092f72943159ec170063bb235aa79690ef34ab181d691",
    description: "Caught in the Burning Desert.",
  },
  SLUGFISH: {
    name: "Slugfish",
    head: "/head/d82efd885e6e2a964efb857de724b2ef043f1dcbbe618f10ec3742c6f2cecab",
    description: "Caught when the bobber has been active for at least 30 seconds.",
  },
  SOUL_FISH: {
    name: "Soul Fish",
    head: "/head/7fe554d346c20c161aa85cfdc1b89779c9f64e726a5bb28ace8078e6594052d7",
    description: "Caught in the Stronghold.",
  },
  STEAMING_HOT_FLOUNDER: {
    name: "Steaming-Hot Flounder",
    head: "/head/8b88f88f3053c434660eeb4c7b2344bc21ab52596cea5a66d0f9db8c0e050209",
    description: "Caught when the bobber is within 2 blocks of a Geyser in the Blazing Volcano.",
  },
  SULPHUR_SKITTER: {
    name: "Sulphur Skitter",
    head: "/head/4fbf7111609f2ec23d9b3f285e1755b62193bd7c3d770576e2b18c48afeb0e29",
    description: "Caught when standing within 8 blocks of a Sulphur Ore.",
  },
  VANILLE: {
    name: "Vanille",
    head: "/head/57120222cce38d53ba69fc6540e97bff9abdbe22ba6068d4ee9af52ecc56842f",
    description: "Caught when using a Starter Lava Rod with no Enchantments.",
  },
  VOLCANIC_STONEFISH: {
    name: "Volcanic Stonefish",
    head: "/head/38f89cbaa61ecc99a8321d53f070cef8414efc3eac47bf6fe143056fed9ee8",
    description: "Caught in the Blazing Volcano.",
  },
};

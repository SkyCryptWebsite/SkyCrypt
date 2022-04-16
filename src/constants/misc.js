// prevent specific players from appearing in leaderboards
export const blocked_players = [
  "20934ef9488c465180a78f861586b4cf", // Minikloon (Admin)
  "f025c1c7f55a4ea0b8d93f47d17dfe0f", // Plancke (Admin)
];

// Number of kills required for each level of expertise
export const expertise_kills_ladder = [50, 100, 250, 500, 1000, 2500, 5500, 10000, 15000];

// Walking distance required for each rarity level of the prehistoric egg
export const prehistoric_egg_blocks_walked_ladder = [4000, 10000, 20000, 40000, 100000];

// api names and their max value from the profile upgrades
export const profile_upgrades = {
  island_size: 10,
  minion_slots: 5,
  guests_count: 5,
  coop_slots: 3,
  coins_allowance: 5,
};

// Player stats on a completely new profile
export const base_stats = {
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

export const stat_template = {
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

/** @type {{[key: string]: string}} */
export const statNames = {
  Damage: "damage",
  Health: "health",
  Defense: "defense",
  Strength: "strength",
  Drunkenness: "strength",
  Speed: "speed",
  "Pegleg Boost": "speed",
  "Crit Chance": "crit_chance",
  "Crit Damage": "crit_damage",
  "Bonus Attack Speed": "bonus_attack_speed",
  Intelligence: "intelligence",
  "Magic Find": "magic_find",
  "Pet Luck": "pet_luck",
  Ferocity: "ferocity",
  "Ability Damage": "ability_damage",
};

export const slayer_cost = {
  1: 2000,
  2: 7500,
  3: 20000,
  4: 50000,
  5: 100000,
};

export const mob_mounts = {
  sea_emperor: ["guardian_emperor", "skeleton_emperor"],
  monster_of_the_deep: ["zombie_deep", "chicken_deep"],
};

export const mob_names = {
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

export const raceObjectiveToStatName = {
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

export const area_names = {
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

export const color_names = {
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

export const ranks = {
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

export const farming_crops = {
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

export const experiments = {
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

export const max_favorites = 10;

export const increase_most_stats_exclude = [
  "mining_speed",
  "mining_fortune",
  "farming_fortune",
  "foraging_fortune",
  "pristine",
];

export const fairy_souls = {
  max: {
    normal: 228,
    stranded: 3,
  },
};

export const tieredAchievements = {
  skyblock_angler: {
    name: "Angler",
    description: "Achieve Fishing levels",
    tierLevelRequirements: [5, 10, 15, 20, 25],
    tierRewards: [5, 5, 10, 10, 15],
  },
  skyblock_augmentation: {
    name: "Augmentation",
    description: "Achieve Enchanting levels",
    tierLevelRequirements: [5, 10, 15, 20, 25],
    tierRewards: [5, 5, 10, 10, 15],
  },
  skyblock_combat: {
    name: "Combat!",
    description: "Achieve Combat levels",
    tierLevelRequirements: [5, 10, 15, 20, 25],
    tierRewards: [5, 5, 10, 10, 15],
  },
  skyblock_concoctor: {
    name: "Concoctor",
    description: "Achieve Alchemy levels",
    tierLevelRequirements: [5, 10, 15, 20, 25],
    tierRewards: [5, 5, 10, 10, 15],
  },
  skyblock_crystal_nucleus: {
    name: "Crystal Nucleus",
    description: "Complete a Crystal Nucleus run by placing all 5 Crystals",
    tierLevelRequirements: [5, 10, 15, 20, 25],
    tierRewards: [5, 10, 15, 20, 25],
  },
  skyblock_divans_treasures: {
    name: "Divan's Treasures",
    description: "Find treasures in the Mines of Divan",
    tierLevelRequirements: [30, 60, 90, 120, 150],
    tierRewards: [5, 10, 15, 20, 25],
  },
  skyblock_domesticator: {
    name: "Domesticator",
    description: "Achieve Taming levels",
    tierLevelRequirements: [5, 10, 15, 20, 25],
    tierRewards: [5, 5, 10, 10, 15],
  },
  skyblock_dungeoneer: {
    name: "Dungeoneer",
    description: "Achieve Dungeoneering levels for any single Dungeon Class",
    tierLevelRequirements: [15, 20, 25, 30, 35],
    tierRewards: [5, 5, 10, 10, 15],
  },
  skyblock_excavator: {
    name: "Excavator",
    description: "Achieve Mining levels",
    tierLevelRequirements: [5, 10, 15, 20, 25],
    tierRewards: [5, 5, 10, 10, 15],
  },
  skyblock_unique_gifts: {
    name: "Festive Altruist",
    description: "Give Gifts to different players",
    tierLevelRequirements: [5, 10, 25, 50, 100],
    tierRewards: [5, 10, 15, 20, 25],
  },
  skyblock_gatherer: {
    name: "Gatherer",
    description: "Achieve Foraging levels",
    tierLevelRequirements: [5, 10, 15, 20, 25],
    tierRewards: [5, 5, 10, 10, 15],
  },
  skyblock_goblin_killer: {
    name: "Goblin Killer",
    description: "Kill Golden Goblins",
    tierLevelRequirements: [5, 10, 25, 50, 100],
    tierRewards: [5, 10, 15, 20, 25],
  },
  skyblock_hard_working_miner: {
    name: "Hard Working Miner",
    description: "Complete Commissions",
    tierLevelRequirements: [5, 25, 100, 250, 500],
    tierRewards: [5, 10, 15, 20, 25],
  },
  skyblock_harvester: {
    name: "Harvester",
    description: "Achieve Farming levels",
    tierLevelRequirements: [5, 10, 15, 20, 25],
    tierRewards: [5, 5, 10, 10, 15],
  },
  skyblock_minion_lover: {
    name: "Minion Lover",
    description: "[Co-op or you] Craft unique Minions",
    tierLevelRequirements: [10, 25, 100, 250, 500],
    tierRewards: [5, 10, 15, 20, 25],
  },
  skyblock_slayer: {
    name: "Slayer",
    description: "Get Slayer exp",
    tierLevelRequirements: [10, 50, 100, 250, 500],
    tierRewards: [5, 10, 15, 20, 25],
  },
  skyblock_treasure_hunter: {
    name: "Treasure Hunter",
    description: "Find Secrets in Dungeons",
    tierLevelRequirements: [10, 50, 100, 250, 1000],
    tierRewards: [5, 10, 15, 20, 25],
  },
  skyblock_treasury: {
    name: "Treasury",
    description: "Unlock Collections",
    tierLevelRequirements: [10, 20, 30, 40, 50],
    tierRewards: [5, 10, 15, 20, 25],
  },
};

export const oneTimeAchievements = {
  skyblock_a_challenging_climb: { name: "A Challenging Climb", description: "Scale the Spider's Den", reward: 5 },
  skyblock_a_good_review: { name: "A Good Review", description: "Feed Don Expresso some Tasty Mithril", reward: 5 },
  skyblock_a_good_spider_is_a_dead_spider: {
    name: "A good spider is a dead spider",
    description: "Kill the Broodmother",
    reward: 10,
  },
  skyblock_royal_meeting: { name: "A Royal Meeting", description: "Obtain the King's Talisman", reward: 5 },
  skyblock_absorb_it_all: { name: "Absorb it all!", description: "Wear a full set of Sponge Armor", reward: 10 },
  skyblock_accessories_galore: {
    name: "Accessories Galore",
    description: "Unlock the Greater Accessory Bag upgrade",
    reward: 5,
  },
  skyblock_advanced_transportation: {
    name: "Advanced Transportation",
    description: "Sell an item using the Enchanted Hopper",
    reward: 5,
  },
  skyblock_agile: { name: "Agile", description: "Drink an Agility Potion", reward: 5 },
  skyblock_animal_fishing: { name: "Animal Fishing", description: "Fish using the Farmer's Rod", reward: 5 },
  skyblock_arcadia: { name: "Arcadia", description: "Place 5 unique Islands on your private world", reward: 5 },
  skyblock_speed_of_light: { name: "At the speed of light", description: "Use a Catalyst", reward: 5 },
  skyblock_baited: { name: "Baited", description: "Obtain the Bait Ring", reward: 5 },
  skyblock_beaconator_two: { name: "Beaconator 2.0", description: "Power a Beacon of any kind", reward: 5 },
  skyblock_big_game_fisher: {
    name: "Big Game Fisher",
    description: "Kill a Sea Creature that requires fishing level 20 or higher",
    reward: 15,
  },
  skyblock_bigger_storage_is_seeded: {
    name: "Bigger Storage Is Seeded",
    description: "Place a Large Storage Chest",
    reward: 5,
  },
  skyblock_brain_power: { name: "Brain Power", description: "Drink an Adrenaline Potion", reward: 5 },
  skyblock_businessman: { name: "Businessman", description: "Complete a trade with another player", reward: 5 },
  skyblock_caretaker: { name: "Caretaker", description: "Level up a Pet to 80", reward: 10 },
  skyblock_caught_the_grinch: {
    name: "Caught the Grinch",
    description: "Kill a Grinch on the Jerry Island",
    reward: 15,
  },
  skyblock_combined_efforts: { name: "Combined efforts", description: "Start a co-op", reward: 5 },
  skyblock_cute_little_cube: {
    name: "Cute Little Cube",
    description: "Land the final blow on killing a Magma Cube Boss",
    reward: 10,
  },
  skyblock_death_from_above: {
    name: "Death From Above",
    description: "Kill a mob using the damage from the Leaping Sword ability",
    reward: 5,
  },
  skyblock_deep_storage: { name: "Deep Storage", description: "Unlock the level 3 Ender Chest Upgrade", reward: 5 },
  skyblock_defeating_death: {
    name: "Defeating Death",
    description: "Slay a Deathmite (Secret Achievement)",
    reward: 5,
  },
  skyblock_didnt_mean_to: { name: "Didn't mean to!", description: "Kill a Kalhuiki Youngling", reward: 5 },
  skyblock_do_you_even_voodoo: {
    name: "Do you even Voodoo?",
    description: "Kill a mob with the Voodoo Doll ability",
    reward: 10,
  },
  skyblock_dragon_slayer: { name: "Dragon Slayer", description: "Take down a Dragon (Secret Achievement)", reward: 5 },
  skyblock_dullahan: { name: "Dullahan", description: "Kill a Headless Horseman", reward: 5 },
  skyblock_dungeon_explorer: {
    name: "Dungeon Explorer",
    description: "Get a score on exploration of 95 or more in a Dungeon.",
    reward: 10,
  },
  skyblock_empty_flower_pot: {
    name: "Empty Flower Pot",
    description:
      "Why is it there? Why are we all here (Hold a flower and right click the flower pot at  -307, 82, 16 in The Park for 5 minutes) (Secret Achievement)",
    reward: 5,
  },
  skyblock_every_little_bit_helps: {
    name: "Every little bit helps",
    description: "Apply a Hot Potato Book to an item",
    reward: 5,
  },
  skyblock_existential_revelations: {
    name: "Existential Revelations",
    description: "Find the mushroom dream in the Catacombs (Secret Achievement)",
    reward: 5,
  },
  skyblock_expensive_brew: { name: "Expensive Brew", description: "Brew a Tier VIII Potion", reward: 10 },
  skyblock_explorer: { name: "Explorer", description: "Discover all Areas on the Hub Island", reward: 5 },
  skyblock_explosive_ending: {
    name: "Explosive Ending",
    description: "Survive the blast from the Unstable Dragon",
    reward: 5,
  },
  skyblock_flamin_hot: { name: "Flamin Hot", description: "Consume 200 Magma Creams using the Magma Bow", reward: 5 },
  skyblock_flawless: { name: "Flawless", description: "Beat a Dungeon without anyone dying", reward: 10 },
  skyblock_fortunate: {
    name: "Fortunate",
    description: "Fish 2 Treasures at once using the blessing enchant",
    reward: 5,
  },
  skyblock_friar_lawrence: {
    name: "Friar Lawrence",
    description: "Complete the Romero and Juliette Questline",
    reward: 25,
  },
  skyblock_friend_for_life: { name: "Friend for Life", description: "Level up a Pet to 100", reward: 20 },
  skyblock_frozen_monster: { name: "Frozen Monster", description: "Kill a Yeti on the Jerry Island", reward: 15 },
  skyblock_fully_evolved: { name: "Fully Evolved", description: "Obtain a legendary Pet", reward: 10 },
  skyblock_ghost_buster: { name: "Ghost Buster", description: "Kill a Ghost", reward: 5 },
  skyblock_glass_cannon: { name: "Glass Cannon", description: "Wear the Elegant Tux", reward: 15 },
  skyblock_goblin_slayer: {
    name: "Goblin Slayer",
    description: "Get 100 points during the Goblin Raid event",
    reward: 5,
  },
  skyblock_gotta_go_fast: { name: "Gotta go fast!", description: "Craft a Speed Artifact", reward: 15 },
  skyblock_gottagofast: { name: "Gottagofast", description: "Wear the full Speedster Armor", reward: 5 },
  skyblock_happy_holidays: {
    name: "Happy Holidays",
    description: "Collect all 20 White Gifts on the Jerry Island",
    reward: 5,
  },
  skyblock_happy_new_year: { name: "Happy New Year", description: "Obtain a New Year Cake from the Baker", reward: 5 },
  skyblock_heart_of_the_end: { name: "Heart of the End", description: "Reach the Dragon's Nest in the End", reward: 5 },
  skyblock_helpful_hand: { name: "Helpful Hand", description: "Give Fetchur the item he asks for", reward: 5 },
  skyblock_hidden_secrets: { name: "Hidden Secrets", description: "Find a Dark Monolith", reward: 5 },
  skyblock_higher_enchants: { name: "Higher Enchants", description: "Obtain a level 6 Enchantment Book", reward: 10 },
  skyblock_higher_than_a_rabbit: { name: "Higher Than a Rabbit", description: "Wear the Spider Boots", reward: 5 },
  skyblock_how_to_train_your_dragon: {
    name: "How to train your dragon?",
    description: "Find the Dragon's Lair",
    reward: 15,
  },
  skyblock_hsssss: { name: "Hsssss", description: "Wear the Creeper Pants", reward: 5 },
  skyblock_i_am_groot: { name: "I Am Groot", description: "Wear a set of Growth Armor with a Bonus 100 hp", reward: 5 },
  skyblock_i_am_superior: {
    name: "I am Superior",
    description: "Take down a Superior Dragon (Secret Achievement)",
    reward: 10,
  },
  skyblock_i_believe_i_can_fly: {
    name: "I believe I can fly!",
    description: "Wear a full set of Bat Person Armor",
    reward: 5,
  },
  skyblock_i_call_that_mercy: {
    name: "I call that.. Mercy",
    description: "Place 5 Gemstones in the Gemstone Gauntlet",
    reward: 15,
  },
  skyblock_i_knew_it: {
    name: "I knew it!",
    description: "Unlock a secret armor set (Mob Armor) (Secret Achievement)",
    reward: 10,
  },
  skyblock_im_fast_as_heck_boy: {
    name: "I'm fast as heck boy!!",
    description: "Obtain the Cheetah Talisman from Guildford",
    reward: 10,
  },
  skyblock_indiana_bones: { name: "Indiana Bones", description: "Find 10 secrets in a single Dungeon run", reward: 10 },
  skyblock_infinite_darkness: {
    name: "Infinite Darkness",
    description: "Kill a squid with the Ink Wand Ability",
    reward: 5,
  },
  skyblock_into_the_deep: {
    name: "Into the Deep",
    description: "Reach the Obsidian Sanctuary in the Deep Caverns",
    reward: 5,
  },
  skyblock_it_never_ends: {
    name: "It Never Ends",
    description: "Kill a zombie using the Zombie Sword or its upgraded versions",
    reward: 5,
  },
  skyblock_jerry: { name: "Jerry!!", description: "Use an Inflatable Jerry", reward: 5 },
  skyblock_king_of_the_chicks: { name: "King of the chickens", description: "Obtain the Feather Artifact", reward: 5 },
  skyblock_king_of_the_pets: { name: "King of the Pets", description: "Obtain a Pet score of 100 or more", reward: 10 },
  skyblock_king_of_the_sea: { name: "King Of The Sea", description: "Wear the Guardian Chestplate", reward: 5 },
  skyblock_knowledge_is_power: {
    name: "Knowledge is Power!",
    description: "Equip the Textbook item on a pet",
    reward: 5,
  },
  skyblock_lapidarist: { name: "Lapidartist", description: "Forge a Perfect Gemstone", reward: 15 },
  skyblock_legendary_rod: { name: "Legendary Rod", description: "Fish using the Rod of Legends", reward: 5 },
  skyblock_librarian: { name: "Librarian", description: "Complete 10 Dungeon Journals", reward: 5 },
  skyblock_lifelong_contract: { name: "Lifelong Contract", description: "Obtain the Seal of the Family", reward: 15 },
  skyblock_lost_soul: { name: "Lost Soul", description: "Find a fairy soul", reward: 5 },
  skyblock_magical_place: { name: "Magical Place", description: "Find the Fairy Grotto", reward: 10 },
  skyblock_mass_production: { name: "Mass Production", description: "Craft a level XI Minion", reward: 15 },
  skyblock_master_enchanter: { name: "Master Enchanter", description: "Enchant something using 64 levels", reward: 5 },
  skyblock_more_space: { name: "More Space", description: "Expand a minion using the Minion Expander", reward: 5 },
  skyblock_mystical: {
    name: "Mystical",
    description: "Use a Recombobulator 3000 to obtain a Mythic rarity",
    reward: 10,
  },
  skyblock_next_level: { name: "Next Level", description: "Upgrade an item to a dungeon item", reward: 10 },
  skyblock_night_eyes: { name: "Night Eyes", description: "Obtain the Night Vision Charm", reward: 5 },
  skyblock_nightmare: {
    name: "Nightmare",
    description: "Complete Bednom's secret quest (Secret Achievement)",
    reward: 5,
  },
  skyblock_no_enchants_needed: { name: "No Enchants Needed", description: "Drink a Burning Potion", reward: 5 },
  skyblock_oh_shiny: { name: "Oh Shiny", description: "Mine a Glowing Block on the End Island", reward: 5 },
  skyblock_overkill: { name: "Overkill", description: "Drink a Critical 3 Potion", reward: 5 },
  skyblock_peak_of_the_mountain: {
    name: "Peak of the Mountain",
    description: "Reach tier V of the Heart of the Mountain",
    reward: 15,
  },
  skyblock_precious_minerals: { name: "Precious Minerals", description: "Wear a full set of Emerald Armor", reward: 5 },
  skyblock_prepare_for_trouble: { name: "Prepare for trouble!", description: "Kill Corleone", reward: 10 },
  skyblock_production_expanded: { name: "Production Expanded", description: "Unlock a new Minion slot", reward: 5 },
  skyblock_promised_fulfilled: { name: "Promise Fulfilled", description: "Max out a Promising Tool", reward: 5 },
  skyblock_quest_complete: { name: "Quest complete!", description: "Complete the Villager Quest", reward: 5 },
  skyblock_rainbow: { name: "Raaaiiinnnnbbooww!", description: "Wear a full set of Fairy Armor", reward: 5 },
  skyblock_rebirth: {
    name: "Rebirth",
    description: "Kill a Fairy while you are a Ghost (Secret Achievement)",
    reward: 5,
  },
  skyblock_resourceful: {
    name: "Resourceful",
    description: "Give Rhys the materials to enter the Dwarven Mines",
    reward: 5,
  },
  skyblock_rough_deal: { name: "Rough Deal", description: "Buy something from Tomioka", reward: 5 },
  skyblock_royal_resident_dialogue: {
    name: "Royal Conversation",
    description: "Finish the dialogue with Royal Resident (Secret Achievement)",
    reward: 15,
  },
  skyblock_s_plus_squad: { name: "S+ Squad", description: "Get an S+ Score in a Dungeon", reward: 15 },
  skyblock_sacrifices_must_be_made: {
    name: "Sacrifices must be made",
    description: "Salvage an item for Essence",
    reward: 5,
  },
  skyblock_saddle_up: { name: "Saddle Up!", description: "Craft a Saddle", reward: 5 },
  skyblock_safety_first: { name: "Safety First", description: "Obtain Stonk", reward: 5 },
  skyblock_sea_monster: { name: "Sea Monsters", description: "Obtain the Sea Creature Artifact", reward: 5 },
  skyblock_second_chance: { name: "Second Chance", description: "Consume the Saving Grace", reward: 5 },
  skyblock_seriously: {
    name: "Seriously?",
    description: "Put a Wood Singularity on an Aspect of the Jerry",
    reward: 10,
  },
  skyblock_should_have_stayed_cool: {
    name: "Should've stayed cool",
    description: "Die from maximum  Heat while in the Magma Fields",
    reward: 5,
  },
  skyblock_shrimp: { name: "Shrimp!?!", description: "Obtain Shrimp the Fish (Secret Achievement)", reward: 5 },
  skyblock_sirius_business: {
    name: "Sirius Buisness",
    description: "Participate in the Dark Auction (Secret Achievement)",
    reward: 10,
  },
  skyblock_smell_like_roses: { name: "Smell like roses", description: "Take down an Endstone Protector", reward: 5 },
  skyblock_smells_better: { name: "Smells Better", description: "Wash off the King's Scent with water", reward: 5 },
  skyblock_soul_hunter: { name: "Soul Hunter", description: "Find 20 Fairy Souls", reward: 10 },
  skyblock_speedrunner: { name: "Speedrunner", description: "Beat a Dungeon Boss in under 4 minutes", reward: 10 },
  skyblock_spiky: { name: "Spiky", description: "Craft a Thorns 3 book", reward: 5 },
  skyblock_storage_forever: { name: "Storage Forever", description: "Craft a Greater Backpack", reward: 10 },
  skyblock_stubborn_giver: { name: "Stubborn Gifter", description: "Give 1,000 total gifts", reward: 10 },
  skyblock_super_fuel: { name: "Super Fuel", description: "Upgrade a minion with a Enchanted Lava Bucket", reward: 5 },
  skyblock_supreme_farmer: { name: "Supreme Farmer", description: "Wear a full set of Farm Armor", reward: 5 },
  skyblock_sweet_tooth: { name: "Sweet Tooth", description: "Find a Purple Candy", reward: 5 },
  skyblock_fallen_star_cult: {
    name: "The Cult of the Fallen Star",
    description: "Wear the Fallen Star Helmet to a Cult of the Fallen Star meeting (Secret Achievement)",
    reward: 5,
  },
  skyblock_dragons_egg: {
    name: "The Dragon's Egg",
    description: "Buy a Golden Dragon Egg from the dragon in the Crystal Hollows",
    reward: 10,
  },
  skyblock_end_race: { name: "The End Race", description: "Complete the End Race in under 42 Seconds", reward: 10 },
  skyblock_the_flash: { name: "The Flash", description: "Reach a Speed of 500%", reward: 5 },
  skyblock_the_flint_bros: { name: "The Flint Bros!", description: "Find both Pat and Rick", reward: 5 },
  skyblock_next_generation: {
    name: "The Next Generation",
    description: "Find a Golden Goblin by throwing a Goblin Egg",
    reward: 5,
  },
  skyblock_the_one_bottle: { name: "The One Bottle", description: "Craft a Titanic Experience Bottle", reward: 5 },
  skyblock_the_prodigy: {
    name: "The Prodigy",
    description: "Complete Through the Campfire song at any score",
    reward: 10,
  },
  skyblock_the_real_zoo_shady: {
    name: "The Real Zoo Shady",
    description: "Have 20 different Pets in your pet menu",
    reward: 20,
  },
  skyblock_eternal_flame_ring: {
    name: "The Ring",
    description: "Throw the Eternal Flame Ring into a specific pool of lava (Secret Achievement)",
    reward: 10,
  },
  skyblock_this_is_fair: { name: "This is fair", description: "Kill a pig using the Pigman Sword", reward: 5 },
  skyblock_three_birds_one_arrow: {
    name: "Three Birds, One Arrow",
    description: "Kill 3 monsters with one shot from Runaan's Bow",
    reward: 5,
  },
  skyblock_time_to_go_on_vacation: {
    name: "Time to go on vacation",
    description: "Upgrade a minion with the Super Compactor 3000",
    reward: 5,
  },
  skyblock_time_to_start_fishing: { name: "Time To Start Fishing", description: "Place the Pond Island", reward: 5 },
  skyblock_to_space_we_go: {
    name: "To space we go!",
    description: "Use a Launch Pad on your private island",
    reward: 5,
  },
  skyblock_though_choice: { name: "Tough Choice", description: "Apply an Ultimate Enchantment on an item", reward: 5 },
  skyblock_treasure_fishing: { name: "Treasure Fishing", description: "Fish up a Large Treasure", reward: 10 },
  skyblock_true_adventurer: { name: "True Adventurer", description: "Reach Catacombs level 40", reward: 10 },
  skyblock_true_alchemist: { name: "True Alchemist", description: "Obtain the Potion Affinity Artifact", reward: 5 },
  skyblock_united_in_blood: { name: "United in blood", description: "Obtain a Gilded Midas Sword", reward: 5 },
  skyblock_upgrades_people_upgrades: {
    name: "Upgrades people, Upgrades!",
    description: "Recombobulate any item",
    reward: 10,
  },
  skyblock_watch_me_shine: { name: "Watch Me Shine", description: "Wear The Crystal Armor Set", reward: 15 },
  skyblock_water_sword: { name: "Water Blade", description: "Kill a Squid using the Prismarine Blade", reward: 5 },
  skyblock_welcome_to_my_factory: { name: "Welcome to my Factory", description: "Place a Farm Crystal", reward: 5 },
  skyblock_bat_pinata: { name: "WHAM! POW!", description: "Kill a Bat Piñata", reward: 5 },
  skyblock_wonderful_treasures: { name: "Wonderful Treasures", description: "Open an Obsidian Chest", reward: 10 },
  skyblock_worth_it: {
    name: "Worth it",
    description: "Spend more than 200 levels on a single Sword Enchantment",
    reward: 10,
  },
  skyblock_your_adventure_begins: {
    name: "Your adventure begins...",
    description: "Travel to Hub from your island",
    reward: 5,
  },
  skyblock_your_big_break: {
    name: "Your Big break",
    description: "Survive an entire SkyBlock year without dying",
    reward: 5,
  },
  skyblock_zookeeper: { name: "Zookeeper", description: "Buy a pet from Oringo during the Traveling Zoo", reward: 10 },
};

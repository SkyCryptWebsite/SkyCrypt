module.exports = {
    // prevent specific players from appearing in leaderboards
    blocked_players: [
        "20934ef9488c465180a78f861586b4cf", // Minikloon (Admin)
        "f025c1c7f55a4ea0b8d93f47d17dfe0f" // Plancke (Admin)
    ],

    item_types: [
        'sword',
        'bow',
        'fishing rod',
        'wand',
        'axe',
        'hoe',
        'shovel',
        'pickaxe',
        'accessory',
        'helmet',
        'chestplate',
        'leggings',
        'boots'
    ],

    tier_colors: {
        "common": "§f",
        "uncommon": "§a",
        "rare": "§9",
        "epic": "§5",
        "legendary": "§6",
        "mythic": "§d",
        "supreme": "§4"
    },

    rarity_colors: {
        "f": "common",
        "a": "uncommon",
        "9": "rare",
        "5": "epic",
        "6": "legendary",
        "d": "mythic",
        "4": "supreme",
        "c": "special"
    },

    special_enchants: [
        'Sharpness 7',
        'Sharpness VII',
        'Sharpness 6',
        'Sharpness VI',
        'Giant Killer 7',
        'Giant Killer VII',
        'Giant Killer 6',
        'Giant Killer VI',
        'Bane of Arthropods 7',
        'Bane of Arthropods VII',
        'Bane of Arthropods 6',
        'Bane of Arthropods VI',
        'Critical 7',
        'Critical VII',
        'Critical 6',
        'Critical VI',
        'Ender Slayer 7',
        'Ender Slayer VII',
        'Ender Slayer 6',
        'Ender Slayer VI',
        'Experience 4',
        'Experience IV',
        'Life Steal 5',
        'Life Steal V',
        'Life Steal 4',
        'Life Steal IV',
        'Looting 5',
        'Looting V',
        'Looting 4',
        'Looting IV',
        'Luck 7',
        'Luck VII',
        'Luck 6',
        'Luck VI',
        'Scavenger 5',
        'Scavenger V',
        'Scavenger 4',
        'Scavenger IV',
        'Smite 7',
        'Smite VII',
        'Smite 6',
        'Smite VI',
        'Vampirism 6',
        'Vampirism VI',
        'Power 7',
        'Power VII',
        'Power 6',
        'Power VI',
        'Growth 7',
        'Growth VII',
        'Growth 6',
        'Growth VI',
        'Blast Protection 7',
        'Blast Protection VII',
        'Blast Protection 6',
        'Blast Protection VI',
        'Fire Protection 7',
        'Fire Protection VII',
        'Fire Protection 6',
        'Fire Protection VI',
        'Projectile Protection 7',
        'Projectile Protection VII',
        'Projectile Protection 6',
        'Projectile Protection VI',
        'Protection 7',
        'Protection VII',
        'Protection 6',
        'Protection VI',
        'True Protection 1',
        'True Protection I',
        'Sugar Rush 3',
        'Sugar Rush III',
        'Efficiency 6',
        'Efficiency VI',
        'Angler 6',
        'Angler VI',
        'Caster 6',
        'Caster VI',
        'Frail 6',
        'Frail VI',
        'Luck of the Sea 6',
        'Luck of the Sea VI',
        'Lure 6',
        'Lure VI',
        'Magnet 6',
        'Magnet VI',
        'Spiked Hook 6',
        'Spiked Hook VI',
        'Dragon Hunter 5',
        'Dragon Hunter V',
        'Feather Falling 10',
        'Feather Falling X',
        'Infinite Quiver 10',
        'Infinite Quiver X',
        'Thorns 6',
        'Thorns VI',
        'Expertise 10',
        'Expertise X',
        'Thunderlord 6',
        'Thunderlord VI',
        'Lethality 6',
        'Lethality VI',
        'Compact 10',
        'Compact X',
        'Cultivating 10',
        'Cultivating X',
        'First Strike 5',
        'First Strike V',
        'Execute 6',
        'Execute VI',
        'Cubism 6',
        'Cubism VI',
        'Venomous 6',
        'Venomous VI',
        'Cleave 6',
        'Cleave VI',
        'Harvesting 6',
        'Harvesting VI',
    ],

    // Number of kills required for each level of expertise
    expertise_kills_ladder: [
        50,
        100,
        250,
        500,
        1000,
        2500,
        5500,
        10000,
        15000
    ],

    // api names and their max value from the profile upgrades
    profile_upgrades: {
        'island_size' : 10,
        'minion_slots' : 5,
        'guests_count' : 5,
        'coop_slots' : 3,
        'coins_allowance' : 5,
    },

    // Player stats on a completely new profile
    base_stats: {
        damage: 0,
        health: 100,
        defense: 0,
        effective_health: 100,
        strength: 0,
        damage_increase: 0,
        speed: 100,
        crit_chance: 30,
        crit_damage: 50,
        bonus_attack_speed: 0,
        intelligence: 0,
        sea_creature_chance: 20,
        magic_find: 10,
        pet_luck: 0,
        ferocity: 0,
        ability_damage: 0,
        mining_speed: 0,
        mining_fortune: 0,
        farming_fortune: 0,
        foraging_fortune: 0
    },

    stat_template: {
        damage: 0,
        health: 0,
        defense: 0,
        effective_health: 0,
        strength: 0,
        damage_increase: 0,
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
        foraging_fortune: 0
    },

    slayer_cost: {
        1: 100,
        2: 2000,
        3: 10000,
        4: 50000,
        5: 100000
    },

    mob_mounts: {
        sea_emperor: [
            "guardian_emperor",
            "skeleton_emperor"
        ],
        monster_of_the_deep: [
            "zombie_deep",
            "chicken_deep"
        ]
    },

    mob_names: {
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
        tentaclees: "Fels"
    },

    area_names: {
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
        winter: "Jerry's Workshop"
    },

    color_names: {
        BLACK: '0',
        DARK_BLUE: '1',
        DARK_GREEN: '2',
        DARK_AQUA: '3',
        DARK_RED: '4',
        DARK_PURPLE: '5',
        GOLD: '6',
        GRAY: '7',
        DARK_GRAY: '8',
        BLUE: '9',
        GREEN: 'a',
        AQUA: 'b',
        RED: 'c',
        LIGHT_PURPLE: 'd',
        YELLOW: 'e',
        WHITE: 'f'
    },

    ranks: {
        'OWNER': {
            color: 'c',
            tag: 'OWNER'
        },

        'ADMIN': {
            color: 'c',
            tag: 'ADMIN'
        },

        'BUILD TEAM': {
            color: '3',
            tag: 'BUILD TEAM'
        },

        'MODERATOR': {
            color: '2',
            tag: 'MOD'
        },

        'HELPER': {
            color: '9',
            tag: 'HELPER'
        },

        'JR HELPER': {
            color: '9',
            tag: 'JR HELPER'
        },

        'YOUTUBER': {
            color: 'c',
            tag: 'YOUTUBE'
        },

        'SUPERSTAR': {
            color: '6',
            tag: 'MVP',
            plus: '++',
            plusColor: 'c'
        },

        'MVP_PLUS': {
            color: 'b',
            tag: 'MVP',
            plus: '+',
            plusColor: 'c'
        },

        'MVP': {
            color: 'b',
            tag: 'MVP'
        },

        'VIP_PLUS': {
            color: 'a',
            tag: 'VIP',
            plus: '+',
            plusColor: '6'
        },

        'VIP': {
            color: 'a',
            tag: 'VIP'
        },

        'PIG+++': {
            color: 'd',
            tag: 'PIG',
            plus: '+++',
            plusColor: 'b'
        },

        'MAYOR': {
            color: 'd',
            tag: 'MAYOR',
        },

        'MINISTER': {
            color: 'c',
            tag: 'MINISTER',
        },

        'NONE': null
    },

    farming_crops: {
        'INK_SACK:3': {
            name: 'Cocoa Beans',
            icon: '351_3'
        },
        'POTATO_ITEM': {
            name: 'Potato',
            icon: '392_0'
        },
        'CARROT_ITEM': {
            name: 'Carrot',
            icon: '391_0'
        },
        'CACTUS': {
            name: 'Cactus',
            icon: '81_0'
        },
        'SUGAR_CANE': {
            name: 'Sugar Cane',
            icon: '338_0'
        },
        'MUSHROOM_COLLECTION': {
            name: 'Mushroom',
            icon: '40_0'
        },
        'PUMPKIN': {
            name: 'Pumpkin',
            icon: '86_0'
        },
        'NETHER_STALK': {
            name: 'Nether Wart',
            icon: '372_0'
        },
        'WHEAT': {
            name: 'Wheat',
            icon: '296_0'
        },
        'MELON': {
            name: 'Melon',
            icon: '360_0'
        }
    },

    experiments: {
        games: {
            simon: {
                name: "Chronomatron"
            },
            numbers: {
                name: "Ultrasequencer"
            },
            pairings: {
                name: "Superpairs"
            }
        },
        tiers: [
            {
                name: "Beginner",
                icon: "351:12"
            }, {
                name: "High",
                icon: "351:10"
            }, {
                name: "Grand",
                icon: "351:11"
            }, {
                name: "Supreme",
                icon: "351:14"
            }, {
                name: "Transcendent",
                icon: "351:1"
            }, {
                name: "Metaphysical",
                icon: "351:13"
            }
        ]
    },

    max_favorites: 5,

    increase_most_stats_exclude: [
        'mining_speed',
        'mining_fortune',
        'farming_fortune',
        'foraging_fortune'
    ],
};

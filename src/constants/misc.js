module.exports = {
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
        "legendary": "§6"
    },

    special_enchants: [
        'Sharpness 6',
        'Sharpness VI',
        'Giant Killer 6',
        'Giant Killer VI',
        'Bane of Arthropods 6',
        'Bane of Arthropods VI',
        'Critical 6',
        'Critical VI',
        'Ender Slayer 6',
        'Ender Slayer VI',
        'Experience 4',
        'Experience IV',
        'Life Steal 4',
        'Life Steal IV',
        'Looting 4',
        'Looting IV',
        'Luck 6',
        'Luck VI',
        'Scavenger 4',
        'Scavenger IV',
        'Smite 6',
        'Smite VI',
        'Vampirism 6',
        'Vampirism VI',
        'Power 6',
        'Power VI',
        'Growth 6',
        'Growth VI',
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
        'Infinite Quiver X'
    ],

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
        pet_luck: 0
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
        pet_luck: 0
    },

    slayer_cost: {
        1: 100,
        2: 2000,
        3: 10000,
        4: 50000
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
        brood_mother_spider: "Brood Mother"
    },

    area_names: {
        dynamic: "Private Island",
        hub: "Hub",
        mining_1: "Gold Mine",
        mining_2: "Deep Caverns",
        combat_1: "Spider's Den",
        combat_2: "Blazing Fortress",
        combat_3: "The End",
        farming_1: "The Barn",
        farming_2: "Mushroom Desert",
        foraging_1: "The Park",
        winter: "Jerry's Workshop"
    },

    bag_size: {
        talisman_bag: {
            collection: 'REDSTONE',
            sizes: [
                {
                    tier: 2,
                    slots: 3
                },
                {
                    tier: 7,
                    slots: 9
                },
                {
                    tier: 9,
                    slots: 15
                },
                {
                    tier: 10,
                    slots: 21
                },
                {
                    tier: 11,
                    slots: 27
                },
                {
                    tier: 12,
                    slots: 33
                },
                {
                    tier: 13,
                    slots: 39
                },
                {
                    tier: 14,
                    slots: 45
                }
            ]
        },
        potion_bag: {
            collection: 'NETHER_STALK',
            sizes: [
                {
                    tier: 2,
                    slots: 9
                },
                {
                    tier: 5,
                    slots: 18
                },
                {
                    tier: 8,
                    slots: 27
                },
                {
                    tier: 10,
                    slots: 36
                },
                {
                    tier: 11,
                    slots: 45
                }
            ]
        },
        fishing_bag: {
            collection: 'RAW_FISH',
            sizes: [
                {
                    tier: 3,
                    slots: 9
                },
                {
                    tier: 7,
                    slots: 18
                },
                {
                    tier: 9,
                    slots: 27
                },
                {
                    tier: 10,
                    slots: 36
                },
                {
                    tier: 11,
                    slots: 45
                }
            ]
        },
        quiver: {
            collection: 'STRING',
            sizes: [
                {
                    tier: 3,
                    slots: 27
                },
                {
                    tier: 6,
                    slots: 36
                },
                {
                    tier: 9,
                    slots: 45
                }
            ]
        }
    },

    talisman_upgrades: {
        WOLF_TALISMAN: [
            'WOLF_RING'
        ],
        RING_POTION_AFFINITY: [
            'ARTIFACT_POTION_AFFINITY'
        ],
        POTION_AFFINITY_TALISMAN: [
            'RING_POTION_AFFINITY',
            'ARTIFACT_POTION_AFFINITY'
        ],
        FEATHER_RING: [
            'FEATHER_ARTIFACT'
        ],
        FEATHER_TALISMAN: [
            'FEATHER_RING',
            'FEATHER_ARTIFACT'
        ],
        SEA_CREATURE_RING: [
            'SEA_CREATURE_ARTIFACT'
        ],
        SEA_CREATURE_TALISMAN: [
            'SEA_CREATURE_RING',
            'SEA_CREATURE_ARTIFACT'
        ],
        HEALING_TALISMAN: [
            'HEALING_RING'
        ],
        CANDY_RING: [
            'CANDY_ARTIFACT'
        ],
        CANDY_TALISMAN: [
            'CANDY_RING',
            'CANDY_ARTIFACT'
        ],
        INTIMIDATION_RING: [
            'INTIMIDATION_ARTIFACT'
        ],
        INTIMIDATION_TALISMAN: [
            'INTIMIDATION_RING',
            'INTIMIDATION_ARTIFACT'
        ],
        SPIDER_RING: [
            'SPIDER_ARTIFACT'
        ],
        SPIDER_TALISMAN: [
            'SPIDER_RING',
            'SPIDER_ARTIFACT'
        ],
        RED_CLAW_RING: [
            'RED_CLAW_ARTIFACT'
        ],
        RED_CLAW_TALISMAN: [
            'RED_CLAW_RING',
            'RED_CLAW_ARTIFACT'
        ],
        HUNTER_TALISMAN: [
            'HUNTER_RING'
        ],
        ZOMBIE_RING: [
            'ZOMBIE_ARTIFACT'
        ],
        ZOMBIE_TALISMAN: [
            'ZOMBIE_RING',
            'ZOMBIE_ARTIFACT'
        ],
        BAT_RING: [
            'BAT_ARTIFACT'
        ],
        BAT_TALISMAN: [
            'BAT_RING',
            'BAT_ARTIFACT'
        ],
        BROKEN_PIGGY_BANK: [
            'CRACKED_PIGGY_BANK',
            'PIGGY_BANK'
        ],
        CRACKED_PIGGY_BANK: [
            'PIGGY_BANK'
        ],
        SPEED_TALISMAN: [
            'SPEED_RING',
            'SPEED_ARTIFACT'
        ],
        SPEED_RING: [
            'SPEED_ARTIFACT'
        ],
        PERSONAL_COMPACTOR_4000: [
            'PERSONAL_COMPACTOR_5000',
            'PERSONAL_COMPACTOR_6000'
        ],
        PERSONAL_COMPACTOR_5000: [
            'PERSONAL_COMPACTOR_6000'
        ]
    },

    talisman_duplicates: {

    },

    // Minecraft color and formatting codes
    minecraft_formatting: {
        0: {
            type: 'color',
            color: '#000000',
            css: 'color: #000000'
        },

        1: {
            type: 'color',
            color: '#0000AA',
            niceColor: '#3251AE',
            css: 'color: #0000AA'
        },

        2: {
            type: 'color',
            color: '#00AA00',
            css: 'color: #00AA00'
        },

        3: {
            type: 'color',
            color: '#00AAAA',
            css: 'color: #00AAAA'
        },

        4: {
            type: 'color',
            color: '#CC3333',
            css: 'color: #CC3333'
        },

        5: {
            type: 'color',
            color: '#eb17eb',
            css: 'color: #eb17eb'
        },

        6: {
            type: 'color',
            color: '#FFAA00',
            css: 'color: #FFAA00'
        },

        7: {
            type: 'color',
            color: '#AAAAAA',
            niceColor: '#333333',
            css: 'color: #AAAAAA'
        },

        8: {
            type: 'color',
            color: '#777777',
            css: 'color: #777777'
        },

        9: {
            type: 'color',
            color: '#5555FF',
            css: 'color: #8888FF'
        },

        a: {
            type: 'color',
            color: '#55FF55',
            niceColor: '#40BB40',
            css: 'color: #55FF55'
        },

        b: {
            type: 'color',
            color: '#55FFFF',
            niceColor: '#51C4D7',
            css: 'color: #55FFFF'
        },

        c: {
            type: 'color',
            color: '#FF5555',
            niceColor: '#C43C3C',
            css: 'color: #FF5555'
        },

        d: {
            type: 'color',
            color: '#FF55FF',
            niceColor: '#D985BC',
            css: 'color: #FF55FF'
        },

        e: {
            type: 'color',
            color: '#FFFF55',
            niceColor: '#EAA522',
            css: 'color: #FFFF55'
        },

        f: {
            type: 'color',
            color: '#FFFFFF',
            niceColor: '#000000',
            css: 'color: #FFFFFF'
        },

        k: {
            type: 'format',
            css: 'display: none'
        },

        l: {
            type: 'format',
            css: 'font-weight: bold'
        },

        m: {
            type: 'format',
            css: 'text-decoration: line-through'
        },

        n: {
            type: 'format',
            css: 'text-decoration: underline'
        },

        o: {
            type: 'format',
            css: 'font-style: italic'
        },

        r: {
            type: 'reset'
        }
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
            plus: '++'
        },

        'MVP_PLUS': {
            color: 'b',
            tag: 'MVP',
            plus: '+'
        },

        'MVP': {
            color: 'b',
            tag: 'MVP'
        },

        'VIP_PLUS': {
            color: 'a',
            tag: 'VIP',
            plus: '+',
        },

        'VIP': {
            color: 'a',
            tag: 'VIP'
        },

        'PIG+++': {
            color: 'd',
            tag: 'PIG',
            plus: '+++'
        },

        'NONE': null
    }
};

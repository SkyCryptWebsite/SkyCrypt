module.exports = {
    // prevent specific players from appearing in leaderboards
    blocked_players: [
        "20934ef9488c465180a78f861586b4cf", // Minikloon (Admin)
        "f025c1c7f55a4ea0b8d93f47d17dfe0f", // Plancke (Admin)
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
        "legendary": "§6"
    },

    rarity_colors: {
        "f": "common",
        "a": "uncommon",
        "9": "rare",
        "5": "epic",
        "6": "legendary",
        "d": "mythic",
        "c": "special"
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
        'Power 6',
        'Power VI',
        'Growth 6',
        'Growth VI',
        'Blast Protection 6',
        'Blast Protection VI',
        'Fire Protection 6',
        'Fire Protection VI',
        'Projectile Protection 6',
        'Projectile Protection VI',
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
        'Growth 7',
        'Growth VII',
        'Protection 7',
        'Protection VII'
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
        ferocity: 0
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
        ferocity: 0
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
        ],
        SCARF_STUDIES: [
            'SCARF_THESIS',
            'SCARF_GRIMOIRE'
        ],
        SCARF_THESIS: [
            'SCARF_GRIMOIRE'
        ],
        CAT_TALISMAN: [
            'LYNX_TALISMAN',
            'CHEETAH_TALISMAN'
        ],
        LYNX_TALISMAN: [
            'CHEETAH_TALISMAN'
        ],
        SHADY_RING: [
            'CROOKED_ARTIFACT',
            'SEAL_OF_THE_FAMILY'
        ],
        CROOKED_ARTIFACT: [
            'SEAL_OF_THE_FAMILY'
        ],
        TREASURE_TALISMAN: [
            'TREASURE_RING',
            'TREASURE_ARTIFACT'
        ],
        TREASURE_RING: [
            'TREASURE_ARTIFACT'
        ],
        BEASTMASTER_CREST_COMMON: [
            'BEASTMASTER_CREST_UNCOMMON',
            'BEASTMASTER_CREST_RARE',
            'BEASTMASTER_CREST_EPIC',
            'BEASTMASTER_CREST_LEGENDARY'
        ],
        BEASTMASTER_CREST_UNCOMMON: [
            'BEASTMASTER_CREST_RARE',
            'BEASTMASTER_CREST_EPIC',
            'BEASTMASTER_CREST_LEGENDARY'
        ],
        BEASTMASTER_CREST_RARE: [
            'BEASTMASTER_CREST_EPIC',
            'BEASTMASTER_CREST_LEGENDARY'
        ],
        BEASTMASTER_CREST_EPIC: [
            'BEASTMASTER_CREST_LEGENDARY'
        ],
        RAGGEDY_SHARK_TOOTH_NECKLACE: [
            'DULL_SHARK_TOOTH_NECKLACE',
            'HONED_SHARK_TOOTH_NECKLACE',
            'SHARP_SHARK_TOOTH_NECKLACE',
            'RAZOR_SHARP_SHARK_TOOTH_NECKLACE'
        ],
        DULL_SHARK_TOOTH_NECKLACE: [
            'HONED_SHARK_TOOTH_NECKLACE',
            'SHARP_SHARK_TOOTH_NECKLACE',
            'RAZOR_SHARP_SHARK_TOOTH_NECKLACE'
        ],
        HONED_SHARK_TOOTH_NECKLACE: [
            'SHARP_SHARK_TOOTH_NECKLACE',
            'RAZOR_SHARP_SHARK_TOOTH_NECKLACE'
        ],
        SHARP_SHARK_TOOTH_NECKLACE: [
            'RAZOR_SHARP_SHARK_TOOTH_NECKLACE'
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
    },
    talismans: {
        'FARMING_TALISMAN': {
            name: "Farming Talisman"
        },
        'VACCINE_TALISMAN': {
            name: "Vaccine Talisman"
        },
        'WOOD_TALISMAN': {
            name: "Wood Affinity Talisman"
        },
        'SKELETON_TALISMAN': {
            name: "Skeleton Talisman"
        },
        'COIN_TALISMAN': {
            name: "Talisman of Coins"
        },
        'MAGNETIC_TALISMAN': {
            name: "Magnetic Talisman"
        },
        'GRAVITY_TALISMAN': {
            name: "Gravity Talisman"
        },
        'VILLAGE_TALISMAN': {
            name: "Village Affinity Talisman"
        },
        'MINE_TALISMAN': {
            name: "Mine Affinity Talisman"
        },
        'NIGHT_VISION_CHARM': {
            name: "Night Vision Charm"
        },
        'LAVA_TALISMAN': {
            name: "Lava Talisman"
        },
        'SCAVENGER_TALISMAN': {
            name: "Scavenger Talisman"
        },
        'WOLF_PAW': {
            name: "Wolf Paw"
        },
        'FIRE_TALISMAN': {
            name: "Fire Talisman"
        },
        'PIGGY_BANK': {
            name: "Piggy Bank"
        },
        'CRACKED_PIGGY_BANK': {
            name: "Cracked Piggy Bank"
        },
        'BROKEN_PIGGY_BANK': {
            name: "Broken Piggy Bank"
        },
        'PIGS_FOOT': {
            name: "Pig's Foot"
        },
        'FROZEN_CHICKEN': {
            name: "Frozen Chicken"
        },
        'FISH_AFFINITY_TALISMAN': {
            name: "Fish Affinity Talisman"
        },
        'FARMER_ORB': {
            name: "Farmer Orb"
        },
        'HASTE_RING': {
            name: "Hast Ring"
        },
        'NEW_YEAR_CAKE_BAG': {
            name: "New Year Cake Bag"
        },
        'NIGHT_CRYSTAL': {
            name: "Night Crystal"
        },
        'DAY_CRYSTAL': {
            name: "Day Crystal"
        },
        'FEATHER_TALISMAN': {
            name: "Feather Talisman"
        },
        'FEATHER_RING': {
            name: "Feather Ring"
        },
        'FEATHER_ARTIFACT': {
            name: "Feather Artifact"
        },
        'POTION_AFFINITY_TALISMAN': {
            name: "Potion Affinity Talisman"
        },
        'RING_POTION_AFFINITY': {
            name: "Potion Affinity Ring"
        },
        'ARTIFACT_POTION_AFFINITY': {
            head: "hi"
        },
        'HEALING_TALISMAN': {
            head: "/head/651eb16f22dd7505be5dae06671803633a5abf8b2beeb5c60548670df0e59214"
        },
        'HEALING_RING': {
            head: "hi"
        },
        'CANDY_TALISMAN': {
            head: "hi"
        },
        'CANDY_RING': {
            head: "hi"
        },
        'CANDY_ARTIFACT': {
            head: "/head/4eb46bbca3812363b59676ff629dc3698257fd178d394fadffda7143422e2f10"
        },
        'EXPERIENCE_ARTIFACT': {
            head: "/resourcepacks/FurfSky+_Release_1_71/assets/minecraft/mcpatcher/cit/items/items/experience_artifact.png"
        },
        'MELODY_HAIR': {
            head: "hi"
        },
        'SEA_CREATURE_TALISMAN': {
            head: "hi"
        },
        'SEA_CREATURE_RING': {
            head: "hi"
        },
        'SEA_CREATURE_ARTIFACT': {
            head: "hi"
        },
        'INTIMIDATION_TALISMAN': {
            head: "hi"
        },
        'INTIMIDATION_RING': {
            head: "hi"
        },
        'INTIMIDATION_ARTIFACT': {
            head: "/head/f931ca9e46fcf351354fa022992fa07cc59be50ffb80e9dd8af4973378cf89d5"
        },
        'WOLF_TALISMAN': {
            head: "hi"
        },
        'WOLF_RING': {
            head: "hi"
        },
        'BAT_TALISMAN': {
            head: "hi"
        },
        'BAT_RING': {
            head: "hi"
        },
        'BAT_ARTIFACT': {
            head: "/head/382fc3f71b41769376a9e92fe3adbaac3772b999b219c9d6b4680ba9983e527"
        },
        'DEVOUR_RING': {
            head: "hi"
        },
        'ZOMBIE_TALISMAN': {
            head: "hi"
        },
        'ZOMBIE_RING': {
            head: "hi"
        },
        'ZOMBIE_ARTIFACT': {
            head: "hi"
        },
        'SPIDER_TALISMAN': {
            head: "hi"
        },
        'SPIDER_RING': {
            head: "hi"
        },
        'SPIDER_ARTIFACT': {
            head: "hi"
        },
        'ENDER_ARTIFACT': {
            head: "hi"
        },
        'TARANTULA_TALISMAN': {
            head: "hi"
        },
        'SURVIVOR_CUBE': {
            head: "hi"
        },
        'WITHER_ARTIFACT': {
            head: "hi"
        },
        'WEDDING_RING_': {
            head: "hi"
        },
        'RED_CLAW_TALISMAN': {
            head: "hi"
        },
        'RED_CLAW_RING': {
            head: "hi"
        },
        'RED_CLAW_ARTIFACT': {
            head: "hi"
        },
        'BAIT_RING': {
            head: "hi"
        },
        'SHADY_RING': {
            head: "hi"
        },
        'CROOKED_ARTIFACT': {
            head: "hi"
        },
        'SEAL_OF_THE_FAMILY': {
            head: "hi"
        },
        'HUNTER_TALISMAN': {
            head: "hi"
        },
        'HUNTER_RING': {
            head: "hi"
        },
        'CAMPFIRE_TALISMAN_': {
            head: "/head/4080bbefca87dc0f36536b6508425cfc4b95ba6e8f5e6a46ff9e9cb488a9ed"
        },
        'SCARF_STUDIES': {
            head: "/head/6de4ab129e137f9f4cbf7060318ee1748dc39da9b5d129a8da0e614e2337693"
        },
        'SCARF_THESIS': {
            head: "hi"
        },
        'SCARF_GRIMOIRE': {
            head: "hi"
        },
        'PARTY_HAT_CRAB': {
            head: "hi"
        },
        'POTATO_TALISMAN': {
            head: "hi"
        },
        'PERSONAL_COMPACTOR_4000': {
            head: "hi"
        },
        'PERSONAL_COMPACTOR_5000': {
            head: "hi"
        },
        'PERSONAL_COMPACTOR_6000': {
            head: "hi"
        },
        'SPEED_TALISMAN': {
            head: "/head/8624bacb5f1986e6477abce4ae7dca1820a5260b6233b55ba1d9ba936c84b"
        },
        'SPEED_RING': {
            head: "hi"
        },
        'SPEED_ARTIFACT': {
            head: "hi"
        },
        'CAT_TALISMAN': {
            head: "hi"
        },
        'LYNX_TALISMAN': {
            head: "hi"
        },
        'CHEETAH_TALISMAN': {
            head: "/head/1553f8856dd46de7e05d46f5fc2fb58eafba6829b11b160a1545622e89caaa33"
        },
        'TREASURE_TALISMAN': {
            head: "hmmmm"
        },
        'TREASURE_RING': {
            head: "hmmm"
        },
        'TREASURE_ARTIFACT': {
            head: "hmmm"
        },
        'MINERAL_TALISMAN': {
            head: "yes"
        },
        'BEASTMASTER_CREST_COMMON': {
            head: "yes"
        },
        'BEASTMASTER_CREST_UNCOMMON': {
            head: "yes"
        },
        'BEASTMASTER_CREST_RARE': {
            head: "yes"
        },
        'BEASTMASTER_CREST_EPIC': {
            head: "yes"
        },
        'BEASTMASTER_CREST_LEGENDARY': {
            head: "yes"
        },
        'RAGGEDY_SHARK_TOOTH_NECKLACE': {
            head: "yes"
        },
        'DULL_SHARK_TOOTH_NECKLACE': {
            head: "yes"
        },
        'HONED_SHARK_TOOTH_NECKLACE': {
            head: "yes"
        },
        'SHARP_SHARK_TOOTH_NECKLACE': {
            head: "yes"
        },
        'RAZOR_SHARP_SHARK_TOOTH_NECKLACE': {
            head: false
        }
    }
};

module.exports = {
    // XP required for each level of a skill
    leveling_xp: {
        1: 50,
        2: 125,
        3: 200,
        4: 300,
        5: 500,
        6: 750,
        7: 1000,
        8: 1500,
        9: 2000,
        10: 3500,
        11: 5000,
        12: 7500,
        13: 10000,
        14: 15000,
        15: 20000,
        16: 30000,
        17: 50000,
        18: 75000,
        19: 100000,
        20: 200000,
        21: 300000,
        22: 400000,
        23: 500000,
        24: 600000,
        25: 700000,
        26: 800000,
        27: 900000,
        28: 1000000,
        29: 1100000,
        30: 1200000,
        31: 1300000,
        32: 1400000,
        33: 1500000,
        34: 1600000,
        35: 1700000,
        36: 1800000,
        37: 1900000,
        38: 2000000,
        39: 2100000,
        40: 2200000,
        41: 2300000,
        42: 2400000,
        43: 2500000,
        44: 2600000,
        45: 2750000,
        46: 2900000,
        47: 3100000,
        48: 3400000,
        49: 3700000,
        50: 4000000
    },

    // XP required for each level of Runecrafting
    runecrafting_xp: {
        1: 50,
        2: 100,
        3: 125,
        4: 160,
        5: 200,
        6: 250,
        7: 315,
        8: 400,
        9: 500,
        10: 625,
        11: 785,
        12: 1000,
        13: 1250,
        14: 1600,
        15: 2000,
        16: 2465,
        17: 3125,
        18: 4000,
        19: 5000,
        20: 6200,
        21: 7800,
        22: 9800,
        23: 12200,
        24: 15300
    },

    // total XP required for level of Slayer
    slayer_xp: {
        1: 5,
        2: 15,
        3: 200,
        4: 1000,
        5: 5000,
        6: 20000,
        7: 100000,
        8: 400000
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
        crit_chance: 20,
        crit_damage: 50,
        intelligence: 0
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
        intelligence: 0
    },

    // Object with fairy soul, skill, slayer bonuses and enchantment bonuses
    bonus_stats: {
        fairy_souls: {
            5: {
                health: 3,
                defense: 1,
                strength: 1,
                speed: 0
            },
            10: {
                health: 3,
                defense: 1,
                strength: 1,
                speed: 0
            },
            15: {
                health: 4,
                defense: 1,
                strength: 1,
                speed: 0
            },
            20: {
                health: 4,
                defense: 1,
                strength: 1,
                speed: 0
            },
            25: {
                health: 5,
                defense: 2,
                strength: 2,
                speed: 0
            },
            30: {
                health: 5,
                defense: 1,
                strength: 1,
                speed: 0
            },
            35: {
                health: 6,
                defense: 1,
                strength: 1,
                speed: 0
            },
            40: {
                health: 6,
                defense: 1,
                strength: 1,
                speed: 0
            },
            45: {
                health: 7,
                defense: 1,
                strength: 1,
                speed: 0
            },
            50: {
                health: 7,
                defense: 2,
                strength: 2,
                speed: 1
            },
            55: {
                health: 8,
                defense: 1,
                strength: 1,
                speed: 0
            },
            60: {
                health: 8,
                defense: 1,
                strength: 1,
                speed: 0
            },
            65: {
                health: 9,
                defense: 1,
                strength: 1,
                speed: 0
            },
            70: {
                health: 9,
                defense: 1,
                strength: 1,
                speed: 0
            },
            75: {
                health: 10,
                defense: 2,
                strength: 2,
                speed: 0
            },
            80: {
                health: 10,
                defense: 1,
                strength: 1,
                speed: 0
            },
            85: {
                health: 11,
                defense: 1,
                strength: 1,
                speed: 0
            },
            90: {
                health: 11,
                defense: 1,
                strength: 1,
                speed: 0
            },
            95: {
                health: 12,
                defense: 1,
                strength: 1,
                speed: 0
            },
            100: {
                health: 12,
                defense: 2,
                strength: 2,
                speed: 1
            },
            105: {
                health: 13,
                defense: 1,
                strength: 1,
                speed: 0
            },
            110: {
                health: 13,
                defense: 1,
                strength: 1,
                speed: 0
            },
            115: {
                health: 14,
                defense: 1,
                strength: 1,
                speed: 0
            },
            120: {
                health: 14,
                defense: 1,
                strength: 1,
                speed: 0
            },
            125: {
                health: 15,
                defense: 2,
                strength: 2,
                speed: 0
            },
            130: {
                health: 15,
                defense: 1,
                strength: 1,
                speed: 0
            },
            135: {
                health: 16,
                defense: 1,
                strength: 1,
                speed: 0
            },
            140: {
                health: 16,
                defense: 1,
                strength: 1,
                speed: 0
            },
            145: {
                health: 17,
                defense: 1,
                strength: 1,
                speed: 0
            },
            150: {
                health: 17,
                defense: 2,
                strength: 2,
                speed: 1
            },
            155: {
                health: 18,
                defense: 1,
                strength: 1,
                speed: 0
            },
            160: {
                health: 18,
                defense: 1,
                strength: 1,
                speed: 0
            },
            165: {
                health: 19,
                defense: 1,
                strength: 1,
                speed: 0
            },
            170: {
                health: 19,
                defense: 1,
                strength: 1,
                speed: 0
            },
            175: {
                health: 20,
                defense: 2,
                strength: 2,
                speed: 0
            },
            180: {
                health: 20,
                defense: 1,
                strength: 1,
                speed: 0
            },
            185: {
                health: 21,
                defense: 1,
                strength: 1,
                speed: 0
            },
            190: {
                health: 21,
                defense: 1,
                strength: 1,
                speed: 0
            }
        },

        farming_skill: {
            1: {
                health: 2
            },
            15: {
                health: 3
            },
            20: {
                health: 4
            },
            26: {
                health: 5
            }
        },

        combat_skill: {
            1: {
                crit_chance: 1,
                damage_increase: 0.04
            }
        },

        mining_skill: {
            1: {
                defense: 1
            },
            15: {
                defense: 2
            }
        },

        foraging_skill: {
            1: {
                strength: 1
            },
            15: {
                strength: 2
            }
        },

        fishing_skill: {
            1: {
                health: 2
            },
            15: {
                health: 3
            },
            20: {
                health: 4
            },
            26: {
                health: 5
            }
        },

        enchanting_skill: {
            1: {
                intelligence: 1
            },
            15: {
                intelligence: 2
            }
        },

        alchemy_skill: {
            1: {
                intelligence: 1
            },
            15: {
                intelligence: 2
            }
        },

        carpentry_skill: {
            1: {

            }
        },

        runecrafting_skill: {
            1: {

            }
        },

        zombie_slayer: {
            1: {
                health: 2
            },
            3: {
                health: 3
            },
            5: {
                health: 4
            },
            7: {
                health: 5
            },
            9: {
                health: 6
            }
        },

        spider_slayer: {
            1: {
                crit_damage: 1
            },
            5: {
                crit_damage: 2
            },
            7: {
                crit_damage: 0,
                crit_chance: 1
            },
            8: {
                crit_chance: 0,
                crit_damage: 3
            }
        },

        wolf_slayer: {
            1: {
                speed: 1
            },
            2: {
                health: 2
            },
            3: {
                speed: 1
            },
            4: {
                health: 2
            },
            5: {
                crit_damage: 1
            },
            6: {
                health: 3
            },
            7: {
                crit_damage: 2
            },
            8: {
                speed: 1
            }
        },

        enchantments: {
            sharpness: {
                1: {
                    damage_multiplicator: 0.05
                }
            },

            ender: {
                1: {
                    damage_multiplicator: 0.12
                }
            },

            giant_killer: {
                1: {
                    damage_multiplicator: 0.05
                }
            },

            cubism: {
                1: {
                    damage_multiplicator: 0.1
                }
            },

            impaling: {
                1: {
                    damage_multiplicator: 0.125
                }
            },

            critical: {
                1: {
                    crit_damage: 10
                }
            },

            first_strike: {
                1: {
                    damage_multiplicator: 0.25
                }
            },

            power: {
                1: {
                    damage_multiplicator: 0.08
                }
            }
        },
    },

    talisman_upgrades: {
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
        ]
    },

    talisman_duplicates: {
        BROKEN_PIGGY_BANK: [
            'CRACKED_PIGGY_BANK',
            'PIGGY_BANK'
        ],
        CRACKED_PIGGY_BANK: [
            'PIGGY_BANK'
        ]
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
            color: '#AA00AA',
            css: 'color: #AA00AA'
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
            css: ''
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

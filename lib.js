const fs = require('fs');
const path = require('path');
const nbt = require('prismarine-nbt');
const util = require('util');
const mcData = require("minecraft-data")("1.8.9");
const objectPath = require("object-path");

const parseNbt = util.promisify(nbt.parse);

const rarity_order = ['special', 'legendary', 'epic', 'rare', 'uncommon', 'common'];

const max_souls = 190;

function replaceAll(target, search, replacement){
    return target.split(search).join(replacement);
}

function getLevelByXp(xp, runecrafting){
    let xp_table = runecrafting ? runecrafting_xp : leveling_xp;

    if(isNaN(xp)){
        return {
            xp: 0,
            level: 0,
            xpCurrent: 0,
            xpForNext: xp_table[1],
            progress: 0
        };
    }

    let xpTotal = 0;
    let level = 0;

    let xpForNext = Infinity;

    let maxLevel = Object.keys(xp_table).sort((a, b) => Number(a) - Number(b)).map(a => Number(a)).pop();

    for(let x = 1; x <= maxLevel; x++){
        xpTotal += xp_table[x];

        if(xpTotal > xp){
            xpTotal -= xp_table[x];
            break;
        }else{
            level = x;
        }
    }

    let xpCurrent = Math.floor(xp - xpTotal);

    if(level < maxLevel)
        xpForNext = Math.ceil(xp_table[level + 1]);

    let progress = Math.max(0, Math.min(xpCurrent / xpForNext, 1));

    return {
        xp,
        level,
        maxLevel,
        xpCurrent,
        xpForNext,
        progress
    };
}

function getSlayerLevel(slayer){
    let { claimed_levels } = slayer;

    let level = 0;

    for(let level_name in claimed_levels){
        let _level = parseInt(level_name.split("_").pop());

        if(_level > level)
            level = _level;
    }

    return level;
}

function getBonusStat(level, skill, max, incremention){
    let skill_stats = bonus_stats[skill];
    let steps = Object.keys(skill_stats).sort((a, b) => Number(a) - Number(b)).map(a => Number(a));

    let bonus = Object.assign({}, stat_template);

    for(let x = steps[0]; x <= max; x += incremention){
        if(level < x)
            break;

        let skill_step = steps.slice().reverse().find(a => a <= x);

        let skill_bonus = skill_stats[skill_step];

        for(let skill in skill_bonus)
            bonus[skill] += skill_bonus[skill];
    }

    return bonus;
}

// Calculate total health with defense
function getEffectiveHealth(health, defense){
    if(defense <= 0)
        return health;

    return Math.round(health * (1 + defense / 100));
}

async function getBackpackContents(arraybuf){
    let buf = Buffer.from(arraybuf);

    let data = await parseNbt(buf);
    data = nbt.simplify(data);

    let items = data.i;

    for(let item of items){
        item.isInactive = true;
        item.inBackpack = true;
    }

    return items;
}

function getId(item){
    if(objectPath.has(item, 'tag.ExtraAttributes.id'))
        return item.tag.ExtraAttributes.id;
    return null;
}

// Process items returned by API
async function getItems(base64){
    // API stores data as base64 encoded gzipped Minecraft NBT data
    let buf = Buffer.from(base64, 'base64');

    let data = await parseNbt(buf);
    data = nbt.simplify(data);

    let items = data.i;

    // Check backpack contents and add them to the list of items
    for(let [index, item] of items.entries()){
        if(objectPath.has(item, 'tag.display.Name') && (item.tag.display.Name.endsWith('Backpack') || item.tag.display.Name.endsWith('Itchy New Year Cake Bag'))){

            let keys = Object.keys(item.tag.ExtraAttributes);

            let backpackData;

            keys.forEach(key => {
                if(key.endsWith('backpack_data') || key == 'new_year_cake_bag_data')
                    backpackData = item.tag.ExtraAttributes[key];
            });

            if(!Array.isArray(backpackData))
                continue;

            let backpackContents = await getBackpackContents(backpackData);

            backpackContents.forEach(backpackItem => {
                backpackItem.backpackIndex = index;
            });

            item.containsItems = [];

            items.push(...backpackContents);
        }
    }

    let index = 0;

    for(let item of items){
        // Set custom texture for colored leather armor
        if(objectPath.has(item, 'id') && item.id >= 298 && item.id <= 301){
            let types
            let color = [149, 94, 59];

            if(objectPath.has(item, 'tag.ExtraAttributes.color'))
                color = item.tag.ExtraAttributes.color.split(":");

            let type = ["leather_helmet", "leather_chestplate", "leather_leggings", "leather_boots"][item.id - 298].replace('_', '/');

            item.texture_path = `/${type}/${color.join(',')}`;
        }

        // Set raw display name without color and formatting codes
        if(objectPath.has(item, 'tag.display.Name'))
            item.display_name = module.exports.getRawLore(item.tag.display.Name);

        if(objectPath.has(item, 'display_name')){
            if(item.display_name == 'Water Bottle')
                item.Damage = 17;

            // Replace all declared custom textures (mostly FurfSky+ replacements so far)
            for(let texture in replacement_textures)
                if(item.display_name.includes(texture))
                    item.texture_path = replacement_textures[texture];
        }


        // Resolve skull textures to their image path
        if(objectPath.has(item, 'tag.SkullOwner.Properties.textures') && Array.isArray(item.tag.SkullOwner.Properties.textures) && item.tag.SkullOwner.Properties.textures.length > 0){
            try{
                let json = JSON.parse(Buffer.from(item.tag.SkullOwner.Properties.textures[0].Value, 'base64').toString());
                let url = json.textures.SKIN.url;
                let uuid = url.split("/").pop();

                item.texture_path = `/head/${uuid}?v3`;
            }catch(e){

            }
        }

        let lore_raw;

        // Set HTML lore to be displayed on the website
        if(objectPath.has(item, 'tag.display.Lore')){
            lore_raw = item.tag.display.Lore;

            item.lore = '';

            lore_raw.forEach((line, index) => {
                item.lore += module.exports.renderLore(line);

                if(index + 1 <= lore_raw.length)
                    item.lore += '<br>';
            });

            if(objectPath.has(item, 'tag.ExtraAttributes.anvil_uses')){
                let { anvil_uses } = item.tag.ExtraAttributes;

                let hot_potato_count = 0;

                if('hot_potato_count' in item.tag.ExtraAttributes)
                    ({ hot_potato_count } = item.tag.ExtraAttributes);

                anvil_uses -= hot_potato_count;

                if(anvil_uses > 0 && lore_raw)
                    item.lore += "<br>" +  module.exports.renderLore(`§7Anvil Uses: §c${anvil_uses}`);
            }
        }

        let lore = lore_raw ? lore_raw.map(a => a = module.exports.getRawLore(a)) : [];

        let rarity, item_type;

        if(lore.length > 0){
            // Get item type (like "bow") and rarity (like "legendary") from last line of lore
            let rarity_type = lore[lore.length - 1];

            rarity_type = module.exports.splitWithTail(rarity_type, " ", 1);

            rarity = rarity_type[0];

            if(rarity_type.length > 1)
                item_type = rarity_type[1].trim();

            item.rarity = rarity.toLowerCase();

            if(item_type)
                item.type = item_type.toLowerCase();

            item.stats = {};

            // Get item stats from lore
            lore.forEach(line => {
                let split = line.split(":");

                if(split.length < 2)
                    return;

                let stat_type = split[0];
                let stat_value = parseInt(split[1].trim().replace(/,/g, ''));

                switch(stat_type){
                    case 'Damage':
                        item.stats.damage = stat_value;
                        break;
                    case 'Health':
                        item.stats.health = stat_value;
                        break;
                    case 'Defense':
                        item.stats.defense = stat_value;
                        break;
                    case 'Strength':
                        item.stats.strength = stat_value;
                        break;
                    case 'Speed':
                        item.stats.speed = stat_value;
                        break;
                    case 'Crit Chance':
                        item.stats.crit_chance = stat_value;
                        break;
                    case 'Crit Damage':
                        item.stats.crit_damage = stat_value;
                        break;
                    case 'Intelligence':
                        item.stats.intelligence = stat_value;
                        break;
                }
            });

            // Apply Speed Talisman speed bonus
            if(objectPath.has(item, 'tag.ExtraAttributes.id') && item.tag.ExtraAttributes.id == 'SPEED_TALISMAN'){
                lore.forEach(line => {
                    if(line.startsWith('Gives')){
                        let split = line.split("Gives +");

                        if(split.length < 2)
                            return;

                        let speed = parseInt(split[1]);

                        if(!isNaN(speed))
                            item.stats.speed = speed;
                    }
                })
            }
        }

        // Add snow canon and blaster to weapons
        if(objectPath.has(item, 'tag.ExtraAttributes.id') && ['SNOW_CANNON', 'SNOW_BLASTER'].includes(item.tag.ExtraAttributes.id))
            item.type = 'bow';

        // Workaround for detecting item types if another language is set by the player on Hypixel
        if(objectPath.has(item, 'tag.ExtraAttributes.id') && item.tag.ExtraAttributes.id != 'ENCHANTED_BOOK'){
            if(objectPath.has(item, 'tag.ExtraAttributes.enchantments')){
                if('sharpness' in item.tag.ExtraAttributes.enchantments
                || 'crticial' in item.tag.ExtraAttributes.enchantments
                || 'ender_slayer' in item.tag.ExtraAttributes.enchantments
                || 'execute' in item.tag.ExtraAttributes.enchantments
                || 'first_strike' in item.tag.ExtraAttributes.enchantments
                || 'giant_killer' in item.tag.ExtraAttributes.enchantments
                || 'lethality' in item.tag.ExtraAttributes.enchantments
                || 'life_steal' in item.tag.ExtraAttributes.enchantments
                || 'looting' in item.tag.ExtraAttributes.enchantments
                || 'luck' in item.tag.ExtraAttributes.enchantments
                || 'scavenger' in item.tag.ExtraAttributes.enchantments
                || 'vampirism' in item.tag.ExtraAttributes.enchantments
                || 'bane_of_arthropods' in item.tag.ExtraAttributes.enchantments
                || 'smite' in item.tag.ExtraAttributes.enchantments)
                    item.type = 'sword';

                if('power' in item.tag.ExtraAttributes.enchantments
                || 'aiming' in item.tag.ExtraAttributes.enchantments
                || 'dragon_hunter' in item.tag.ExtraAttributes.enchantments
                || 'infinite_quiver' in item.tag.ExtraAttributes.enchantments
                || 'power' in item.tag.ExtraAttributes.enchantments
                || 'snipe' in item.tag.ExtraAttributes.enchantments
                || 'punch' in item.tag.ExtraAttributes.enchantments
                || 'flame' in item.tag.ExtraAttributes.enchantments
                || 'piercing' in item.tag.ExtraAttributes.enchantments)
                    item.type = 'bow';

                if('angler' in item.tag.ExtraAttributes.enchantments
                || 'blessing' in item.tag.ExtraAttributes.enchantments
                || 'caster' in item.tag.ExtraAttributes.enchantments
                || 'frail' in item.tag.ExtraAttributes.enchantments
                || 'luck_of_the_sea' in item.tag.ExtraAttributes.enchantments
                || 'lure' in item.tag.ExtraAttributes.enchantments
                || 'magnet' in item.tag.ExtraAttributes.enchantments)
                    item.type = 'fishing rod';
            }
        }
    }

    for(let item of items){
        if(item.inBackpack){
            items[item.backpackIndex].containsItems.push(Object.assign({}, item));
        }
    }

    items = items.filter(a => !a.inBackpack);

    return items;
}

// XP required for each level of a skill
const leveling_xp = {
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
    45: 2700000,
    46: 2800000,
    47: 3100000,
    48: 3400000,
    49: 3700000,
    50: 4000000
};

// XP required for each level of Runecrafting
const runecrafting_xp = {
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
}

const slayer_xp = {
    1: 5,
    2: 15,
    3: 200,
    4: 1000,
    5: 5000,
    6: 20000,
    7: 100000,
    8: 400000
};

// Player stats on a completely new profile
const base_stats = {
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
};

const stat_template = {
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
};

// Object with fairy soul, skill, slayer bonuses and enchantment bonuses
const bonus_stats = {
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
        9: {
            crit_chance: 3
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
};

// Minecraft color and formatting codes
const minecraft_formatting = {
    0: {
        type: 'color',
        css: 'color: #000000'
    },

    1: {
        type: 'color',
        css: 'color: #0000AA'
    },

    2: {
        type: 'color',
        css: 'color: #00AA00'
    },

    3: {
        type: 'color',
        css: 'color: #44DDDD'
    },

    4: {
        type: 'color',
        css: 'color: #CC3333'
    },

    5: {
        type: 'color',
        css: 'color: #AA00AA'
    },

    6: {
        type: 'color',
        css: 'color: #FFAA00'
    },

    7: {
        type: 'color',
        css: 'color: #AAAAAA'
    },

    8: {
        type: 'color',
        css: 'color: #777777'
    },

    9: {
        type: 'color',
        css: 'color: #8888FF'
    },

    a: {
        type: 'color',
        css: 'color: #55FF55'
    },

    b: {
        type: 'color',
        css: 'color: #55FFFF'
    },

    c: {
        type: 'color',
        css: 'color: #FF5555'
    },

    d: {
        type: 'color',
        css: 'color: #FF55FF'
    },

    e: {
        type: 'color',
        css: 'color: #FFFF55'
    },

    f: {
        type: 'color',
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
};

// List of items whose texture should be replaced with a custom one
const replacement_textures = {
    "Undead Sword": "/resources/img/textures/furfsky/undead_sword.png",
    "Spider Sword": "/resources/img/textures/furfsky/spider_sword.png",
    "Silver Fang": "/resources/img/textures/furfsky/silver_fang.png",
    "Rogue Sword": "/resources/img/textures/furfsky/rogue_sword.png",
    "Prismarine Blade": "/resources/img/textures/furfsky/prismarine_blade.gif",
    "Pigman Sword": "/resources/img/textures/furfsky/pigman_sword.gif",
    "Midas' Sword": "/resources/img/textures/furfsky/midas_sword.gif",
    "Leaping Sword": "/resources/img/textures/furfsky/leaping_sword.gif",
    "Ink Wand": "/resources/img/textures/furfsky/ink_wand.gif",
    "Golem Sword": "/resources/img/textures/furfsky/golem_sword.png",
    "Ender Sword": "/resources/img/textures/furfsky/ender_sword.png",
    "Emerald Blade": "/resources/img/textures/furfsky/emerald_blade.gif",
    "Ember Rod": "/resources/img/textures/furfsky/ember_rod.gif",
    "Cleaver": "/resources/img/textures/furfsky/cleaver.png",
    "Aspect of the End": "/resources/img/textures/furfsky/aspect_sword.gif",
    "Aspect of the Dragon": "/resources/img/textures/furfsky/aspect_dragon.gif",

    "End Stone Bow": "/resources/img/textures/furfsky/endstone_bow_standby.png",
    "Wither Bow": "/resources/img/textures/furfsky/wither_bow_standby.png",
    "Savanna Bow": "/resources/img/textures/furfsky/savanna_bow_standby.png",
    "Runaan's Bow": "/resources/img/textures/furfsky/runaan_bow_standby.gif",
    "Hurricane Bow": "/resources/img/textures/furfsky/hurricane_bow_standby.gif",
    "Ender Bow": "/resources/img/textures/furfsky/ender_bow_standby.png",
    "Slime Bow": "/resources/img/textures/furfsky/slime_bow_standby.png",
    "Explosive Bow": "/resources/img/textures/furfsky/explosive_bow_standby.png",
    "Magma Bow": "/resources/img/textures/furfsky/magma_bow_standby.gif",

    "Challenging Rod": "/resources/img/textures/furfsky/challenging_rod.png",
    "Farmer's Rod": "/resources/img/textures/furfsky/farmers_rod.png",
    "Prismarine Rod": "/resources/img/textures/furfsky/prismarine_rod.gif",
    "Rod of Champions": "/resources/img/textures/furfsky/rod_of_champions.gif",
    "Rod of Legends": "/resources/img/textures/furfsky/rod_of_legends.gif",
    "Shredder": "/resources/img/textures/furfsky/shredder.png",
    "Speedster Rod": "/resources/img/textures/furfsky/speedster_rod.png",
    "Sponge Rod": "/resources/img/textures/furfsky/sponge_rod.png",

    "Speedster Helmet": "/resources/img/textures/furfsky/speedster_helm.png",
    "Speedster Chestplate": "/resources/img/textures/furfsky/speedster_chest.png",
    "Speedster Leggings": "/resources/img/textures/furfsky/speedster_legs.png",
    "Speedster Boots": "/resources/img/textures/furfsky/speedster_boots.png",

    "Mushroom Helmet": "/resources/img/textures/furfsky/mush_helm.png",
    "Mushroom Chestplate": "/resources/img/textures/furfsky/mush_chest.png",
    "Mushroom Leggings": "/resources/img/textures/furfsky/mush_legs.png",
    "Mushroom Boots": "/resources/img/textures/furfsky/mush_boots.png",

    "Skeleton's Helmet": "/resources/img/textures/furfsky/skeleton_helm.png",
    "Guardian Chestplate": "/resources/img/textures/furfsky/guardian_chest.png",
    "Creeper Pants": "/resources/img/textures/furfsky/creeper_pants.png",
    "Spider's Boots": "/resources/img/textures/furfsky/spider_boots.png",

    "Miner's Outfit Helmet": "/resources/img/textures/furfsky/miner_helm.png",
    "Miner's Outfit  Chestplate": "/resources/img/textures/furfsky/miner_chest.png",
    "Miner's Outfit  Leggings": "/resources/img/textures/furfsky/miner_legs.png",
    "Miner's Outfit  Boots": "/resources/img/textures/furfsky/miner_boots.png",

    "Miner Helmet": "/resources/img/textures/furfsky/mine_helm.png",
    "Miner Chestplate": "/resources/img/textures/furfsky/mine_chest.png",
    "Miner Leggings": "/resources/img/textures/furfsky/mine_legs.png",
    "Miner Boots": "/resources/img/textures/furfsky/mine_boots.png",

    "Armor of Magma Helmet": "/resources/img/textures/furfsky/magma_helm.png",
    "Armor of Magma Chestplate": "/resources/img/textures/furfsky/magma_chest.png",
    "Armor of Magma Leggings": "/resources/img/textures/furfsky/magma_legs.png",
    "Armor of Magma Boots": "/resources/img/textures/furfsky/magma_boots.png",

    "Leaflet Helmet": "/resources/img/textures/furfsky/leaf_helm.png",
    "Leaflet Chestplate": "/resources/img/textures/furfsky/leaf_chest.png",
    "Leaflet Leggings": "/resources/img/textures/furfsky/leaf_legs.png",
    "Leaflet Boots": "/resources/img/textures/furfsky/leaf_boots.png",

    "Lapis Armor Helmet": "/resources/img/textures/furfsky/lapis_helm.png",
    "Lapis Armor Chestplate": "/resources/img/textures/furfsky/lapis_chest.png",
    "Lapis Armor Leggings": "/resources/img/textures/furfsky/lapis_legs.png",
    "Lapis Armor Boots": "/resources/img/textures/furfsky/lapis_boots.png",

    "Hardened Diamond Helmet": "/resources/img/textures/furfsky/hardened_diamond_helm.png",
    "Hardened Diamond Chestplate": "/resources/img/textures/furfsky/hardened_diamond_chest.png",
    "Hardened Diamond Leggings": "/resources/img/textures/furfsky/hardened_diamond_legs.png",
    "Hardened Diamond Boots": "/resources/img/textures/furfsky/hardened_diamond_boots.png",

    "Growth Helmet": "/resources/img/textures/furfsky/growth_helm.png",
    "Growth Chestplate": "/resources/img/textures/furfsky/growth_chest.png",
    "Growth Leggings": "/resources/img/textures/furfsky/growth_legs.png",
    "Growth Boots": "/resources/img/textures/furfsky/growth_boots.png",

    "Emerald Armor Helmet": "/resources/img/textures/furfsky/emerald_helm.png",
    "Emerald Armor Chestplate": "/resources/img/textures/furfsky/emerald_chest.png",
    "Emerald Armor Leggings": "/resources/img/textures/furfsky/emerald_legs.png",
    "Emerald Armor Boots": "/resources/img/textures/furfsky/emerald_boots.png",

    "Cactus Helmet": "/resources/img/textures/furfsky/cactus_helm.png",
    "Cactus Chestplate": "/resources/img/textures/furfsky/cactus_chest.png",
    "Cactus Leggings": "/resources/img/textures/furfsky/cactus_legs.png",
    "Cactus Boots": "/resources/img/textures/furfsky/cactus_boots.png",

    "Budget Hopper": "/resources/img/textures/furfsky/budget_hopper.png",
    "Enchanted Hopper": "/resources/img/textures/furfsky/enchanted_hopper.png",
    "Grand Experience": "/resources/img/textures/furfsky/grand_bottle.png",
    "Titanic Experience": "/resources/img/textures/furfsky/titanic_bottle.png",
    "Grappling Hook": "/resources/img/textures/furfsky/grapple_hook.png",
    "Jungle Axe": "/resources/img/textures/furfsky/jungle_axe.png",
    "Stonk": "/resources/img/textures/furfsky/stonk.gif",
    "Zombie Pickaxe": "/resources/img/textures/furfsky/zombie_pickaxe.png",

    "Birch Forest Biome Stick": "/resources/img/textures/furfsky/birch_biome_stick.png",
    "Roofed Forest Biome Stick": "/resources/img/textures/furfsky/roofed_biome_stick.png",
    "Deep Ocean Biome Stick": "/resources/img/textures/furfsky/deepocean_biome_stick.png",
    "Desert Biome Stick": "/resources/img/textures/furfsky/desert_biome_stick.png",
    "End Biome Stick": "/resources/img/textures/furfsky/end_biome_stick.png",
    "Forest Biome Stick": "/resources/img/textures/furfsky/forest_biome_stick.png",
    "Jungle Biome Stick": "/resources/img/textures/furfsky/jungle_biome_stick.png",
    "Forest Biome Stick": "/resources/img/textures/furfsky/forest_biome_stick.png",
    "Savanna Biome Stick": "/resources/img/textures/furfsky/savanna_biome_stick.png",
    "Taiga Biome Stick": "/resources/img/textures/furfsky/taiga_biome_stick.png",
}

module.exports = {
    splitWithTail: (string, delimiter, count) => {
        let parts = string.split(delimiter);
        let tail = parts.slice(count).join(delimiter);
        let result = parts.slice(0,count);
        result.push(tail);

        return result;
    },

    getBaseStats: () => {
        return base_stats;
    },

    getLevelByXp: (xp) => {
        let xpTotal = 0;
        let level = 0;

        let maxLevel = Object.keys(leveling_xp).sort((a, b) => Number(a) - Number(b)).map(a => Number(a)).pop();

        for(let x = 1; x <= maxLevel; x++){
            xpTotal += leveling_xp[x];

            if(xp >= xpTotal)
                level = x;
        }

        return level;
    },

    // Get skill bonuses for a specific skill
    getBonusStat: (level, skill, incremention) => {
        let skill_stats = bonus_stats[skill];
        let steps = Object.keys(skill_stats).sort((a, b) => Number(a) - Number(b)).map(a => Number(a));

        let bonus = {
            health: 0,
            defense: 0,
            strength: 0,
            damage_increase: 0,
            speed: 0,
            crit_chance: 0,
            crit_damage: 0,
            intelligence: 0,
            damage_multiplicator: 1
        };

        for(let x = steps[0]; x <= steps[steps.length - 1]; x += incremention){
            if(level < x)
                break;

            let skill_step = steps.slice().reverse().find(a => a <= x);

            let skill_bonus = skill_stats[skill_step];

            for(let skill in skill_bonus)
                bonus[skill] += skill_bonus[skill];
        }

        return bonus;
    },

    getEffectiveHealth: (health, defense) => {
        return getEffectiveHealth(health, defense);
    },

    // Convert Minecraft lore to HTML
    renderLore: (text) => {
        let output = "";
        let spansOpened = 0;
        let parts = text.split("§");

        parts.forEach(part => {
            let code = part.substr(0, 1);
            let content = part.substr(1);

            if(code in minecraft_formatting){
                let format = minecraft_formatting[code];

                if(format.type == 'color'){
                    for(; spansOpened > 0; spansOpened--){
                        output += "</span>";
                    }

                    output += `<span style="${format.css}">${content}`;

                    spansOpened++;
                }else if(format.type == 'format'){
                    output += `<span style="${format.css}">${content}`;

                    spansOpened++;
                }else if(format.type == 'reset'){
                    for(; spansOpened > 0; spansOpened--){
                        output += "</span>";
                    }

                    output += content;
                }
            }
        });

        for(; spansOpened > 0; spansOpened--){
            output += "</span>";
        }

        return output;
    },

    // Get Minecraft lore without the color and formatting codes
    getRawLore: (text) => {
        let output = "";
        let parts = text.split("§");

        parts.forEach(part => {
            output += part.substr(1);
        });

        return output;
    },

    getItems: async (profile) => {
        let output = {};

        // Process inventories returned by API
        let armor = 'inv_armor' in profile ? await getItems(profile.inv_armor.data) : [];
        let inventory = 'inv_contents' in profile ? await getItems(profile.inv_contents.data) : [];
        let enderchest = 'ender_chest_contents' in profile ? await getItems(profile.ender_chest_contents.data) : [];
        let talisman_bag = 'talisman_bag' in profile ? await getItems(profile.talisman_bag.data) : [];
        let fishing_bag = 'fishing_bag' in profile ? await getItems(profile.fishing_bag.data) : [];
        let quiver = 'quiver' in profile ? await getItems(profile.quiver.data) : [];
        let potion_bag = 'potion_bag' in profile ? await getItems(profile.potion_bag.data) : [];
        let candy_bag = 'candy_inventory_contents' in profile ? await getItems(profile.candy_inventory_contents.data) : [];

        output.armor = armor.filter(a => Object.keys(a).length != 0);
        output.inventory = inventory
        output.enderchest = enderchest;
        output.talisman_bag = talisman_bag;
        output.fishing_bag = fishing_bag;
        output.quiver = quiver;
        output.potion_bag = potion_bag;

        const all_items = armor.concat(inventory, enderchest, talisman_bag, fishing_bag, quiver, potion_bag);

        for(let [index, item] of all_items.entries()){
            item.item_index = index;
        }

        // All items not in the inventory or accessory bag should be inactive so they don't contribute to the total stats
        enderchest = enderchest.map(a => Object.assign({ isInactive: true}, a) );

        // Add candy bag contents as backpack contents to candy bag
        for(let item of all_items){
            if(objectPath.has(item, 'tag.ExtraAttributes.id') && item.tag.ExtraAttributes.id == 'TRICK_OR_TREAT_BAG')
                item.containsItems = candy_bag;
        }

        let talismans = [];

        // Add talismans from inventory
        for(let talisman of inventory.filter(a => a.type == 'accessory')){
            let id = talisman.tag.ExtraAttributes.id;

            if(talismans.filter(a => !a.isInactive && a.tag.ExtraAttributes.id == id).length == 0){
                talismans.push(talisman);
            }else{
                let talisman_inactive = Object.assign({ isInactive: true }, talisman);
                talismans.push(talisman_inactive);
            }
        }

        // Add talismans from accessory bag if not already in inventory
        for(let talisman of talisman_bag){
            if(!objectPath.has(talisman, 'tag.ExtraAttributes.id'))
                continue;

            let id = talisman.tag.ExtraAttributes.id;

            if(talismans.filter(a => !a.isInactive && a.tag.ExtraAttributes.id == id).length == 0){
                talismans.push(talisman);
            }else{
                let talisman_inactive = Object.assign({ isInactive: true }, talisman);
                talismans.push(talisman_inactive);
            }
        }

        // Don't account for lower tier versions of the same talisman
        for(let talisman of talismans){
            let id = talisman.tag.ExtraAttributes.id;

            if((id == 'RING_POTION_AFFINITY' && talismans.filter(a => !a.isInactive && getId(a) == 'ARTIFACT_POTION_AFFINITY').length > 0)
            || (id == 'POTION_AFFINITY_TALISMAN' && talismans.filter(a => !a.isInactive && (getId(a) == 'RING_POTION_AFFINITY' || getId(a) == 'ARTIFACT_POTION_AFFINITY')).length > 0)
            || (id == 'FEATHER_RING' && talismans.filter(a => !a.isInactive && getId(a) == 'FEATHER_ARTIFACT').length > 0)
            || (id == 'FEATHER_TALISMAN' && talismans.filter(a => !a.isInactive && (getId(a) == 'FEATHER_ARTIFACT' || getId(a) == 'FEATHER_RING')).length > 0)
            || (id == 'SEA_CREATURE_RING' && talismans.filter(a => !a.isInactive && getId(a) == 'SEA_CREATURE_ARTIFACT').length > 0)
            || (id == 'SEA_CREATURE_TALISMAN' && talismans.filter(a => !a.isInactive && (getId(a) == 'SEA_CREATURE_ARTIFACT' || getId(a) == 'SEA_CREATURE_RING')).length > 0)
            || (id == 'HEALING_TALISMAN' && talismans.filter(a => !a.isInactive && getId(a) == 'HEALING_RING').length > 0)
            || (id == 'CANDY_RING' && talismans.filter(a => !a.isInactive && getId(a) == 'CANDY_ARTIFACT').length > 0)
            || (id == 'CANDY_TALISMAN' && talismans.filter(a => !a.isInactive && (getId(a) == 'CANDY_ARTIFACT' || getId(a) == 'CANDY_RING')).length > 0)
            || (id == 'INTIMIDATION_RING' && talismans.filter(a => !a.isInactive && getId(a) == 'INTIMIDATION_ARTIFACT').length > 0)
            || (id == 'INTIMIDATION_TALISMAN' && talismans.filter(a => !a.isInactive && (getId(a) == 'INTIMIDATION_ARTIFACT' || getId(a) == 'INTIMIDATION_RING')).length > 0)
            || (id == 'SPIDER_RING' && talismans.filter(a => !a.isInactive && getId(a) == 'SPIDER_ARTIFACT').length > 0)
            || (id == 'SPIDER_TALISMAN' && talismans.filter(a => !a.isInactive && (getId(a) == 'SPIDER_ARTIFACT' || getId(a) == 'SPIDER_RING')).length > 0)
            || (id == 'RED_CLAW_RING' && talismans.filter(a => !a.isInactive && getId(a) == 'RED_CLAW_ARTIFACT').length > 0)
            || (id == 'RED_CLAW_TALISMAN' && talismans.filter(a => !a.isInactive && (getId(a) == 'RED_CLAW_ARTIFACT' || getId(a) == 'RED_CLAW_RING')).length > 0)
            || (id == 'HUNTER_TALISMAN' && talismans.filter(a => !a.isInactive && getId(a) == 'HUNTER_RING').length > 0)
            || (id == 'ZOMBIE_RING' && talismans.filter(a => !a.isInactive && getId(a) == 'ZOMBIE_ARTIFACT').length > 0)
            || (id == 'ZOMBIE_TALISMAN' && talismans.filter(a => !a.isInactive && (getId(a) == 'ZOMBIE_ARTIFACT' || getId(a) == 'ZOMBIE_RING')).length > 0)
            || (id == 'HEALING_TALISMAN' && talismans.filter(a => !a.isInactive && getId(a) == 'HEALING_RING').length > 0)
            || (id == 'BAT_RING' && talismans.filter(a => !a.isInactive && getId(a) == 'BAT_ARTIFACT').length > 0)
            || (id == 'BAT_TALISMAN' && talismans.filter(a => !a.isInactive && (getId(a) == 'BAT_ARTIFACT' || getId(a) == 'BAT_RING')).length > 0)
            )
                talisman.isInactive = true;
        }

        // Add New Year Cake Bag health bonus (1 per unique cake)
        for(let talisman of talismans){
            let id = talisman.tag.ExtraAttributes.id;
            let cakes = [];

            if(id == 'NEW_YEAR_CAKE_BAG' && objectPath.has(talisman, 'containsItems') && Array.isArray(talisman.containsItems)){
                talisman.stats.health = 0;

                for(let item of talisman.containsItems){
                    if(objectPath.has(item, 'tag.ExtraAttributes.new_years_cake') && !cakes.includes(item.tag.ExtraAttributes.new_years_cake)){
                        talisman.stats.health++;
                        cakes.push(item.tag.ExtraAttributes.new_years_cake);
                    }
                }
            }
        }

        talismans.push(...enderchest.filter(a => a.type == 'accessory'));

        output.talismans = talismans;
        output.weapons = all_items.filter(a => a.type == 'sword' || a.type == 'bow');

        // Check if inventory access disabled by user
        if(inventory.length == 0)
            output.no_inventory = true;

        // Sort talismans and weapons by rarity
        for(let items of ['talismans', 'weapons'])
            output[items] = output[items].sort((a, b) => rarity_order.indexOf(a.rarity) - rarity_order.indexOf(b.rarity));

        let swords = output.weapons.filter(a => a.type == 'sword');
        let bows = output.weapons.filter(a => a.type == 'bow');

        if(swords.length > 0)
            output.highest_rarity_sword = swords.filter(a => a.rarity == swords[0].rarity).sort((a, b) => a.item_index - b.item_index)[0];

        if(bows.length > 0)
            output.highest_rarity_bow = bows.filter(a => a.rarity == bows[0].rarity).sort((a, b) => a.item_index - b.item_index)[0];

        if(armor.filter(a => Object.keys(a).length > 1).length == 4){

            let output_name = "";

            armor.forEach(armorPiece => {
                let name = armorPiece.display_name;

                if(objectPath.has(armor[0], 'tag.ExtraAttributes.modifier'))
                    name = name.split(" ").slice(1).join(" ");

                armorPiece.armor_name = name;
            });

            if(armor.filter(a => objectPath.has(a, 'tag.ExtraAttributes.modifier')
            && a.tag.ExtraAttributes.modifier == armor[0].tag.ExtraAttributes.modifier).length == 4)
                output_name += armor[0].display_name.split(" ")[0] + " ";

            if(armor.filter(a => a.armor_name.split(" ")[0] == armor[0].armor_name.split(" ")[0]).length == 4){
                let base_name = armor[0].armor_name.split(" ");
                base_name.pop();

                output_name += base_name.join(" ");

                if(!output_name.endsWith("Armor"))
                    output_name += " Armor";

                output.armor_set = output_name;
            }
        }

        return output;
    },

    getStats: async (profile, items) => {
        let output = {};

        output.stats = Object.assign({}, base_stats);

        if(isNaN(profile.fairy_souls_collected))
            profile.fairy_souls_collected = 0;

        output.fairy_bonus = {};

        if(profile.fairy_exchanges > 0){
            let fairyBonus = getBonusStat(profile.fairy_exchanges * 5, 'fairy_souls', max_souls, 5);
            output.fairy_bonus = Object.assign({}, fairyBonus);

            // Apply fairy soul bonus
            for(let stat in fairyBonus)
                output.stats[stat] += fairyBonus[stat];
        }

        output.fairy_souls = { collected: profile.fairy_souls_collected, total: max_souls, progress: Math.min(profile.fairy_souls_collected / max_souls, 1) };

        // Apply skill bonuses
        if('experience_skill_farming' in profile
        || 'experience_skill_mining' in profile
        || 'experience_skill_combat' in profile
        || 'experience_skill_foraging' in profile
        || 'experience_skill_fishing' in profile
        || 'experience_skill_enchanting' in profile
        || 'experience_skill_alchemy' in profile
        || 'experience_skill_carpentry' in profile
        || 'experience_skill_runecrafting' in profile){
            let average_level = 0;

            let levels = {
                farming: getLevelByXp(profile.experience_skill_farming),
                mining: getLevelByXp(profile.experience_skill_mining),
                combat: getLevelByXp(profile.experience_skill_combat),
                foraging: getLevelByXp(profile.experience_skill_foraging),
                fishing: getLevelByXp(profile.experience_skill_fishing),
                enchanting: getLevelByXp(profile.experience_skill_enchanting),
                alchemy: getLevelByXp(profile.experience_skill_alchemy),
                carpentry: getLevelByXp(profile.experience_skill_carpentry),
                runecrafting: getLevelByXp(profile.experience_skill_runecrafting, true),
            };

            output.skill_bonus = {};

            for(let skill in levels){
                if(skill != 'runecrafting' && skill != 'carpentry')
                    average_level += levels[skill].level + levels[skill].progress;

                let skillBonus = getBonusStat(levels[skill].level, `${skill}_skill`, 50, 1);

                output.skill_bonus[skill] = Object.assign({}, skillBonus);

                for(let stat in skillBonus)
                    output.stats[stat] += skillBonus[stat];
            }

            output.average_level = +(average_level / (Object.keys(levels).length - 2)).toFixed(1);

            output.levels = Object.assign({}, levels);
        }

        // Apply slayer bonuses
        if('slayer_bosses' in profile){
            output.slayer_bonus = {};

            let slayers = {};

            if(objectPath.has(profile, 'slayer_bosses.zombie.claimed_levels'))
                slayers.zombie = getSlayerLevel(profile.slayer_bosses.zombie);

            if(objectPath.has(profile, 'slayer_bosses.spider.claimed_levels'))
                slayers.spider = getSlayerLevel(profile.slayer_bosses.spider);

            if(objectPath.has(profile, 'slayer_bosses.wolf.claimed_levels'))
                slayers.wolf = getSlayerLevel(profile.slayer_bosses.wolf);

            for(let slayer in slayers){
                let slayerBonus = getBonusStat(slayers[slayer], `${slayer}_slayer`, 50, 1);

                output.slayer_bonus[slayer] = Object.assign({}, slayerBonus);

                for(let stat in slayerBonus)
                    output.stats[stat] += slayerBonus[stat];
            }

            output.slayers = Object.assign({}, slayers);
        }

        output.base_stats = Object.assign({}, output.stats);

        // Apply basic armor stats
        items.armor.forEach(item => {
            for(let stat in item.stats)
                output.stats[stat] += item.stats[stat];
        });

        // Apply Superior Dragon Armor full set bonus of 5% stat increase
        if(items.armor.filter(a => objectPath.has(a, 'tag.ExtraAttributes.id') && a.tag.ExtraAttributes.id.startsWith('SUPERIOR_DRAGON_')).length == 4)
            for(let stat in output.stats)
                output.stats[stat] = Math.round(output.stats[stat] * 1.05);

        // Apply Lapis Armor full set bonus of +60 HP
        if(items.armor.filter(a => objectPath.has(a, 'tag.ExtraAttributes.id') && a.tag.ExtraAttributes.id.startsWith('LAPIS_ARMOR_')).length == 4)
            output.stats['health'] += 60;

        // Apply Emerald Armor full set bonus of +1 HP and +1 Defense per 3000 emeralds in collection with a maximum of 300
        if(objectPath.has(profile, 'collection.EMERALD')
        && !isNaN(profile.collection.EMERALD)
        && items.armor.filter(a => objectPath.has(a, 'tag.ExtraAttributes.id') && a.tag.ExtraAttributes.id.startsWith('EMERALD_ARMOR_')).length == 4){
            let emerald_bonus = Math.min(350, Math.floor(profile.collection.EMERALD / 3000));

            output.stats.health += emerald_bonus;
            output.stats.defense += emerald_bonus;
        }

        // Apply Speedster Armor full set bonus of +20 Speed
        if(items.armor.filter(a => objectPath.has(a, 'tag.ExtraAttributes.id') && a.tag.ExtraAttributes.id.startsWith('SPEEDSTER_')).length == 4)
            output.stats.speed += 20;

        // Apply Young Dragon Armor full set bonus of +70 Speed
        if(items.armor.filter(a => objectPath.has(a, 'tag.ExtraAttributes.id') && a.tag.ExtraAttributes.id.startsWith('YOUNG_DRAGON_')).length == 4)
            output.stats.speed += 70;

        // Apply stats of active talismans
        items.talismans.filter(a => Object.keys(a).length != 0 && !a.isInactive).forEach(item => {
            for(let stat in item.stats)
                output.stats[stat] += item.stats[stat];
        });

        // Apply Mastiff Armor full set bonus of +50 HP per 1% Crit Damage
        if(items.armor.filter(a => objectPath.has(a, 'tag.ExtraAttributes.id') && a.tag.ExtraAttributes.id.startsWith('MASTIFF_')).length == 4)
            output.stats.health += 50 * output.stats.crit_damage;

        // Apply +5 Defense and +5 Strength of Day/Night Crystal only if both are owned as this is required for a permanent bonus
        if(items.talismans.filter(a => objectPath.has(a, 'tag.ExtraAttributes.id') && ["DAY_CRYSTAL", "NIGHT_CRYSTAL"].includes(a.tag.ExtraAttributes.id)).length == 2){
            output.stats.defense += 5;
            output.stats.strength += 5;
        }

        // Apply Obsidian Chestplate bonus of +1 Speed per 20 Obsidian in inventory
        if(items.armor.filter(a => objectPath.has(a, 'tag.ExtraAttributes.id') && a.tag.ExtraAttributes.id == ('OBSIDIAN_CHESTPLATE')).length == 1){
            let obsidian = 0;

            for(let item of items.inventory){
                if(item.id == 49)
                    obsidian += item.Count;
            }

            output.stats.speed += Math.floor(obsidian / 20);
        }

        output.stats.effective_health = getEffectiveHealth(output.stats.health, output.stats.defense);

        output.weapon_stats = {};

        items.weapons.forEach(item => {
            let stats = Object.assign({}, output.stats);

            // Apply held weapon stats
            for(let stat in item.stats){
                stats[stat] += item.stats[stat];
            }

            // Add crit damage from held weapon to Mastiff Armor full set bonus
            if(items.armor.filter(a => objectPath.has(a, 'tag.ExtraAttributes.id') && a.tag.ExtraAttributes.id.startsWith('MASTIFF_')).length == 4)
                stats.health += 50 * item.stats.crit_damage;

            stats.effective_health = getEffectiveHealth(stats.health, stats.defense);

            output.weapon_stats[item.item_index] = stats;

            // Stats shouldn't go into negative
            for(let stat in stats)
                output.weapon_stats[item.item_index][stat] = Math.max(0, stats[stat]);
        });

        // Stats shouldn't go into negative
        for(let stat in output.stats)
            output.stats[stat] = Math.max(0, output.stats[stat]);

        let killsDeaths = [];

        for(let stat in profile.stats){
            if(stat.startsWith("kills_"))
                killsDeaths.push({ type: 'kills', entityId: stat.replace("kills_", ""), amount: profile.stats[stat] });

            if(stat.startsWith("deaths_"))
                killsDeaths.push({ type: 'deaths', entityId: stat.replace("deaths_", ""), amount: profile.stats[stat] });
        }

        killsDeaths.forEach(stat => {
            let entityName = "";
            let { entityId } = stat;
            entityId.split("_").forEach((split, index) => {
                entityName += split.charAt(0).toUpperCase() + split.slice(1);

                if(index < entityId.split("_").length - 1)
                    entityName += " ";
            });

            stat.entityName = entityName;
        });

        output.kills = killsDeaths.filter(a => a.type == 'kills').sort((a, b) => b.amount - a.amount);
        output.deaths = killsDeaths.filter(a => a.type == 'deaths').sort((a, b) => b.amount - a.amount);

        return output;
    }
}

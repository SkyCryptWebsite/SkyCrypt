const nbt = require('prismarine-nbt');
const util = require('util');
const mcData = require("minecraft-data")("1.8.9");
const objectPath = require("object-path");

const parseNbt = util.promisify(nbt.parse);

const rarity_order = ['legendary', 'epic', 'rare', 'uncommon', 'common'];

function getLevelByXp(xp){
    let xpTotal = 0;
    let level = 0;

    let xpForNext = Infinity;

    let maxLevel = Object.keys(leveling_xp).sort((a, b) => Number(a) - Number(b)).map(a => Number(a)).pop();

    for(let x = 1; x <= maxLevel; x++){
        xpTotal += leveling_xp[x];

        if(xpTotal > xp){
            xpTotal -= leveling_xp[x];
            break;
        }else{
            level = x;
        }
    }

    let xpCurrent = Math.floor(xp - xpTotal);

    if(level < maxLevel)
        xpForNext = Math.ceil(leveling_xp[level + 1]);


    return {
        xp,
        level,
        xpCurrent,
        xpForNext,
        progress: xpCurrent / xpForNext
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

function getEffectiveHealth(health, defense){
    if(defense <= 0)
        return health;

    return health * (1 + defense / 100);
}

async function getBackpackContents(arraybuf){
    let buf = Buffer.from(arraybuf);

    let data = await parseNbt(buf);
    data = nbt.simplify(data);

    let items = data.i.filter(a => Object.keys(a).length != 0).map(a => Object.assign({ isInactive: true}, a) );

    return items;
}

async function getItems(base64){
    let buf = Buffer.from(base64, 'base64');

    let data = await parseNbt(buf);
    data = nbt.simplify(data);

    let items = data.i.filter(a => Object.keys(a).length > 0);

    for(let item of items){
        if(item.tag.display.Name.endsWith('Backpack')){

            let keys = Object.keys(item.tag.ExtraAttributes);

            let backpackData;

            keys.forEach(key => {
                if(key.endsWith('backpack_data'))
                    backpackData = item.tag.ExtraAttributes[key];
            });

            if(!Array.isArray(backpackData))
                continue;

            let backpackContents = await getBackpackContents(backpackData);

            items.push(...backpackContents);
        }
    }

    for(let item of items){
        let mcdata = mcData.items[item.id];

        if(mcdata && 'name' in mcdata){
            let item_name = mcData.items[mcdata.id].name;

            item.texture_path = `/resources/img/textures/item/${item_name}.png`;
            item.minecraft_tag = item_name;
        }else{
            mcdata = mcData.blocks[item.id];

            if(mcdata && 'name' in mcdata){
                let block_name = mcData.blocks[item.id];

                item.texture_path = `/resources/img/textures/block/${block_name}.png`;
                item.minecraft_tag = block_name;
            }
        }

        if('minecraft_tag' in item){
            if(["leather_helmet", "leather_chestplate", "leather_leggings", "leather_boots"].includes(item.minecraft_tag)){
                let color = [149, 94, 59];

                if(objectPath.has(item, 'tag.ExtraAttributes.color'))
                    color = item.tag.ExtraAttributes.color.split(":");

                let type = item.minecraft_tag.replace('_', '/');

                item.texture_path = `/${type}/${color.join(',')}`;
            }
        }

        if(objectPath.has(item, 'tag.display.Name'))
            item.display_name = module.exports.getRawLore(item.tag.display.Name);

        if('minecraft_tag' in item && 'Damage' in item){
            if(item.minecraft_tag == 'skull'){
                switch(item.Damage){
                    case 0:
                        item.texture_path = '/resources/img/textures/item/skeleton_skull.png';
                        break;
                    case 1:
                        item.texture_path = '/resources/img/textures/item/wither_skeleton_skull.png';
                        break;
                    case 2:
                        item.texture_path = '/resources/img/textures/item/zombie_skull.png';
                        break;
                    case 4:
                        item.texture_path = '/resources/img/textures/item/creeper_skull.png';
                        break;
                    case 5:
                        item.texture_path = '/resources/img/textures/item/dragon_skull.png';
                        break;
                }
            }
        }

        if(objectPath.has(item, 'display_name'))
            for(let texture in replacement_textures)
                if(item.display_name.includes(texture))
                    item.texture_path = replacement_textures[texture];


        if(objectPath.has(item, 'tag.SkullOwner.Properties.textures') && Array.isArray(item.tag.SkullOwner.Properties.textures) && item.tag.SkullOwner.Properties.textures.length > 0){
            try{
                let json = JSON.parse(Buffer.from(item.tag.SkullOwner.Properties.textures[0].Value, 'base64').toString());
                let url = json.textures.SKIN.url;
                let uuid = url.split("/").pop();

                item.texture_path = `/head/${uuid}`;
            }catch(e){

            }
        }

        let lore_raw = item.tag.display.Lore;

        item.lore = '';

        lore_raw.forEach((line, index) => {
            item.lore += module.exports.renderLore(line);

            if(index + 1 <= lore_raw.length)
                item.lore += '<br>';
        });

        let lore = lore_raw.map(a => a = module.exports.getRawLore(a));
        let rarity, item_type;

        let rarity_type = lore[lore.length - 1];

        rarity_type = module.exports.splitWithTail(rarity_type, " ", 1);

        rarity = rarity_type[0];

        if(rarity_type.length > 1)
            item_type = rarity_type[1].trim();

        item.rarity = rarity.toLowerCase();

        if(item_type)
            item.type = item_type.toLowerCase();

        item.stats = {};

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
    }

    return items;
}

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
        }
    },

    spider_slayer: {
        1: {
            crit_damage: 1
        }
    },

    wolf_slayer: {
        1: {
            speed: 1
        },
        2: {
            //health: 2 (bonus health doesn't seem to be applied ingame)
        },
        3: {
            speed: 1
        },
        4: {
            //health: 2 (this one probably isn't being applied either)
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

    sharpness_enchantment: {
        1: {
            damage_multiplicator: 0.05
        }
    },

    ender_slayer_enchantment: {
        1: {
            damage_multiplicator: 0.12
        }
    },

    giant_killer_enchantment: {
        1: {
            damage_multiplicator: 0.05
        }
    },

    cubism_enchantment: {
        1: {
            damage_multiplicator: 0.1
        }
    },

    impaling_enchantment: {
        1: {
            damage_multiplicator: 0.125
        }
    },

    critical_enchantment: {
        1: {
            crit_damage: 10
        }
    },

    first_strike_enchantment: {
        1: {
            damage_multiplicator: 0.25
        }
    },

    power_enchantment: {
        1: {
            damage_multiplicator: 0.08
        }
    }
};

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
    "Slime Bow": "/resources/img/textures/furfsky/slime_standby.png",
    "Magma Bow": "/resources/img/textures/furfsky/magma_bow_standby.gif",

    "Speedster Helmet": "/resources/img/textures/furfsky/speedster_helm.png",
    "Speedster Chestplate": "/resources/img/textures/furfsky/speedster_chest.png",
    "Speedster Leggings": "/resources/img/textures/furfsky/speedster_legs.png",
    "Speedster Boots": "/resources/img/textures/furfsky/speedster_boots.png",

    "Mushroom Helmet": "/resources/img/textures/furfsky/mushroom_helm.png",
    "Mushroom Chestplate": "/resources/img/textures/furfsky/mushroom_chest.png",
    "Mushroom Leggings": "/resources/img/textures/furfsky/mushroom_legs.png",
    "Mushroom Boots": "/resources/img/textures/furfsky/mushroom_boots.png",

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

    "Armor of Magma Helmet": "/resources/img/textures/furfsky/armor_helm.png",
    "Armor of Magma Chestplate": "/resources/img/textures/furfsky/armor_chest.png",
    "Armor of Magma Leggings": "/resources/img/textures/furfsky/armor_legs.png",
    "Armor of Magma Boots": "/resources/img/textures/furfsky/armor_boots.png",

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
        return health * (1 + defense / 100);
    },

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

        let inventory = 'inv_contents' in profile ? await getItems(profile.inv_contents.data) : [];
        let talisman_bag = 'talisman_bag' in profile ? await getItems(profile.talisman_bag.data) : [];
        let enderchest = 'ender_chest_contents' in profile ? await getItems(profile.ender_chest_contents.data) : [];

        let armor = await getItems(profile.inv_armor.data);

        enderchest = enderchest.map(a => Object.assign({ isInactive: true}, a) );

        let items = inventory.concat(enderchest);

        let talismans = inventory.filter(a => a.type == 'accessory');

        talisman_bag.forEach(talisman => {
            if(talismans.filter(a => !a.isInactive && a.tag.ExtraAttributes.id == talisman.tag.ExtraAttributes.id).length == 0){
                talismans.push(talisman);
            }else{
                let talisman_inactive = Object.assign({ isInactive: true }, talisman);
                talismans.push(talisman_inactive);
            }
        });

        talismans.push(...enderchest.filter(a => a.type == 'accessory'));

        output.inventory = inventory
        output.enderchest = enderchest;
        output.talisman_bag = talisman_bag;

        output.all = inventory.concat(enderchest, talisman_bag);

        output.talismans = talismans;
        output.weapons = items.filter(a => a.type == 'sword' || a.type == 'bow');
        output.armor = armor;

        for(items in output){
            output[items] = output[items].sort((a, b) => rarity_order.indexOf(a.rarity) - rarity_order.indexOf(b.rarity));
            output[items].forEach((item, index) => {
                item.item_index = index;
            });
        }

        return output;
    },

    getStats: async (profile, items) => {
        let output = {};

        output.stats = Object.assign({}, base_stats);

        console.log(output.stats);

        let fairyBonus = getBonusStat(profile.fairy_souls_collected, 'fairy_souls', 180, 5);

        output.fairy_bonus = Object.assign({}, fairyBonus);

        for(let stat in fairyBonus)
            output.stats[stat] += fairyBonus[stat];

        let levels = {
            farming: getLevelByXp(profile.experience_skill_farming),
            mining: getLevelByXp(profile.experience_skill_mining),
            combat: getLevelByXp(profile.experience_skill_combat),
            foraging: getLevelByXp(profile.experience_skill_foraging),
            fishing: getLevelByXp(profile.experience_skill_fishing),
            enchanting: getLevelByXp(profile.experience_skill_enchanting),
            alchemy: getLevelByXp(profile.experience_skill_alchemy),
        };

        output.skill_bonus = {};

        for(let skill in levels){
            let skillBonus = getBonusStat(levels[skill].level, `${skill}_skill`, 50, 1);

            output.skill_bonus[skill] = Object.assign({}, skillBonus);

            for(let stat in skillBonus)
                output.stats[stat] += skillBonus[stat];
        }

        output.levels = Object.assign({}, levels);

        if('slayer_bosses' in profile){
            output.slayer_bonus = {};

            let slayers = {
                zombie: getSlayerLevel(profile.slayer_bosses.zombie),
                spider: getSlayerLevel(profile.slayer_bosses.spider),
                wolf: getSlayerLevel(profile.slayer_bosses.wolf)
            };

            for(let slayer in slayers){
                let slayerBonus = getBonusStat(slayers[slayer], `${slayer}_slayer`, 50, 1);

                output.slayer_bonus[slayer] = Object.assign({}, slayerBonus);

                for(let stat in slayerBonus)
                    output.stats[stat] += slayerBonus[stat];
            }

            output.slayers = Object.assign({}, slayers);
        }

        output.base_stats = Object.assign({}, output.stats);

        items.talismans.filter(a => !a.isInactive).forEach(item => {
            for(let stat in item.stats)
                output.stats[stat] += item.stats[stat];
        });

        items.armor.forEach(item => {
            for(let stat in item.stats)
                output.stats[stat] += item.stats[stat];
        });

        if(items.armor.filter(a => a.tag.ExtraAttributes.id.startsWith('MASTIFF_')).length == 4)
            output.stats['health'] += 50 * output.stats.crit_damage;

        if(items.talismans.filter(a => ["DAY_CRYSTAL", "NIGHT_CRYSTAL"].includes(a.tag.ExtraAttributes.id)).length == 2){
            output.stats['defense'] += 5;
            output.stats['strength'] += 5;
        }

        output.stats.effective_health = Math.round(getEffectiveHealth(output.stats.health, output.stats.defense));

        output.weapon_stats = {};

        items.weapons.forEach(item => {
            let stats = Object.assign({}, output.stats);

            for(let stat in item.stats){
                stats[stat] += item.stats[stat];
            }

            if(items.armor.filter(a => a.tag.ExtraAttributes.id.startsWith('MASTIFF_')).length == 4)
                stats.health += 50 * item.stats.crit_damage;

            output.weapon_stats[item.item_index] = stats;

            for(let stat in stats)
                output.weapon_stats[item.item_index][stat] = Math.max(0, stats[stat]);
        });

        for(let stat in output.stats)
            output.stats[stat] = Math.max(0, output.stats[stat]);

        return output;
    }
}

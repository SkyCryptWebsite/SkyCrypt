const fs = require('fs');
const path = require('path');
const nbt = require('prismarine-nbt');
const util = require('util');
const mcData = require("minecraft-data")("1.8.9");
const _ = require('lodash');
const constants = require('./constants');
const helper = require('./helper');
const { getId } = helper;
const axios = require('axios');
const moment = require('moment');
const { v4 } = require('uuid');
const retry = require('async-retry');

const credentials = require('./../credentials.json');

const { MongoClient } = require('mongodb');
let db;

const mongo = new MongoClient(credentials.dbUrl, { useUnifiedTopology: true });

mongo.connect().then(() => {
    db = mongo.db(credentials.dbName);
});

const Hypixel = axios.create({
    baseURL: 'https://api.hypixel.net/'
});

const Redis = require("ioredis");
const redisClient = new Redis();

const customResources = require('./custom-resources');
const { SSL_OP_DONT_INSERT_EMPTY_FRAGMENTS } = require('constants');
const randomEmoji = require('./constants/randomEmoji');

const parseNbt = util.promisify(nbt.parse);

const rarity_order = ['special', 'mythic', 'legendary', 'epic', 'rare', 'uncommon', 'common'];

const petTiers = ['common', 'uncommon', 'rare', 'epic', 'legendary', 'mythic'];

const MAX_SOULS = 209;
let TALISMAN_COUNT;

function replaceAll(target, search, replacement){
    return target.split(search).join(replacement);
}

function getMinMax(profiles, min, ...path){
    let output = null;

    const compareValues = profiles.map(a => helper.getPath(a, ...path)).filter(a => !isNaN(a));

    if(compareValues.length == 0)
        return output;

    if(min)
        output = Math.min(...compareValues);
    else
        output = Math.max(...compareValues);

    if(isNaN(output))
        return null;

    return output;
}

function getMax(profiles, ...path){
    return getMinMax(profiles, false, ...path);
}

function getMin(profiles, ...path){
    return getMinMax(profiles, true, ...path);
}

function getAllKeys(profiles, ...path){
    return _.uniq([].concat(...profiles.map(a => _.keys(helper.getPath(a, ...path)))));
}

function getXpByLevel(level, extra = {}){
    let xp_table;
    switch(extra.type){
        case "runecrafting":
            xp_table = constants.runecrafting_xp;
            break;
        case "dungeoneering":
            xp_table = constants.dungeoneering_xp;
            break;
        default:
            xp_table = constants.leveling_xp;
    }

    let levelCap = 1;
    let maxLevel = 1;

    if(extra.skill){
        if(constants.default_skill_caps[extra.skill]
            && constants.default_skill_caps[extra.skill] > levelCap)
            levelCap = constants.default_skill_caps[extra.skill];

        if(constants.maxed_skill_caps[extra.skill])
            maxLevel = constants.maxed_skill_caps[extra.skill];
    }else levelCap = Object.keys(xp_table).sort((a, b) => Number(a) - Number(b)).map(a => Number(a)).pop();

    if(levelCap > maxLevel)
        maxLevel = levelCap;

    const output = {
        level: Math.min(level, maxLevel),
        xpCurrent: 0,
        xpForNext: null,
        progress: 0.05
    }

    if(isNaN(level))
        return 0;

    let xpTotal = 0;

    for(let x = 1; x <= level; x++)
        xpTotal += xp_table[x];

    output.xp = xpTotal;

    if(level >= maxLevel)
        output.progress = 1;
    else
        output.xpForNext = xp_table[level + 1];

    return output;
}

function getLevelByXp(xp, extra = {}){
    let xp_table;
    switch(extra.type){
        case "runecrafting":
            xp_table = constants.runecrafting_xp;
            break;
        case "dungeoneering":
            xp_table = constants.dungeoneering_xp;
            break;
        default:
            xp_table = constants.leveling_xp;
    }

    if(isNaN(xp)){
        return {
            xp: 0,
            level: 0,
            xpCurrent: 0,
            xpForNext: xp_table[1],
            progress: 0,
            level_cap: 0,
            uncapped_level: 0
        };
    }

    let xpTotal = 0;
    let level = 0;
    let uncappedLevel = 0;

    let xpForNext = Infinity;

    let levelCap = 1;
    let maxLevel = 1;

    if(extra.cap)
        levelCap = extra.cap; 

    if(extra.skill){
        if(constants.default_skill_caps[extra.skill]
            && constants.default_skill_caps[extra.skill] > levelCap)
            levelCap = constants.default_skill_caps[extra.skill];

        if(constants.maxed_skill_caps[extra.skill])
            maxLevel = constants.maxed_skill_caps[extra.skill];
    }else levelCap = Object.keys(xp_table).sort((a, b) => Number(a) - Number(b)).map(a => Number(a)).pop();

    if(levelCap > maxLevel)
        maxLevel = levelCap;

    for(let x = 1; x <= maxLevel; x++){
        xpTotal += xp_table[x];

        if(xpTotal > xp){
            xpTotal -= xp_table[x];
            break;
        }else{
            if(x <= levelCap) level = x;
            uncappedLevel = x;
        }
    }

    let xpCurrent = Math.floor(xp - xpTotal);

    if(level < levelCap)
        xpForNext = Math.ceil(xp_table[level + 1]);

    let progress = Math.max(0, Math.min(xpCurrent / xpForNext, 1));

    return {
        xp,
        level,
        maxLevel,
        xpCurrent,
        xpForNext,
        progress,
        levelCap,
        uncappedLevel
    };
}

function getSlayerLevel(slayer, slayerName){
    let { xp, claimed_levels } = slayer;

    let currentLevel = 0;
    let progress = 0;
    let xpForNext = 0;

    const maxLevel = Math.max(...Object.keys(constants.slayer_xp[slayerName]));

    for(const level_name in claimed_levels){
        const level = parseInt(level_name.split("_").pop());

        if(level > currentLevel)
            currentLevel = level;
    }

    if(currentLevel < maxLevel){
        const nextLevel = constants.slayer_xp[slayerName][currentLevel + 1];

        progress = xp / nextLevel;
        xpForNext = nextLevel;
    }else{
        progress = 1;
    }

    return { currentLevel, xp, maxLevel, progress, xpForNext };
}

function getPetLevel(pet){
    const rarityOffset = constants.pet_rarity_offset[pet.rarity];
    const levels = constants.pet_levels.slice(rarityOffset, rarityOffset + 99);

    const xpMaxLevel = levels.reduce((a, b) => a + b, 0)
    let xpTotal = 0;
    let level = 1;

    let xpForNext = Infinity;

    for(let i = 0; i < 100; i++){
        xpTotal += levels[i];

        if(xpTotal > pet.exp){
            xpTotal -= levels[i];
            break;
        }else{
            level++;
        }
    }

    let xpCurrent = Math.floor(pet.exp - xpTotal);
    let progress;

    if(level < 100){
        xpForNext = Math.ceil(levels[level - 1]);
        progress = Math.max(0, Math.min(xpCurrent / xpForNext, 1));
    }else{
        level = 100;
        xpCurrent = pet.exp - levels[99];
        xpForNext = 0;
        progress = 1;
    }

    return {
        level,
        xpCurrent,
        xpForNext,
        progress,
        xpMaxLevel
    };
}

function getFairyBonus(fairyExchanges){
    const bonus = Object.assign({}, constants.stat_template);

    bonus.speed = Math.floor(fairyExchanges / 10);

    for(let i = 0; i < fairyExchanges; i++){
        bonus.strength += (i + 1) % 5 == 0 ? 2 : 1;
        bonus.defense += (i + 1) % 5 == 0 ? 2 : 1;
        bonus.health += 3 + Math.floor(i / 2);
    }

    return bonus;
}

function getBonusStat(level, skill, max, incremention){
    let skill_stats = constants.bonus_stats[skill];
    let steps = Object.keys(skill_stats).sort((a, b) => Number(a) - Number(b)).map(a => Number(a));

    let bonus = Object.assign({}, constants.stat_template);

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

    for(const [index, item] of items.entries()){
        item.isInactive = true;
        item.inBackpack = true;
        item.item_index = index;
    }

    return items;
}

// Process items returned by API
async function getItems(base64, customTextures = false, packs, cacheOnly = false){
    // API stores data as base64 encoded gzipped Minecraft NBT data
    let buf = Buffer.from(base64, 'base64');

    let data = await parseNbt(buf);
    data = nbt.simplify(data);

    let items = data.i;

    // Check backpack contents and add them to the list of items
    for(const [index, item] of items.entries()){
        if(helper.hasPath(item, 'tag', 'display', 'Name') && 
        (item.tag.display.Name.endsWith('Backpack') 
        || item.tag.display.Name.endsWith('New Year Cake Bag') 
        || item.tag.display.Name.endsWith("Builder's Wand") 
        || item.tag.display.Name.endsWith('Basket of Seeds'))){
            let backpackData;

            for(const key of Object.keys(item.tag.ExtraAttributes))
                if(key.endsWith('backpack_data') 
                || key == 'new_year_cake_bag_data' 
                || key == "builder's_wand_data"
                || key == 'basket_of_seeds_data')
                    backpackData = item.tag.ExtraAttributes[key];

            if(!Array.isArray(backpackData))
                continue;

            let backpackContents = await getBackpackContents(backpackData);

            for(const backpackItem of backpackContents)
                backpackItem.backpackIndex = index;

            item.containsItems = [];

            items.push(...backpackContents);
        }
    }

    let index = 0;

    for(const item of items){
        // Set custom texture for colored leather armor
        if(helper.hasPath(item, 'id') && item.id >= 298 && item.id <= 301){
            let color = [149, 94, 59];

            if(helper.hasPath(item, 'tag', 'ExtraAttributes', 'color'))
                color = item.tag.ExtraAttributes.color.split(":");

            const type = ["leather_helmet", "leather_chestplate", "leather_leggings", "leather_boots"][item.id - 298].replace('_', '/');

            item.texture_path = `/${type}/${color.join(',')}`;
        }

        // Set raw display name without color and formatting codes
        if(helper.hasPath(item, 'tag', 'display', 'Name'))
            item.display_name = helper.getRawLore(item.tag.display.Name);

        if(helper.hasPath(item, 'display_name'))
            if(item.display_name == 'Water Bottle')
                item.Damage = 17;

        // Resolve skull textures to their image path
        if(helper.hasPath(item, 'tag', 'SkullOwner', 'Properties', 'textures')
        && Array.isArray(item.tag.SkullOwner.Properties.textures)
        && item.tag.SkullOwner.Properties.textures.length > 0){
            try{
                const json = JSON.parse(Buffer.from(item.tag.SkullOwner.Properties.textures[0].Value, 'base64').toString());
                const url = json.textures.SKIN.url;
                const uuid = url.split("/").pop();

                item.texture_path = `/head/${uuid}?v6`;
            }catch(e){

            }
        }

        if(customTextures){
            const customTexture = await customResources.getTexture(item, false, packs);

            if(customTexture){
                item.animated = customTexture.animated;
                item.texture_path = '/' + customTexture.path;
                item.texture_pack = customTexture.pack.config;
                item.texture_pack.base_path = '/' + path.relative(path.resolve(__dirname, '..', 'public'), customTexture.pack.basePath);
            }
        }

        const enchantments = helper.getPath(item, 'tag', 'ExtraAttributes', 'enchantments') || {};

        let itemLore = helper.getPath(item, 'tag', 'display', 'Lore') || [];
        let lore_raw = [...itemLore];

        let lore = lore_raw != null ? lore_raw.map(a => a = helper.getRawLore(a)) : [];

        // Set HTML lore to be displayed on the website
        if(itemLore.length > 0){
            if(helper.hasPath(item, 'tag', 'ExtraAttributes', 'rarity_upgrades')){
                const { rarity_upgrades } = item.tag.ExtraAttributes;

                if(rarity_upgrades > 0)
                    itemLore.push('§8(Recombobulated)');
            }

            let hasAnvilUses = false;

            if(helper.hasPath(item, 'tag', 'ExtraAttributes', 'anvil_uses')){
                let { anvil_uses } = item.tag.ExtraAttributes;

                let hot_potato_count = 0;

                if('hot_potato_count' in item.tag.ExtraAttributes)
                    ({ hot_potato_count } = item.tag.ExtraAttributes);

                anvil_uses -= hot_potato_count;

                if(anvil_uses > 0){
                    hasAnvilUses = true;

                    itemLore.push('', `§7Anvil Uses: §c${anvil_uses}`);
                }
            }

            if(helper.hasPath(item, 'tag', 'ExtraAttributes', 'expertise_kills')){
                let { expertise_kills } = item.tag.ExtraAttributes;

                if(expertise_kills > 0 && lore_raw){
                    itemLore.push('', `§7Expertise Kills: §c${expertise_kills}`);
                    if (expertise_kills >= 15000)
                        itemLore.push(`§8MAXED OUT!`);
                    else{
                        let toNextLevel = 0;
                        for (const e of constants.expertise_kills_ladder){
                            if(expertise_kills < e){
                                toNextLevel = e - expertise_kills;
                                break;
                            }
                        }
                        itemLore.push(`§8${toNextLevel} kills to tier up!`);}
                }
            }

            if(helper.hasPath(item, 'tag', 'ExtraAttributes', 'timestamp')){
                const { timestamp } = item.tag.ExtraAttributes;

                let obtainmentDate;

                if(!isNaN(timestamp))
                    obtainmentDate = moment(parseInt(timestamp));
                else if(timestamp.includes("AM") || timestamp.includes("PM"))
                    obtainmentDate = moment(timestamp, "M/D/YY h:mm A");
                else
                    obtainmentDate = moment(timestamp, "D/M/YY HH:mm");

                if(!obtainmentDate.isValid())
                    obtainmentDate = moment(timestamp, "M/D/YY HH:mm");

                itemLore.push('', `§7Obtained: §c${obtainmentDate.format("D MMM YYYY")}`);
            }

            if(helper.hasPath(item, 'tag', 'ExtraAttributes', 'spawnedFor')){
                if(!helper.hasPath(item, 'tag', 'ExtraAttributes', 'timestamp'))
                    itemLore.push('');

                const spawnedFor = item.tag.ExtraAttributes.spawnedFor.replace(/\-/g, '');
                const spawnedForUser = await helper.resolveUsernameOrUuid(spawnedFor, db, cacheOnly);

                itemLore.push(`§7By: §c<a href="/stats/${spawnedFor}">${spawnedForUser.display_name}</a>`);
            }
 
            if(helper.hasPath(item, 'tag', 'ExtraAttributes', 'baseStatBoostPercentage')){
                const boost = item.tag.ExtraAttributes.baseStatBoostPercentage;

                itemLore.push('', `§7Dungeon Item Quality: ${boost == 50 ? '§6' : '§c'}${boost}/50%`);
            }

            if(helper.hasPath(item, 'tag', 'ExtraAttributes', 'item_tier')){
                const floor = item.tag.ExtraAttributes.item_tier;

                itemLore.push(`§7Obtained From: §bFloor ${floor}`);
            }

            if(helper.hasPath(item, 'tag', 'ExtraAttributes', 'winning_bid')){
                const price = item.tag.ExtraAttributes.winning_bid;

                itemLore.push(`§7Price Paid at Dark Auction: §b${price.toLocaleString()} coins`);
            }
        }

        let rarity, item_type;

        if(lore.length > 0){
            // Get item type (like "bow") and rarity (like "legendary") from last line of lore
            let rarity_type = lore[lore.length - 1];

            let rarity_type_color = lore_raw[lore_raw.length - 1].charAt(1);

            if(rarity_type.startsWith('a '))
                rarity_type = rarity_type.substring(2).substring(0, rarity_type.length - 4);

            if(rarity_type.startsWith('VERY'))
                rarity_type = rarity_type.substring(5);

            rarity_type = module.exports.splitWithTail(rarity_type, " ", 1);

            rarity = rarity_type[0];

            if(rarity_type.length > 1)
                item_type = rarity_type[1].trim();

            let loreRarity = rarity.toLowerCase(); 
            let colorRarity = loreRarity;

            if(rarity_type_color in constants.rarity_colors)
                colorRarity = constants.rarity_colors[rarity_type_color];

            item.rarity = colorRarity;

            if(loreRarity != colorRarity)
                item.localized = true;
            
            if(item_type)
                item.type = item_type.toLowerCase();

            if(item.type == 'hatccessory')
                item.type = 'accessory';

            if(item.type != null && item.type.startsWith('dungeon'))
                item.Damage = 0;
            
            // fix custom maps texture
            if(item.id == 358){
                item.id = 395;
                item.Damage = 0;
            }

            item.stats = {};

            // Get item stats from lore
            lore.forEach(line => {
                let split = line.split(":");

                if(split.length < 2)
                    return;

                const statType = split[0];
                const statValue = parseFloat(split[1].trim().replace(/,/g, ''));

                switch(statType){
                    case 'Damage':
                        item.stats.damage = statValue;
                        break;
                    case 'Health':
                        item.stats.health = statValue;
                        break;
                    case 'Defense':
                        item.stats.defense = statValue;
                        break;
                    case 'Strength':
                        item.stats.strength = statValue;
                        break;
                    case 'Speed':
                        item.stats.speed = statValue;
                        break;
                    case 'Crit Chance':
                        item.stats.crit_chance = statValue;
                        break;
                    case 'Crit Damage':
                        item.stats.crit_damage = statValue;
                        break;
                    case 'Bonus Attack Speed':
                        item.stats.bonus_attack_speed = statValue;
                        break;
                    case 'Intelligence':
                        item.stats.intelligence = statValue;
                        break;
                    case 'Sea Creature Chance':
                        item.stats.sea_creature_chance = statValue;
                        break;
                    case 'Magic Find':
                        item.stats.magic_find = statValue;
                        break;
                    case 'Pet Luck':
                        item.stats.pet_luck = statValue;
                        break;
                    case 'Ferocity':
                        item.stats.ferocity = statValue;
                        break;
                }
            });

            // Apply Speed Talisman speed bonuses
            if(getId(item) == 'SPEED_TALISMAN')
                item.stats.speed = 1;

            if(getId(item) == 'SPEED_RING')
                item.stats.speed = 3;

            if(getId(item) == 'SPEED_ARTIFACT')
                item.stats.speed = 5;
        }

        // Workaround for detecting item types if another language is set by the player on Hypixel
        if(getId(item) != 'ENCHANTED_BOOK'
        && !constants.item_types.includes(item.type)){
            if('sharpness' in enchantments
            || 'crticial' in enchantments
            || 'ender_slayer' in enchantments
            || 'execute' in enchantments
            || 'first_strike' in enchantments
            || 'giant_killer' in enchantments
            || 'lethality' in enchantments
            || 'life_steal' in enchantments
            || 'looting' in enchantments
            || 'luck' in enchantments
            || 'scavenger' in enchantments
            || 'vampirism' in enchantments
            || 'bane_of_arthropods' in enchantments
            || 'smite' in enchantments)
                item.type = 'sword';

            if('power' in enchantments
            || 'aiming' in enchantments
            || 'infinite_quiver' in enchantments
            || 'power' in enchantments
            || 'snipe' in enchantments
            || 'punch' in enchantments
            || 'flame' in enchantments
            || 'piercing' in enchantments)
                item.type = 'bow';

            if('angler' in enchantments
            || 'blessing' in enchantments
            || 'caster' in enchantments
            || 'frail' in enchantments
            || 'luck_of_the_sea' in enchantments
            || 'lure' in enchantments
            || 'magnet' in enchantments)
                item.type = 'fishing rod';
        }

        if(!helper.hasPath(item, 'display_name') && helper.hasPath(item, 'id')){
            const vanillaItem = mcData.items[item.id];

            if(helper.hasPath(vanillaItem, 'displayName'))
                item.display_name = vanillaItem.displayName;
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

module.exports = {
    splitWithTail: (string, delimiter, count) => {
        let parts = string.split(delimiter);
        let tail = parts.slice(count).join(delimiter);
        let result = parts.slice(0,count);
        result.push(tail);

        return result;
    },

    getBaseStats: () => {
        return constants.base_stats;
    },

    getLevelByXp: (xp, extra = {}) => {
        return getLevelByXp(xp, extra);
    },

    // Get skill bonuses for a specific skill
    getBonusStat: (level, skill, incremention) => {
        let skill_stats = constants.bonus_stats[skill];
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

    getMinions: coopMembers => {
        const minions = [];

        const craftedGenerators = [];

        for(const member in coopMembers){
            if(!('crafted_generators' in coopMembers[member]))
                continue;

            craftedGenerators.push(...coopMembers[member].crafted_generators);
        }

        for(const generator of craftedGenerators){
            const split = generator.split("_");

            const minionLevel = parseInt(split.pop());
            const minionName = split.join("_");

            const minion = minions.filter(a => a.id == minionName);

            if(minion.length == 0)
                minions.push(Object.assign({ id: minionName, maxLevel: 0, levels: [minionLevel] }, constants.minions[minionName]));
            else
                minion[0].levels.push(minionLevel);
        }

        for(const minion in constants.minions)
            if(minions.filter(a => a.id == minion).length == 0)
                minions.push(Object.assign({ id: minion, levels: [], maxLevel: 0 }, constants.minions[minion]));

        for(const minion of minions){
            minion.levels = _.uniq(minion.levels.sort((a, b) => a - b));
            minion.maxLevel = minion.levels.length > 0 ? Math.max(...minion.levels) : 0;

            if(!('name' in minion))
                minion.name = _.startCase(_.toLower(minion.id));
        }

        return minions;
    },

    getMinionSlots: minions => {
        let uniqueMinions = 0;

        for(const minion of minions)
            uniqueMinions += minion.levels.length;

        const output = { currentSlots: 5, toNext: 5 };

        const uniquesRequired = Object.keys(constants.minion_slots).sort((a, b) => parseInt(a) - parseInt(b) );

        for(const [index, uniques] of uniquesRequired.entries()){
            if(parseInt(uniques) <= uniqueMinions)
                continue;

            output.currentSlots = constants.minion_slots[uniquesRequired[index - 1]];
            output.toNextSlot = uniquesRequired[index] - uniqueMinions;
            break;
        }

        return output;
    },

    getItems: async (profile, customTextures = false, packs, cacheOnly = false) => {
        const output = {};

        // Process inventories returned by API
        let armor = 'inv_armor' in profile ? await getItems(profile.inv_armor.data, customTextures, packs, cacheOnly) : [];
        let inventory = 'inv_contents' in profile ? await getItems(profile.inv_contents.data, customTextures, packs, cacheOnly) : [];
        let wardrobe_inventory = 'wardrobe_contents' in profile ? await getItems(profile.wardrobe_contents.data, customTextures, packs, cacheOnly) : [];
        let enderchest = 'ender_chest_contents' in profile ? await getItems(profile.ender_chest_contents.data, customTextures, packs, cacheOnly) : [];
        let talisman_bag = 'talisman_bag' in profile ? await getItems(profile.talisman_bag.data, customTextures, packs, cacheOnly) : [];
        let fishing_bag = 'fishing_bag' in profile ? await getItems(profile.fishing_bag.data, customTextures, packs, cacheOnly) : [];
        let quiver = 'quiver' in profile ? await getItems(profile.quiver.data, customTextures, packs, cacheOnly) : [];
        let potion_bag = 'potion_bag' in profile ? await getItems(profile.potion_bag.data, customTextures, packs, cacheOnly) : [];
        let candy_bag = 'candy_inventory_contents' in profile ? await getItems(profile.candy_inventory_contents.data, customTextures, packs, cacheOnly) : [];
        let personal_vault = 'personal_vault_contents' in profile ? await getItems(profile.personal_vault_contents.data, customTextures, packs, cacheOnly) : [];

        const wardrobeColumns = wardrobe_inventory.length / 4;

        let wardrobe = [];

        for(let i = 0; i < wardrobeColumns; i++){
            let page = Math.floor(i / 9);

            let wardrobeSlot = [];

            for(let j = 0; j < 4; j++){
                let index = (36 * page) + (i % 9) + (j * 9);

                if(getId(wardrobe_inventory[index]).length > 0)
                    wardrobeSlot.push(wardrobe_inventory[index]);
                else
                    wardrobeSlot.push(null);
            }

            if(wardrobeSlot.filter(a => a !== null).length > 0)
                wardrobe.push(wardrobeSlot);
        }

        output.armor = armor.filter(a => Object.keys(a).length != 0);
        output.wardrobe = wardrobe;
        output.wardrobe_inventory = wardrobe_inventory;
        output.inventory = inventory;
        output.enderchest = enderchest;
        output.talisman_bag = talisman_bag;
        output.fishing_bag = fishing_bag;
        output.quiver = quiver;
        output.potion_bag = potion_bag;
        output.personal_vault = personal_vault;

        const all_items = armor.concat(inventory, enderchest, talisman_bag, fishing_bag, quiver, potion_bag, personal_vault, wardrobe_inventory);

        for(const [index, item] of all_items.entries()){
            item.item_index = index;
            item.itemId = v4('itemId');

            if('containsItems' in item && Array.isArray(item.containsItems))
                item.containsItems.forEach(a => { a.backpackIndex = item.item_index; a.itemId = v4('itemId'); });
        }

        // All items not in the inventory or accessory bag should be inactive so they don't contribute to the total stats
        enderchest = enderchest.map(a => Object.assign({ isInactive: true}, a) );

        // Add candy bag contents as backpack contents to candy bag
        for(let item of all_items){
            if(getId(item) == 'TRICK_OR_TREAT_BAG')
                item.containsItems = candy_bag;
        }

        const talismans = [];
        const talisman_ids = [];

        // Modify talismans on armor and add
        for(const talisman of armor.filter(a => a.type == 'accessory')){
            const id = getId(talisman);

            if(id === "")
                continue;

            const insertTalisman = Object.assign({ isUnique: true, isInactive: false }, talisman);

            if(talismans.filter(a => !a.isInactive && getId(a) == id).length > 0)
                insertTalisman.isInactive = true;

            if(talismans.filter(a => getId(a) == id).length > 0)
                insertTalisman.isUnique = false;

            talismans.push(insertTalisman);
            talisman_ids.push(id);
        }

        // Add talismans from inventory
        for(const talisman of inventory.filter(a => a.type == 'accessory' || a.type == 'dungeon accessory')){
            const id = getId(talisman);

            if(id === "")
                continue;

            const insertTalisman = Object.assign({ isUnique: true, isInactive: false }, talisman);

            if(talismans.filter(a => !a.isInactive && getId(a) == id).length > 0)
                insertTalisman.isInactive = true;

            if(talismans.filter(a => getId(a) == id).length > 0)
                insertTalisman.isUnique = false;

            talismans.push(insertTalisman);
            talisman_ids.push(id);
        }

        // Add talismans from accessory bag if not already in inventory
        for(const talisman of talisman_bag){
            const id = getId(talisman);

            if(id === "")
                continue;

            const insertTalisman = Object.assign({ isUnique: true, isInactive: false }, talisman);

            if(talismans.filter(a => !a.isInactive && getId(a) == id).length > 0)
                insertTalisman.isInactive = true;

            if(talismans.filter(a => getId(a) == id).length > 0)
                insertTalisman.isUnique = false;

            talismans.push(insertTalisman);
            talisman_ids.push(id);
        }

        // Add inactive talismans from enderchest and backpacks
        for(const item of inventory.concat(enderchest)){
            let items = [item];

            if(item.type != 'accessory' && 'containsItems' in item && Array.isArray(item.containsItems))
                items = item.containsItems.slice(0);

            for(const talisman of items.filter(a => a.type == 'accessory')){
                const id = getId(talisman);

                const insertTalisman = Object.assign({ isUnique: true, isInactive: true }, talisman);

                if(talismans.filter(a => getId(a) == id).length > 0)
                    insertTalisman.isUnique = false;

                talismans.push(insertTalisman);
                talisman_ids.push(id);
            }
        }

        // Don't account for lower tier versions of the same talisman
        for(const talisman of talismans.concat(armor)){
            const id = getId(talisman);

            if(id.startsWith("CAMPFIRE_TALISMAN_")){
                const tier = parseInt(id.split("_").pop());

                const maxTier = Math.max(...talismans.filter(a => getId(a).startsWith("CAMPFIRE_TALISMAN_")).map(a => getId(a).split("_").pop()));

                if(tier < maxTier){
                    talisman.isUnique = false;
                    talisman.isInactive = true;
                }
                talisman_ids.splice(talisman_ids.indexOf(id), 1, "CAMPFIRE_TALISMAN_");
            }

            if(id.startsWith("WEDDING_RING_")){
                const tier = parseInt(id.split("_").pop());

                const maxTier = Math.max(...talismans.filter(a => getId(a).startsWith("WEDDING_RING_")).map(a => getId(a).split("_").pop()));

                if(tier < maxTier){
                    talisman.isUnique = false;
                    talisman.isInactive = true;
                }
                talisman_ids.splice(talisman_ids.indexOf(id), 1, "WEDDING_RING_");
            }

            if(id in constants.talisman_upgrades){
                const talismanUpgrades = constants.talisman_upgrades[id];

                if(talismans.filter(a => !a.isInactive && talismanUpgrades.includes(getId(a))).length > 0)
                    talisman.isInactive = true;

                if(talismans.filter(a => talismanUpgrades.includes(getId(a))).length > 0)
                    talisman.isUnique = false;
            }

            if(id in constants.talisman_duplicates){
                const talismanDuplicates = constants.talisman_duplicates[id];

                if(talismans.filter(a => talismanDuplicates.includes(getId(a))).length > 0)
                    talisman.isUnique = false;
            }
        }

        // Add New Year Cake Bag health bonus (1 per unique cake)
        for(let talisman of talismans){
            let id = getId(talisman);
            let cakes = [];

            if(id == 'NEW_YEAR_CAKE_BAG' && helper.hasPath(talisman, 'containsItems') && Array.isArray(talisman.containsItems)){
                talisman.stats.health = 0;

                for(const item of talisman.containsItems){
                    if(helper.hasPath(item, 'tag', 'ExtraAttributes', 'new_years_cake') && !cakes.includes(item.tag.ExtraAttributes.new_years_cake)){
                        talisman.stats.health++;
                        cakes.push(item.tag.ExtraAttributes.new_years_cake);
                    }
                }
            }
        }

        
        for(const talisman of talismans){
            talisman.base_name = talisman.display_name;

            if(helper.hasPath(talisman, 'tag', 'ExtraAttributes', 'modifier')){
                talisman.base_name = talisman.display_name.split(" ").slice(1).join(" ");
                talisman.reforge = talisman.tag.ExtraAttributes.modifier
            }
        }

        output.talismans = talismans;
        output.talisman_ids = talisman_ids;
        output.weapons = all_items.filter(a => a.type != null && (a.type.endsWith('sword') || a.type.endsWith('bow')));
        output.rods =  all_items.filter(a => a.type != null && a.type.endsWith('fishing rod'));

        for(const item of all_items){
            if(!Array.isArray(item.containsItems))
                continue;

            output.weapons.push(...item.containsItems.filter(a => a.type != null && (a.type.endsWith('sword') || a.type.endsWith('bow'))));
            output.rods.push(...item.containsItems.filter(a => a.type != null && a.type.endsWith('fishing rod')));
        }

        // Check if inventory access disabled by user
        if(inventory.length == 0)
            output.no_inventory = true;

        // Same for personal vault
        if(personal_vault.length == 0)
            output.no_personal_vault = true;

        // Sort talismans, weapons and rods by rarity
        output.weapons = output.weapons.sort((a, b) => {
            if(a.rarity == b.rarity){
                if(b.inBackpack)
                    return -1;

                return a.item_index > b.item_index ? 1 : -1;
            }

            return rarity_order.indexOf(a.rarity) - rarity_order.indexOf(b.rarity)
        });

        output.rods = output.rods.sort((a, b) => {
            if(a.rarity == b.rarity){
                if(b.inBackpack)
                    return -1;

                return a.item_index > b.item_index ? 1 : -1;
            }

            return rarity_order.indexOf(a.rarity) - rarity_order.indexOf(b.rarity)
        });

        const countsOfId = {};

        for(const weapon of output.weapons){
            const id = getId(weapon);

            countsOfId[id] = (countsOfId[id] || 0) + 1;

            if(countsOfId[id] > 2)
                weapon.hidden = true;
        }

        output.talismans = output.talismans.sort((a, b) => {
            const rarityOrder = rarity_order.indexOf(a.rarity) - rarity_order.indexOf(b.rarity);

            if(rarityOrder == 0)
                return (a.isInactive === b.isInactive) ? 0 : a.isInactive? 1 : -1;

            return rarityOrder;
        });

        let swords = output.weapons.filter(a => a.type == 'sword');
        let bows = output.weapons.filter(a => a.type == 'bow');

        let swordsInventory = swords.filter(a => a.backpackIndex === undefined);
        let bowsInventory = bows.filter(a => a.backpackIndex === undefined);
        let rodsInventory = output.rods.filter(a => a.backpackIndex === undefined);

        if(swords.length > 0)
            output.highest_rarity_sword = swordsInventory.filter(a =>  a.rarity == swordsInventory[0].rarity).sort((a, b) => a.item_index - b.item_index)[0];

        if(bows.length > 0)
            output.highest_rarity_bow = bowsInventory.filter(a => a.rarity == bowsInventory[0].rarity).sort((a, b) => a.item_index - b.item_index)[0];

        if(output.rods.length > 0)
            output.highest_rarity_rod = rodsInventory.filter(a => a.rarity == rodsInventory[0].rarity).sort((a, b) => a.item_index - b.item_index)[0];

        if(armor.filter(a => Object.keys(a).length > 2).length == 1){
            const armorPiece = armor.filter(a => Object.keys(a).length > 2)[0];

            output.armor_set = armorPiece.display_name;
            output.armor_set_rarity = armorPiece.rarity;
        }

        if(armor.filter(a => Object.keys(a).length > 2).length == 4){

            let output_name = "";
            let reforgeName;

            armor.forEach(armorPiece => {
                let name = armorPiece.display_name.replace(/\✪/g, '').trim();

                if(helper.hasPath(armorPiece, 'tag', 'ExtraAttributes', 'modifier'))
                    name = name.split(" ").slice(1).join(" ");

                armorPiece.armor_name = name;
            });

            if(armor.filter(a => helper.hasPath(a, 'tag', 'ExtraAttributes', 'modifier')
            && a.tag.ExtraAttributes.modifier == armor[0].tag.ExtraAttributes.modifier).length == 4)
                reforgeName = armor[0].display_name.split(" ")[0]

            const isMonsterSet = armor
            .filter(a =>
                ['SKELETON_HELMET', 'GUARDIAN_CHESTPLATE', 'CREEPER_LEGGINGS', 'SPIDER_BOOTS', 'TARANTULA_BOOTS'].includes(getId(a))
            ).length == 4;

            const isPerfectSet = armor
            .filter(a =>
                getId(a).startsWith('PERFECT_')
            ).length == 4;

            const isSpongeSet = armor
            .filter(a =>
                getId(a).startsWith('SPONGE_')
            ).length == 4;

            if(armor.filter(a => a.armor_name.split(" ")[0] == armor[0].armor_name.split(" ")[0]).length == 4
            || isMonsterSet){
                let base_name = armor[0].armor_name.split(" ");
                base_name.pop();

                output_name += base_name.join(" ");

                if(!output_name.endsWith("Armor") && !output_name.startsWith("Armor"))
                    output_name += " Armor";

                output.armor_set = output_name;
                output.armor_set_rarity = armor[0].rarity;

                if(isMonsterSet){
                    output.armor_set_rarity = 'rare';

                    if(getId(armor[0]) == 'SPIDER_BOOTS')
                        output.armor_set = 'Monster Hunter Armor';

                    if(getId(armor[0]) == 'TARANTULA_BOOTS')
                        output.armor_set = 'Monster Raider Armor';
                }

                if(isPerfectSet){
                    const sameTier = armor.filter(a => getId(a).split("_").pop() == getId(armor[0]).split("_").pop()).length == 4;

                    if(sameTier)
                        output.armor_set = 'Perfect Armor - Tier ' + getId(armor[0]).split("_").pop();
                    else
                        output.armor_set = 'Perfect Armor';
                }

                if(isSpongeSet)
                    output.armor_set = 'Sponge Armor';

                if(reforgeName)
                    output.armor_set = reforgeName + " " + output.armor_set;
            }
        }

        return output;
    },

    getLevels: async (userProfile, hypixelProfile) => {
        let output = {};

        let skillLevels;
        let totalSkillXp = 0;
        let average_level = 0;

        // Apply skill bonuses
        if(helper.hasPath(userProfile, 'experience_skill_taming')
        || helper.hasPath(userProfile, 'experience_skill_farming')
        || helper.hasPath(userProfile, 'experience_skill_mining')
        || helper.hasPath(userProfile, 'experience_skill_combat')
        || helper.hasPath(userProfile, 'experience_skill_foraging')
        || helper.hasPath(userProfile, 'experience_skill_fishing')
        || helper.hasPath(userProfile, 'experience_skill_enchanting')
        || helper.hasPath(userProfile, 'experience_skill_alchemy')
        || helper.hasPath(userProfile, 'experience_skill_carpentry')
        || helper.hasPath(userProfile, 'experience_skill_runecrafting')){
            let average_level_no_progress = 0;

            skillLevels = {
                taming: getLevelByXp(userProfile.experience_skill_taming || 0, {skill: "taming"}),
                farming: getLevelByXp(userProfile.experience_skill_farming || 0, {skill: "farming", cap: hypixelProfile.achievements.skyblock_harvester || 0}),
                mining: getLevelByXp(userProfile.experience_skill_mining || 0, {skill: "mining"}),
                combat: getLevelByXp(userProfile.experience_skill_combat || 0, {skill: "combat"}),
                foraging: getLevelByXp(userProfile.experience_skill_foraging || 0, {skill: "foraging"}),
                fishing: getLevelByXp(userProfile.experience_skill_fishing || 0, {skill: "fishing"}),
                enchanting: getLevelByXp(userProfile.experience_skill_enchanting || 0, {skill: "enchanting"}),
                alchemy: getLevelByXp(userProfile.experience_skill_alchemy || 0, {skill: "alchemy"}),
                carpentry: getLevelByXp(userProfile.experience_skill_carpentry || 0, {skill: "carpentry"}),
                runecrafting: getLevelByXp(userProfile.experience_skill_runecrafting || 0, {skill: "runecrafting", type: "runecrafting"}),
            };

            for(let skill in skillLevels){
                if(skill != 'runecrafting' && skill != 'carpentry'){
                    average_level += skillLevels[skill].level + skillLevels[skill].progress;
                    average_level_no_progress += skillLevels[skill].level;

                    totalSkillXp += skillLevels[skill].xp;
                }
            }

            output.average_level = (average_level / (Object.keys(skillLevels).length - 2));
            output.average_level_no_progress = (average_level_no_progress / (Object.keys(skillLevels).length - 2));
            output.total_skill_xp = totalSkillXp;

            output.levels = Object.assign({}, skillLevels);
        }else{
            skillLevels = {
                farming: hypixelProfile.achievements.skyblock_harvester || 0,
                mining: hypixelProfile.achievements.skyblock_excavator || 0,
                combat: hypixelProfile.achievements.skyblock_combat || 0,
                foraging: hypixelProfile.achievements.skyblock_gatherer || 0,
                fishing: hypixelProfile.achievements.skyblock_angler || 0,
                enchanting: hypixelProfile.achievements.skyblock_augmentation || 0,
                alchemy: hypixelProfile.achievements.skyblock_concoctor || 0,
                taming: hypixelProfile.achievements.skyblock_domesticator || 0,
            };

            output.levels = {};

            let skillsAmount = 0;

            for(const skill in skillLevels){
                output.levels[skill] = getXpByLevel(skillLevels[skill], {skill: skill});

                if(skillLevels[skill] < 0)
                    continue;

                skillsAmount++;
                average_level += output.levels[skill].level;

                totalSkillXp += output.levels[skill].xp;
            }

            output.average_level = (average_level / skillsAmount);
            output.average_level_no_progress = output.average_level;
            output.total_skill_xp = totalSkillXp;
        }

        const multi = redisClient.pipeline();

        const skillNames = Object.keys(output.levels);

        for(const skill of skillNames){
            if(output.levels[skill].xp == null){
                output.levels[skill].rank = 100000;
                continue;
            }

            multi.zcount(`lb_skill_${skill}_xp`, output.levels[skill].xp, '+inf');
        }

        const results = await multi.exec();

        for(const [index, skill] of skillNames.entries()){
            output.levels[skill].rank = results[index][1];
        }

        output.average_level_rank = await redisClient.zcount([`lb_average_level`, output.average_level, '+inf']);

        return output;
    },

    getStats: async (db, profile, allProfiles, items, cacheOnly = false) => {
        let output = {};

        const userProfile = profile.members[profile.uuid];
        const hypixelProfile = await helper.getRank(profile.uuid, db, cacheOnly);

        output.stats = Object.assign({}, constants.base_stats);

        if(isNaN(userProfile.fairy_souls_collected))
            userProfile.fairy_souls_collected = 0;

        output.fairy_bonus = {};

        if(userProfile.fairy_exchanges > 0){
            const fairyBonus = getFairyBonus(userProfile.fairy_exchanges);

            output.fairy_bonus = Object.assign({}, fairyBonus);

            // Apply fairy soul bonus
            for(let stat in fairyBonus)
                output.stats[stat] += fairyBonus[stat];
        }

        output.fairy_souls = { collected: userProfile.fairy_souls_collected, total: MAX_SOULS, progress: Math.min(userProfile.fairy_souls_collected / MAX_SOULS, 1) };

        const { levels, average_level, average_level_no_progress, total_skill_xp, average_level_rank } = await module.exports.getLevels(userProfile, hypixelProfile);

        output.levels = levels;
        output.average_level = average_level;
        output.average_level_no_progress = average_level_no_progress;
        output.total_skill_xp = total_skill_xp;
        output.average_level_rank = average_level_rank;

        output.skill_bonus = {};

        for(let skill in levels){
            if(levels[skill].level == 0)
                continue;

            const skillBonus = getBonusStat(levels[skill].level || levels[skill], `${skill}_skill`, 50, 1);

            output.skill_bonus[skill] = Object.assign({}, skillBonus);

            for(const stat in skillBonus)
                output.stats[stat] += skillBonus[stat];
        }

        output.slayer_coins_spent = {};

        // Apply slayer bonuses
        if('slayer_bosses' in userProfile){
            output.slayer_bonus = {};

            let slayers = {};

            if(helper.hasPath(userProfile, 'slayer_bosses')){
                for(const slayerName in userProfile.slayer_bosses){
                    const slayer = userProfile.slayer_bosses[slayerName];

                    slayers[slayerName] = {};

                    if(!helper.hasPath(slayer, 'claimed_levels'))
                        continue;

                    slayers[slayerName].level = getSlayerLevel(slayer, slayerName);

                    slayers[slayerName].kills = {};

                    for(const property in slayer){
                        slayers[slayerName][property] = slayer[property];

                        if(property.startsWith('boss_kills_tier_')){
                            const tier = parseInt(property.replace('boss_kills_tier_', '')) + 1;

                            slayers[slayerName].kills[tier] = slayer[property];

                            output.slayer_coins_spent[slayerName] = (output.slayer_coins_spent[slayerName] || 0) + slayer[property] * constants.slayer_cost[tier];
                        }
                    }
                }

                for(const slayerName in output.slayer_coins_spent){
                    output.slayer_coins_spent.total = (output.slayer_coins_spent.total || 0) + output.slayer_coins_spent[slayerName];
                }

                output.slayer_coins_spent.total = output.slayer_coins_spent.total || 0;
            }

            output.slayer_xp = 0;

            for(const slayer in slayers){
                if(!helper.hasPath(slayers[slayer], 'level', 'currentLevel'))
                    continue;

                const slayerBonus = getBonusStat(slayers[slayer].level.currentLevel, `${slayer}_slayer`, 9, 1);

                output.slayer_bonus[slayer] = Object.assign({}, slayerBonus);

                output.slayer_xp += slayers[slayer].xp || 0;

                for(let stat in slayerBonus)
                    output.stats[stat] += slayerBonus[stat];
            }

            output.slayers = Object.assign({}, slayers);
        }

        if(!items.no_inventory){
            output.missingTalismans = await module.exports.getMissingTalismans(items.talisman_ids);
            output.talismanCount = await module.exports.getTalismanCount();
        }

        output.pets = await module.exports.getPets(userProfile);
        output.missingPets = await module.exports.getMissingPets(output.pets);
        output.petScore = await module.exports.getPetScore(output.pets);

        const petScoreRequired = Object.keys(constants.pet_rewards).sort((a, b) => parseInt(b) - parseInt(a) );

        output.pet_bonus = {};

        for(const [index, score] of petScoreRequired.entries()){
            if(parseInt(score) > output.petScore)
                continue;

            output.pet_score_bonus = Object.assign({}, constants.pet_rewards[score]);

            break;
        }

        let activePet = false;
        for(const pet of output.pets){
            if(!pet.active)
                continue;
            
            activePet = pet;
            for(const stat in pet.stats)
                output.pet_bonus[stat] = (output.pet_bonus[stat] || 0) + pet.stats[stat];
        }

        // Apply all harp bonuses when Melody's Hair has been acquired
        if(items.talismans.filter(a => getId(a) == 'MELODY_HAIR').length == 1)
            output.stats.intelligence += 26;

        // Apply pet score bonus
        for(const stat in output.pet_score_bonus)
            output.stats[stat] += output.pet_score_bonus[stat];

        output.base_stats = Object.assign({}, output.stats);

        // Apply stats from pets
        for(const stat in output.pet_bonus)
            output.stats[stat] += output.pet_bonus[stat];

        // Apply Lapis Armor full set bonus of +60 HP
        if(items.armor.filter(a => getId(a).startsWith('LAPIS_ARMOR_')).length == 4)
            items.armor[0].stats.health = (items.armor[0].stats.health || 0) + 60;

        // Apply Emerald Armor full set bonus of +1 HP and +1 Defense per 3000 emeralds in collection with a maximum of 300
        if(helper.hasPath(userProfile, 'collection', 'EMERALD')
        && !isNaN(userProfile.collection.EMERALD)
        && items.armor.filter(a => getId(a).startsWith('EMERALD_ARMOR_')).length == 4){
            let emerald_bonus = Math.min(350, Math.floor(userProfile.collection.EMERALD / 3000));

            items.armor[0].stats.health += emerald_bonus;
            items.armor[0].stats.defense += emerald_bonus;
        }

        // Apply Fairy Armor full set bonus of +10 Speed
        if(items.armor.filter(a => getId(a).startsWith('FAIRY_')).length == 4)
            items.armor[0].stats.speed += 10;

        // Apply Speedster Armor full set bonus of +20 Speed
        if(items.armor.filter(a => getId(a).startsWith('SPEEDSTER_')).length == 4)
            items.armor[0].stats.speed += 20;

        // Apply Young Dragon Armor full set bonus of +70 Speed
        if(items.armor.filter(a => getId(a).startsWith('YOUNG_DRAGON_')).length == 4)
            items.armor[0].stats.speed += 70;

        // Apply basic armor stats
        for(const item of items.armor){
            if(item.isInactive || item.type == 'accessory'){
                item.stats = {};

                if(getId(item) != 'PARTY_HAT_CRAB')
                    continue;

                for(const lore of item.tag.display.Lore){
                    const line = helper.getRawLore(lore);

                    if(line.startsWith('Your bonus: ')){
                        item.stats.intelligence = parseInt(line.split(' ')[2].substring(1));

                        break;
                    }
                }
            }

            for(let stat in item.stats)
                output.stats[stat] += item.stats[stat];
        }

        // Apply stats of active talismans
        items.talismans.filter(a => Object.keys(a).length != 0 && !a.isInactive).forEach(item => {
            for(let stat in item.stats)
                output.stats[stat] += item.stats[stat];
        });

        // Apply Mastiff Armor full set bonus of +50 HP per 1% Crit Damage
        if(items.armor.filter(a => getId(a).startsWith('MASTIFF_')).length == 4){
            output.stats.health += 50 * output.stats.crit_damage;
            items.armor[0].stats.health += 50 * output.stats.crit_damage;
        }

        // Apply +5 Defense and +5 Strength of Day/Night Crystal only if both are owned as this is required for a permanent bonus
        if(items.talismans.filter(a => !a.isInactive && ["DAY_CRYSTAL", "NIGHT_CRYSTAL"].includes(getId(a))).length == 2){
            output.stats.defense += 5;
            output.stats.strength += 5;

            const dayCrystal = items.talismans.filter(a => getId(a) == 'DAY_CRYSTAL')[0];

            dayCrystal.stats.defense = (dayCrystal.stats.defense || 0) + 5;
            dayCrystal.stats.strength = (dayCrystal.stats.strength || 0) + 5;
        }

        // Apply Obsidian Chestplate bonus of +1 Speed per 20 Obsidian in inventory
        if(items.armor.filter(a => getId(a) == 'OBSIDIAN_CHESTPLATE').length == 1){
            let obsidian = 0;

            for(let item of items.inventory){
                if(item.id == 49)
                    obsidian += item.Count;
            }

            output.stats.speed += Math.floor(obsidian / 20);
        }

        if(items.armor.filter(a => getId(a).startsWith('CHEAP_TUXEDO_')).length == 3)
            output.stats['health'] = 75;

        if(items.armor.filter(a => getId(a).startsWith('FANCY_TUXEDO_')).length == 3)
            output.stats['health'] = 150;

        if(items.armor.filter(a => getId(a).startsWith('ELEGANT_TUXEDO_')).length == 3)
            output.stats['health'] = 250;

        output.weapon_stats = {};

        for(const item of items.weapons.concat(items.rods)){
            let stats = Object.assign({}, output.stats);

            // Apply held weapon stats
            for(let stat in item.stats){
                stats[stat] += item.stats[stat];
            }

            // Add crit damage from held weapon to Mastiff Armor full set bonus
            if(item.stats.crit_damage > 0 && items.armor.filter(a => getId(a).startsWith('MASTIFF_')).length == 4)
                stats.health += 50 * item.stats.crit_damage;

            // Apply Superior Dragon Armor full set bonus of 5% stat increase
            if(items.armor.filter(a => getId(a).startsWith('SUPERIOR_DRAGON_')).length == 4)
                for(const stat in stats)
                    stats[stat] *= 1.05;

            for(let i = 0; i < items.armor.filter(a => helper.getPath(a, 'tag', 'ExtraAttributes', 'modifier') == 'renowned').length; i++){
                for(const stat in stats)
                    stats[stat] *= 1.01;
            }

            if(items.armor.filter(a => getId(a).startsWith('CHEAP_TUXEDO_')).length == 3)
                stats['health'] = 75;

            if(items.armor.filter(a => getId(a).startsWith('FANCY_TUXEDO_')).length == 3)
                stats['health'] = 150;

            if(items.armor.filter(a => getId(a).startsWith('ELEGANT_TUXEDO_')).length == 3)
                stats['health'] = 250;

            output.weapon_stats[item.itemId] = stats;

            // Stats shouldn't go into negative
            for(let stat in stats)
                output.weapon_stats[item.itemId][stat] = Math.max(0, Math.round(stats[stat]));

            stats.effective_health = getEffectiveHealth(stats.health, stats.defense);
        }

        const superiorBonus = Object.assign({}, constants.stat_template);

        // Apply Superior Dragon Armor full set bonus of 5% stat increase
        if(items.armor.filter(a => getId(a).startsWith('SUPERIOR_DRAGON_')).length == 4){
            for(const stat in output.stats)
                superiorBonus[stat] = output.stats[stat] * 0.05;

            for(const stat in superiorBonus){
                output.stats[stat] += superiorBonus[stat];

                if(!(stat in items.armor[0].stats))
                    items.armor[0].stats[stat] = 0;

                items.armor[0].stats[stat] += superiorBonus[stat];
            }
        }

        const renownedBonus = Object.assign({}, constants.stat_template);

        for(const item of items.armor){
            if(helper.getPath(item, 'tag', 'ExtraAttributes', 'modifier') == 'renowned'){
                for(const stat in output.stats){
                    renownedBonus[stat] += output.stats[stat] * 0.01;

                    output.stats[stat] *= 1.01;
                }
            }
        }

        if(items.armor[0] != null && helper.hasPath(items.armor[0], 'stats')){
            for(const stat in renownedBonus){
                if(!(stat in items.armor[0].stats))
                    items.armor[0].stats[stat] = 0;

                items.armor[0].stats[stat] += renownedBonus[stat];
            }
        }

        // Modify stats based off of pet ability
        if (activePet) // hacky, ik; someone who is smarter than me fix this in the js correct way
            activePet.ref.modifyStats(output.stats);

        // Stats shouldn't go into negative
        for(let stat in output.stats)
            output.stats[stat] = Math.max(0, Math.round(output.stats[stat]));

        output.stats.effective_health = getEffectiveHealth(output.stats.health, output.stats.defense);

        let killsDeaths = [];

        for(let stat in userProfile.stats){
            if(stat.startsWith("kills_") && userProfile.stats[stat] > 0)
                killsDeaths.push({ type: 'kills', entityId: stat.replace("kills_", ""), amount: userProfile.stats[stat] });

            if(stat.startsWith("deaths_") && userProfile.stats[stat] > 0)
                killsDeaths.push({ type: 'deaths', entityId: stat.replace("deaths_", ""), amount: userProfile.stats[stat] });
        }

        for(const stat of killsDeaths){
            let { entityId } = stat;

            if(entityId in constants.mob_names){
                stat.entityName = constants.mob_names[entityId];
                continue;
            }

            let entityName = "";

            entityId.split("_").forEach((split, index) => {
                entityName += split.charAt(0).toUpperCase() + split.slice(1);

                if(index < entityId.split("_").length - 1)
                    entityName += " ";
            });

            stat.entityName = entityName;
        }

        if('kills_guardian_emperor' in userProfile.stats || 'kills_skeleton_emperor' in userProfile.stats)
            killsDeaths.push({
                type: 'kills',
                entityId: 'sea_emperor',
                entityName: 'Sea Emperor',
                amount: (userProfile.stats['kills_guardian_emperor'] || 0) + (userProfile.stats['kills_skeleton_emperor'] || 0)
            });

        if('kills_chicken_deep' in userProfile.stats || 'kills_zombie_deep' in userProfile.stats)
            killsDeaths.push({
                type: 'kills',
                entityId: 'monster_of_the_deep',
                entityName: 'Monster of the Deep',
                amount: (userProfile.stats['kills_chicken_deep'] || 0) + (userProfile.stats['kills_zombie_deep'] || 0)
            });

        killsDeaths = killsDeaths.filter(a => {
            return ![
                'guardian_emperor',
                'skeleton_emperor',
                'chicken_deep',
                'zombie_deep'
            ].includes(a.entityId);
        });

        output.kills = killsDeaths.filter(a => a.type == 'kills').sort((a, b) => b.amount - a.amount);
        output.deaths = killsDeaths.filter(a => a.type == 'deaths').sort((a, b) => b.amount - a.amount);

        const playerObject = await helper.resolveUsernameOrUuid(profile.uuid, db, cacheOnly);

        output.display_name = playerObject.display_name;

        if('wardrobe_equipped_slot' in userProfile)
            output.wardrobe_equipped_slot = userProfile.wardrobe_equipped_slot;

        const userInfo = await db
        .collection('usernames')
        .findOne({ uuid: profile.uuid });

        const members = await Promise
        .all(
            Object.keys(profile.members).map(a => helper.resolveUsernameOrUuid(a, db, cacheOnly))
        );

        if(userInfo){
            output.display_name = userInfo.username;

            members.push({
                uuid: profile.uuid,
                display_name: userInfo.username
            });

            if('emoji' in userInfo)
                output.display_emoji = userInfo.emoji;
            
            if('emojiImg' in userInfo)
                output.display_emoji_img = userInfo.emojiImg;
            if (userInfo.username == "jjww2") {
                output.display_emoji = randomEmoji();
            }
        }

        for(const member of members){
            if(!helper.hasPath(profile, 'members', member.uuid, 'last_save'))
                continue;

            const last_updated = profile.members[member.uuid].last_save;

            member.last_updated = {
                unix: last_updated,
                text: (Date.now() - last_updated) < 7 * 60 * 1000 ? 'currently online' : `last played ${moment(last_updated).fromNow()}`
            };
        }

        if(helper.hasPath(profile, 'banking', 'balance'))
            output.bank = profile.banking.balance;

        output.guild = await helper.getGuild(profile.uuid, db, cacheOnly);

        output.rank_prefix = helper.renderRank(hypixelProfile);
        output.purse = userProfile.coin_purse || 0;
        output.uuid = profile.uuid;
        output.skin_data = playerObject.skin_data;

        output.profile = { profile_id: profile.profile_id, cute_name: profile.cute_name, game_mode: profile.game_mode };
        output.profiles = {};

        for(const sbProfile of allProfiles.filter(a => a.profile_id != profile.profile_id)){
            if(!helper.hasPath(sbProfile, 'members', profile.uuid, 'last_save'))
                continue;

            output.profiles[sbProfile.profile_id] = {
                profile_id: sbProfile.profile_id,
                cute_name: sbProfile.cute_name,
                game_mode: sbProfile.game_mode,
                last_updated: {
                    unix: sbProfile.members[profile.uuid].last_save,
                    text: `last played ${moment(sbProfile.members[profile.uuid].last_save).fromNow()}`
                }
            };
        }

        output.members = members.filter(a => a.uuid != profile.uuid);
        output.minions = module.exports.getMinions(profile.members);
        output.minion_slots = module.exports.getMinionSlots(output.minions);
        output.collections = await module.exports.getCollections(profile.uuid, profile, cacheOnly);
        output.bag_sizes = await module.exports.getBagSizes(output.collections);
        output.social = hypixelProfile.socials;

        output.dungeons = await module.exports.getDungeons(userProfile, hypixelProfile);

        output.fishing = {
            total: userProfile.stats.items_fished || 0,
            treasure: userProfile.stats.items_fished_treasure || 0,
            treasure_large: userProfile.stats.items_fished_large_treasure || 0,
            shredder_fished: userProfile.stats.shredder_fished || 0,
            shredder_bait: userProfile.stats.shredder_bait || 0,
        };

        const misc = {};

        misc.milestones = {};
        misc.races = {};
        misc.gifts = {};
        misc.winter = {};
        misc.dragons = {};
        misc.protector = {};
        misc.damage = {};
        misc.burrows = {};
        misc.profile_upgrades = {};
        misc.auctions_sell = {};
        misc.auctions_buy = {};
        misc.claimed_items = {};

        if('ender_crystals_destroyed' in userProfile.stats)
            misc.dragons['ender_crystals_destroyed'] = userProfile.stats['ender_crystals_destroyed'];

        misc.dragons['last_hits'] = 0;
        misc.dragons['deaths'] = 0;

        if(hypixelProfile.claimed_items)
            misc.claimed_items = hypixelProfile.claimed_items;

        const burrows = [
            "mythos_burrows_dug_next", 
            "mythos_burrows_dug_combat", 
            "mythos_burrows_dug_treasure", 
            "mythos_burrows_chains_complete"
        ];

        const dug_next = {};
        const dug_combat = {};
        const dug_treasure = {};
        const chains_complete = {};

        for(const key of burrows)
            if(key in userProfile.stats) 
                misc.burrows[key.replace("mythos_burrows_", "")] = { total: userProfile.stats[key] };

        misc.profile_upgrades = await module.exports.getProfileUpgrades(profile);
        
        const auctions_buy = ["auctions_bids", "auctions_highest_bid", "auctions_won", "auctions_gold_spent"];
        const auctions_sell = ["auctions_fees", "auctions_gold_earned"];

        const auctions_bought = {};
        const auctions_sold = {};

        for(const key of auctions_sell)
            if(key in userProfile.stats)
                misc.auctions_sell[key.replace("auctions_", "")] = userProfile.stats[key];

        for(const key of auctions_buy)
            if(key in userProfile.stats)
                misc.auctions_buy[key.replace("auctions_", "")] = userProfile.stats[key];

        for(const key in userProfile.stats)
            if(key.includes('_best_time'))
                misc.races[key] = userProfile.stats[key];
            else if(key.includes('gifts_'))
                misc.gifts[key] = userProfile.stats[key];
            else if(key.includes('most_winter'))
                misc.winter[key] = userProfile.stats[key];
            else if(key.includes('highest_critical_damage'))
                misc.damage[key] = userProfile.stats[key];
            else if(key.includes('auctions_sold_'))
                auctions_sold[key.replace("auctions_sold_", "")] = userProfile.stats[key];
            else if(key.includes('auctions_bought_'))
                auctions_bought[key.replace("auctions_bought_", "")] = userProfile.stats[key];
            else if(key.startsWith('kills_') && key.endsWith('_dragon'))
                misc.dragons['last_hits'] += userProfile.stats[key];
            else if(key.startsWith('deaths_') && key.endsWith('_dragon'))
                misc.dragons['deaths'] += userProfile.stats[key];
            else if(key.includes('kills_corrupted_protector'))
                misc.protector['last_hits'] = userProfile.stats[key];
            else if(key.includes('deaths_corrupted_protector'))
                misc.protector['deaths'] = userProfile.stats[key];
            else if(key.startsWith('pet_milestone_'))
                misc.milestones[key.replace('pet_milestone_', '')] = userProfile.stats[key];
            else if(key.startsWith('mythos_burrows_dug_next_'))
                dug_next[key.replace('mythos_burrows_dug_next_', '').toLowerCase()] = userProfile.stats[key];
            else if(key.startsWith('mythos_burrows_dug_combat_'))
                dug_combat[key.replace('mythos_burrows_dug_combat_', '').toLowerCase()] = userProfile.stats[key];
            else if(key.startsWith('mythos_burrows_dug_treasure_'))
                dug_treasure[key.replace('mythos_burrows_dug_treasure_', '').toLowerCase()] = userProfile.stats[key];
            else if(key.startsWith('mythos_burrows_chains_complete_')) {
                chains_complete[key.replace('mythos_burrows_chains_complete_', '').toLowerCase()] = userProfile.stats[key];
            }

        for(const key in misc.dragons)
            if(misc.dragons[key] == 0)
                delete misc.dragons[key];

        for(const key in misc)
            if(Object.keys(misc[key]).length == 0)
                delete misc[key];

        for(const key in dug_next)
            misc.burrows.dug_next[key] = dug_next[key];

        for(const key in dug_combat)
            misc.burrows.dug_combat[key] = dug_combat[key];

        for(const key in dug_treasure)
            misc.burrows.dug_treasure[key] = dug_treasure[key];

        for(const key in chains_complete)
            misc.burrows.chains_complete[key] = chains_complete[key];

        for(const key in auctions_bought)
            misc.auctions_buy['items_bought'] = (misc.auctions_buy['items_bought'] || 0) + auctions_bought[key];

        for(const key in auctions_sold)
            misc.auctions_sell['items_sold'] = (misc.auctions_sell['items_sold'] || 0) + auctions_sold[key];

        output.misc = misc;
        output.auctions_bought = auctions_bought;
        output.auctions_sold = auctions_sold;

        const last_updated = userProfile.last_save;
        const first_join = userProfile.first_join;

        const diff = (+new Date() - last_updated) / 1000;

        let last_updated_text = moment(last_updated).fromNow();
        let first_join_text = moment(first_join).fromNow();

        if('current_area' in userProfile)
            output.current_area = userProfile.current_area;

        if('current_area_updated' in userProfile)
            output.current_area_updated = userProfile.current_area_updated;

        if(diff < 3)
            last_updated_text = `Right now`;
        else if(diff < 60)
            last_updated_text = `${Math.floor(diff)} seconds ago`;

        output.last_updated = {
            unix: last_updated,
            text: last_updated_text
        };

        output.first_join = {
            unix: first_join,
            text: first_join_text
        };

        return output;
    },

    getPets: async profile => {
        let output = [];

        if(!helper.hasPath(profile, 'pets'))
            return output;

        for(const pet of profile.pets){
            if(!('tier' in pet))
                continue;

            pet.rarity = pet.tier.toLowerCase();

            if(pet.heldItem == 'PET_ITEM_TIER_BOOST' || pet.heldItem == 'PET_ITEM_VAMPIRE_FANG')
                pet.rarity = petTiers[Math.min(petTiers.length - 1, petTiers.indexOf(pet.rarity) + 1)];

            pet.level = getPetLevel(pet);
            pet.stats = {};

            const petData = constants.pet_data[pet.type] || {
                type: '???',
                emoji: '❓',
                head: '/head/bc8ea1f51f253ff5142ca11ae45193a4ad8c3ab5e9c6eec8ba7a4fcb7bac40'
            };

            pet.texture_path = petData.head;

            let lore = [
                `§8${helper.capitalizeFirstLetter(petData.type)} Pet`,
            ];

            lore.push('');

            const petName = helper.titleCase(pet.type.replace(/\_/g, ' '));
            const searchName = petName in constants.petStats ? petName : '???';

            if(searchName in constants.petStats){
                let rarity;
                switch(pet.rarity){
                    case "common":
                        rarity = 0;
                        break;
                    case "uncommon":
                        rarity = 1;
                        break;
                    case "rare":
                        rarity = 2;
                        break;
                    case "epic":
                        rarity = 3;
                        break;
                    case "legendary":
                        rarity = 4;
                        break;
                    case "mythic":
                        rarity = 5;
                        break;
                }

                const petInstance = new constants.petStats[searchName](rarity, pet.level.level)
                // we need to push stats later :o

                // make pet.stats actually hold pet stats
                pet.stats = Object.assign({}, petInstance.stats);

                pet.ref = petInstance;

                // we also need to push abilites after stats :O
            }

            if(pet.heldItem) {
                const { heldItem } = pet;

                const heldItemObj = await db
                .collection('items')
                .findOne({ id: heldItem });

                if(heldItem in constants.pet_items){
                    if('stats' in constants.pet_items[heldItem])
                        for(const stat in constants.pet_items[heldItem].stats)
                            pet.stats[stat] = (pet.stats[stat] || 0) + constants.pet_items[heldItem].stats[stat];
                    if('multStats' in constants.pet_items[heldItem])
                        for(const stat in constants.pet_items[heldItem].multStats)
                            if (pet.stats[stat]) { pet.stats[stat] = (pet.stats[stat] || 0) * constants.pet_items[heldItem].multStats[stat] };
                }

                // push pet lore after held item stats added
                const stats = pet.ref.lore(pet.stats);
                stats.forEach(line => {
                    lore.push(line);
                });

                // then the ability lore
                const abilities = pet.ref.abilities;
                abilities.forEach(ability => {
                    lore.push(' ', ability.name);
                    ability.desc.forEach(line => {
                        lore.push(line);
                    });
                });
                // now we push the lore of the held items
                if(heldItemObj)
                    lore.push('', `§6Held Item: §${constants.tier_colors[heldItemObj.tier.toLowerCase()]}${heldItemObj.name}`);

                if(heldItem in constants.pet_items){
                    lore.push(constants.pet_items[heldItem].description);
                }
                // extra line
                lore.push(' ');
            } else { // no held items so push the new stats
                const stats = pet.ref.lore();
                stats.forEach(line => {
                    lore.push(line);
                });
                
                const abilities = pet.ref.abilities;
                abilities.forEach(ability => {
                    lore.push(' ', ability.name);
                    ability.desc.forEach(line => {
                        lore.push(line);
                    });
                });
                // extra line
                lore.push(' ');
            }

            if(pet.level.level < 100){
                lore.push(
                    `§7Progress to Level ${pet.level.level + 1}: §e${(pet.level.progress * 100).toFixed(1)}%`
                );

                let levelBar = '';

                for(let i = 0; i < 20; i++){
                    if(pet.level.progress > i / 20)
                        levelBar += '§2';
                    else
                        levelBar += '§f';
                    levelBar += '-';
                }

                levelBar += ` §e${pet.level.xpCurrent.toLocaleString()} §6/ §e${helper.formatNumber(pet.level.xpForNext, false, 10)}`;

                lore.push(levelBar);
            }else{
                lore.push(
                    '§bMAX LEVEL'
                );
            }

            lore.push(
                '',
                `§7Total XP: §e${helper.formatNumber(pet.exp, true, 10)} §6/ §e${helper.formatNumber(pet.level.xpMaxLevel, true, 10)}`,
                `§7Candy Used: §e${pet.candyUsed || 0} §6/ §e10`
            );

            pet.lore = '';

            for(const [index, line] of lore.entries()){
                pet.lore += helper.renderLore(line);

                if(index < lore.length)
                    pet.lore += '<br>';
            }

            pet.display_name = petName;
            pet.emoji = petData.emoji;

            output.push(pet);
        }

        output = output.sort((a, b) => {
            if(a.active === b.active)
                if(a.rarity == b.rarity){
                    if(a.type == b.type){
                        return a.level.level > b.level.level ? -1 : 1;
                    }else{
                        let maxPetA = output
                        .filter(x => x.type == a.type && x.rarity == a.rarity)
                        .sort((x, y) => y.level.level - x.level.level);

                        maxPetA = maxPetA.length > 0 ? maxPetA[0].level.level : null;

                        let maxPetB = output
                        .filter(x => x.type == b.type && x.rarity == b.rarity)
                        .sort((x, y) => y.level.level - x.level.level);

                        maxPetB = maxPetB.length > 0 ? maxPetB[0].level.level : null;

                        if(maxPetA && maxPetB && maxPetA == maxPetB)
                            return a.type < b.type ? -1 : 1;
                        else
                            return maxPetA > maxPetB ? -1 : 1;
                    }
                }else{
                    return rarity_order.indexOf(a.rarity) > rarity_order.indexOf(b.rarity) ? 1 : -1;
                }

            return a.active? -1 : 1
        });

        return output;
    },

    getMissingPets: async pets => {
        const output = [];

        for(const petType in constants.pet_data){
            if(pets.map(a => a.type).includes(petType))
                continue;

            const pet = Object.assign({}, constants.pet_data[petType]);

            pet.texture_path = pet.head;
            pet.display_name = helper.titleCase(petType.replace(/\_/g, ' '));
            pet.rarity = 'legendary';

            let lore = [
                `§8${helper.capitalizeFirstLetter(pet.type)} Pet`,
            ];

            pet.lore = '';

            lore.forEach((line, index) => {
                pet.lore += helper.renderLore(line);

                if(index + 1 <= lore.length)
                    pet.lore += '<br>';
            });

            output.push(pet);
        }

        return output;
    },

    getPetScore: async pets => {
        const highestRarity = {};

        for(const pet of pets)
            if(!(pet.type in highestRarity)
            || constants.pet_value[pet.rarity] > highestRarity[pet.type])
                highestRarity[pet.type] = constants.pet_value[pet.rarity];

        return Object.values(highestRarity).reduce((a, b) => a + b, 0);
    },

    getMissingTalismans: async talismans => {
        let unique = Object.keys(constants.talismans);

        let missing = unique.filter(talisman => !talismans.includes(talisman));
        missing.forEach(name => {
            if(name in constants.talisman_upgrades){ //if the name is in the upgrades list
                for(let upgrade of constants.talisman_upgrades[name]){
                    if(talismans.includes(upgrade)){ //if talisman list includes the upgrade
                        missing = missing.filter(item => item !== name);
                        break;
                    }
                }
            }
        });

        const output = [];
        missing.forEach(async talisman => {
            let object = {
                display_name: null,
                rarity: null,
                texture_path: null
            }

            // SPECIFIC TALISMANS
            if(talisman.startsWith("WEDDING_RING_")){
                object.texture_path = "/head/8fb265c8cc6136063b4eb15450fe1fe1ab7738b0bf54d265490e1ef49da60b7c"
                object.display_name = "Ring of Love"
                object.rarity = "legendary"

                output.push(object);
                return;
            }
            
            if(talisman.startsWith("CAMPFIRE_TALISMAN_")){
                object.texture_path = "/head/4080bbefca87dc0f36536b6508425cfc4b95ba6e8f5e6a46ff9e9cb488a9ed"
                object.display_name = "Campfire God Badge"
                object.rarity = "legendary"

                output.push(object);
                return;
            }

            if(object.name == null)
                object.name = talisman;

            // MAIN TALISMANS
            if (constants.talismans[talisman] != null){
                const data = constants.talismans[talisman];

                object.texture_path = data.texture || null;
                object.display_name = data.name || null;
                object.rarity = data.rarity || null;
            } else {
                const data = await db
                    .collection('items')
                    .findOne({ id: talisman });

                if(data){
                    object.texture_path = data.texture ? "/head/" + data.texture : `/item/${talisman}`;
                    object.display_name = data.name;
                    object.rarity = data.tier.toLowerCase();
                }
            }

            output.push(object);
        });

        return output;
    },

    getTalismanCount: () => {
        if(TALISMAN_COUNT != null) return TALISMAN_COUNT;
        let talismanArray = Object.keys(constants.talismans);

        for(const talisman in constants.talisman_upgrades){
            if(talismanArray.includes(talisman)){
                talismanArray = talismanArray.filter(name => name !== talisman);
            }
        }

        TALISMAN_COUNT = talismanArray.length;
        return talismanArray.length;
    },

    getCollections: async (uuid, profile, cacheOnly = false) => {
        const output = {};

        const userProfile = profile.members[uuid];

        if(!('unlocked_coll_tiers' in userProfile) || !('collection' in userProfile))
            return output;

        const members = {};

        (
            await Promise.all(
                Object.keys(profile.members).map(a => helper.resolveUsernameOrUuid(a, db, cacheOnly))
            )
        ).forEach(a => members[a.uuid] = a.display_name);

        for(const collection of userProfile.unlocked_coll_tiers){
            const split = collection.split("_");
            const tier = Math.max(0, parseInt(split.pop()));
            const type = split.join("_");
            const amount = userProfile.collection[type] || 0;
            const amounts = [];
            let totalAmount = 0;

            for(member in profile.members){
                const memberProfile = profile.members[member];

                if('collection' in memberProfile)
                    amounts.push({ username: members[member], amount: memberProfile.collection[type] || 0 });
            }

            for(const memberAmount of amounts)
                totalAmount += memberAmount.amount;

            if(!(type in output) || tier > output[type].tier)
                output[type] = { tier, amount, totalAmount, amounts };

            const collectionData =  constants.collection_data.filter(a => a.skyblockId == type)[0];

            if('tiers' in collectionData){
                for(const tier of collectionData.tiers){
                    if(totalAmount >= tier.amountRequired){
                        output[type].tier = Math.max(tier.tier, output[type].tier);
                    }
                }
            }
        }

        return output;
    },

    getBagSizes: async (collections) => {
        const output = {};

        for(const bag in constants.bag_size){
            const bagSize = constants.bag_size[bag];

            if(!(bagSize.collection in collections))
                continue;

            let slots = 0;

            for(const size of bagSize.sizes)
                if(collections[bagSize.collection].tier >= size.tier)
                    slots = size.slots;

            output[bag] = slots;
        }

        return output;
    },

    getDungeons: async (userProfile, hypixelProfile) => {
        let output = {};

        const dungeons = userProfile.dungeons;
        if (dungeons == null 
            || Object.keys(dungeons).length === 0) return output;

        const dungeons_data = constants.dungeons;
        if (dungeons.dungeon_types == null
            || Object.keys(dungeons.dungeon_types).length === 0) return output;

        // Main Dungeons Data
        for(const type of Object.keys(dungeons.dungeon_types)){
            const dungeon = dungeons.dungeon_types[type];
            if (dungeon == null || Object.keys(dungeon).length === 0) {
                output[type] = { visited: false };
                continue;   
            };

            let floors = {};

            for(const key of Object.keys(dungeon)){
                if(typeof dungeon[key] != "object") continue;
                for(const floor of Object.keys(dungeon[key])){
                    if(!floors[floor]) floors[floor] = {
                        name: `floor_${floor}`,
                        icon_texture: "908fc34531f652f5be7f27e4b27429986256ac422a8fb59f6d405b5c85c76f7",
                        stats: {}
                    };

                    let id = `${type}_${floor}`; // Floor ID
                    if(dungeons_data.floors[id]){
                        if(dungeons_data.floors[id].name) 
                            floors[floor].name = dungeons_data.floors[id].name;
                        if(dungeons_data.floors[id].texture) 
                            floors[floor].icon_texture = dungeons_data.floors[id].texture;
                    }
                    
                    if(key.startsWith("most_damage")){
                        if(!floors[floor].most_damage || dungeon[key][floor] > floors[floor].most_damage.value) 
                            floors[floor].most_damage = {
                                class: key.replace("most_damage_", ""),
                                value: dungeon[key][floor]
                            };
                    }else if(key === "best_runs") floors[floor][key] = dungeon[key][floor];
                    else floors[floor].stats[key] = dungeon[key][floor];
                }
            }

            let dungeon_id = `dungeon_${type}`; // Dungeon ID
            let highest_floor = dungeon.highest_tier_completed || 0;
            output[type] = {
                id: dungeon_id,
                visited: true,
                level: getLevelByXp(dungeon.experience, {type: "dungeoneering"}),
                highest_floor: 
                    dungeons_data.floors[`${type}_${highest_floor}`] && dungeons_data.floors[`${type}_${highest_floor}`].name 
                    ? dungeons_data.floors[`${type}_${highest_floor}`].name : `floor_${highest_floor}`,
                floors: floors
            }
        }

        // Classes
        output.classes = {}

        let used_classes = false;
        let current_class = dungeons.selected_dungeon_class || "none";
        for(const className of Object.keys(dungeons.player_classes)){
            let data = dungeons.player_classes[className];
            output.classes[className] = {
                experience: getLevelByXp(data.experience, {type: "dungeoneering"}),
                current: false
            }

            if (data.experience > 0)
                used_classes = true;
            if(className == current_class) 
                output.classes[className].current = true;
        }

        output.used_classes = used_classes;

        output.selected_class = current_class;
        output.secrets_found = hypixelProfile.achievements.skyblock_treasure_hunter || 0;

        if (!output.catacombs.visited) return output;

        // Boss Collections
        const collection_data = dungeons_data.boss_collections;
        const boss_data = dungeons_data.bosses;
        let collections = {};

        for (i in output.catacombs.floors) {
            let floor_id = `catacombs_${i}`;
            if (!Object.keys(collection_data).includes(floor_id)) continue;

            let data = output.catacombs.floors[i];
            if (data.stats.tier_completions == null || data.stats.tier_completions <= 0) continue; 

            let coll = collection_data[floor_id];
            let boss = boss_data[coll.boss];

            if (!collections[floor_id]) collections[floor_id] = {
                name: boss.name,
                texture: boss.texture,
                tier: 0,
                maxed: false,
                killed: data.stats.tier_completions || 0,
                unclaimed: 0,
                claimed: []
            };

            for (reward_id in coll.rewards) {
                let reward = coll.rewards[reward_id];
                if (collections[floor_id].killed >= reward.required) {
                    collections[floor_id].tier = reward.tier;
                    if(reward_id != "coming_soon") collections[floor_id].unclaimed++;
                } else break;

                if (collections[floor_id].tier == coll.max_tiers)
                    collections[floor_id].maxed = true;
            }
        }

        const tasks = userProfile.tutorial;
        for (i in tasks) {
            if (!tasks[i].startsWith("boss_collection_claimed")) continue;
            let task = tasks[i].split("_").splice(3);

            if (!Object.keys(boss_data).includes(task[0])) continue;
            let boss = boss_data[task[0]];

            if (!Object.keys(collection_data).includes(boss.floor)) continue;
            let coll = collection_data[boss.floor];

            let item = coll.rewards[task.splice(1).join('_')];

            if (item == null || boss == null) continue;
            collections[boss.floor].claimed.push(item.name);
            collections[boss.floor].unclaimed--;
        }

        if (Object.keys(collections).length === 0) 
            output.unlocked_collections = false;
        else output.unlocked_collections = true;

        output.boss_collections = collections;

        // Journal Entries
        const journal_constants = constants.dungeons.journals;
        const journal_entries = dungeons.dungeon_journal.journal_entries;
        let journals = {
            pages_collected: 0,
            journals_completed: 0,
            total_pages: 0,
            maxed: false,
            journal_entries: []
        };

        for(entry_id in journal_entries){
            let entry = {
                name: journal_constants[entry_id] ? journal_constants[entry_id].name : entry_id,
                pages_collected: journal_entries[entry_id].length || 0,
                total_pages: journal_constants[entry_id] ? journal_constants[entry_id].pages : null,
            }

            journals.pages_collected += entry.pages_collected;
            if(entry.total_pages != null)
                if(entry.pages_collected >= entry.total_pages) 
                    journals.journals_completed++;

            journals.journal_entries.push(entry);
        }

        for(entry_id in journal_constants)
            journals.total_pages += journal_constants[entry_id].pages || 0;

        if(journals.pages_collected >= journals.total_pages) 
            journals.maxed = true;

        output.journals = journals;

        // Level Bonuses (Only Catacombs Item Boost right now)
        for(let name in constants.dungeons.level_bonuses){
            let level_stats = constants.dungeons.level_bonuses[name];
            let steps = Object.keys(level_stats).sort((a, b) => Number(a) - Number(b)).map(a => Number(a));

            let level = 0;
            switch(name){
                case "dungeon_catacombs":
                    level = output.catacombs.level.level;
                    output.catacombs.bonuses = {
                        item_boost: 0
                    };
                    break;
                default:
                    continue;
            }

            for(let x = steps[0]; x <= steps[steps.length - 1]; x += 1){
                if(level < x)
                    break;

                let level_step = steps.slice().reverse().find(a => a <= x);

                let level_bonus = level_stats[level_step];

                for(bonus in level_bonus)
                    switch(name){
                        case "dungeon_catacombs":
                            output.catacombs.bonuses[bonus] += level_bonus[bonus];
                    }
            }
        }

        return output;
    },

    getProfileUpgrades: async (profile) => {
        const output = {};
        for (const upgrade in constants.profile_upgrades)
            output[upgrade] = 0;
        if (helper.hasPath(profile, 'community_upgrades', 'upgrade_states'))
            for (const u of profile.community_upgrades.upgrade_states)
                output[u.upgrade] = Math.max(output[u.upgrade] || 0, u.tier);
        return output;
    },

    getProfile: async (db, paramPlayer, paramProfile, options = { cacheOnly: false }) => {
        if(paramPlayer.length != 32){
            try{
                const { uuid } = await helper.resolveUsernameOrUuid(paramPlayer, db);

                paramPlayer = uuid;
            }catch(e){
                console.error(e);
                throw e;
            }
        }

        if(paramProfile)
            paramProfile = paramProfile.toLowerCase();

        const params = {
            key: credentials.hypixel_api_key,
            uuid: paramPlayer
        };

        let allSkyBlockProfiles = [];

        let profileObject = await db
        .collection('profileStore')
        .findOne({ uuid: paramPlayer });

        let lastCachedSave = 0;

        if(profileObject){
            const profileData = db
            .collection('profileCache')
            .find({ profile_id: { $in: Object.keys(profileObject.profiles) } });

            for await(const doc of profileData){
                if(!helper.hasPath(doc, 'members', paramPlayer))
                    continue;

                Object.assign(doc, profileObject.profiles[doc.profile_id]);

                allSkyBlockProfiles.push(doc);

                lastCachedSave = Math.max(lastCachedSave, doc.members[paramPlayer].last_save || 0);
            }
        }else{
            profileObject = { last_update: 0 };
        }

        let response = null;

        if(!options.cacheOnly &&
        (Date.now() - lastCachedSave > 190 * 1000 && Date.now() - lastCachedSave < 300 * 1000
        || Date.now() - profileObject.last_update >= 300 * 1000)){
            try{
                response = await retry(async () => {
                    return await Hypixel.get('skyblock/profiles', {
                        params
                    });
                }, { retries: 2 });

                const { data } = response;

                if(!data.success)
                    throw "Request to Hypixel API failed. Please try again!";

                if(data.profiles == null)
                    throw "Player has no SkyBlock profiles.";

                allSkyBlockProfiles = data.profiles;
            }catch(e){
                if(helper.hasPath(e, 'response', 'data', 'cause'))
                    throw `Hypixel API Error: ${e.response.data.cause}.`;

                throw e;
            }
        }

        if(allSkyBlockProfiles.length == 0)
            throw "Player has no SkyBlock profiles.";

        for(const profile of allSkyBlockProfiles){
            for(const member in profile.members)
                if(!helper.hasPath(profile.members[member], 'last_save'))
                    delete profile.members[member];

            profile.uuid = paramPlayer;
        }

        let skyBlockProfiles = [];

        if(paramProfile){
            if(paramProfile.length == 32){
                const filteredProfiles = allSkyBlockProfiles.filter(a => a.profile_id.toLowerCase() == paramProfile);

                if(filteredProfiles.length > 0){
                    skyBlockProfiles = filteredProfiles;
                }else{
                    const profileResponse = await retry(async () => {
                        const response = await Hypixel.get('skyblock/profile', {
                            params: { key: credentials.hypixel_api_key, profile: paramProfile }
                        }, { retries: 3 });

                        if(!response.data.success)
                            throw "api request failed";

                        return response.data.profile;
                    });

                    profileResponse.cute_name = 'Deleted';
                    profileResponse.uuid = paramPlayer;

                    skyBlockProfiles.push(profileResponse);
                }
            }else{
                skyBlockProfiles = allSkyBlockProfiles.filter(a => a.cute_name.toLowerCase() == paramProfile);
            }
        }

        if(skyBlockProfiles.length == 0)
            skyBlockProfiles = allSkyBlockProfiles;

        const profiles = [];

        for(const [index, profile] of skyBlockProfiles.entries()){
            let memberCount = 0;

            for(const member in profile.members){
                if(helper.hasPath(profile.members[member], 'last_save'))
                    memberCount++;
            }

            if(memberCount == 0){
                if(paramProfile)
                    throw "Uh oh, this SkyBlock profile has no players.";

                continue;
            }

            profiles.push(profile);
        }

        if(profiles.length == 0)
            throw "No data returned by Hypixel API, please try again!";

        let highest = 0;
        let profileId;
        let profile;

        const storeProfiles = {};

        for(const _profile of allSkyBlockProfiles){
            let userProfile = _profile.members[paramPlayer];

            if(!userProfile)
                continue;

            if(response && response.request.fromCache !== true){
                const insertCache = {
                    last_update: new Date(),
                    members: _profile.members
                };

                if(helper.hasPath(_profile, 'banking'))
                    insertCache.banking = _profile.banking;
                
                if(helper.hasPath(_profile, 'community_upgrades'))
                    insertCache.community_upgrades = _profile.community_upgrades;

                db
                .collection('profileCache')
                .updateOne(
                    { profile_id: _profile.profile_id },
                    { $set: insertCache },
                    { upsert: true }
                ).catch(console.error);
            }

            if(helper.hasPath(userProfile, 'last_save'))
                storeProfiles[_profile.profile_id] = {
                    profile_id: _profile.profile_id,
                    cute_name: _profile.cute_name,
                    game_mode: _profile.game_mode,
                    last_save: userProfile.last_save
                };
        }

        for(const [index, _profile] of profiles.entries()){
            if(_profile === undefined || _profile === null)
                return;

            let userProfile = _profile.members[paramPlayer];

            if(helper.hasPath(userProfile, 'last_save') && userProfile.last_save > highest){
                profile = _profile;
                highest = userProfile.last_save;
                profileId = _profile.profile_id;
            }
        }

        if(!profile)
            throw "User not found in selected profile. This is probably due to a declined co-op invite.";

        const userProfile = profile.members[paramPlayer];

        if(profileObject && helper.hasPath(profileObject, 'current_area'))
            userProfile.current_area = profileObject.current_area;

        if(Date.now() - userProfile.last_save < 5 * 60 * 1000)
            userProfile.current_area_updated = true;

        if(response && response.request.fromCache !== true){
            const apisEnabled = helper.hasPath(userProfile, 'inv_contents')
            && Object.keys(userProfile).filter(a => a.startsWith('experience_skill_')).length > 0
            && helper.hasPath(userProfile, 'collection')

            const insertProfileStore = {
                last_update: new Date(),
                last_save: Math.max(...allSkyBlockProfiles.map(a => helper.getPath(a, 'members', paramPlayer, 'last_save') || 0)),
                apis: apisEnabled,
                profiles: storeProfiles
            };

            if(options.updateArea && Date.now() - userProfile.last_save < 5 * 60 * 1000){
                try{
                    const statusResponse = await Hypixel.get('status', { params: { uuid: paramPlayer, key: credentials.hypixel_api_key }});

                    const areaData = statusResponse.data.session;

                    if(areaData.online && areaData.gameType == 'SKYBLOCK'){
                        const areaName = constants.area_names[areaData.mode] || helper.titleCase(areaData.mode.replace(/\_/g, ' '));

                        userProfile.current_area = areaName;
                        insertProfileStore.current_area = areaName;
                    }
                }catch(e){
                    console.error(e);
                }
            }

            module.exports.updateLeaderboardPositions(db, paramPlayer, allSkyBlockProfiles).catch(console.error);

            db
            .collection('profileStore')
            .updateOne(
                { uuid: paramPlayer },
                { $set: insertProfileStore },
                { upsert: true }
            ).catch(console.error);
        }

        return { profile: profile, allProfiles: allSkyBlockProfiles, uuid: paramPlayer };
    },

    updateLeaderboardPositions: async (db, uuid, allProfiles) => {
        if(constants.blocked_players.includes(uuid))
            return;

        const hypixelProfile = await helper.getRank(uuid, db, true);

        const memberProfiles = [];

        for(const singleProfile of allProfiles){
            const userProfile = singleProfile.members[uuid];

            if(userProfile == null)
                continue;

            userProfile.levels = await module.exports.getLevels(userProfile, hypixelProfile);

            let totalSlayerXp = 0;

            userProfile.slayer_xp = 0;

            if(userProfile.hasOwnProperty('slayer_bosses')){
                for(const slayer in userProfile.slayer_bosses)
                    totalSlayerXp += userProfile.slayer_bosses[slayer].xp || 0;

                userProfile.slayer_xp = totalSlayerXp;

                for(const mountMob in constants.mob_mounts){
                    const mounts = constants.mob_mounts[mountMob];

                    userProfile.stats[`kills_${mountMob}`] = 0;
                    userProfile.stats[`deaths_${mountMob}`] = 0;

                    for(const mount of mounts){
                        userProfile.stats[`kills_${mountMob}`] += userProfile.stats[`kills_${mount}`] || 0;
                        userProfile.stats[`deaths_${mountMob}`] += userProfile.stats[`deaths_${mount}`] || 0;

                        delete userProfile.stats[`kills_${mount}`];
                        delete userProfile.stats[`deaths_${mount}`]
                    }
                }
            }

            userProfile.pet_score = 0;

            const maxPetRarity = {};

            if(Array.isArray(userProfile.pets)){
                for(const pet of userProfile.pets){
                    if(!helper.hasPath(pet, 'tier'))
                        continue;

                    maxPetRarity[pet.type] = Math.max(maxPetRarity[pet.type] || 0, constants.pet_value[pet.tier.toLowerCase()]);
                }

                for(const key in maxPetRarity)
                    userProfile.pet_score += maxPetRarity[key];
            }

            memberProfiles.push({
                profile_id: singleProfile.profile_id,
                data: userProfile
            });
        }

        const values = {};

        values['pet_score'] = getMax(memberProfiles, 'data', 'pet_score');

        values['fairy_souls'] = getMax(memberProfiles, 'data', 'fairy_souls_collected');
        values['average_level'] = getMax(memberProfiles, 'data', 'levels', 'average_level');
        values['total_skill_xp'] = getMax(memberProfiles, 'data', 'levels', 'total_skill_xp');

        for(const skill of getAllKeys(memberProfiles, 'data', 'levels', 'levels'))
            values[`skill_${skill}_xp`] = getMax(memberProfiles, 'data', 'levels', 'levels', skill, 'xp');

        values['slayer_xp'] = getMax(memberProfiles, 'data', 'slayer_xp');

        for(const slayer of getAllKeys(memberProfiles, 'data', 'slayer_bosses')){
            for(const key of getAllKeys(memberProfiles, 'data', 'slayer_bosses', slayer)){
                if(!key.startsWith('boss_kills_tier'))
                    continue;

                const tier = key.split("_").pop();

                values[`${slayer}_slayer_boss_kills_tier_${tier}`] = getMax(memberProfiles, 'data', 'slayer_bosses', slayer, key);
            }

            values[`${slayer}_slayer_xp`] = getMax(memberProfiles, 'data', 'slayer_bosses', slayer, 'xp');
        }

        for(const item of getAllKeys(memberProfiles, 'data', 'collection'))
            values[`collection_${item.toLowerCase()}`] = getMax(memberProfiles, 'data', 'collection', item);

        for(const stat of getAllKeys(memberProfiles, 'data', 'stats'))
            values[stat] = getMax(memberProfiles, 'data', 'stats', stat);

        // Dungeons (Mainly Catacombs now.)
        for(const stat of getAllKeys(memberProfiles, 'data', 'dungeons', 'dungeon_types', 'catacombs')){
            switch(stat){
                case "best_runs":
                case "highest_tier_completed":
                    break;
                case "experience":
                    values[`dungeons_catacombs_xp`] = getMax(memberProfiles, 'data', 'dungeons', 'dungeon_types', 'catacombs', 'experience');
                    break;
                default:
                    for(const floor of getAllKeys(memberProfiles, 'data', 'dungeons', 'dungeon_types', 'catacombs', stat)){
                        const floor_id = `catacombs_${floor}`;
                        if(!constants.dungeons.floors[floor_id] || !constants.dungeons.floors[floor_id].name) continue;

                        const floor_name = constants.dungeons.floors[floor_id].name;
                        values[`dungeons_catacombs_${floor_name}_${stat}`] = getMax(memberProfiles, 'data', 'dungeons', 'dungeon_types', 'catacombs', stat, floor);
                    };
            }
        }

        for(const dungeon_class of getAllKeys(memberProfiles, 'data', 'dungeons', 'player_classes'))
            values[`dungeons_class_${dungeon_class}_xp`] = getMax(memberProfiles, 'data', 'dungeons', 'player_classes', dungeon_class, 'experience');

        values[`dungeons_secrets_found`] = hypixelProfile.achievements.skyblock_treasure_hunter || 0;

        const multi = redisClient.pipeline();

        for(const key in values){
            if(values[key] == null)
                continue;

            multi.zadd(`lb_${key}`, values[key], uuid);
        }

        for(const singleProfile of allProfiles){
            if(helper.hasPath(singleProfile, 'banking', 'balance'))
                multi.zadd(`lb_bank`, singleProfile.banking.balance, singleProfile.profile_id);

            const minionCrafts = [];

            for(const member in singleProfile.members)
                if(Array.isArray(singleProfile.members[member].crafted_generators))
                    minionCrafts.push(...singleProfile.members[member].crafted_generators);

            multi.zadd(
                `lb_unique_minions`,
                _.uniq(minionCrafts).length,
                singleProfile.profile_id
            );
        }

        try{
            await multi.exec();
        }catch(e){
            console.error(e);
        }
    },

    getThemes: () => {
        return constants.themes;
    },

    getPacks: () => {
        return customResources.packs;
    }
}

async function init(){
    const response = await axios('https://api.hypixel.net/resources/skyblock/collections');

    if(!helper.hasPath(response, 'data', 'collections'))
        return;

    for(const type in response.data.collections){
        for(const itemType in response.data.collections[type].items){
            const item = response.data.collections[type].items[itemType];

            const collectionData = constants.collection_data.filter(a => a.skyblockId == itemType)[0];

            collectionData.maxTier = item.maxTiers;
            collectionData.tiers = item.tiers;
        }
    }
}

init();

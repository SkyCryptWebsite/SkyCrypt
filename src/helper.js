const axios = require('axios');
require('axios-debug-log');

const retry = require('async-retry');

const _ = require('lodash');

const constants = require('./constants');
const credentials = require('./../credentials.json');

const Redis = require("ioredis");
const redisClient = new Redis();

const Hypixel = axios.create({
    baseURL: 'https://api.hypixel.net/'
});

function getKey(key){
    const intKey = new Number(key);

    if(!isNaN(intKey))
        return intKey;

    return key;
}

module.exports = {
    hasPath: (obj, ...keys) => {
        if(obj == null)
            return false;

        let loc = obj;

        for(let i = 0; i < keys.length; i++){
            loc = loc[getKey(keys[i])];

            if(loc === undefined)
                return false;
        }

        return true;
    },

    getPath: (obj, ...keys) => {
        if(obj == null)
            return undefined;

        let loc = obj;

        for(let i = 0; i < keys.length; i++){
            loc = loc[getKey(keys[i])];

            if(loc === undefined)
                return undefined;
        }

        return loc;
    },

    setPath: (obj, value, ...keys) => {
        let i;
        let loc = obj || {};

        for(i = 0; i < keys.length - 1; i++){
            if(!loc.hasOwnProperty(keys[i]))
                loc[keys[i]] = {};

            loc = loc[keys[i]];
        }

        loc[keys[i]] = value;
    },

    getId: item => {
        if(module.exports.hasPath(item, 'tag', 'ExtraAttributes', 'id'))
            return item.tag.ExtraAttributes.id;

        return "";
    },

    resolveUsernameOrUuid: async (uuid, db, cacheOnly = false) => {
        let user = null;

        uuid = uuid.replace(/\-/g, '');

        const isUuid = uuid.length == 32;

        if(isUuid){
            user = await db
            .collection('usernames')
            .findOne({ uuid });
        }else{
            const playerObjects = await db
            .collection('usernames')
            .find({ $text: { $search: uuid } })
            .toArray();

            for(const doc of playerObjects)
                if(doc.username.toLowerCase() == uuid.toLowerCase())
                    user = doc;
        }

        let skin_data = { 
            skinurl: 'https://textures.minecraft.net/texture/3b60a1f6d562f52aaebbf1434f1de147933a3affe0e764fa49ea057536623cd3', 
            model: 'slim' 
        };

        if(user && module.exports.hasPath(user, 'skinurl')){
            skin_data.skinurl = user.skinurl;
            skin_data.model = user.model;

            if(module.exports.hasPath(user, 'capeurl'))
                skin_data.capeurl = user.capeurl;
        }

        if(cacheOnly === false && (user === null || (+new Date() - user.date) > 7200 * 1000)){
            let profileRequest = axios(`https://api.ashcon.app/mojang/v1/user/${uuid}`, { timeout: 5000 });

            profileRequest.then(async response => {
                try{
                    const { data } = response;

                    data.id = data.uuid.replace(/\-/g, '');

                    let updateDoc = {
                        username: data.username,
                        date: +new Date()
                    }

                    if(module.exports.hasPath(data.textures, 'skin')){
                        skin_data.skinurl = data.textures.skin.url;
                        skin_data.model = data.textures.slim ? 'slim' : 'regular';
                    }

                    if(module.exports.hasPath(data.textures, 'cape'))
                        skin_data.capeurl = data.textures.cape.url;

                    updateDoc = Object.assign(updateDoc, skin_data);

                    await db
                    .collection('usernames')
                    .updateOne(
                        { uuid: data.id },
                        { $set: updateDoc },
                        { upsert: true }
                    );

                    const playerObjects = await db
                    .collection('usernames')
                    .find({ $text: { $search: data.username } });

                    for await(const doc of playerObjects){
                        if(doc.uuid == data.id)
                            continue;

                        if(doc.username.toLowerCase() == data.username.toLowerCase()){
                            await db
                            .collection('usernames')
                            .deleteOne(
                                { _id: doc._id }
                            );

                            module.exports.resolveUsernameOrUuid(doc.uuid, db).catch(console.error);
                        }
                    }
                }catch(e){
                    console.error(e);
                }
            }).catch(async err => {
                if(user)
                    await db
                    .collection('usernames')
                    .updateOne(
                        { uuid: user.uuid },
                        { $set: { date: +new Date() } }
                    );

                console.error(err);
            });

            if(!user){
                try{
                    let { data } = await profileRequest;

                    data.id = data.uuid.replace(/\-/g, '');

                    if(module.exports.hasPath(data.textures, 'skin')){
                        skin_data.skinurl = data.textures.skin.url;
                        skin_data.model = data.textures.slim ? 'slim' : 'regular';
                    }

                    if(module.exports.hasPath(data.textures, 'cape'))
                        skin_data.capeurl = data.textures.cape.url;

                    return { uuid: data.id, display_name: data.username, skin_data };
                }catch(e){
                    if(isUuid){
                        return { uuid, display_name: uuid, skin_data };
                    }else{
                        if(module.exports.hasPath(e, 'response', 'data', 'reason'))
                            throw e.response.data.reason;
                        else
                            throw "Failed resolving username.";
                    }
                }
            }
        }

        if(user)
            return { uuid: user.uuid, display_name: user.username, emoji: user.emoji, skin_data };
        else
            return { uuid, display_name: uuid, skin_data };
    },

    getGuild: async (uuid, db, cacheOnly = false) => {
        const guildMember = await db
        .collection('guildMembers')
        .findOne({ uuid: uuid });

        let guildObject = null;

        if(cacheOnly && guildMember === null)
            return null;

        if(guildMember !== null && guildMember.gid !== null)
            guildObject = await db
            .collection('guilds')
            .findOne({ gid: guildMember.gid });

        if(cacheOnly || (guildMember !== null && guildMember.gid !== null && (guildObject === null || (Date.now() - guildMember.last_updated) < 7200 * 1000))){
            if(guildMember.gid !== null){
                const guildObject = await db
                .collection('guilds')
                .findOne({ gid: guildMember.gid });

                if(guildObject === null)
                    return null;

                guildObject.level = module.exports.getGuildLevel(guildObject.exp);
                guildObject.gmUser = await module.exports.resolveUsernameOrUuid(guildObject.gm, db, cacheOnly);
                guildObject.rank = guildMember.rank;

                return guildObject;
            }

            return null;
        }else{
            if(guildMember === null || (Date.now() - guildMember.last_updated) > 7200 * 1000){
                try{
                    const guildResponse = await Hypixel.get('guild', { params: { player: uuid, key: credentials.hypixel_api_key }});

                    const { guild } = guildResponse.data;

                    let gm;

                    if(guild && guild !== null){
                        for(const member of guild.members)
                            if(["guild master", "guildmaster"].includes(member.rank.toLowerCase()))
                                gm = member.uuid;

                        for(const member of guild.members){
                            if(!gm && guild.ranks.filter(a => a.name.toLowerCase() == member.rank.toLowerCase()).length == 0)
                                gm = member.uuid;

                            await db
                            .collection('guildMembers')
                            .updateOne(
                                { uuid: member.uuid },
                                { $set: { gid: guild._id, rank: member.rank, last_updated: new Date() }},
                                { upsert: true }
                            );
                        }

                        const guildMembers = await db
                        .collection('guildMembers')
                        .find({ gid: guild._id })
                        .toArray();

                        for(const member of guildMembers){
                            if(guild.members.filter(a => a.uuid == member.uuid).length == 0){
                                await db
                                .collection('guildMembers')
                                .updateOne(
                                    { uuid: member.uuid },
                                    { $set: { gid: null, last_updated: new Date() } }
                                );
                            }
                        }

                        const guildObject = await db
                        .collection('guilds')
                        .findOneAndUpdate(
                            { gid: guild._id },
                            { $set: { name: guild.name, tag: guild.tag, exp: guild.exp, created: guild.created, gm, members: guild.members.length, last_updated: new Date() }},
                            { returnOriginal: false, upsert: true }
                        );

                        guildObject.value.level = module.exports.getGuildLevel(guildObject.value.exp);
                        guildObject.value.gmUser = await module.exports.resolveUsernameOrUuid(guildObject.value.gm, db);
                        guildObject.value.rank = guild.members.filter(a => a.uuid == uuid)[0].rank;

                        return guildObject.value;
                    }else{
                        await db
                        .collection('guildMembers')
                        .findOneAndUpdate(
                            { uuid },
                            { $set: { gid: null, last_updated: new Date() }},
                            { upsert: true }
                        );
                    }

                    return null;
                }catch(e){
                    console.error(e);
                    return null;
                }
            }else{
                return null;
            }
        }
    },

    getGuildLevel: xp => {
        let level = 0;

        for(let i = 0;; i++){
            const xpNeeded = constants.guild_xp[Math.min(constants.guild_xp.length - 1, i)];

            xp -= xpNeeded;

            if(xp < 0)
                return level;

            level++;
        }

        return level;
    },

    // Convert Minecraft lore to HTML
    renderLore: (text, enchants = false) => {
        let output = "";
        let spansOpened = 0;

        const parts = text.split("§");

        if(parts.length == 1)
            return text;

        for(const part of parts){
            const code = part.substring(0, 1);
            const content = part.substring(1);

            const format = constants.minecraft_formatting[code];

            if(format === undefined)
                continue;

            if(format.type == 'color'){
                for(; spansOpened > 0; spansOpened--)
                    output += "</span>";

                output += `<span style='${format.css}'>${content}`;

                spansOpened++;
            }else if(format.type == 'format'){
                output += `<span style='${format.css}'>${content}`;

                spansOpened++;
            }else if(format.type == 'reset'){
                for(; spansOpened > 0; spansOpened--)
                    output += "</span>";

                output += content;
            }
        }

        for(; spansOpened > 0; spansOpened--)
            output += "</span>";

        if(enchants){
            const specialColor = constants.minecraft_formatting['6'];

            const matchingEnchants = constants.special_enchants.filter(a => output.includes(a));

            for(const enchantment of matchingEnchants)
                output = output.replace(enchantment, `<span style='${specialColor.css}'>${enchantment}</span>`);
        }

        return output;
    },

    // Get Minecraft lore without the color and formatting codes
    getRawLore: text => {
        let output = "";
        let parts = text.split("§");

        for(const [index, part] of parts.entries())
            output += part.substring(Math.min(index, 1));

        return output;
    },

    capitalizeFirstLetter: word => {
        return word.charAt(0).toUpperCase() + word.slice(1);
    },

    titleCase: string => {
       let split = string.toLowerCase().split(' ');

       for(let i = 0; i < split.length; i++)
            split[i] = split[i].charAt(0).toUpperCase() + split[i].substring(1);

        return split.join(' ');
    },

    aOrAn: string => {
       return ['a', 'e', 'i', 'o', 'u'].includes(string.charAt(0).toLowerCase()) ? 'an': 'a';
    },

    getPrice: orderSummary => {
        orderSummary = orderSummary.slice(0, Math.ceil(orderSummary.length / 2));

        const orders = [];

        const totalVolume = orderSummary.map(a => a.amount).reduce((a, b) => a + b, 0);
        const volumeTop2 = Math.ceil(totalVolume * 0.02);

        let volume = 0;

        for(const order of orderSummary){
            const cappedAmount = Math.min(order.amount, volumeTop2 - volume);

            orders.push([
                order.pricePerUnit,
                cappedAmount
            ]);

            volume += cappedAmount;

            if(volume >= volumeTop2)
                break;
        }

        const totalWeight = orders.reduce((sum, value) => sum + value[1], 0);

        return orders.reduce((mean, value) => mean + value[0] * value[1] / totalWeight, 0);
    },

    getPrices: product => {
        return {
            buyPrice: module.exports.getPrice(product.buy_summary),
            sellPrice: module.exports.getPrice(product.sell_summary),
        };
    },

    formatNumber: (number, floor, rounding = 10) => {
        if(number < 1000)
            return Math.floor(number);
        else if(number < 10000)
            if(floor)
                return (Math.floor(number / 1000 * rounding) / rounding).toFixed(rounding.toString().length - 1) + 'K';
            else
                return (Math.ceil(number / 1000 * rounding) / rounding).toFixed(rounding.toString().length - 1) + 'K';
        else if(number < 1000000)
            if(floor)
                return Math.floor(number / 1000) + 'K';
            else
                return Math.ceil(number / 1000) + 'K';
        else if(number < 1000000000)
            if(floor)
                return (Math.floor(number / 1000 / 1000 * rounding) / rounding).toFixed(rounding.toString().length - 1) + 'M';
            else
                return (Math.ceil(number / 1000 / 1000 * rounding) / rounding).toFixed(rounding.toString().length - 1) + 'M';
        else
        if(floor)
            return (Math.floor(number / 1000 / 1000 / 1000 * rounding * 10) / (rounding * 10)).toFixed(rounding.toString().length) + 'B';
        else
            return (Math.ceil(number / 1000 / 1000 / 1000 * rounding * 10) / (rounding * 10)).toFixed(rounding.toString().length) + 'B';
    },

    parseRank: player => {
        let rankName = 'NONE';
        let rank = null;

        let output = {
            rankText: null,
            rankColor: null,
            plusText: null,
            plusColor: null
        };

        if(module.exports.hasPath(player, 'packageRank'))
            rankName = player.packageRank;

        if(module.exports.hasPath(player, 'newPackageRank'))
            rankName = player.newPackageRank;

        if(module.exports.hasPath(player, 'monthlyPackageRank') && player.monthlyPackageRank != 'NONE')
            rankName = player.monthlyPackageRank;

        if(module.exports.hasPath(player, 'rank') && player.rank != 'NORMAL')
            rankName = player.rank;

        if(module.exports.hasPath(player, 'prefix'))
            rankName = module.exports.getRawLore(player.prefix).replace(/\[|\]/g, '');

        if(module.exports.hasPath(constants.ranks, rankName))
            rank = constants.ranks[rankName];

        if(!rank)
            return output;

        output.rankText = rank.tag;
        output.rankColor = rank.color;

        if(rankName == 'SUPERSTAR'){
            if(!module.exports.hasPath(player, 'monthlyRankColor'))
                player.monthlyRankColor = 'GOLD';

            output.rankColor = constants.color_names[player.monthlyRankColor];
        }

        if(module.exports.hasPath(rank, 'plus')){
            output.plusText = rank.plus;
            output.plusColor = output.rankColor;
        }

        if(output.plusText && module.exports.hasPath(player, 'rankPlusColor'))
            output.plusColor = constants.color_names[player.rankPlusColor];

        if(rankName == 'PIG+++')
            output.plusColor = 'b';

        return output;
    },

    renderRank: rank => {
        let { rankText, rankColor, plusText, plusColor } = rank;
        let output = "";

        if(rankText === null)
            return output;

        rankColor = constants.minecraft_formatting[rankColor].niceColor
        || constants.minecraft_formatting[rankColor].color;

        output = `<div class="rank-tag ${plusText ? 'rank-plus' : ''}"><div class="rank-name" style="background-color: ${rankColor}">${rankText}</div>`;

        if(plusText){
            plusColor = constants.minecraft_formatting[plusColor].niceColor
            || constants.minecraft_formatting[plusColor].color

            output += `<div class="rank-plus" style="background-color: ${plusColor}"><div class="rank-plus-before" style="background-color: ${plusColor};"></div><span class="rank-plus-text">${plusText}</span></div>`;
        }

        output += `</div>`;

        return output;
    },

    updateRank: async (uuid, db) => {
        let rank = { rankText: null, rankColor: null,plusText: null, plusColor: null,socials: {}, achievements: {}, claimed_items: {} };

        try{
            const response = await retry(async () => {
                return await Hypixel.get('player', {
                    params: {
                        key: credentials.hypixel_api_key, uuid
                    }
                });
            });

            const player = response.data.player;

            rank = Object.assign(rank, module.exports.parseRank(player));

            if(module.exports.hasPath(player, 'socialMedia', 'links'))
                rank.socials = player.socialMedia.links;

            if(module.exports.hasPath(player, 'achievements'))
                rank.achievements = player.achievements;

            let claimable = {
                "claimed_potato_talisman": "Potato Talisman",
                "claimed_potato_basket": "Potato Basket",
                "claim_potato_war_silver_medal": "Silver Medal (Potato War)",
                "claim_potato_war_crown": "Crown (Potato War)",
                "skyblock_free_cookie": "Free Booster Cookie",
                "scorpius_bribe_96": "Scorpius Bribe (Year 96)"
            };

            for(item in claimable)
                if(module.exports.hasPath(player, item)) 
                    rank.claimed_items[claimable[item]] = player[item];
        }catch(e){
            console.error(e);
        }

        rank.last_updated = new Date();

        await db
        .collection('hypixelPlayers')
        .updateOne(
            { uuid },
            { $set: rank },
            { upsert: true }
        );

        return rank;
    },

    getRank: async (uuid, db, cacheOnly = false) => {
        let hypixelPlayer = await db
        .collection('hypixelPlayers')
        .findOne({ uuid });

        let updateRank;

        if(cacheOnly === false && (hypixelPlayer === null || (+new Date() - hypixelPlayer.last_updated) > 3600 * 1000))
            updateRank = module.exports.updateRank(uuid, db);

        if(cacheOnly === false && hypixelPlayer === null)
            hypixelPlayer = await updateRank;

        if(hypixelPlayer === null){
            hypixelPlayer = { achievements: {} };
        }

        return hypixelPlayer;
    },

    fetchMembers: async (profileId, db, returnUuid = false) => {
        let output = [];

        const members = await db
        .collection('members')
        .find({ profile_id: profileId })
        .toArray();

        if(members.length == 0){
            let profileResponse = await Hypixel.get('skyblock/profile', { params: { key: credentials.hypixel_api_key, profile: profileId } });

            let memberPromises = [];

            for(const member in profileResponse.data.profile.members)
                memberPromises.push(module.exports.resolveUsernameOrUuid(member, db));

            let profileMembers = await Promise.all(memberPromises);

            for(const profileMember of profileMembers){
                await db
                .collection('members')
                .replaceOne(
                    { profile_id: profileId, uuid: profileMember.uuid },
                    { profile_id: profileId, uuid: profileMember.uuid, username: profileMember.display_name },
                    { upsert: true }
                );
            }

            if(returnUuid)
                output = profileMembers;
            else
                output = profileMembers.map(a => a.display_name);
        }else{
            if(returnUuid)
                output = members.map(a => { return { uuid: a.uuid, display_name: a.username } });
            else
                output = members.map(a => a.username);
        }

        return output;
    }
}

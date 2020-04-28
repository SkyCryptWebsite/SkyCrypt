const axios = require('axios');
require('axios-debug-log');

const retry = require('async-retry');

const _ = require('lodash');

const constants = require('./constants');
const credentials = require('../credentials.json');

const axiosCacheAdapter = require('axios-cache-adapter');

const { RedisStore } = axiosCacheAdapter;
const redis = require('redis');

const redisClient = redis.createClient();
const redisStore = new RedisStore(redisClient);

const Hypixel = axiosCacheAdapter.setup({
    baseURL: 'https://api.hypixel.net/',
    cache: {
        maxAge: 2 * 60 * 1000,
        store: redisStore,
        exclude: {
            query: false
        }
    }
});

module.exports = {
    uuidToUsername: async (uuid, db) => {
        let output;

        let user = await db
        .collection('usernames')
        .find({ uuid: uuid })
        .next();

        if(user === null || +new Date() - user.date > 4000 * 1000){
            let profileRequest = axios(`https://sessionserver.mojang.com/session/minecraft/profile/${uuid}`, { timeout: 2000 });

            profileRequest.then(async response => {
                let { data } = response;

                await db
                .collection('usernames')
                .updateOne(
                    { uuid: data.id },
                    { $set: { username: data.name, date: +new Date() } },
                    { upsert: true }
                );
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
                    return { uuid, display_name: data.name };
                }catch(e){
                    return { uuid, display_name: uuid };
                }
            }
        }

        if(user)
            return { uuid, display_name: user.username, emoji: user.emoji };
    },

    getGuild: async (uuid, db) => {
        const guildMember = await db
        .collection('guildMembers')
        .findOne({ uuid: uuid });

        if(guildMember !== null){
            if(guildMember.gid !== null){
                const guildObject = await db
                .collection('guilds')
                .findOne({ gid: guildMember.gid });

                guildObject.level = module.exports.getGuildLevel(guildObject.exp);
                guildObject.gmUser = await module.exports.uuidToUsername(guildObject.gm, db);
                guildObject.rank = guildMember.rank;

                return guildObject;
            }

            return null;
        }else{
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
                            { $set: { gid: guild._id, rank: member.rank }},
                            { upsert: true }
                        );
                    }

                    const guildObject = await db
                    .collection('guilds')
                    .findOneAndUpdate(
                        { gid: guild._id },
                        { $set: { name: guild.name, tag: guild.tag, exp: guild.exp, created: guild.created, gm, members: guild.members.length }},
                        { returnOriginal: false, upsert: true }
                    );

                    guildObject.value.level = module.exports.getGuildLevel(guildObject.value.exp);
                    guildObject.value.gmUser = await module.exports.uuidToUsername(guildObject.value.gm, db);
                    guildObject.value.rank = guild.members.filter(a => a.uuid == uuid)[0].rank;

                    return guildObject.value;
                }else{
                    await db
                    .collection('guildMembers')
                    .findOneAndUpdate(
                        { uuid },
                        { $set: { gid: null }},
                        { upsert: true }
                    );
                }

                return null;
            }catch(e){
                console.error(e);
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
    renderLore: text => {
        let output = "";
        let spansOpened = 0;

        const parts = text.split("§");

        if(parts.length == 1)
            return text;

        for(const part of parts){
            const code = part.substring(0, 1);
            const content = part.substring(1);

            if(code in constants.minecraft_formatting){
                const format = constants.minecraft_formatting[code];

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
        }

        for(; spansOpened > 0; spansOpened--)
            output += "</span>";

        return output;
    },

    // Get Minecraft lore without the color and formatting codes
    getRawLore: text => {
        let output = "";
        let parts = text.split("§");

        for(const [index, part] of parts.entries())
            output += part.substr(Math.min(index, 1));

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

    getProfile: async req => {
        let player = req.params.player;

        let profile = req.params.profile;
        let profileId;

        let params = {
            key: credentials.hypixel_api_key
        };

        if(player.length == 32)
            params.uuid = player;
        else
            params.name = player;

        const playerResponse = await retry(async () => {
            return await Hypixel.get('player', {
                params, cache: { maxAge: 10 * 60 * 1000 }
            });
        });

        let profiles = playerResponse.data.player.stats.SkyBlock.profiles;

        let selectedProfile;

        if(profile.length == 32)
            selectedProfile = _.pickBy(profiles, a => a.profile_id.toLowerCase() == profile.toLowerCase());
        else
            selectedProfile = _.pickBy(profiles, a => a.cute_name.toLowerCase() == profile.toLowerCase());

        profileId = Object.keys(selectedProfile)[0];

        const profileResponse = await retry(async () => {
            const response = await Hypixel.get('skyblock/profile', {
                params: { key: credentials.hypixel_api_key, profile: profileId }
            });

            if(!response.data.success)
                return "api request failed";

            return response;
        });

        return {
            playerResponse,
            profileResponse
        };
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
                memberPromises.push(module.exports.uuidToUsername(member, db));

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

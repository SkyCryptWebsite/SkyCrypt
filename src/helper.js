const axios = require('axios');
require('axios-debug-log')

const _ = require('lodash');


const credentials = require('../credentials.json');

const Hypixel = axios.create({
    baseURL: 'https://api.hypixel.net/'
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
                .replaceOne(
                    { uuid: data.id },
                    { uuid: data.id, username: data.name, date: +new Date() },
                    { upsert: true }
                );
            }).catch(async err => {
                if(user)
                    await db
                    .collection('usernames')
                    .replaceOne(
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
            return { uuid, display_name: user.username };
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

        let playerResponse = await Hypixel.get('player', {
            params, timeout: 5000
        });

        let profiles = playerResponse.data.player.stats.SkyBlock.profiles;

        let selectedProfile;

        if(profile.length == 32)
            selectedProfile = _.pickBy(profiles, a => a.profile_id.toLowerCase() == profile.toLowerCase());
        else
            selectedProfile = _.pickBy(profiles, a => a.cute_name.toLowerCase() == profile.toLowerCase());

        profileId = Object.keys(selectedProfile)[0];

        return {
            playerResponse: playerResponse,
            profileResponse: await Hypixel.get('skyblock/profile', { params: { key: credentials.hypixel_api_key, profile: profileId } })
        };
    },

    fetchMembers: async (profileId, db) => {
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

            output = profileMembers.map(a => a.display_name);
        }else{
            output = members.map(a => a.username);
        }

        return output;
    }
}

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

                if(user)
                    await db
                    .collection('usernames')
                    .updateOne(
                        { uuid: user.uuid },
                        { $set: { username: data.name, date: +new Date() } }
                    );
                else
                    await db
                    .collection('usernames')
                    .insertOne({ uuid: data.id, username: data.name, date: +new Date() });

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
            return { uuid, display_name: user.username };
    },

    getProfile: async req => {
        let player = req.params.player;

        let profile = req.params.profile;
        let profileId;

        if(profile.length == 32){
            profileId = profile;
        }else{
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
            let selectedProfile = _.pickBy(profiles, a => a.cute_name.toLowerCase() == profile.toLowerCase());

            profileId = Object.keys(selectedProfile)[0];
        }

        return await Hypixel.get('skyblock/profile', { params: { key: credentials.hypixel_api_key, profile: profileId } });
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

            for(const profileMember of profileMembers)
                await db
                .collection('members')
                .insertOne({ profile_id: profileId, uuid: profileMember.uuid, username: profileMember.display_name });

            output = profileMembers.map(a => a.display_name);
        }else{
            output = members.map(a => a.username);
        }

        return output;
    }
}

const axios = require('axios');
const credentials = require('../credentials.json');
const tableify = require('@tillhub/tableify');
const _ = require('lodash');

const Hypixel = axios.create({
    baseURL: 'https://api.hypixel.net/'
});

async function getProfile(req){
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
}

module.exports = app => {
    app.get('/api/:player/profiles', async (req, res) => {
        try{
            let playerResponse = await Hypixel.get('player', {
                params: { key: credentials.hypixel_api_key, name: req.params.player }, timeout: 5000
            });

            const skyBlockProfiles = playerResponse.data.player.stats.SkyBlock.profiles;

            let profiles = [];

            for(let profile in skyBlockProfiles)
                profiles.push(skyBlockProfiles[profile]);

            if('html' in req.query){
                res.send(tableify(profiles, { showHeaders: false }));
            }else{
                res.json(profiles);
            }
        }catch(e){
            res.set('Content-Type', 'text/plain');
            res.status(500).send('Something went wrong');
        }
    });

    app.get('/api/:player/:profile/minions', async (req, res) => {
        try{
            let profileResponse = await getProfile(req);

            let minions = [];

            let coopMembers = profileResponse.data.profile.members;

            for(const member in coopMembers){
                if(!('crafted_generators' in coopMembers[member]))
                    continue;

                for(const minion of coopMembers[member].crafted_generators){
                    const minionName = minion.replace(/(_[0-9]+)/g, '');

                    const minionLevel = parseInt(minion.split("_").pop());

                    if(minions.filter(a => a.minion == minionName).length == 0)
                        minions.push({ minion: minionName, level: minionLevel });

                    let minionObject = minions.filter(a => a.minion == minionName)[0];

                    if(minionObject.level < minionLevel)
                        minionObject.level = minionLevel;
                }
            }

            if('html' in req.query){
                res.send(tableify(minions, { showHeaders: false }));
            }else{
                res.json(minions);
            }
        }catch(e){
            console.error(e);

            res.set('Content-Type', 'text/plain');
            res.status(500).send('Something went wrong');
        }
    });
}

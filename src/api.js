const axios = require('axios');
require('axios-debug-log')

const credentials = require('../credentials.json');
const tableify = require('@tillhub/tableify');
const _ = require('lodash');
const helper = require('./helper');
const lib = require('./lib');
const objectPath = require("object-path");

const Hypixel = axios.create({
    baseURL: 'https://api.hypixel.net/'
});

module.exports = (app, db) => {
    app.get('/api/:player/profiles', async (req, res) => {
        try{
            let playerResponse = await Hypixel.get('player', {
                params: { key: credentials.hypixel_api_key, name: req.params.player }, timeout: 5000
            });

            const skyBlockProfiles = playerResponse.data.player.stats.SkyBlock.profiles;

            let profiles = [];

            for(let profile in skyBlockProfiles){
                skyBlockProfiles[profile].members = await helper.fetchMembers(profile, db);

                if('html' in req.query)
                    skyBlockProfiles[profile].members = skyBlockProfiles[profile].members.join(", ");

                profiles.push(skyBlockProfiles[profile]);
            }

            if('html' in req.query){
                res.send(tableify(profiles, { showHeaders: false }));
            }else{
                res.json(profiles);
            }
        }catch(e){
            console.error(e);

            res.set('Content-Type', 'text/plain');
            res.status(500).send('Something went wrong');
        }
    });

    app.get('/api/:player/:profile/pets', async (req, res) => {
        try{
            const { playerResponse, profileResponse } = await helper.getProfile(req);

            const userProfile = profileResponse.data.profile.members[playerResponse.data.player.uuid];

            const pets = await lib.getPets(userProfile);

            for(const pet of pets){
                delete pet.lore;

                const petLevel = Object.assign({}, pet.level);
                delete pet.level;
                delete pet.tier;

                for(const key in petLevel)
                    pet[key] = petLevel[key];
            }

            if('html' in req.query)
                res.send(tableify(pets, { showHeaders: false }));
            else
                res.json(pets);
        }catch(e){
            console.error(e);

            res.set('Content-Type', 'text/plain');
            res.status(500).send('Something went wrong');
        }
    });

    app.get('/api/:player/:profile/minions', async (req, res) => {
        try{
            const { profileResponse } = await helper.getProfile(req);

            const minions = [];

            const coopMembers = profileResponse.data.profile.members;

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

            if('html' in req.query)
                res.send(tableify(minions, { showHeaders: false }));
            else
                res.json(minions);
        }catch(e){
            console.error(e);

            res.set('Content-Type', 'text/plain');
            res.status(500).send('Something went wrong');
        }
    });

    app.get('/api/:player/:profile/accessories', async (req, res) => {
        try{
            const { playerResponse, profileResponse } = await helper.getProfile(req);

            const userProfile = profileResponse.data.profile.members[playerResponse.data.player.uuid];

            const items = await lib.getItems(userProfile);

            const talismans = items.talismans
            .filter(a => a.isUnique)
            .map(a => { return {
                id: a.tag.ExtraAttributes.id,
                rarity: a.rarity,
                reforge: a.reforge,
                name: a.base_name,
                isActive: a.isInactive ? 'false' : 'true'
            }});

            if('html' in req.query){
                res.send(tableify(talismans, { showHeaders: false }));
            }else{
                res.json(talismans);
            }
        }catch(e){
            console.error(e);

            res.set('Content-Type', 'text/plain');
            res.status(500).send('Something went wrong');
        }
    });

    app.get('/api/:player/:profile/cakebag', async (req, res) => {
        try{
            const { playerResponse, profileResponse } = await helper.getProfile(req);

            const userProfile = profileResponse.data.profile.members[playerResponse.data.player.uuid];

            const items = await lib.getItems(userProfile);

            const allItems = items.armor.concat(items.inventory, items.talisman_bag, items.enderchest);

            const cakeBags = allItems.filter(a => objectPath.has(a, 'tag.ExtraAttributes.id') && a.tag.ExtraAttributes.id == 'NEW_YEAR_CAKE_BAG');

            if(cakeBags.length == 0){
                res.set('Content-Type', 'text/plain');
                res.send('Player has no cake bag');
            }else{
                const cakeBag = cakeBags[0];

                let cakes = [];

                for(const item of cakeBag.containsItems)
                    if(objectPath.has(item, 'tag.ExtraAttributes.new_years_cake'))
                        cakes.push({cake: item.tag.ExtraAttributes.new_years_cake});

                cakes = cakes.sort((a, b) => a.cake - b.cake);

                res.send(tableify(cakes, { showHeaders: false }));
            }
        }catch(e){
            console.error(e);

            res.set('Content-Type', 'text/plain');
            res.status(500).send('Something went wrong');
        }
    });
}

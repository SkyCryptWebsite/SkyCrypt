const axios = require('axios');
require('axios-debug-log')

const credentials = require('../credentials.json');
const tableify = require('@tillhub/tableify');
const _ = require('lodash');
const helper = require('./helper');
const lib = require('./lib');
const constants = require('./constants');
const objectPath = require("object-path");

const Hypixel = axios.create({
    baseURL: 'https://api.hypixel.net/'
});

function handleError(e, res){
    console.error(e);

    res.set('Content-Type', 'text/plain');
    res.status(500).send('Something went wrong');
}

module.exports = (app, db) => {
    app.all('/api/:player/profiles', async (req, res) => {
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
            handleError(e, res);
        }
    });

    app.all('/api/:player/:profile/pets', async (req, res) => {
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
            console.error(e, res);
        }
    });

    app.all('/api/:player/:profile/minions', async (req, res) => {
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
            handleError(e, res);
        }
    });

    app.all('/api/:player/:profile/accessories', async (req, res) => {
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
            handleError(e, res);
        }
    });

    app.all('/api/:player/:profile/collections', async (req, res) => {
        try{
            const { playerResponse, profileResponse } = await helper.getProfile(req);

            const profile = profileResponse.data.profile;
            const userProfile = profile.members[playerResponse.data.player.uuid];
            const members = await helper.fetchMembers(profile.profile_id, db, true);
            const collections = await lib.getCollections(playerResponse.data.player.uuid, profile, members);

            for(const collection in collections)
                collections[collection].name = constants.collection_data.filter(a => a.skyblockId == collection)[0].name;

            if('html' in req.query){
                res.send(tableify(Object.keys(collections).map(a => [ a, collections[a].name, collections[a].tier, collections[a].amount, collections[a].totalAmount ]), { showHeaders: false }));
            }else{
                res.json(collections);
            }
        }catch(e){
            handleError(e, res);
        }
    });

    app.all('/api/:player/:profile/cakebag', async (req, res) => {
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
            handleError(e, res);
        }
    });

    app.all('/api/bazaar', async (req, res) => {
        try{
            const output = [];

            const products = await db
            .collection('bazaar')
            .find()
            .toArray();

            for(const product of products){
                let productName = product.productId.replace(/(_+)/g, ' ');
                const collections = constants.collection_data.filter(a => a.skyblockId == product.productId);

                if(collections.length > 0)
                    productName = collections[0].name;

                output.push({
                    id: product.productId,
                    name: helper.titleCase(productName),
                    buyPrice: product.buyPrice,
                    sellPrice: product.sellPrice,
                    price: (product.buyPrice + product.sellPrice) / 2
                });
            }

            if('html' in req.query){
                res.send(tableify(output.map(a => [ a.name, +a.price.toFixed(3) ]), { showHeaders: false }));
            }else{
                res.json(output);
            }
        }catch(e){
            handleError(e, res);
        }
    });
}

const express = require('express');
const axios = require('axios');
const fs = require('fs-extra');
const path = require('path');
const util = require('util');
const renderer = require('./renderer');
const lib = require('./lib');
const _ = require('lodash');
const objectPath = require('object-path');
const moment = require('moment');

const low = require('lowdb');
const FileSync = require('lowdb/adapters/FileSync');

const adapter = new FileSync('db.json');
const db = low(adapter);

const CACHE_DURATION = 30 * 24 * 60 * 60 * 1000; // 30 days

db
.defaults({ usernames: [], profiles: [] })
.write();

fs.ensureDirSync('cache');

const credentials = require('./credentials.json');

if(credentials.hypixel_api_key.length == 0)
    throw "Please enter a valid Hypixel API Key. Join mc.hypixel.net and enter /api to obtain one.";

const Hypixel = axios.create({
    baseURL: 'https://api.hypixel.net/'
});

let api_index = 0;
let api_key = credentials.hypixel_api_key;

if(!Array.isArray(api_key))
    api_key = [api_key];

function getApiKey(){
    api_index++;

    if(api_index >= api_key.length)
        api_index = 0;

    return api_key[api_index];
}

async function uuidToUsername(uuid){
    let output;

    let user = db
    .get('usernames')
    .find({ uuid: uuid })
    .value();

    if(!user || +new Date() - user.date > 3600 * 1000){
        let profileRequest = axios(`https://sessionserver.mojang.com/session/minecraft/profile/${uuid}`, { timeout: 2000 });

        profileRequest.then(response => {
            let { data } = response;

            if(user)
                db
                .get('usernames')
                .find({ uuid: user.uuid })
                .assign({ username: data.name, date: +new Date()  })
                .write();
            else
                db
                .get('usernames')
                .push({ uuid: data.id, username: data.name, date: +new Date() })
                .write();
        }).catch(err => {
            if(user)
                db
                .get('usernames')
                .find({ uuid: user.uuid })
                .assign({ date: +new Date()  })
                .write();

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
}

const app = express();
const port = 32464;

app.set('view engine', 'ejs');
app.use(express.static('public', { maxAge: CACHE_DURATION }));

app.get('/stats/:player/:profile?', async (req, res, next) => {
    let response;

    let active_profile = db
    .get('profiles')
    .find({ username: req.params.player.toLowerCase() })
    .value();

    try{
        response = await Hypixel.get('player', { params: { key: getApiKey(), name: req.params.player } });
        let { data } = response;

        if(!data.success){
            res.render('index', {
                error: 'Request to Hypixel API failed. Please try again!',
                player: req.params.player,
                page: 'index'
            });

            return false;
        }

        if(data.player == null){
            res.render('index', {
                error: 'Player not found.',
                player: req.params.player,
                page: 'index'
            });

            return false;
        }

        if(!objectPath.has(data, 'player.stats')){
            res.render('index', {
                error: 'No data returned by Hypixel API, please try again!',
                player: req.params.player,
                page: 'index'
            });

            return false;
        }

        if(!('SkyBlock' in data.player.stats)){
            res.render('index', {
                error: 'Player has not played SkyBlock yet.',
                player: req.params.player,
                page: 'index'
            });

            return false;
        }

        let all_skyblock_profiles = data.player.stats.SkyBlock.profiles;

        let skyblock_profiles = {};

        if(Object.keys(all_skyblock_profiles).length == 0){
            let default_profile = await Hypixel.get('skyblock/profile', { params: { key: getApiKey(), profile: data.player.uuid }});

            if(default_profile.data.profile == null){
                res.render('index', {
                    error: 'Player has no SkyBlock profiles.',
                    player: req.params.player,
                    page: 'index'
                });

                return false;
            }else{
                skyblock_profiles[data.player.uuid] = {
                    profile_id: data.player.uuid,
                    cute_name: 'Avocado',
                };

                all_skyblock_profiles = skyblock_profiles;
            }
        }

        if(req.params.profile)
            skyblock_profiles = _.pickBy(all_skyblock_profiles, a => a.cute_name.toLowerCase() == req.params.profile.toLowerCase());
        else if(active_profile)
            skyblock_profiles = _.pickBy(all_skyblock_profiles, a => a.profile_id.toLowerCase() == active_profile.profile_id);

        if(Object.keys(skyblock_profiles).length == 0)
            skyblock_profiles = all_skyblock_profiles;

        let profile_names = Object.keys(skyblock_profiles);

        let promises = [];
        let profile_ids = [];

        for(let profile in skyblock_profiles){
            profile_ids.push(profile);

            promises.push(
                Hypixel.get('skyblock/profile', { params: { key: getApiKey(), profile: profile } })
            );
        }

        let responses = await Promise.all(promises);

        let profiles = [];

        for(let[index, profile_response] of responses.entries()){
            if(!profile_response.data.success){
                delete skyblock_profiles[profile_ids[index]];
                continue;
            }

            profiles.push(profile_response.data.profile);
        }

        if(profiles.length == 0){
            res.render('index', {
                error: 'No data returned by Hypixel API, please try again!',
                player: req.params.player,
                page: 'index'
            });

            return false;
        }

        let highest = 0;
        let profile_id;

        profiles.forEach((_profile, index) => {
            if(_profile === undefined || _profile === null)
                return;

            let user_profile = _profile.members[data.player.uuid];

            if(user_profile.last_save > highest){
                profile = _profile;
                highest = user_profile.last_save;
                profile_id = profile_names[index];
            }
        });

        let user_profile = profile.members[data.player.uuid];

        if(active_profile){
            if(user_profile.last_save > active_profile.last_save){
                db
                .get('profiles')
                .find({ username: req.params.player.toLowerCase() })
                .assign({ profile_id: profile_id, last_save: user_profile.last_save })
                .write();
            }
        }else{
            db
            .get('profiles')
            .push({ username: req.params.player.toLowerCase(), profile_id: profile_id, last_save: user_profile.last_save })
            .write();
        }


        let memberUuids = Object.keys(profile.members);

        let memberPromises = [];

        for(let member of memberUuids)
            if(member != data.player.uuid)
                memberPromises.push(uuidToUsername(member));

        let members = await Promise.all(memberPromises);

        let items = await lib.getItems(user_profile);
        let calculated = await lib.getStats(user_profile, items);

        if(objectPath.has(profile, 'banking.balance'))
            calculated.bank = profile.banking.balance;

        calculated.uuid = data.player.uuid;
        calculated.display_name = data.player.displayname;
        calculated.profile = skyblock_profiles[profile_id];
        calculated.profiles = _.pickBy(all_skyblock_profiles, a => a.profile_id != profile_id);
        calculated.members = members;

        let last_updated = user_profile.last_save;
        let first_join = user_profile.first_join;

        let diff = (+new Date() - last_updated) / 1000;

        let last_updated_text = moment(last_updated).fromNow();
        let first_join_text = moment(first_join).fromNow();

        if(diff < 3)
            last_updated_text = `Right now`;
        else if(diff < 60)
            last_updated_text = `${Math.floor(diff)} seconds ago`;

        calculated.last_updated = {
            unix: last_updated,
            text: last_updated_text
        };

        calculated.first_join = {
            unix: first_join,
            text: first_join_text
        };

        res.render('stats', { items, calculated, page: 'stats' });
    }catch(e){
        console.error(e);

        res.render('index', {
            error: 'An unknown error occured. Please try again!',
            player: req.params.player,
            page: 'index'
        });

        return false;
    }
});

app.get('/head/:uuid', async (req, res) => {
    let uuid = req.params.uuid;

    let filename = `head_${uuid}.png`;

    try{
        file = await fs.readFile(path.resolve(__dirname, 'cache', filename));
    }catch(e){
        file = await renderer.renderHead(`http://textures.minecraft.net/texture/${uuid}`, 6.4);

        fs.writeFile(path.resolve(__dirname, 'cache', filename), file, err => {
            if(err)
                console.error(err);
        });
    }

    res.setHeader('Cache-Control', `public, max-age=${CACHE_DURATION}`);
    res.contentType('image/png');
    res.send(file);
});

app.get('/leather/:type/:color', async (req, res) => {
    let file;
    let types = ["boots", "leggings", "chestplate", "helmet"];

    if(!types.includes(req.params.type))
        throw new Error("invalid armor type");

    let type = req.params.type;

    let color = req.params.color.split(",");

    if(color.length < 3)
        throw new Error("invalid color");

    let filename = `leather_${type}_${color.join("_")}.png`;

    try{
        file = await fs.readFile(path.resolve(__dirname, 'cache', filename));
    }catch(e){
        file = await renderer.renderArmor(type, color);

        fs.writeFile(path.resolve(__dirname, 'cache', filename), file, err => {
            if(err)
                console.error(err);
        });
    }

    res.setHeader('Cache-Control', `public, max-age=${CACHE_DURATION}`);
    res.contentType('image/png');
    res.send(file);
});

app.get('/', async (req, res, next) => {
    res.render('index', { error: null, player: null, page: 'index' });
});

app.get('*', async (req, res, next) => {
    res.redirect('/');
});

app.listen(port, () => console.log(`SkyBlock Stats running on http://localhost:${port}`));

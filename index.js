const express = require('express');
const cookieParser = require('cookie-parser')
const axios = require('axios');
const fs = require('fs-extra');
const path = require('path');
const util = require('util');
const renderer = require('./renderer');
const lib = require('./lib');
const _ = require('lodash');
const moment = require('moment');

const low = require('lowdb');
const FileSync = require('lowdb/adapters/FileSync');

const adapter = new FileSync('db.json');
const db = low(adapter);

db
.defaults({ usernames: [] })
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

    if(user)
        if(+new Date() - user.date < 3600 * 1000)
            output = user.username;

    if(!output){
        try{
            let { data } = await axios(`https://sessionserver.mojang.com/session/minecraft/profile/${uuid}`);

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

            output = data.name;
        }catch(e){
            return "";
        }
    }

    return output;
}

const app = express();
const port = 32464;

app.set('view engine', 'ejs');

app.use(cookieParser());
app.use(express.static('public'));

app.get('/stats/:player/:profile?', async (req, res, next) => {
    let { data } = await Hypixel.get('player', { params: { key: getApiKey(), name: req.params.player } });

    if(data.player == null){
        res
        .cookie('error', 'Player not found.')
        .redirect('/');
        return false;
    }

    if(!('SkyBlock' in data.player.stats)){
        res
        .cookie('error', 'Player has not played SkyBlock yet.')
        .redirect('/');
        return false;
    }

    let all_skyblock_profiles = data.player.stats.SkyBlock.profiles;

    let skyblock_profiles = {};

    if(Object.keys(all_skyblock_profiles).length == 0){
        let default_profile = await Hypixel.get('skyblock/profile', { params: { key: getApiKey(), profile: data.player.uuid }});

        if(default_profile.data.profile == null){
            res
            .cookie('error', 'Player has no SkyBlock profiles.')
            .redirect('/');
            return false;
        }else{
            skyblock_profiles[data.player.uuid] = {
                profile_id: data.player.uuid,
                cute_name: 'Avocado'
            };

            all_skyblock_profiles = skyblock_profiles;
        }
    }

    if(req.params.profile)
        skyblock_profiles = _.pickBy(all_skyblock_profiles, a => a.cute_name.toLowerCase() == req.params.profile.toLowerCase());

    if(Object.keys(skyblock_profiles).length == 0)
        skyblock_profiles = all_skyblock_profiles;

    let profile_names = Object.keys(skyblock_profiles);

    let promises = [];

    for(let profile in skyblock_profiles)
        promises.push(
            Hypixel.get('skyblock/profile', { params: { key: getApiKey(), profile: profile } })
        );

    let responses = await Promise.all(promises);

    let profiles = [];

    responses.forEach(response => {
        profiles.push(response.data.profile);
    });

    let highest = 0;
    let profile_id;

    profiles.forEach((_profile, index) => {
        if(_profile === undefined)
            return;

        let user_profile = _profile.members[data.player.uuid];

        if(user_profile.last_save > highest){
            profile = _profile;
            highest = user_profile.last_save;
            profile_id = profile_names[index];
        }
    });

    let user_profile = profile.members[data.player.uuid];

    let member_uuids = Object.keys(profile.members);

    let members = [];

    for(let member of member_uuids)
        if(member != data.player.uuid)
            members.push({ uuid: member, display_name: await uuidToUsername(member) });

    let items = await lib.getItems(user_profile);
    let calculated = await lib.getStats(user_profile, items);

    calculated.uuid = data.player.uuid;
    calculated.display_name = data.player.displayname;
    calculated.profile = skyblock_profiles[profile_id];
    calculated.profiles = _.pickBy(all_skyblock_profiles, a => a.profile_id != profile_id);
    calculated.members = members;

    calculated.last_updated = {
        unix: user_profile.last_save,
        text: moment.unix(user_profile.last_save / 1000).fromNow()
    };

    res.render('stats', { items, calculated, page: 'stats' });
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

    res.contentType('image/png');
    res.send(file);
});

app.get('/', async (req, res, next) => {
    res.render('index', { page: 'index '});
});

app.get('*', async (req, res, next) => {
    res.redirect('/');
});

app.listen(port, () => console.log(`SkyBlock Stats running on http://localhost:${port}`));

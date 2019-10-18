const express = require('express');
const axios = require('axios');
const fs = require('fs-extra');
const path = require('path');
const util = require('util');
const renderer = require('./renderer');
const helper = require('./helper');
const _ = require('lodash');

const credentials = require('./credentials.json');

const app = express();
const port = 32464;

const Hypixel = axios.create({
    baseURL: 'https://api.hypixel.net/'
});
app.set('view engine', 'ejs');
app.use(express.static('public'));

app.get('/', async (req, res, next) => {
    res.redirect('/stats/LeaPhant');
});

app.get('/stats/:player/:profile?', async (req, res, next) => {
    let { data } = await Hypixel.get('player', { params: { key: credentials.hypixel_api_key, name: req.params.player } });

    if(data.player == null){
        res.send('Player not found');
        return false;
    }

    if(!('SkyBlock' in data.player.stats)){
        res.send("Player has not played SkyBlock yet");
        return false;
    }

    let skyblock_profiles = data.player.stats.SkyBlock.profiles;

    if(req.params.profile){
        skyblock_profiles = _.pickBy(skyblock_profiles, a => a.cute_name.toLowerCase() == req.params.profile.toLowerCase());
    }

    let profile_names = Object.keys(skyblock_profiles);

    let responses = [];

    for(let profile in skyblock_profiles)
        responses.push(
            await Hypixel.get('skyblock/profile', { params: { key: credentials.hypixel_api_key, profile: profile } })
        );

    let profiles = [];

    responses.forEach(response => {
        profiles.push(response.data.profile.members[data.player.uuid]);
    });

    let highest = 0;
    let profile_id;

    profiles.forEach((_profile, index) => {
        if(_profile.last_save > highest){
            profile = _profile;
            highest = _profile.last_save;
            profile_id = profile_names[index];
        }
    });

    let items = await helper.getItems(profile);
    let calculated = await helper.getStats(profile, items);

    calculated.uuid = data.player.uuid;
    calculated.display_name = data.player.displayname;
    calculated.profile = skyblock_profiles[profile_id];

    res.render('stats', { items, calculated });
});

app.get('/head/:uuid', async (req, res) => {
    let uuid = req.params.uuid;

    let filename = `head_${uuid}.png`;

    try{
        file = await fs.readFile(path.resolve(__dirname, 'cache', filename));
    }catch(e){
        file = await renderer.renderHead(`http://textures.minecraft.net/texture/${uuid}`, 10);

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

app.listen(port, () => console.log(`SkyBlock Stats running on http://localhost:${port}`));

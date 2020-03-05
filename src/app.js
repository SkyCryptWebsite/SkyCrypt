const cluster = require('cluster');
const lib = require('./lib');

const dbUrl = 'mongodb://localhost:27017';
const dbName = 'sbstats';

async function main(){
    const express = require('express');
    const bodyParser = require('body-parser');

    const axios = require('axios');
    require('axios-debug-log')

    const fs = require('fs-extra');

    const path = require('path');
    const util = require('util');
    const renderer = require('./renderer');
    const _ = require('lodash');
    const objectPath = require('object-path');
    const moment = require('moment');
    const { MongoClient } = require('mongodb');
    const helper = require('./helper');
    const constants = require('./constants');

    const mongo = new MongoClient(dbUrl, { useUnifiedTopology: true });
    await mongo.connect();
    const db = mongo.db(dbName);

    const CACHE_DURATION = 30 * 24 * 60 * 60 * 1000; // 30 days

    const cachePath = path.resolve(__dirname, '../cache');

    await fs.ensureDir(cachePath);

    const credentials = require(path.resolve(__dirname, '../credentials.json'));

    if(credentials.hypixel_api_key.length == 0)
        throw "Please enter a valid Hypixel API Key. Join mc.hypixel.net and enter /api to obtain one.";

    const Hypixel = axios.create({
        baseURL: 'https://api.hypixel.net/'
    });

    const app = express();
    const port = 32464;

    app.locals.moment = moment;
    app.use(bodyParser.urlencoded({ extended: true }));
    app.set('view engine', 'ejs');
    app.use(express.static('public', { maxAge: CACHE_DURATION }));

    require('./api')(app, db);
    require('./donations/kofi')(app, db);

    async function getExtra(){
        const output = {};

        const kofiEntry = await db.collection('donations').find({type: 'kofi'}).next();
        const patreonEntry = await db.collection('donations').find({type: 'patreon'}).next();

        if(kofiEntry == null || patreonEntry == null)
            return output;

        output.donations = {
            kofi: kofiEntry.amount || 0,
            patreon: patreonEntry.amount || 0
        };

        return output;
    }

    app.get('/stats/:player/:profile?', async (req, res, next) => {
        let response;

        let paramPlayer = req.params.player.toLowerCase().replace(/\-/g, '');
        let paramProfile = req.params.profile ? req.params.profile.toLowerCase() : null;

        let playerUsername = paramPlayer;

        let isPlayerUuid = paramPlayer.length == 32;
        let isProfileUuid = false;

        if(paramProfile)
            isProfileUuid = paramProfile.length == 32;

        let activeProfile;

        if(!isPlayerUuid){
            let playerObject = await db
            .collection('usernames')
            .find({ username: new RegExp(`^${paramPlayer}\$`, 'i') })
            .next();

            if(playerObject){
                paramPlayer = playerObject.uuid;
                isPlayerUuid = true;
            }
        }else{
            let playerObject = await db
            .collection('usernames')
            .find({ uuid: paramPlayer })
            .next();

            if(playerObject)
                playerUsername = playerObject.username;
        }

        if(isPlayerUuid)
            activeProfile = await db
            .collection('profiles')
            .find({ uuid: paramPlayer })
            .next();
        else
            activeProfile = await db
            .collection('profiles')
            .find({ username: paramPlayer })
            .next();

        let params = {
            key: credentials.hypixel_api_key
        };

        if(isPlayerUuid)
            params.uuid = paramPlayer;
        else
            params.name = paramPlayer;

        try{
            response = await Hypixel.get('player', { params, timeout: 5000 });
            let { data } = response;

            if(!data.success){
                res.render('index', {
                    error: 'Request to Hypixel API failed. Please try again!',
                    player: playerUsername,
                    extra: await getExtra(),
                    page: 'index'
                });

                return false;
            }

            if(data.player == null){
                res.render('index', {
                    error: 'Player not found.',
                    player: playerUsername,
                    extra: await getExtra(),
                    page: 'index'
                });

                return false;
            }

            if(!objectPath.has(data, 'player.stats')){
                res.render('index', {
                    error: 'No data returned by Hypixel API, please try again!',
                    player: playerUsername,
                    extra: await getExtra(),
                    page: 'index'
                });

                return false;
            }

            if(!('SkyBlock' in data.player.stats)){
                res.render('index', {
                    error: 'Player has not played SkyBlock yet.',
                    player: playerUsername,
                    extra: await getExtra(),
                    page: 'index'
                });

                return false;
            }

            const hypixelPlayer = data.player;

            await db
            .collection('usernames')
            .replaceOne(
                { uuid: hypixelPlayer.uuid },
                { uuid: hypixelPlayer.uuid, username: hypixelPlayer.displayname, date: +new Date() },
                { upsert: true }
            );

            let allSkyBlockProfiles = hypixelPlayer.stats.SkyBlock.profiles;

            let skyBlockProfiles = {};

            if(Object.keys(allSkyBlockProfiles).length == 0){
                let default_profile = await Hypixel.get('skyblock/profile', {
                    params: { key: credentials.hypixel_api_key, profile: data.player.uuid
                }});

                if(default_profile.data.profile == null){
                    res.render('index', {
                        error: 'Player has no SkyBlock profiles.',
                        player: playerUsername,
                        extra: await getExtra(),
                        page: 'index'
                    });

                    return false;
                }else{
                    skyBlockProfiles[data.player.uuid] = {
                        profile_id: data.player.uuid,
                        cute_name: 'Avocado',
                    };

                    allSkyBlockProfiles = skyBlockProfiles;
                }
            }

            if(paramProfile){
                if(isProfileUuid){
                    if(Object.keys(allSkyBlockProfiles).includes(paramProfile)){
                        skyBlockProfiles = _.pickBy(allSkyBlockProfiles, a => a.profile_id.toLowerCase() == paramProfile);
                    }else{
                        skyBlockProfiles[paramProfile] = {
                            profile_id: paramProfile,
                            cute_name: 'Deleted'
                        };
                    }
                }else{
                    skyBlockProfiles = _.pickBy(allSkyBlockProfiles, a => a.cute_name.toLowerCase() == paramProfile);
                }
            }else if(activeProfile)
                skyBlockProfiles = _.pickBy(allSkyBlockProfiles, a => a.profile_id.toLowerCase() == activeProfile.profile_id);

            if(Object.keys(skyBlockProfiles).length == 0)
                skyBlockProfiles = allSkyBlockProfiles;

            const profileNames = Object.keys(skyBlockProfiles);

            const promises = [];
            const profileIds = [];

            for(const profile in skyBlockProfiles){
                profileIds.push(profile);

                promises.push(
                    Hypixel.get('skyblock/profile', { params: { key: credentials.hypixel_api_key, profile: profile } })
                );
            }

            const responses = await Promise.all(promises);

            const profiles = [];

            for(const [index, profile_response] of responses.entries()){
                if(!profile_response.data.success){
                    delete skyBlockProfiles[profileIds[index]];
                    continue;
                }

                let memberCount = 0;

                for(const member in profile_response.data.profile.members){
                    if('last_save' in profile_response.data.profile.members[member])
                        memberCount++;
                }

                if(memberCount == 0){
                    delete skyBlockProfiles[profileIds[index]];

                    if(req.params.profile){
                        res.render('index', {
                            error: 'Uh oh, this SkyBlock profile has no players.',
                            player: playerUsername,
                            extra: await getExtra(),
                            page: 'index'
                        });

                        return false;
                    }

                    continue;
                }

                profiles.push(profile_response.data.profile);
            }

            if(profiles.length == 0){
                res.render('index', {
                    error: 'No data returned by Hypixel API, please try again!',
                    player: playerUsername,
                    extra: await getExtra(),
                    page: 'index'
                });

                return false;
            }

            let highest = 0;
            let profileId;
            let profile;

            profiles.forEach((_profile, index) => {
                if(_profile === undefined || _profile === null)
                    return;

                let userProfile = _profile.members[data.player.uuid];

                if('last_save' in userProfile && userProfile.last_save > highest){
                    profile = _profile;
                    highest = userProfile.last_save;
                    profileId = profileNames[index];
                }
            });

            if(!profile){
                res.render('index', {
                    error: 'User not found in selected profile. This is probably due to a declined co-op invite.',
                    player: playerUsername,
                    extra: await getExtra(),
                    page: 'index'
                });

                return false;
            }

            let userProfile = profile.members[data.player.uuid];

            if(!activeProfile || userProfile.last_save > activeProfile.last_save){
                await db
                .collection('profiles')
                .replaceOne(
                    { uuid: hypixelPlayer.uuid },
                    { uuid: hypixelPlayer.uuid, username: hypixelPlayer.displayname, profile_id: profileId, last_save: userProfile.last_save },
                    { upsert: true }
                );
            }

            for(const member in profile.members)
                if(!('last_save' in profile.members[member]))
                    delete profile.members[member];

            const memberUuids = Object.keys(profile.members);

            const memberPromises = [];

            for(let member of memberUuids)
                if(member != data.player.uuid)
                    memberPromises.push(helper.uuidToUsername(member, db));

            const members = await Promise.all(memberPromises);

            members.push({
                uuid: hypixelPlayer.uuid,
                display_name: hypixelPlayer.displayname
            });

            for(const member of members){
                await db
                .collection('members')
                .replaceOne(
                    { profile_id: profileId, uuid: member.uuid },
                    { profile_id: profileId, uuid: member.uuid, username: member.display_name },
                    { upsert: true}
                );
            }

            const items = await lib.getItems(userProfile);
            const calculated = await lib.getStats(userProfile, items);

            if(objectPath.has(profile, 'banking.balance'))
                calculated.bank = profile.banking.balance;

            calculated.rank_prefix = lib.rankPrefix(data.player);
            calculated.purse = userProfile.coin_purse || 0;
            calculated.uuid = data.player.uuid;
            calculated.display_name = data.player.displayname;
            calculated.profile = skyBlockProfiles[profileId];
            calculated.profiles = _.pickBy(allSkyBlockProfiles, a => a.profile_id != profileId);
            calculated.members = members.filter(a => a.uuid != hypixelPlayer.uuid);
            calculated.minions = lib.getMinions(profile.members);
            calculated.minion_slots = lib.getMinionSlots(calculated.minions);
            calculated.pets = await lib.getPets(userProfile);
            calculated.collections = await lib.getCollections(userProfile);

            calculated.fishing = {
                total: userProfile.stats.items_fished || 0,
                treasure: userProfile.stats.items_fished_treasure || 0,
                treasure_large: userProfile.stats.items_fished_large_treasure || 0,
                shredder_fished: userProfile.stats.shredder_fished || 0
            };

            const last_updated = userProfile.last_save;
            const first_join = userProfile.first_join;

            const diff = (+new Date() - last_updated) / 1000;

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

            res.render('stats', { items, calculated, _, constants, helper, extra: await getExtra(), page: 'stats' });
        }catch(e){
            console.error(e);

            res.render('index', {
                error: 'Request to Hypixel API failed. Their API might be down right now so try again later.',
                player: playerUsername,
                extra: await getExtra(),
                page: 'index'
            });

            return false;
        }
    });

    app.get('/head/:uuid', async (req, res) => {
        const { uuid } = req.params;

        const filename = `head_${uuid}.png`;

        try{
            file = await fs.readFile(path.resolve(cachePath, filename));
        }catch(e){
            file = await renderer.renderHead(`http://textures.minecraft.net/texture/${uuid}`, 6.4);

            fs.writeFile(path.resolve(cachePath, filename), file, err => {
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

        if(!["boots", "leggings", "chestplate", "helmet"].includes(req.params.type))
            throw new Error("invalid armor type");

        const { type } = req.params;

        const color = req.params.color.split(",");

        if(color.length < 3)
            throw new Error("invalid color");

        const filename = `leather_${type}_${color.join("_")}.png`;

        try{
            file = await fs.readFile(path.resolve(cachePath, filename));
        }catch(e){
            file = await renderer.renderArmor(type, color);

            fs.writeFile(path.resolve(cachePath, filename), file, err => {
                if(err)
                    console.error(err);
            });
        }

        res.setHeader('Cache-Control', `public, max-age=${CACHE_DURATION}`);
        res.contentType('image/png');
        res.send(file);
    });

    app.get('/', async (req, res, next) => {
        res.render('index', { error: null, player: null, extra: await getExtra(), page: 'index' });
    });

    app.get('*', async (req, res, next) => {
        res.redirect('/');
    });

    app.listen(port, () => console.log(`SkyBlock Stats running on http://localhost:${port}`));
}

if(cluster.isMaster){
    const cpus = require('os').cpus().length;

    for(let i = 0; i < cpus; i += 1){
        cluster.fork();
    }

    console.log('Running SkyBlock Stats on %i cores', cpus);
}else{
    main();
}

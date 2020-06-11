const cluster = require('cluster');
const lib = require('./lib');

const dbUrl = 'mongodb://localhost:27017';
const dbName = 'sbstats';

async function main(){
    const express = require('express');
    const session = require('express-session');
    const MongoStore = require('connect-mongo')(session);
    const bodyParser = require('body-parser');
    const crypto = require('crypto');
    const cors = require('cors');

    const axiosCacheAdapter = require('axios-cache-adapter');

    const { RedisStore } = axiosCacheAdapter;
    const redis = require('redis');

    const redisClient = redis.createClient();
    const redisStore = new RedisStore(redisClient);

    const axios = require('axios');
    require('axios-debug-log');

    const retry = require('async-retry');

    const fs = require('fs-extra');

    const path = require('path');
    const util = require('util');
    const renderer = require('./renderer');

    await renderer.init();

    const _ = require('lodash');
    const objectPath = require('object-path');
    const moment = require('moment-timezone');
    require('moment-duration-format')(moment);

    const { MongoClient } = require('mongodb');
    const helper = require('./helper');
    const constants = require('./constants');
    const { SitemapStream, streamToPromise } = require('sitemap');
    const { createGzip } = require('zlib');
    const twemoji = require('twemoji');

    const mongo = new MongoClient(dbUrl, { useUnifiedTopology: true });
    await mongo.connect();
    const db = mongo.db(dbName);

    const CACHE_DURATION = 30 * 24 * 60 * 60 * 1000; // 30 days

    const cachePath = path.resolve(__dirname, '../cache');

    await fs.ensureDir(cachePath);

    const credentials = require(path.resolve(__dirname, '../credentials.json'));

    if(credentials.hypixel_api_key.length == 0)
        throw "Please enter a valid Hypixel API Key. Join mc.hypixel.net and enter /api to obtain one.";

    const Hypixel = axiosCacheAdapter.setup({
        baseURL: 'https://api.hypixel.net/',
        cache: {
            maxAge: 2 * 60 * 1000,
            store: redisStore,
            exclude: {
                query: false
            }
        },
        timeout: 5000,
    });

    const app = express();
    const port = 32464;

    let sitemap;

    app.locals.moment = moment;
    app.use(bodyParser.urlencoded({ extended: true }));
    app.set('view engine', 'ejs');
    app.use(express.static('public', { maxAge: CACHE_DURATION }));

    app.use(session({
        secret: credentials.session_secret,
        resave: false,
        saveUninitialized: false,
        store: new MongoStore({
            client: mongo
        })
    }));

    require('./api')(app, db);
    require('./donations/kofi')(app, db);

    async function getExtra(){
        const output = {};

        const kofiEntry = await db.collection('donations').findOne({type: 'kofi'});
        const patreonEntry = await db.collection('donations').findOne({type: 'patreon'});

        if(kofiEntry == null || patreonEntry == null)
            return output;

        output.donations = {
            kofi: kofiEntry.amount || 0,
            patreon: patreonEntry.amount || 0
        };

        const topProfiles = await db
        .collection('viewsLeaderboard')
        .aggregate([
            {
                "$lookup": {
                    "from": "profiles",
                    "localField": "uuid",
                    "foreignField": "uuid",
                    "as": "profileInfo"
                }
            },
            {
                "$unwind": {
                    "path": "$profileInfo"
                }
            }
        ])
        .limit(20)
        .toArray();

        for(const profile of topProfiles){
            delete profile.views;
            delete profile.total;
            delete profile.weekly;
            delete profile.daily;
            delete profile.rank;
        }

        output.top_profiles = topProfiles;

        if('recaptcha_site_key' in credentials)
            output.recaptcha_site_key = credentials.recaptcha_site_key;

        output.twemoji = twemoji;

        return output;
    }

    app.all('/stats/:player/:profile?', async (req, res, next) => {
        let response;

        let paramPlayer = req.params.player.toLowerCase().replace(/[^a-z\d\-\_:]/g, '');
        let paramProfile = req.params.profile ? req.params.profile.toLowerCase() : null;

        let playerUsername = paramPlayer;

        let isPlayerUuid = paramPlayer.length == 32;
        let isProfileUuid = false;

        if(paramProfile)
            isProfileUuid = paramProfile.length == 32;

        if(!isPlayerUuid){
            try{
                const { uuid } = await helper.usernameToUuid(paramPlayer, db);

                paramPlayer = uuid;
                isPlayerUuid = true;
            }catch(e){
                console.error(e);

                res.status(500);
                res.render('index', {
                    error: e,
                    player: playerUsername,
                    extra: await getExtra(),
                    helper,
                    page: 'index'
                });
            }
        }else{
            playerUsername = (await helper.uuidToUsername(paramPlayer, db)).display_name;
        }

        let playerObject = await helper.uuidToUsername(paramPlayer, db);

        try{
            const { profile, allProfiles } = await helper.getProfile(db, paramPlayer, paramProfile);

            let userProfile = profile.members[paramPlayer];

            for(const member in profile.members)
                if(!('last_save' in profile.members[member]))
                    delete profile.members[member];

            const memberUuids = Object.keys(profile.members);

            const memberPromises = [];

            for(let member of memberUuids)
                if(member != paramPlayer)
                    memberPromises.push(helper.uuidToUsername(member, db));

            const members = await Promise.all(memberPromises);

            const userInfo = await db
            .collection('usernames')
            .findOne({ uuid: paramPlayer });

            const hypixelRank = await helper.getRank(paramPlayer, db);

            const items = await lib.getItems(userProfile, req.query.pack);
            const calculated = await lib.getStats(userProfile, items, hypixelRank);

            calculated.display_name = playerUsername;

            if('wardrobe_equipped_slot' in userProfile)
                calculated.wardrobe_equipped_slot = userProfile.wardrobe_equipped_slot;

            if(userInfo){
                calculated.display_name = userInfo.username;

                members.push({
                    uuid: paramPlayer,
                    display_name: userInfo.username
                });

                if('emoji' in userInfo)
                    calculated.display_emoji = userInfo.emoji;
            }

            for(const member of members){
                await db
                .collection('members')
                .replaceOne(
                    { profile_id: profile.profile_id, uuid: member.uuid },
                    { profile_id: profile.profile_id, uuid: member.uuid, username: member.display_name },
                    { upsert: true}
                );
            }


            if(objectPath.has(profile, 'banking.balance'))
                calculated.bank = profile.banking.balance;

            calculated.guild = await helper.getGuild(paramPlayer, db);

            calculated.rank_prefix = helper.renderRank(hypixelRank);
            calculated.purse = userProfile.coin_purse || 0;
            calculated.uuid = paramPlayer;
            calculated.skin_data = playerObject.skin_data;

            calculated.profile = { profile_id: profile.profile_id, cute_name: profile.cute_name };
            calculated.profiles = {};

            for(const sbProfile of allProfiles.filter(a => a.profile_id != profile.profile_id))
                calculated.profiles[sbProfile.profile_id] = {
                    profile_id: sbProfile.profile_id,
                    cute_name: sbProfile.cute_name
                };

            calculated.members = members.filter(a => a.uuid != paramPlayer);
            calculated.minions = lib.getMinions(profile.members);
            calculated.minion_slots = lib.getMinionSlots(calculated.minions);
            calculated.collections = await lib.getCollections(paramPlayer, profile, members);
            calculated.bag_sizes = await lib.getBagSizes(calculated.collections);
            calculated.social = hypixelRank.socials;

            calculated.fishing = {
                total: userProfile.stats.items_fished || 0,
                treasure: userProfile.stats.items_fished_treasure || 0,
                treasure_large: userProfile.stats.items_fished_large_treasure || 0,
                shredder_fished: userProfile.stats.shredder_fished || 0,
                shredder_bait: userProfile.stats.shredder_bait || 0,
            };

            const misc = {};

            misc.milestones = {};
            misc.races = {};
            misc.gifts = {};
            misc.winter = {};
            misc.dragons = {};
            misc.protector = {};
            misc.damage = {};
            misc.auctions_sell = {};
            misc.auctions_buy = {};

            if('ender_crystals_destroyed' in userProfile.stats)
                misc.dragons['ender_crystals_destroyed'] = userProfile.stats['ender_crystals_destroyed'];

            misc.dragons['last_hits'] = 0;
            misc.dragons['deaths'] = 0;

            const auctions_buy = ["auctions_bids", "auctions_highest_bid", "auctions_won", "auctions_gold_spent"];
            const auctions_sell = ["auctions_fees", "auctions_gold_earned"];

            const auctions_bought = {};
            const auctions_sold = {};

            for(const key of auctions_sell)
                if(key in userProfile.stats)
                    misc.auctions_sell[key.replace("auctions_", "")] = userProfile.stats[key];

            for(const key of auctions_buy)
                if(key in userProfile.stats)
                    misc.auctions_buy[key.replace("auctions_", "")] = userProfile.stats[key];

            for(const key in userProfile.stats)
                if(key.includes('_best_time'))
                    misc.races[key] = userProfile.stats[key];
                else if(key.includes('gifts_'))
                    misc.gifts[key] = userProfile.stats[key];
                else if(key.includes('most_winter'))
                    misc.winter[key] = userProfile.stats[key];
                else if(key.includes('highest_critical_damage'))
                    misc.damage[key] = userProfile.stats[key];
                else if(key.includes('auctions_sold_'))
                    auctions_sold[key.replace("auctions_sold_", "")] = userProfile.stats[key];
                else if(key.includes('auctions_bought_'))
                    auctions_bought[key.replace("auctions_bought_", "")] = userProfile.stats[key];
                else if(key.startsWith('kills_') && key.endsWith('_dragon'))
                    misc.dragons['last_hits'] += userProfile.stats[key];
                else if(key.startsWith('deaths_') && key.endsWith('_dragon'))
                    misc.dragons['deaths'] += userProfile.stats[key];
                else if(key.includes('kills_corrupted_protector'))
                    misc.protector['last_hits'] = userProfile.stats[key];
                else if(key.includes('deaths_corrupted_protector'))
                    misc.protector['deaths'] = userProfile.stats[key];
                else if(key.startsWith('pet_milestone_')){
                    misc.milestones[key.replace('pet_milestone_', '')] = userProfile.stats[key];
                }

            for(const key in misc.dragons)
                if(misc.dragons[key] == 0)
                    delete misc.dragons[key];

            for(const key in misc)
                if(Object.keys(misc[key]).length == 0)
                    delete misc[key];

            for(const key in auctions_bought)
                misc.auctions_buy['items_bought'] = (misc.auctions_buy['items_bought'] || 0) + auctions_bought[key];

            for(const key in auctions_sold)
                misc.auctions_sell['items_sold'] = (misc.auctions_sell['items_sold'] || 0) + auctions_sold[key];

            calculated.misc = misc;
            calculated.auctions_bought = auctions_bought;
            calculated.auctions_sold = auctions_sold;

            const last_updated = userProfile.last_save;
            const first_join = userProfile.first_join;

            const diff = (+new Date() - last_updated) / 1000;

            let last_updated_text = moment(last_updated).fromNow();
            let first_join_text = moment(first_join).fromNow();

            let currentArea;

            if(diff < 5 * 60){
                try{
                    const statusResponse = await Hypixel.get('status', { params: { uuid: paramPlayer, key: credentials.hypixel_api_key }});

                    const areaData = statusResponse.data.session;

                    if(areaData.online && areaData.gameType == 'SKYBLOCK')
                        currentArea = areaData.mode;
                }catch(e){

                }
            }

            if(currentArea)
                calculated.current_area = constants.area_names[currentArea];

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

            const apisEnabled = !('no_inventory' in items) && 'levels' in calculated && Object.keys(calculated.social).length > 0;

            if(profile.cute_name != 'Deleted'){
                const currentProfile = await db
                .collection('profiles')
                .findOne(
                    { uuid: paramPlayer }
                );

                if(currentProfile === null || userProfile.last_save > currentProfile.last_save){
                    await db
                    .collection('profiles')
                    .updateOne(
                        { uuid: paramPlayer },
                        { $set: { username: playerUsername, profile_id: profile.profile_id, last_save: userProfile.last_save, api: apisEnabled }},
                        { upsert: true }
                    );
                }
            }

            res.render('stats', { items, calculated, _, constants, helper, extra: await getExtra(), page: 'stats' });
        }catch(e){
            console.error(e);

            if(objectPath.has(e, 'response.data.cause')){
                res.render('index', {
                    error: `Hypixel API Error: ${e.response.data.cause}.`,
                    player: playerUsername,
                    extra: await getExtra(),
                    helper,
                    page: 'index'
                });
            }else{
                res.render('index', {
                    error: 'Unknown Hypixel API error.',
                    player: playerUsername,
                    extra: await getExtra(),
                    helper,
                    page: 'index'
                });
            }

            return false;
        }
    });

    app.all('/texture/:uuid', cors(), async (req, res) => {
        const { uuid } = req.params;

        const filename = `texture_${uuid}.png`;

        try{
            file = await fs.readFile(path.resolve(cachePath, filename));
        }catch(e){
            try{
                file = (await axios.get(`https://textures.minecraft.net/texture/${uuid}`, { responseType: 'arraybuffer' })).data;

                fs.writeFile(path.resolve(cachePath, filename), file, err => {
                    if(err)
                        console.error(err);
                });
            }catch(e){
                res.status(404);
                res.send('texture not found');

                return;
            }
        }

        res.setHeader('Cache-Control', `public, max-age=${CACHE_DURATION}`);
        res.contentType('image/png');
        res.send(file);
    });

    app.all('/cape/:username', cors(), async (req, res) => {
        const { username } = req.params;

        const filename = `cape_${username}.png`;

        try{
            file = await fs.readFile(path.resolve(cachePath, filename));

            const fileStats = await fs.stat(path.resolve(cachePath, filename));

            if(Date.now() - stats.mtime > 10 * 1000){
                const optifineCape = await axios.head(`https://optifine.net/capes/${username}.png`);
                const lastUpdated = moment(optifineCape.headers['last-modified']);

                if(lastUpdated.unix() > stats.mtime)
                    throw "optifine cape changed";
            }
        }catch(e){
            try{
                file = (await axios.get(`https://optifine.net/capes/${username}.png`, { responseType: 'arraybuffer' })).data;

                fs.writeFile(path.resolve(cachePath, filename), file, err => {
                    if(err)
                        console.error(err);
                });
            }catch(e){
                res.status(404);
                res.send('no cape for user');

                return;
            }
        }

        res.setHeader('Cache-Control', `public, max-age=${CACHE_DURATION}`);
        res.contentType('image/png');
        res.send(file);
    });

    app.all('/head/:uuid', cors(), async (req, res) => {
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

    app.all('/item(.gif)?/:skyblockId?', cors(), async (req, res) => {
        const skyblockId = req.params.skyblockId || null;
        const item = await renderer.renderItem(skyblockId, req.query, db);

        if(item.error){
            res.status(500);
            res.send(item.error);
            return;
        }

        res.setHeader('Cache-Control', `public, max-age=${CACHE_DURATION}`);
        res.contentType(item.mime);
        res.send(item.image);
    });

    app.all('/leather/:type/:color', cors(), async (req, res) => {
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

    app.all('/sitemap.xml', async (req, res, next) => {
        res.header('Content-Type', 'application/xml');
        res.header('Content-Encoding', 'gzip');

        if(sitemap){
            res.send(sitemap);
            return
        }

        try{
            const smStream = new SitemapStream({ hostname: 'https://sky.lea.moe/' });
            const pipeline = smStream.pipe(createGzip());

            const cursor = await db.collection('viewsLeaderboard').find().limit(10000);

            while(await cursor.hasNext()){
                const doc = await cursor.next();

                smStream.write({ url: `/stats/${doc.userInfo.username}` });
            }

            smStream.end();

            streamToPromise(pipeline).then(sm => sitemap = sm);

            pipeline.pipe(res).on('error', (e) => {throw e});
        }catch(e){
            console.error(e)
            res.status(500).end()
        }
    });

    app.all('/random/stats', async (req, res, next) => {
        const profile = await db
        .collection('profiles')
        .aggregate([
            { $match: { api: true } },
            { $sample: { size: 1 } }
        ]).next();

        res.redirect(`/stats/${profile.uuid}/{profile.profile_id}`);
    });

    app.all('/favicon.ico', express.static(path.join(__dirname, 'public')));

    app.all('/:player/:profile?', async (req, res, next) => {
        res.redirect(`/stats${req.path}`);
    });

    app.all('/', async (req, res, next) => {
        res.render('index', { error: null, player: null, extra: await getExtra(), helper, page: 'index' });
    });

    app.all('*', async (req, res, next) => {
        res.redirect('/');
    });

    app.listen(port, () => console.log(`SkyBlock Stats running on http://localhost:${port}`));
}

if(cluster.isMaster){
    const cpus = Math.min(4, require('os').cpus().length);

    for(let i = 0; i < cpus; i += 1){
        cluster.fork();
    }

    console.log('Running SkyBlock Stats on %i cores', cpus);
}else{
    main();
}

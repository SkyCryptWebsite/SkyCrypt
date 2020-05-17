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

        let params = {
            key: credentials.hypixel_api_key,
            uuid: paramPlayer
        };

        try{
            const response = await retry(async () => {
                return await Hypixel.get('skyblock/profiles', {
                    params
                });
            });

            const { data } = response;

            if(!data.success){
                res.status(500);
                res.render('index', {
                    error: 'Request to Hypixel API failed. Please try again!',
                    player: playerUsername,
                    extra: await getExtra(),
                    helper,
                    page: 'index'
                });

                return false;
            }

            if(data.profiles == null){
                res.status(404);
                res.render('index', {
                    error: 'Player has no SkyBlock profiles.',
                    player: playerUsername,
                    extra: await getExtra(),
                    helper,
                    page: 'index'
                });

                return false;
            }

            const hypixelPlayer = data.player;

            let allSkyBlockProfiles = data.profiles;

            let skyBlockProfiles = [];

            if(paramProfile){
                if(isProfileUuid){
                    const filteredProfiles = allSkyBlockProfiles.filter(a => a.profile_id.toLowerCase() == paramProfile);

                    if(filteredProfiles.length > 0){
                        skyBlockProfiles = filteredProfiles;
                    }else{
                        const profileResponse = await retry(async () => {
                            const response = await Hypixel.get('skyblock/profile', {
                                params: { key: credentials.hypixel_api_key, profile: paramProfile }
                            });

                            if(!response.data.success)
                                throw "api request failed";

                            return response.data.profile;
                        });

                        profileResponse.cute_name = 'Deleted';

                        skyBlockProfiles.push(profileResponse);
                    }
                }else{
                    skyBlockProfiles = allSkyBlockProfiles.filter(a => a.cute_name.toLowerCase() == paramProfile);
                }
            }

            if(skyBlockProfiles.length == 0)
                skyBlockProfiles = allSkyBlockProfiles;

            const profiles = [];

            for(const [index, profile] of skyBlockProfiles.entries()){
                let memberCount = 0;

                for(const member in profile.members){
                    if('last_save' in profile.members[member])
                        memberCount++;
                }

                if(memberCount == 0){
                    if(req.params.profile){
                        res.status(404);
                        res.render('index', {
                            error: 'Uh oh, this SkyBlock profile has no players.',
                            player: playerUsername,
                            extra: await getExtra(),
                            helper,
                            page: 'index'
                        });

                        return false;
                    }

                    continue;
                }else{
                    profiles.push(profile);
                }
            }

            if(profiles.length == 0){
                res.status(500);
                res.render('index', {
                    error: 'No data returned by Hypixel API, please try again!',
                    player: playerUsername,
                    extra: await getExtra(),
                    helper,
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

                let userProfile = _profile.members[paramPlayer];

                if('last_save' in userProfile && userProfile.last_save > highest){
                    profile = _profile;
                    highest = userProfile.last_save;
                    profileId = _profile.profile_id;
                }
            });

            if(!profile){
                res.status(404);
                res.render('index', {
                    error: 'User not found in selected profile. This is probably due to a declined co-op invite.',
                    player: playerUsername,
                    extra: await getExtra(),
                    helper,
                    page: 'index'
                });

                return false;
            }

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

            members.push({
                uuid: paramPlayer,
                display_name: playerUsername
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

            const hypixelRank = await helper.getRank(paramPlayer, db);

            const items = await lib.getItems(userProfile, req.query.pack);
            const calculated = await lib.getStats(userProfile, items, hypixelRank);

            if(objectPath.has(profile, 'banking.balance'))
                calculated.bank = profile.banking.balance;

            calculated.guild = await helper.getGuild(paramPlayer, db);

            calculated.rank_prefix = helper.renderRank(hypixelRank);
            calculated.purse = userProfile.coin_purse || 0;
            calculated.uuid = paramPlayer;
            calculated.display_name = playerUsername;

            const userInfo = await db
            .collection('usernames')
            .findOne({ uuid: paramPlayer });

            if(userInfo){
                calculated.display_name = userInfo.username;

                if('emoji' in userInfo)
                    calculated.display_emoji = userInfo.emoji;
            }

            calculated.profile = { profile_id: profile.profile_id, cute_name: profile.cute_name };
            calculated.profiles = {};

            for(const sbProfile of allSkyBlockProfiles.filter(a => a.profile_id != profileId))
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
            misc.damage = {};
            misc.auctions_sell = {};
            misc.auctions_buy = {};

            if('ender_crystals_destroyed' in userProfile.stats)
                misc.dragons['ender_crystals_destroyed'] = userProfile.stats['ender_crystals_destroyed'];

            misc.dragons['dragon_last_hits'] = 0;
            misc.dragons['dragon_deaths'] = 0;

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
                    misc.dragons['dragon_last_hits'] += userProfile.stats[key];
                else if(key.startsWith('deaths_') && key.endsWith('_dragon'))
                    misc.dragons['dragon_deaths'] += userProfile.stats[key];
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

            /*

            - Hide Views for now due to abuse -

            calculated.views = _.pick(await db
            .collection('profileViews')
            .findOne({ uuid: hypixelPlayer.uuid }),
            'total', 'daily', 'weekly', 'rank');

            calculated.views.total = calculated.views.total || 0;

            const ipAddress = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
            const ipHash = crypto.createHash('md5').update(ipAddress).digest("hex");

            const ownViews = await db
            .collection('views')
            .countDocuments(
                { ip: ipHash, uuid: hypixelPlayer.uuid }
            );

            if(ownViews == 0)
                calculated.views.total++;
            */

            const apisEnabled = !('no_inventory' in items) && 'levels' in calculated && Object.keys(calculated.social).length > 0;

            if(profile.cute_name != 'Deleted'){
                await db
                .collection('profiles')
                .updateOne(
                    { uuid: paramPlayer },
                    { $set: { username: playerUsername, profile_id: profileId, last_save: userProfile.last_save, api: apisEnabled }},
                    { upsert: true }
                );
            }

            res.render('stats', { items, calculated, _, constants, helper, extra: await getExtra(), page: 'stats' });
        }catch(e){
            console.error(e);

            res.render('index', {
                error: 'Request to Hypixel API failed. Their API might be down right now so try again later.',
                player: playerUsername,
                extra: await getExtra(),
                helper,
                page: 'index'
            });

            return false;
        }
    });

    app.all('/head/:uuid', async (req, res) => {
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

    app.all('/item(.gif)?/:skyblockId?', async (req, res) => {
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

    app.all('/leather/:type/:color', async (req, res) => {
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

    /*

    - Hide Views for now due to abuse -

    app.all('/api/topViews', async (req, res, next) => {
        const limit = Math.min(100, req.query.limit || 10);
        const offset = Math.max(0, req.query.offset || 0);

        res.json(await db
        .collection('profileViews')
        .aggregate([
            {
                $sort: {
                    total: -1
                }
            },
            {
                $skip: offset
            },
            {
                $lookup: {
                    from: "usernames",
                    localField: "uuid",
                    foreignField: "uuid",
                    as: "userInfo"
                }
            },
            {
                $unwind: {
                    path: "$userInfo"
                }
            },
            {
                $limit: limit
            }
        ])
        .toArray());
    });*/

    app.all('/api/addView', async (req, res, next) => {
        res.send('ok');

        const response = await axios({
            method: 'post',
            url: `https://www.google.com/recaptcha/api/siteverify`,
            params: {
                secret: credentials.recaptcha_secret_key,
                response: req.query.token
            }
        });

        try{
            const { score } = response.data;

            if(score >= 0.9){
                const ipAddress = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
                const ipHash = crypto.createHash('md5').update(ipAddress).digest("hex");

                const { upsertedCount } = await db
                .collection('views')
                .replaceOne(
                    { ip: ipHash, uuid: req.query.uuid },
                    { ip: ipHash, uuid: req.query.uuid, time: new Date() },
                    { upsert: true }
                );

                /*

                - Freeze Views for now due to abuse -

                const userObject = await db
                .collection('usernames')
                .findOne({ uuid: req.query.uuid });

                if(upsertedCount > 0)
                    await db
                    .collection('profileViews')
                    .updateOne(
                        { uuid: req.query.uuid },
                        { $inc: { total: 1, weekly: 1, daily: 1 } },
                        { upsert: true }
                    );
                */
            }
        }catch(e){

        }
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

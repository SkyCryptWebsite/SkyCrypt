const cluster = require('cluster');
const lib = require('./lib');
const { getFileHashes, getFileHash, hashedDirectories } = require('./hashes');

async function main(){
    const express = require('express');
    const session = require('express-session');
    const MongoStore = require('connect-mongo')(session);
    const bodyParser = require('body-parser');
    const cors = require('cors');

    const Redis = require("ioredis");
    const redisClient = new Redis();

    const axios = require('axios');
    require('axios-debug-log');

    const retry = require('async-retry');

    const fs = require('fs-extra');

    const path = require('path');
    const util = require('util');
    const renderer = require('./renderer');

    await renderer.init();

    const fileHashes = await getFileHashes();

    if (process.env.NODE_ENV == 'development') {
        const { default: watch } = await import('node-watch');
        
        watch('public/resources', { recursive: true }, async (evt, name) => {
            const [, , directory, fileName] = name.split(/\/|\\/);
            if (hashedDirectories.includes(directory)) {
                fileHashes[directory][fileName] = await getFileHash(name);
            }
        });
    }

    const credentials = require(path.resolve(__dirname, '../credentials.json'));

    const _ = require('lodash');
    const moment = require('moment-timezone');
    require('moment-duration-format')(moment);

    const { MongoClient } = require('mongodb');
    const helper = require('./helper');
    const constants = require('./constants');
    const manifest = require('../public/manifest.json');
    const { SitemapStream, streamToPromise } = require('sitemap');
    const { createGzip } = require('zlib');
    const twemoji = require('twemoji');
    const cookieParser = require('cookie-parser');

    const mongo = new MongoClient(credentials.dbUrl, { useUnifiedTopology: true });
    await mongo.connect();
    const db = mongo.db(credentials.dbName);

    const CACHE_DURATION = 30 * 24 * 60 * 60 * 1000; // 30 days
    const cachePath = path.resolve(__dirname, '../cache');
    await fs.ensureDir(cachePath);

    if(credentials.hypixel_api_key.length == 0)
        throw "Please enter a valid Hypixel API Key. Join mc.hypixel.net and enter /api to obtain one.";

    let isFoolsDay;
    function updateIsFoolsDay() {
        const date = new Date();
        isFoolsDay = date.getUTCMonth() === 3 && date.getUTCDate() === 1;
    }
    updateIsFoolsDay();
    setInterval(updateIsFoolsDay, 60_000);

    const app = express();
    const port = 32464;

    let sitemap;

    app.locals.moment = moment;
    app.use(bodyParser.urlencoded({ extended: true }));
    app.set('view engine', 'ejs');
    express.static.mime.define({ 'application/opensearchdescription+xml': ['osd'] });
    app.use(express.static('public', { maxAge: CACHE_DURATION }));
    app.use(cookieParser())

    app.use(session({
        secret: credentials.session_secret,
        resave: false,
        saveUninitialized: false,
        store: new MongoStore({
            client: mongo
        })
    }));

    require('./api')(app, db);
    require('./apiv2')(app, db);
    require('./donations/kofi')(app, db);

    let FEATURED_PROFILES;
    let FEATURED_LAST_UPDATED = 0;

    function parseFavorites(cookie) {
        return cookie?.split(',').filter(uuid => /^[0-9a-f]{32}$/.test(uuid)) || [];
    }

    async function getFavoritesFormUUIDs(uuids) {
        favorites = [];
        for (const uuid of uuids) {
            if (uuid == null) continue;

            const cache = await db
            .collection('favoriteCache')
            .find( { uuid } )
            .toArray();

            if (cache[0]) {
                favorites.push(cache[0]);
                continue;
            } else {
                let output_cache = { uuid };
                
                const user = await db
                .collection('usernames')
                .find( { uuid } )
                .toArray();

                if (user[0]) {
                    output_cache = user[0];

                    let profiles = await db
                    .collection('profileStore')
                    .find( { uuid } )
                    .toArray();

                    if (profiles[0]) {
                        const profile = profiles[0];
                        output_cache.last_updated = profile.last_save;
                    } else {
                        output_cache.error = "Profile doesn't exist.";
                    }
                } else {
                    output_cache.error = "User doesn't exist.";
                }
                
                await db.collection('favoriteCache').insertOne(output_cache);
                favorites.push(output_cache);
            }
        
        }
        return favorites;
    }

    async function getExtra(page = null, favoriteUUIDs = []){
        const output = {};

        output.twemoji = twemoji;

        output.themes = lib.getThemes();

        output.packs = lib.getPacks();

        output.isFoolsDay = isFoolsDay;

        if('recaptcha_site_key' in credentials)
            output.recaptcha_site_key = credentials.recaptcha_site_key;

        const patreonEntry = await db.collection('donations').findOne({type: 'patreon'});

        if(patreonEntry != null)
            output.donations = { patreon: patreonEntry.amount || 0 };

        if (page === 'index') {
            if(FEATURED_PROFILES == null || (Date.now() - FEATURED_LAST_UPDATED < 900 * 1000)){
                FEATURED_LAST_UPDATED = Date.now();
                FEATURED_PROFILES = await db
                    .collection('topViews')
                    .find()
                    .sort({ position: 1 })
                    .toArray();
            }

            output.devs = FEATURED_PROFILES;

            output.favorites = await getFavoritesFormUUIDs(favoriteUUIDs);

            output.devs = await db
                .collection('topViews')
                .find()
                .sort({ position: 1 })
                .toArray();
        } else if (page === 'stats') {
            output.favoriteUUIDs = favoriteUUIDs;
        }

        return output;
    }

    app.all('/stats/:player/:profile?', async (req, res, next) => {
        const debugId = helper.generateDebugId('stats');
        const timeStarted = new Date().getTime();

        console.debug(`${debugId}: stats page was called.`);

        let paramPlayer = req.params.player.toLowerCase().replace(/[ +]/g, '_').replace(/[^a-z\d\-\_:]/g, '');
        let paramProfile = req.params.profile ? req.params.profile.toLowerCase() : null;

        const cacheOnly = req.query.cache === 'true';

        const playerUsername = paramPlayer.length == 32 ? await helper.resolveUsernameOrUuid(paramPlayer, db).display_name : paramPlayer;
        
        const favorites = parseFavorites(req.cookies.favorite);
        try{
            const { profile, allProfiles } = await lib.getProfile(db, paramPlayer, paramProfile, { updateArea: true, cacheOnly, debugId });

            const items = await lib.getItems(profile.members[profile.uuid], true, req.cookies.pack, { cacheOnly, debugId });
            const calculated = await lib.getStats(db, profile, allProfiles, items, { cacheOnly, debugId });

            if (isFoolsDay) {
                calculated.skin_data.skinurl = "http://textures.minecraft.net/texture/b4bd832813ac38e68648938d7a32f6ba29801aaf317404367f214b78b4d4754c";
            }

            console.debug(`${debugId}: starting page render.`);
            const renderStart = new Date().getTime();

            if(req.cookies.pack)
                process.send({type: "selected_pack", id: req.cookies.pack});

            res.render('stats', 
                { req, items, calculated, _, constants, helper, extra: await getExtra('stats', favorites), fileHashes, page: 'stats' },
                (err, html) => {
                    console.debug(`${debugId}: page succesfully rendered. (${new Date().getTime() - renderStart}ms)`);
                    res.set('X-Debug-ID', `${debugId}`);
                    res.set('X-Process-Time', `${new Date().getTime() - timeStarted}`);
                    res.send(html);
                }
            );
        }catch(e){
            console.debug(`${debugId}: an error has occured.`);
            console.error(e);

            res.render('index', 
                { req, error: e, player: playerUsername, extra: await getExtra('index', favorites), fileHashes, helper, page: 'index' },
                (err, html) => {
                    res.set('X-Debug-ID', `${debugId}`);
                    res.set('X-Process-Time', `${new Date().getTime() - timeStarted}`);
                    res.send(html);
                }
            );

            return false;
        }
    });

    app.all('/texture/:uuid', cors(), async (req, res) => {
        const { uuid } = req.params;

        const filename = `texture_${uuid}.png`;
        res.set('X-Cluster-ID', `${helper.getClusterId()}`);

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
        res.set('X-Cluster-ID', `${helper.getClusterId()}`);

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

        res.set('X-Cluster-ID', `${helper.getClusterId()}`);

        res.setHeader('Cache-Control', `public, max-age=${CACHE_DURATION}`);
        res.contentType('image/png');
        res.send(file);
    });

    app.all('/item(.gif)?/:skyblockId?', cors(), async (req, res) => {
        const skyblockId = req.params.skyblockId || null;
        const item = await renderer.renderItem(skyblockId, req.query, db);

        res.set('X-Cluster-ID', `${helper.getClusterId()}`);

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

    app.all('/robots.txt', async (req, res, next) => {
        res.type('text').send(
`User-agent: *
Disallow: /item /head /leather /resources
`);
    });

    app.all('/sitemap.xml', async (req, res, next) => {
        res.header('Content-Type', 'application/xml');
        res.header('Content-Encoding', 'gzip');

        if(sitemap){
            res.send(sitemap);
            return
        }

        try{
            const smStream = new SitemapStream({ hostname: 'https://sky.shiiyu.moe/' });
            const pipeline = smStream.pipe(createGzip());

            const cursor = await db.collection('topViews').find();

            while(await cursor.hasNext()){
                const doc = await cursor.next();

                smStream.write({ url: `/stats/${doc.username}` });
            }

            smStream.end();

            streamToPromise(pipeline).then(sm => sitemap = sm);

            pipeline.pipe(res).on('error', (e) => {throw e});
        }catch(e){
            console.error(e);
            res.status(500).end();
        }
    });

    app.all('/random/stats', async (req, res, next) => {
        /*const profile = await db
        .collection('profileStore')
        .aggregate([
            { $match: { apis: true } },
            { $sample: { size: 1 } }
        ]).next();*/

        res.redirect(`/stats/20934ef9488c465180a78f861586b4cf/bf7c14fb018946899d944d56e65222d2`);
    });

    app.all('/manifest.webmanifest', async (req, res) => {
        const favorites = await getFavoritesFormUUIDs(parseFavorites(req.cookies.favorite))
        const shortcuts = favorites.map(favorite => ({
            url: `/stats/${favorite.uuid}`,
            name: favorite.username,
            icons: [48, 72, 96, 144, 192, 512].map(size => ({
                src: `https://crafatar.com/avatars/${favorite.uuid}?size=${size}&overlay`,
                sizes: `${size}x${size}`,
                type: "image/png"
            }))
        }))
        res.json(Object.assign({shortcuts}, manifest))
    });

    app.all('/api', async (req, res, next) => {
        res.render('api', { error: null, player: null, extra: await getExtra('api'), fileHashes, helper, page: 'api' },
        (err, html) => {
            res.set('X-Cluster-ID', `${helper.getClusterId()}`);
            res.send(html);
        });
    });

    app.all('/:player/:profile?', async (req, res, next) => {
        res.redirect(`/stats${req.path}`);
    });

    app.all('/', async (req, res, next) => {
        const timeStarted = new Date().getTime();
        const favorites = parseFavorites(req.cookies.favorite);

        res.render('index', 
            { req, error: null, player: null, extra: await getExtra('index', favorites), fileHashes, helper, page: 'index' },
            (err, html) => {
                res.set('X-Cluster-ID', `${helper.getClusterId()}`);
                res.set('X-Process-Time', `${new Date().getTime() - timeStarted}`);
                res.send(html);
            }
        );
    });

    app.all('*', async (req, res, next) => {
        res
        .status(404)
        .type('txt')
        .send('Not found')
    });

    app.listen(port, () => console.log(`SkyBlock Stats running on http://localhost:${port} (${helper.getClusterId()})`));
}

if(cluster.isMaster){
    const totalCpus = require('os').cpus().length;
    const cpus = Math.min(process.env?.NODE_ENV != 'development' ? 8 : 2, totalCpus);

    for(let i = 0; i < cpus; i += 1){
        cluster.fork();
    }

    console.log(`Running SkyBlock Stats on ${cpus} cores`);
}else{
    main();
}

const cluster = require('cluster');

async function main(){
    const { MongoClient } = require('mongodb');
    const _ = require('lodash');

    const helper = require('./../helper');
    const lib = require('./../lib');
    const constants = require('./../constants');
    const credentials = require('./../../credentials.json');

    const ProgressBar = require('progress');

    const mongo = new MongoClient(credentials.dbUrl, { useUnifiedTopology: true });
    await mongo.connect();

    const db = mongo.db(credentials.dbName);

    const Redis = require("ioredis");
    const redisClient = new Redis();

    async function updateLeaderboards(){
        await db.collection('leaderboards').deleteMany({});

        const leaderboards = [];
        const keys = await redisClient.keys('lb_*');

        /* const multi = redisClient.pipeline(); */

        for(const key of keys){
            const lb = constants.leaderboard(key);

            if (lb.mappedBy == 'uuid' && !lb.key.startsWith('collection_enchanted'))
                leaderboards.push(lb);

            /* if(lb.sortedBy < 0)
                multi.zrevrange(key, 0, 49);
            else
                multi.zrange(key, 0, 49); */
        } 

        /* const updateUsers = _.uniq((await multi.exec()).map(a => a[1]).flat());

        console.log('updating', updateUsers.length, 'profiles');

        const bar = new ProgressBar('  generating leaderboards [:bar] :current/:total :rate users/s :percent :etas', {
            complete: '=',
            incomplete: ' ',
            width: 20,
            total: updateUsers.length
        });

        for(const uuid of updateUsers){
            lib.getProfile(db, uuid)
            .then(() => { bar.tick() })
            .catch(() => {});

            await new Promise(r => setTimeout(r, 500));
        } */

        leaderboards.sort((a, b) => {
            return a.key.localeCompare(b.key);
        }); 

        await db
            .collection('leaderboards')
            .insertMany(leaderboards)
            .catch(console.error);

        console.log(`Updated list of leaderboards!`);
        setTimeout(updateLeaderboards, 1000 * 60 * 30);
    }

    updateLeaderboards();
}

if(cluster.isMaster)
    main();

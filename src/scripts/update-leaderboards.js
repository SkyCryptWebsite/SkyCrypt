const cluster = require('cluster');

async function main(){
    const dbUrl = 'mongodb://localhost:27017';
    const dbName = 'sbstats';

    const { MongoClient } = require('mongodb');
    const _ = require('lodash');

    const helper = require('./../helper');
    const lib = require('./../lib');
    const constants = require('./../constants');

    const ProgressBar = require('progress');

    const mongo = new MongoClient(dbUrl, { useUnifiedTopology: true });
    await mongo.connect();

    const db = mongo.db(dbName);

    const redis = require('async-redis');
    const redisClient = redis.createClient();

    async function updateLeaderboards(){
        const keys = await redisClient.keys('lb_*');

        let updateUsers = [];

        for(const key of keys){
            const lb = constants.leaderboard(key);

            if(lb.sortedBy < 0)
                updateUsers.push(...await redisClient.zrevrange([key, 0, 49]))
            else
                updateUsers.push(...await redisClient.zrange([key, 0, 49]))
        }

        updateUsers = _.uniq(updateUsers);

        console.log('updating', updateUsers.length, 'profiles');

        const bar = new ProgressBar('  generating leaderboards [:bar] :current/:total :rate users/s :percent :etas', {
            complete: '=',
            incomplete: ' ',
            width: 20,
            total: await db.collection('profileStore').estimatedDocumentCount()
        });

        for await(const doc of db.collection('profileStore').find()){
            const { uuid } = doc;

            lib.getProfile(db, uuid)
            .then(() => { bar.tick() })
            .catch(console.error);

            await new Promise(r => setTimeout(r, 500));
        }

        console.log('done updating leaderboards');
    }

    updateLeaderboards();
}

if(cluster.isMaster)
    main();

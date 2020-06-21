const cluster = require('cluster');

async function main(){
    const dbUrl = 'mongodb://localhost:27017';
    const dbName = 'sbstats';

    const { MongoClient } = require('mongodb');
    const _ = require('lodash');
    const redis = require('async-redis');

    const helper = require('./../helper');
    const lib = require('./../lib');
    const constants = require('./../constants');

    const mongo = new MongoClient(dbUrl, { useUnifiedTopology: true });
    await mongo.connect();

    const db = mongo.db(dbName);

    const redisClient = redis.createClient();

    function getMinMax(profiles, min, ...path){
        let output = null;

        const compareValues = profiles.map(a => helper.getPath(a, ...path)).filter(a => a !== undefined);

        if(compareValues.length == 0)
            return output;

        if(min)
            output = Math.min(...compareValues);
        else
            output = Math.max(...compareValues);

        if(isNaN(output))
            return null;

        return output;
    }

    function getMax(profiles, ...path){
        return getMinMax(profiles, false, ...path);
    }

    function getMin(profiles, ...path){
        return getMinMax(profiles, true, ...path);
    }

    function getAllKeys(profiles, ...path){
        return _.uniq([].concat(...profiles.map(a => _.keys(helper.getPath(a, ...path)))));
    }

    async function updateGuildLeaderboards(){
        const keys = await redisClient.keys('lb_*');

        for await(const doc of db.collection('guilds').find({ members: { $gte: 75 } })){
            const { gid } = doc;

            console.log('trying to update', gid);

            const guildMembers = (await db
            .collection('guildMembers')
            .find({ gid })
            .toArray())
            .map(a => a.uuid);

            for(const key of keys){
                const scores = [];

                for(const member of guildMembers){
                    const score = await redisClient.zscore([key, member]);

                    if(score == null){
                        if(!key.includes('best_time'))
                            scores.push(0);

                        continue;
                    }

                    scores.push(score);
                }

                if(scores.length < 75)
                    continue;

                await redisClient.zadd([
                    `g${key}`,
                    scores.reduce((a, v, i) =>(a * i + v) / (i + 1)),
                    gid
                ]);
            }

            console.log('updated guild leaderboard for', gid);
        }

        console.log('done updating guild leaderboards');
    }

    updateGuildLeaderboards();
}

if(cluster.isMaster)
    main();

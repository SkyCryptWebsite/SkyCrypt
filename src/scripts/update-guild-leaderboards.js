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

    function getAverage(scores){
        return scores.reduce((a, b) => a + b, 0) / scores.length;
    }

    async function updateGuildLeaderboards(){
        const keys = await redisClient.keys('lb_*');
        const guilds = (await db.collection('guilds').find({ members: { $gte: 75 } }).toArray()).map(a => a.gid);

        for(const gid of guilds){
            console.log('trying to update', gid);

            const guildMembers = (await db
            .collection('guildMembers')
            .find({ gid })
            .toArray())
            .map(a => a.uuid);

            for(const key of keys){
                const options = constants.leaderboard(key);

                if(options.mappedBy != 'uuid')
                    continue;

                const scores = [];

                const memberScores = await Promise.all(
                    guildMembers.map(a => redisClient.zscore([key, a]))
                );

                for(const memberScore of memberScores){
                    const score = new Number(memberScore);

                    if(isNaN(score)){
                        if(!key.includes('best_time'))
                            scores.push(0);

                        continue;
                    }

                    scores.push(score);
                }

                if(key == 'lb_bank')
                    console.log(scores.join(", "));

                if(scores.length < 75)
                    continue;

                const avgScore = getAverage(scores);

                try{
                    await redisClient.zadd([
                        `g${key}`,
                        avgScore,
                        gid
                    ]);
                }catch(e){
                    console.error(e);
                    console.log(key);
                    console.log(scores.join(', '));
                    console.log('avg:', avgScore);
                }
            }

            console.log('updated guild leaderboard for', gid);
        }

        console.log('done updating guild leaderboards');
    }

    updateGuildLeaderboards();
}

if(cluster.isMaster)
    main();

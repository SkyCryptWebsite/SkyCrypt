const cluster = require('cluster');

async function main(){
    const { MongoClient } = require('mongodb');
    const _ = require('lodash');

    const Redis = require("ioredis");
    const redisClient = new Redis();

    const helper = require('./../helper');
    const lib = require('./../lib');
    const constants = require('./../constants');
    const credentials = require('./../../credentials.json');

    const ProgressBar = require('progress');

    const mongo = new MongoClient(credentials.dbUrl, { useUnifiedTopology: true });
    await mongo.connect();

    const db = mongo.db(credentials.dbName);

    function getAverage(scores){
        return scores.reduce((a, b) => a + b, 0) / scores.length;
    }

    async function updateGuildLeaderboards(){
        const keys = await redisClient.keys('lb_*');
        const guilds = (await db.collection('guilds').find({ members: { $gte: 75 } }).toArray()).map(a => a.gid);

        console.log('updating', guilds.length, 'guilds');

        const bar = new ProgressBar('  generating guild leaderboards [:bar] :current/:total :rate guilds/s :percent :etas', {
            complete: '=',
            incomplete: ' ',
            width: 20,
            total: guilds.length
        });

        for(const gid of guilds){
            const guildMembers = (await db
            .collection('guildMembers')
            .find({ gid })
            .toArray())
            .map(a => a.uuid);

            const multi = redisClient.pipeline();

            for(const key of keys){
                const options = constants.leaderboard(key);

                if(options.mappedBy != 'uuid')
                    continue;

                const scores = [];

                const getScores = redisClient.pipeline();

                for(const member of guildMembers)
                    getScores.zscore(key, member);

                const memberScores = (await getScores.exec()).map(a => a[1]);

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
                    continue;

                if(scores.length < 75)
                    continue;

                const avgScore = getAverage(scores);

                multi.zadd([
                    `g${key}`,
                    avgScore,
                    gid
                ]);
            }

            try{
                await multi.exec();
            }catch(e){
                console.error(e);
            }

            bar.tick();
        }

        updateGuildLeaderboards();
    }

    updateGuildLeaderboards();
}

if(cluster.isMaster)
    main();

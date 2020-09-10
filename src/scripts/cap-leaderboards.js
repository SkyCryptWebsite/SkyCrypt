const cluster = require('cluster');

async function main(){
    const _ = require('lodash');

    const constants = require('./../constants');

    const Redis = require("ioredis");
    const redisClient = new Redis();

    const lbLimit = 50000;

    async function capLeaderboards(){
        const keys = await redisClient.keys('lb_*');

        const multi = redisClient.pipeline();

        for(const key of keys){
            const lb = constants.leaderboard(key);

            if(lb.sortedBy < 0)
                redisClient.zremrangebyrank(key, 0, -lbLimit);
            else
                redisClient.zremrangebyrank(key, lbLimit, -1);
        }

        await multi.exec();
    }

    await capLeaderboards();

    await redisClient.quit();
}

if(cluster.isMaster)
    main();

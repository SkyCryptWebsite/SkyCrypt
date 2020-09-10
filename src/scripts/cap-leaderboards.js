const cluster = require('cluster');

async function main(){
    const _ = require('lodash');

    const constants = require('./../constants');
    const credentials = require('./../../credentials.json');

    const Redis = require("ioredis");
    const redisClient = new Redis();

    const { lbCap } = credentials;

    async function capLeaderboards(){
        const keys = await redisClient.keys('lb_*');

        const multi = redisClient.pipeline();

        for(const key of keys){
            const lb = constants.leaderboard(key);

            if(lb.sortedBy < 0)
                redisClient.zremrangebyrank(key, 0, -lbCap);
            else
                redisClient.zremrangebyrank(key, lbCap, -1);
        }

        await multi.exec();

        setTimeout(capLeaderboards, 1000 * 60);
    }

    capLeaderboards();
}

if(cluster.isMaster)
    main();

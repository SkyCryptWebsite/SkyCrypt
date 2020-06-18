const cluster = require('cluster');

async function main(){
    const dbUrl = 'mongodb://localhost:27017';
    const dbName = 'sbstats';

    const { MongoClient } = require('mongodb');
    const _ = require('lodash');
    const redis = require('async-redis');

    const helper = require('./helper');
    const lib = require('./lib');

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

    async function updateLeaderboards(){
        for await(const doc of db.collection('profileStore').find()){
            const { uuid } = doc;

            console.log('trying to update', uuid);

            helper.getProfile(db, uuid, null, { cacheOnly: true }).then(async response => {
                const { profile, allProfiles } = response;

                const memberProfiles = [];

                for(const singleProfile of allProfiles){
                    const userProfile = singleProfile.members[uuid];

                    const items = await lib.getItems(userProfile, false, null, true);
                    const data = await lib.getStats(db, singleProfile, allProfiles, items, true);

                    memberProfiles.push({
                        raw: userProfile,
                        items,
                        data
                    });
                }

                const values = {};

                values['fairy_souls'] = getMax(memberProfiles, 'data', 'fairy_souls', 'collected');
                values['average_level'] = getMax(memberProfiles, 'data', 'average_level');
                values['total_skill_xp'] = getMax(memberProfiles, 'data', 'total_skill_xp');

                for(const skill of getAllKeys(allProfiles, 'data.levels'))
                    values[`skill_${skill}_xp`] = getMax(memberProfiles, 'data', 'levels', skill, 'xp');

                values['slayer_xp'] = getMax(memberProfiles, 'data', 'slayer_xp');

                for(const slayer of getAllKeys(allProfiles, 'data', 'slayers')){
                    for(const tier of getAllKeys(allProfiles, 'data', 'slayers', slayer, 'kills'))
                        values[`${slayer}_slayer_boss_kills_tier_${tier}`] = getMax(memberProfiles, 'data', 'slayers', slayer, 'kills', tier);

                    values[`${slayer}_slayer_xp`]
                }

                for(const key in values)
                    await redisClient.zadd([key, values[key], uuid]);

                console.log('updated leaderboard for', uuid);
            }).catch(console.error);
        }

        console.log('done updating leaderboards');
    }

    updateLeaderboards();
}

if(cluster.isMaster)
    main();

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

    async function updateLeaderboards(){
        for await(const doc of db.collection('profileStore').find()){
            const { uuid } = doc;

            console.log('trying to update', uuid);

            try{
                const { profile, allProfiles } = await helper.getProfile(db, uuid, null, { cacheOnly: true });
                const hypixelProfile = await helper.getRank(uuid, db, true);

                const memberProfiles = [];

                for(const singleProfile of allProfiles){
                    const userProfile = singleProfile.members[uuid];

                    userProfile.levels = await lib.getLevels(userProfile, hypixelProfile);

                    let totalSlayerXp = 0;

                    userProfile.slayer_xp = 0;

                    if(userProfile.hasOwnProperty('slayer_bosses')){
                        for(const slayer in userProfile.slayer_bosses)
                            totalSlayerXp += userProfile.slayer_bosses[slayer].xp;

                        userProfile.slayer_xp = totalSlayerXp;

                        for(const mountMob in constants.mob_mounts){
                            const mounts = constants.mob_mounts[mountMob];

                            userProfile.stats[`kills_${mountMob}`] = 0;
                            userProfile.stats[`deaths_${mountMob}`] = 0;

                            for(const mount of mounts){
                                userProfile.stats[`kills_${mountMob}`] += userProfile.stats[`kills_${mount}`] || 0;
                                userProfile.stats[`deaths_${mountMob}`] += userProfile.stats[`deaths_${mount}`] || 0;

                                delete userProfile.stats[`kills_${mount}`];
                                delete userProfile.stats[`deaths_${mount}`]
                            }
                        }
                    }

                    userProfile.pet_score = 0;

                    const maxPetRarity = {};

                    if(Array.isArray(userProfile.pets)){
                        for(const pet of userProfile.pets)
                            maxPetRarity[pet.type] = Math.max(maxPetRarity[pet.type] || 0, constants.pet_value[pet.tier.toLowerCase()]);

                        for(const key in maxPetRarity)
                            userProfile.pet_score += maxPetRarity[key];
                    }

                    memberProfiles.push({
                        profile_id: singleProfile.profile_id,
                        data: userProfile
                    });
                }

                const values = {};

                values['pet_score'] = getMax(memberProfiles, 'data', 'pet_score');

                values['fairy_souls'] = getMax(memberProfiles, 'data', 'fairy_souls_collected');
                values['average_level'] = getMax(memberProfiles, 'data', 'levels', 'average_level');
                values['total_skill_xp'] = getMax(memberProfiles, 'data', 'levels', 'total_skill_xp');

                for(const skill of getAllKeys(memberProfiles, 'data', 'levels', 'levels'))
                    values[`skill_${skill}_xp`] = getMax(memberProfiles, 'data', 'levels', 'levels', skill, 'xp');

                values['slayer_xp'] = getMax(memberProfiles, 'data', 'slayer_xp');

                for(const slayer of getAllKeys(memberProfiles, 'data', 'slayer_bosses')){
                    for(const key of getAllKeys(memberProfiles, 'data', 'slayer_bosses', slayer)){
                        if(!key.startsWith('boss_kills_tier'))
                            continue;

                        const tier = key.split("_").pop();

                        values[`${slayer}_slayer_boss_kills_tier_${tier}`] = getMax(memberProfiles, 'data', 'slayer_bosses', slayer, key);
                    }

                    values[`${slayer}_slayer_xp`] = getMax(memberProfiles, 'data', 'slayer_bosses', slayer, 'xp');
                }

                for(const item of getAllKeys(memberProfiles, 'data', 'collection'))
                    values[`collection_${item.toLowerCase()}`] = getMax(memberProfiles, 'data', 'collection', item);

                for(const stat of getAllKeys(memberProfiles, 'data', 'stats'))
                    values[stat] = getMax(memberProfiles, 'data', 'stats', stat);

                for(const key in values){
                    if(values[key] == null)
                        continue;

                    await redisClient.zadd([`lb_${key}`, values[key], uuid]);
                }

                for(const singleProfile of allProfiles){
                    if(helper.hasPath(singleProfile, 'banking', 'balance'))
                        await redisClient.zadd([`lb_bank`, singleProfile.banking.balance, singleProfile.profile_id]);

                    const minionCrafts = [];

                    for(const member in singleProfile.members)
                        if(Array.isArray(singleProfile.members[member].crafted_generators))
                            minionCrafts.push(...singleProfile.members[member].crafted_generators);

                    await redisClient.zadd([
                        `lb_unique_minions`,
                        _.uniq(minionCrafts).length,
                        singleProfile.profile_id
                    ]);
                }

                console.log('updated leaderboard for', uuid);
            }catch(e){
                console.error(e);
            }
        }

        console.log('done updating leaderboards');
    }

    updateLeaderboards();
}

if(cluster.isMaster)
    main();

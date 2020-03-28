const cluster = require('cluster');

async function main(){
    const dbUrl = 'mongodb://localhost:27017';
    const dbName = 'sbstats';

    const { MongoClient } = require('mongodb');
    const axios = require('axios');
    const credentials = require('../credentials.json');
    const mongo = new MongoClient(dbUrl, { useUnifiedTopology: true });
    await mongo.connect();

    const db = mongo.db(dbName);

    async function updateViews(){
        for(const uuid of await db.collection('views').distinct('uuid')){
            const profiles = await db.collection('views').distinct('profile_id', { uuid });
            const { username } = await db.collection('usernames').findOne({ uuid });

            for(const profile_id of profiles){
                const profileViews = await db.collection('views').find({ uuid, profile_id }).toArray();

                const viewsTotal = profileViews.length;
                const viewsWeekly = profileViews.filter(a => a.time > Date.now() - 7 * 24 * 60 * 60 * 1000).length;
                const viewsDaily = profileViews.filter(a => a.time > Date.now() - 1 * 24 * 60 * 60 * 1000).length;

                await db
                .collection('profileViews')
                .replaceOne(
                    { uuid, profile_id },
                    { uuid, profile_id, username, total: viewsTotal, daily: viewsDaily, weekly: viewsWeekly },
                    { upsert: true }
                );
            }

            await new Promise(r => setTimeout(r, 50));
        }
    }

    updateViews();
    setInterval(updateViews, 30 * 60 * 1000);
}

if(cluster.isMaster)
    main();

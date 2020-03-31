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
            const { username } = await db.collection('usernames').findOne({ uuid });

            const profileViews = await db.collection('views').find({ uuid }).toArray();

            const viewsTotal = profileViews.length;

            await db
            .collection('profileViews')
            .replaceOne(
                { uuid },
                { uuid, username, total: viewsTotal },
                { upsert: true }
            );
        }

        console.log('done updating views');
    }

    updateViews();
}

if(cluster.isMaster)
    main();

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
        await db.collection('usernames').find().forEach(async doc => {
            const profileViews = await db.collection('views').countDocuments({ uuid: doc.uuid });

            if(profileViews == 0)
                return;

            await db
            .collection('profileViews')
            .replaceOne(
                { uuid: doc.uuid },
                { uuid: doc.uuid, username: doc.username, total: profileViews },
                { upsert: true }
            );
        });

        mongo.close();
    }

    updateViews();
}

if(cluster.isMaster)
    main();

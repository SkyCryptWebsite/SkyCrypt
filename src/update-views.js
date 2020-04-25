const cluster = require('cluster');

async function main(){
    const dbUrl = 'mongodb://localhost:27017';
    const dbName = 'sbstats';

    const { MongoClient } = require('mongodb');
    const credentials = require('../credentials.json');
    const mongo = new MongoClient(dbUrl, { useUnifiedTopology: true });
    await mongo.connect();

    const db = mongo.db(dbName);

    async function updateViews(){
        const cursor = await db.collection('usernames').find();

        while(await cursor.hasNext()){
            const doc = await cursor.next();

            const profileViews = await db.collection('views').countDocuments({ uuid: doc.uuid, invalid: { $ne: true } });

            if(profileViews == 0)
                continue;

            await db
            .collection('profileViews')
            .updateOne(
                { uuid: doc.uuid },
                { $set: { uuid: doc.uuid, total: profileViews } },
                { upsert: true }
            );
        }

        mongo.close();
    }

    updateViews();
}

if(cluster.isMaster)
    main();

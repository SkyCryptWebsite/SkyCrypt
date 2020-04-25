const cluster = require('cluster');

async function main(){
    const dbUrl = 'mongodb://localhost:27017';
    const dbName = 'sbstats';

    const { MongoClient } = require('mongodb');
    const credentials = require('../credentials.json');
    const mongo = new MongoClient(dbUrl, { useUnifiedTopology: true });
    await mongo.connect();

    const db = mongo.db(dbName);

    async function updateRanks(){
        let rank = 1;

        const cursor = await db.collection('profileViews').find().sort({ total: -1 });

        while(await cursor.hasNext()){
            const doc = await cursor.next();

            await db
            .collection('profileViews')
            .updateOne(
                { uuid: doc.uuid },
                { $set: { rank } }
            );

            rank++;
        }

        setTimeout(updateRanks, 1000 * 3600);
    }

    updateRanks();
}

if(cluster.isMaster)
    main();

const cluster = require('cluster');

async function main(){
    const { MongoClient } = require('mongodb');

    const credentials = require('./../../credentials.json');

    const mongo = new MongoClient(credentials.dbUrl, { useUnifiedTopology: true });
    await mongo.connect();

    const db = mongo.db(credentials.dbName);

    async function updateTopProfiles(){
        await db.collection('topViews').deleteMany({});

        for await(const doc of db.collection('viewsLeaderboard').aggregate([
            {
                "$lookup": {
                    "from": "profileStore",
                    "localField": "uuid",
                    "foreignField": "uuid",
                    "as": "profileInfo"
                }
            },
            {
                "$unwind": {
                    "path": "$profileInfo"
                }
            },
            {
                "$limit": 20
            }
        ])){
            await db.collection('topViews').updateOne(
                { _id: doc._id },
                { $set: doc },
                { upsert: true }
            )
        }

        setTimeout(updateTopProfiles, 60 * 1000);
    }

    updateTopProfiles();
}

if(cluster.isMaster)
    main();

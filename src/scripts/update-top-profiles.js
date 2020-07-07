const cluster = require('cluster');

async function main(){
    const dbUrl = 'mongodb://localhost:27017';
    const dbName = 'sbstats';

    const { MongoClient } = require('mongodb');

    const mongo = new MongoClient(dbUrl, { useUnifiedTopology: true });
    await mongo.connect();

    const db = mongo.db(dbName);

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

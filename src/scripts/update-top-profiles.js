const cluster = require('cluster');

async function main(){
    const { MongoClient } = require('mongodb');

    const credentials = require('./../../credentials.json');

    const mongo = new MongoClient(credentials.dbUrl, { useUnifiedTopology: true });
    await mongo.connect();

    const db = mongo.db(credentials.dbName);

    const moment = require('moment');
    let featured = {
        metalcupcake5: {
            position: 1,
            type: "DEV",
            message: "a dev or something idk"
        }, 
        Shiiyu: {
            position: 2,
            type: "DEV",
            message: ""
        },
        MartinNemi03: {
            position: 3,
            type: "DEV",
            message: "lazy developer"
        },
        jjww2: {
            position: 4,
            type: "DEV",
            message: "bob"
        },
        FantasmicGalaxy: {
            position: 5,
            type: "DEV",
            message: ""
        }
    };

    async function updateTopProfiles(){
        await db.collection('topViews').deleteMany({});

        // Clear the favorite cache
        await db.collection('favoriteCache').deleteMany({});

        /* for await(const doc of db.collection('viewsLeaderboard').aggregate([
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
        } */

        for (name in featured) {
            const user = await db
            .collection('usernames')
            .find( { username: name } )
            .toArray();

            if(!user[0]) continue;
            let output = user[0];

            // For later use...
            /* let profile = await db
            .collection('profileStore')
            .find( { uuid: output.uuid } );

            output.last_updated = moment(profile.last_save).unix(); */

            for (data in featured[name]) 
                output[data] = featured[name][data];

            await db.collection('topViews').updateOne(
                { _id: output._id },
                { $set: output },
                { upsert: true }
            );
        }

        setTimeout(updateTopProfiles, 900 * 1000);
    }

    updateTopProfiles();
}

if(cluster.isMaster)
    main();

const cluster = require('cluster');

async function main(){
    const { MongoClient } = require('mongodb');

    const credentials = require('./../../credentials.json');

    const mongo = new MongoClient(credentials.dbUrl, { useUnifiedTopology: true });
    await mongo.connect();

    const db = mongo.db(credentials.dbName);

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
            message: "\"lazy dev\" &nbsp; <b>(ﾉ´･ω･)ﾉ ﾐ ┸━┸</b>"
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

        for (name in featured) {
            const user = await db
            .collection('usernames')
            .find( { username: name } )
            .toArray();

            if(!user[0]) continue;
            let output = user[0];

            for (data in featured[name]) 
                output[data] = featured[name][data];

            await db.collection('topViews').updateOne(
                { _id: output._id },
                { $set: output },
                { upsert: true }
            );
        }
    }

    updateTopProfiles();
}

if(cluster.isMaster)
    main();

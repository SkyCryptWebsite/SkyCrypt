const cluster = require('cluster');

async function main(){
    const dbUrl = 'mongodb://localhost:27017';
    const dbName = 'sbstats';

    const { MongoClient } = require('mongodb');

    const helper = require('./helper');

    const mongo = new MongoClient(dbUrl, { useUnifiedTopology: true });
    await mongo.connect();

    const db = mongo.db(dbName);

    async function fetchProfiles(){
        const uuids = [];

        for await(const doc of db.collection('usernames').find())
            uuids.push(doc.uuid);

        for(const uuid of uuids){
            helper.getProfile(db, uuid).then(() => console.log('fetched', uuid)).catch(console.error);

            await new Promise(r => setTimeout(r, 1000));
        }

        console.log('done fetching profiles');
    }

    fetchProfiles();
}

if(cluster.isMaster)
    main();

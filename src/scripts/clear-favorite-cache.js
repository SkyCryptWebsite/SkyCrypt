const cluster = require('cluster');

async function main(){
    const { MongoClient } = require('mongodb');

    const credentials = require('./../../credentials.json');

    const mongo = new MongoClient(credentials.dbUrl, { useUnifiedTopology: true });
    await mongo.connect();

    const db = mongo.db(credentials.dbName);

    async function clearFavoriteCache(){
        // Clear cache for favorite
        await db.collection('favoriteCache').deleteMany({});

        setTimeout(clearFavoriteCache(), 15 * 60 * 1000);
    }

    clearFavoriteCache();
}

if(cluster.isMaster)
    main();
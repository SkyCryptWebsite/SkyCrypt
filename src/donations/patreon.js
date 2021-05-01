const cluster = require('cluster');

async function main(){
    const { MongoClient } = require('mongodb');
    const axios = require('axios');
    const credentials = require('../../credentials.json');
    const mongo = new MongoClient(credentials.dbUrl, { useUnifiedTopology: true });
    await mongo.connect();

    const db = mongo.db(credentials.dbName);

    async function updatePatreon(){
        const patreonEntry = await db.collection('donations').find({type: 'patreon'}).next();

        if(patreonEntry == null)
            return;

        const response = await axios.get('https://www.patreon.com/api/oauth2/api/current_user/campaigns', {
            headers: {
                authorization: `Bearer ${credentials.patreon_key}`
            }
        });

        const { data } = response;

        await db
        .collection('donations')
        .replaceOne(
            { type: 'patreon' },
            { type: 'patreon', amount: data.data[0].attributes.patron_count },
            { upsert: true }
        );
    }

    if('patreon_key' in credentials){
        updatePatreon();
        setInterval(updatePatreon, 60 * 1000);
    }
}

if(cluster.isMaster)
    main();

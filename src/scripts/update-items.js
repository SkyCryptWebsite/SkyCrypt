const cluster = require('cluster');

async function main(){
    const { MongoClient } = require('mongodb');
    const axios = require('axios');
    require('axios-debug-log');

    const helper = require('./../helper');
    const credentials = require('./../../credentials.json');

    const mongo = new MongoClient(credentials.dbUrl, { useUnifiedTopology: true });
    await mongo.connect();

    const db = mongo.db(credentials.dbName);

    async function updateItems(){
        try{
            const { data } = await axios('https://api.slothpixel.me/api/skyblock/items');

            for(const skyblockId in data){
                const skyblockItem = data[skyblockId];

                const doc = {
                    damage: 0
                };

                Object.assign(doc, skyblockItem);

                await db
                .collection('items')
                .updateOne(
                    { id: skyblockId },
                    { $set: doc },
                    { upsert: true }
                );
            }
        }catch(e){
            console.error(e);
        }

        setTimeout(updateItems, 1000 * 60 * 60 * 12);
    }

    updateItems();
}

if(cluster.isMaster)
    main();

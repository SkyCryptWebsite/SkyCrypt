const cluster = require('cluster');

async function main(){
    const dbUrl = 'mongodb://localhost:27017';
    const dbName = 'sbstats';

    const { MongoClient } = require('mongodb');
    const axios = require('axios');
    require('axios-debug-log');

    const helper = require('./helper');

    const credentials = require('../credentials.json');
    const mongo = new MongoClient(dbUrl, { useUnifiedTopology: true });
    await mongo.connect();

    const db = mongo.db(dbName);

    const Hypixel = axios.create({
        baseURL: 'https://api.hypixel.net/'
    });

    async function updateBazaar(){
        try{
            const response = await Hypixel.get('skyblock/bazaar', { params: { key: credentials.hypixel_api_key }});

            const { products } = response.data;

            for(const productId in products){
                const product = products[productId];

                const { buyPrice, sellPrice } = helper.getPrices(product);

                const { buyVolume, sellVolume } = product.quick_status;

                await db
                .collection('bazaar')
                .updateOne(
                    { productId },
                    { $set: { buyPrice, sellPrice, buyVolume, sellVolume }},
                    { upsert: true }
                );

                await db
                .collection('bazaarTracker')
                .insertOne(
                    { productId, time: new Date(), buyPrice, sellPrice }
                );

                await db
                .collection('items')
                .updateOne(
                    { id: productId },
                    { $set: { bazaar: true }}
                );
            }
        }catch(e){
            console.error(e);
        }

        setTimeout(updateBazaar, 1000 * 60);
    }

    updateBazaar();
}

if(cluster.isMaster)
    main();

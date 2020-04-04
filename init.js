const fs = require('fs-extra');

const credentials = {
    hypixel_api_key: ""
};

if(!fs.existsSync('credentials.json'))
    fs.writeFileSync('credentials.json', JSON.stringify(credentials, null, 4));

fs.ensureDirSync('cache');

async function main(){
    const dbUrl = 'mongodb://localhost:27017';
    const dbName = 'sbstats';

    const { MongoClient } = require('mongodb');
    const mongo = new MongoClient(dbUrl, { useUnifiedTopology: true });
    await mongo.connect();

    const db = mongo.db(dbName);

    await db
    .collection('profiles')
    .createIndex(
        { username: 'text' }
    );

    await db
    .collection('usernames')
    .createIndex(
        { username: 'text' }
    );

    mongo.close();
}

main();

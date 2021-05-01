const fs = require('fs-extra');
const { randomBytes } = require('crypto');

const credentialsDefault = {
    hypixel_api_key: "",
    recaptcha_site_key: "",
    recaptcha_secret_key: "",
    dbUrl: "mongodb://localhost:27017",
    dbName: "sbstats"
};

if(!fs.existsSync('./credentials.json'))
    fs.writeFileSync('./credentials.json', JSON.stringify(credentialsDefault, null, 4));

const credentials = require('./credentials.json');

if(!('session_secret' in credentials))
    credentials.session_secret = randomBytes(32).toString('hex');

fs.writeFileSync('./credentials.json', JSON.stringify(credentials, null, 4));

fs.ensureDirSync('cache');

async function main(){
    const constants = require('./src/constants');

    const { MongoClient } = require('mongodb');
    const mongo = new MongoClient(credentials.dbUrl, { useUnifiedTopology: true });
    await mongo.connect();

    const db = mongo.db(credentials.dbName);

    await db
    .collection('apiKeys')
    .createIndex(
        { key: 1 },
        { unique: true }
    );

    await db
    .collection('profileStore')
    .createIndex(
        { uuid: 1 },
        { unique: true }
    );

    await db
    .collection('profileStore')
    .createIndex(
        { apis: 1 },
        { partialFilterExpression: { apis: true } }
    );

    await db
    .collection('usernames')
    .createIndex(
        { username: 'text' }
    );

    await db
    .collection('usernames')
    .createIndex(
        { uuid: 1 },
        { unique: true }
    );

    await db
    .collection('favoriteCache')
    .createIndex(
        { uuid: 1 },
        { unique: true }
    );

    await db
    .collection('members')
    .createIndex(
        { uuid: 1, profile_id: 1 },
        { unique: true }
    );

    await db
    .collection('profileViews')
    .createIndex(
        { daily: -1 }
    );

    await db
    .collection('guilds')
    .createIndex(
        { gid: 1 },
        { unique: true }
    );

    await db
    .collection('guildMembers')
    .createIndex(
        { uuid: 1 },
        { unique: true }
    );

    await db
    .collection('guildMembers')
    .createIndex(
        { gid: 1 }
    );

    await db
    .collection('items')
    .createIndex(
        { id: 1 },
        { unique: true }
    );

    await db
    .collection('items')
    .createIndex(
        { name: "text", tag: "text" }
    );

    for(const id in constants.item_tags){
        await db
        .collection('items')
        .updateOne(
            { id },
            { $set: { tag: constants.item_tags[id] }}
        );
    }

    await db
    .collection('bazaar')
    .createIndex(
        { productId: 1 },
        { unique: true }
    );

    await db
    .collection('hypixelPlayers')
    .createIndex(
        { uuid: 1 },
        { unique: true }
    );

    await db
    .collection('profileCache')
    .createIndex(
        { profile_id: 1 },
        { unique: true }
    );

    await db
    .collection('topViews')
    .createIndex(
        { total: -1 }
    );

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
        await db.collection('topViews').insertOne(doc);
    }

    mongo.close();
    process.exit(0);
}

main();

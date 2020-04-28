const fs = require('fs-extra');
const { randomBytes } = require('crypto');

const credentialsDefault = {
    hypixel_api_key: "",
    recaptcha_site_key: "",
    recaptcha_secret_key: ""
};

if(!fs.existsSync('./credentials.json'))
    fs.writeFileSync('./credentials.json', JSON.stringify(credentialsDefault, null, 4));

const credentials = require('./credentials.json');

if(!('session_secret' in credentials))
    credentials.session_secret = randomBytes(32).toString('hex');

fs.writeFileSync('./credentials.json', JSON.stringify(credentials, null, 4));

fs.ensureDirSync('cache');

async function main(){
    const dbUrl = 'mongodb://localhost:27017';
    const dbName = 'sbstats';

    const constants = require('./src/constants');

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
    .collection('profiles')
    .createIndex(
        { uuid: 1 },
        { unique: true }
    );

    await db
    .collection('profiles')
    .createIndex(
        { api: 1 },
        { partialFilterExpression: { api: true } }
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
    .collection('members')
    .createIndex(
        { uuid: 1, profile_id: 1 },
        { unique: true }
    );

    await db
    .collection('views')
    .createIndex(
        { uuid: 1, ip: 1 },
        { unique: true }
    );

    await db
    .collection('profileViews')
    .createIndex(
        { uuid: 1 },
        { unique: true }
    );

    await db
    .collection('profileViews')
    .createIndex(
        { total: -1 }
    );

    await db
    .collection('profileViews')
    .createIndex(
        { weekly: -1 }
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

    await db.createCollection('viewsLeaderboard', {
        viewOn: 'profileViews',
        pipeline: [
            {
                $sort: {
                    total: -1
                }
            },
            {
                $limit: 20
            },
            {
                "$lookup": {
                    "from": "usernames",
                    "localField": "uuid",
                    "foreignField": "uuid",
                    "as": "userInfo"
                }
            },
            {
                "$unwind": {
                    "path": "$userInfo"
                }
            }
        ]
    });

    await db
    .collection('bazaar')
    .createIndex(
        { productId: 1 },
        { unique: true }
    );

    await db
    .collection('bazaarTracker')
    .createIndex(
        { productId: 1, time: 1 },
        { unique: true }
    );

    mongo.close();
}

main();

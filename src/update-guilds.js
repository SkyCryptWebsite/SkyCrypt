const cluster = require('cluster');

async function main(){
    const dbUrl = 'mongodb://localhost:27017';
    const dbName = 'sbstats';

    const { MongoClient } = require('mongodb');
    const axios = require('axios');
    const credentials = require('../credentials.json');
    const mongo = new MongoClient(dbUrl, { useUnifiedTopology: true });
    await mongo.connect();

    const db = mongo.db(dbName);

    const Hypixel = axios.create({
        baseURL: 'https://api.hypixel.net/'
    });

    async function updateGuilds(){
        let rank = 1;

        const cursor = await db.collection('guilds').find();

        while(await cursor.hasNext()){
            const doc = await cursor.next();

            try{
                const guildResponse = await Hypixel.get('guild', { params: { id: doc.gid, key: credentials.hypixel_api_key }});

                const { guild } = guildResponse.data;

                if(guild !== null){
                    await db
                    .collection('guilds')
                    .updateOne(
                        { gid: guild._id },
                        { $set: { name: guild.name, tag: guild.tag, exp: guild.exp, created: guild.created, gm: guild.members[0].uuid }},
                        { upsert: true }
                    );

                    for(const member of guild.members){
                        await db
                        .collection('guildMembers')
                        .updateOne(
                            { uuid: member.uuid },
                            { $set: { gid: guild._id }},
                            { upsert: true }
                        );
                    }
                }
            }catch(e){
                console.error(e);
            }

            await new Promise(r => setTimeout(r, 3000));
        }

        setTimeout(updateGuilds, 1000 * 60 * 20);
    }

    updateGuilds();
}

if(cluster.isMaster)
    main();

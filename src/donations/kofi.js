const axios = require('axios');
const credentials = require('../../credentials.json');

module.exports = async (app, db) => {
    if(!('kofi_key' in credentials))
        return;

    app.post('/webhook/kofi', async (req, res) => {
        if(req.query.key != credentials.kofi_key)
            return;

        const kofiEntry = await db.collection('donations').find({type: 'kofi'}).next();

        if(kofiEntry == null)
            return;

        const data = JSON.parse(req.body.data);

        if(!('type' in data) || !('amount' in data) || data.type != 'Donation')
            return;

        kofiEntry.amount += Math.floor(parseFloat(data.amount) / 3);

        await db
        .collection('donations')
        .replaceOne(
            { type: 'kofi' },
            { type: 'kofi', amount: kofiEntry.amount },
            { upsert: true }
        );

        res.send('ok');
    });
};

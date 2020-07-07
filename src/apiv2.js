const helper = require('./helper');
const lib = require('./lib');
const cors = require('cors');

function handleError(e, res){
    console.error(e);

    res.status(500).json({
        error: e.toString()
    });
}

module.exports = (app, db) => {
    const productInfo = {};

    const init = new Promise(async (resolve, reject) => {
        const bazaarProducts = await db
        .collection('bazaar')
        .find()
        .toArray();

        const itemInfo = await db
        .collection('items')
        .find({ id: { $in: bazaarProducts.map(a => a.productId) } })
        .toArray();

        for(const product of bazaarProducts){
            const info = itemInfo.filter(a => a.id == product.productId);

            if(info.length > 0)
                productInfo[product.productId] = info[0];
        }

        resolve();
    });

    app.use('/api/v2/*', async (req, res, next) => {
        req.cacheOnly = true;

        if(req.query.key){
            const doc = await db
            .collection('apiKeys')
            .findOne({ key: req.query.key });

            if(doc != null)
                req.cacheOnly = false;
        }

        next();
    });

    app.all('/api/v2/bazaar', cors(), async (req, res) => {
        await init;

        try{
            const output = {};

            for await(const product of db.collection('bazaar').find()){
                const itemInfo = productInfo[product.productId];

                const productName = itemInfo ? itemInfo.name : helper.titleCase(product.productId.replace(/(_+)/g, ' '));

                output[product.productId] = {
                    id: product.productId,
                    name: productName,
                    buyPrice: product.buyPrice,
                    sellPrice: product.sellPrice,
                    buyVolume: product.buyVolume,
                    sellVolume: product.sellVolume,
                    tag: 'tag' in itemInfo ? itemInfo.tag : null,
                    price: (product.buyPrice + product.sellPrice) / 2
                };
            }

            res.json(output);
        }catch(e){
            handleError(e, res);
        }
    });

    app.all('/api/v2/profile/:player', cors(), async (req, res) => {
        try{
            const { profile, allProfiles } = await lib.getProfile(db, req.params.player, null, { cacheOnly: req.cacheOnly });

            const output = { profiles: {} };

            for(const singleProfile of allProfiles){
                const userProfile = singleProfile.members[profile.uuid];

                const items = await lib.getItems(userProfile, req.query.pack);
                const data = await lib.getStats(db, singleProfile, allProfiles, items);

                output.profiles[singleProfile.profile_id] = {
                    profile_id: singleProfile.profile_id,
                    cute_name: singleProfile.cute_name,
                    current: Math.max(...allProfiles.map(a => a.members[profile.uuid].last_save)) == userProfile.last_save,
                    last_save: userProfile.last_save,
                    raw: userProfile,
                    items,
                    data
                };
            }

            res.json(output);
        }catch(e){
            handleError(e, res);
        }
    });
};

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

    app.all('/api/v2/profile/:player', cors(), async (req, res) => {
        try{
            const { profile, allProfiles } = await helper.getProfile(db, req.params.player, null, { cacheOnly: req.cacheOnly });

            console.log('serving from cache', req.cacheOnly);

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

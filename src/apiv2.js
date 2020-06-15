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
    app.all('/api/v2/profile/:player', cors(), async (req, res) => {
        try{
            const { profile, allProfiles } = await helper.getProfile(db, req.params.player, null, { cacheOnly: true });

            const output = { profiles: {} };

            for(const singleProfile of allProfiles){
                const userProfile = singleProfile.members[profile.uuid];

                const items = await lib.getItems(userProfile, req.query.pack);
                const data = await lib.getStats(db, profile, allProfiles, items);

                output.profiles[singleProfile.profile_id] = {
                    current: Math.max(...allProfiles.map(a => a.members[profile.uuid].last_save)) == userProfile.last_save,
                    last_save: userProfile.last_save,
                    cute_name: singleProfile.cute_name,
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

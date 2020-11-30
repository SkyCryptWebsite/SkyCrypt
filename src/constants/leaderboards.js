const collections = require('./collections');
const misc = require('./misc');
const leveling = require('./leveling');
const moment = require('moment');
const _ = require('lodash');
require('moment-duration-format')(moment);

const defaultOptions = {
    mappedBy: 'uuid',
    sortedBy: -1,
    format: x => Number(x),
    category: 'misc'
};

const raceFormat = x => {
    x = Number(x);

    let raceDuration = moment.duration(x, "milliseconds").format("m:ss.SSS");

    if(x < 1000)
        raceDuration = '0.' + raceDuration;

    return raceDuration;
};

const skillFormat = xp => {
    const { getLevelByXp } = require('../lib');
    let levelObj = getLevelByXp(xp);
    return `Level ${levelObj.level} + ${levelObj.xpCurrent.toLocaleString()} XP`;
};

const skillFormatFarming = xp => {
    const { getLevelByXp } = require('../lib');
    let levelObj = getLevelByXp(xp, {skill: "farming"});
    return `Level ${levelObj.level} + ${levelObj.xpCurrent.toLocaleString()} XP`;
};

const skillFormatRunecrafting = xp => {
    const { getLevelByXp } = require('../lib');
    let levelObj = getLevelByXp(xp, {type: "runecrafting"});
    return `Level ${levelObj.level} + ${levelObj.xpCurrent.toLocaleString()} XP`;
};

const skillFormatDungeoneering = xp => {
    const { getLevelByXp } = require('../lib');
    let levelObj = getLevelByXp(xp, {type: "dungeoneering"});
    return `Level ${levelObj.level} + ${levelObj.xpCurrent.toLocaleString()} XP`;
};

const overrides = {
    bank: {
        mappedBy: 'profile_id'
    },

    unique_minions: {
        mappedBy: 'profile_id'
    },

    'player_kills_k/d': {
        name: 'Player K/D'
    },

    average_level: {
        category: 'skill'
    }
};

const titleCase = string => {
    let split = string.toLowerCase().split(' ');

    for(let i = 0; i < split.length; i++)
        split[i] = split[i].charAt(0).toUpperCase() + split[i].substring(1);

    return split.join(' ');
};

module.exports = {
    leaderboard: name => {
        const lbName = name.split("_").slice(1).join("_");

        const options = Object.assign({}, defaultOptions);

        options['key'] = lbName;
        options['name'] = titleCase(lbName.split("_").join(" "));

        // Categories
        const categories = ["kills", "deaths", "auctions", "collection", "dungeons", "skill", "slayer"];
        categories.forEach(category => {
            if(lbName.includes(category))
                options['category'] = category;
        });

        // Override names
        if(overrides.hasOwnProperty(lbName))
            for(const key in overrides[lbName])
                options[key] = overrides[lbName][key];

        // Other specifications
        if(lbName.startsWith('collection_')){
            const collectionName = lbName.split("_").slice(1).join("_").toUpperCase();
            const collectionData = collections.collection_data.filter(a => a.skyblockId == collectionName);

            if(collectionData.length > 0)
                options['name'] = collectionData[0].name + ' Collection';
        }

        if(lbName.includes('_best_time') || lbName.includes('_fastest_time')){
            options['sortedBy'] = 1;
            options['format'] = raceFormat;
            options['category'] = 'races';
        }

        if(lbName.startsWith('skill_')){
            const skill = lbName.split("_").slice(1).join("_");

            if(skill.includes('farming'))
                options['format'] = skillFormatFarming;

            else if(skill.includes('runecrafting'))
                options['format'] = skillFormatRunecrafting;

            else options['format'] = skillFormat;
        }

        if(lbName.startsWith('dungeons_') && lbName.includes('_xp'))
            options['format'] = skillFormatDungeoneering;

        if(lbName.includes('_slayer_boss_kills_')){
            const tier = Number(lbName.split("_").pop()) + 1;

            if(lbName.startsWith('zombie_slayer'))
                options['name'] = `Kills Revenant Horror Tier ${tier}`;
            else if(lbName.startsWith('spider_slayer'))
                options['name'] = `Kills Tarantula Broodfather Tier ${tier}`;
            else if(lbName.startsWith('wolf_slayer'))
                options['name'] = `Kills Sven Packmaster Tier ${tier}`;
        }

        if(lbName.startsWith('kills_') || lbName.startsWith('deaths_')){
            const type = _.capitalize(lbName.split('_')[0]);
            const mobName = lbName.split('_').slice(1).join('_');

            if(Object.keys(misc.mob_names).includes(mobName))
                options['name'] = `${misc.mob_names[mobName]} ${type}`;
        }

        return options;
    }
}


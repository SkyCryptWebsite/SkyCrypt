const collections = require('./collections');
const leveling = require('./leveling');
const moment = require('moment');
const { getLevelByXp } = require('../lib');
require('moment-duration-format')(moment);

const defaultOptions = {
    mappedBy: 'uuid',
    sortedBy: -1,
    format: x => Number(x)
};

const raceFormat = x => {
    x = Number(x);

    let raceDuration = moment.duration(x, "milliseconds").format("m:ss.SSS");

    if(x < 1000)
        raceDuration = '0.' + raceDuration;

    return raceDuration;
};

const skillFormat = xp => {
    const xp_table = leveling.leveling_xp;

    let levelObj = {
        xp: 0,
        level: 0,
        xpCurrent: 0,
        xpForNext: xp_table[1],
        progress: 0
    };

    let xpTotal = 0;
    let level = 0;

    let xpForNext = Infinity;

    let maxLevel = Object.keys(xp_table).sort((a, b) => Number(a) - Number(b)).map(a => Number(a)).pop();

    for(let x = 1; x <= maxLevel; x++){
        xpTotal += xp_table[x];

        if(xpTotal > xp){
            xpTotal -= xp_table[x];
            break;
        }else{
            level = x;
        }
    }

    let xpCurrent = Math.floor(xp - xpTotal);

    if(level < maxLevel)
        xpForNext = Math.ceil(xp_table[level + 1]);

    let progress = Math.max(0, Math.min(xpCurrent / xpForNext, 1));

    levelObj = {
        xp,
        level,
        maxLevel,
        xpCurrent,
        xpForNext,
        progress
    };

    return `Level ${levelObj.level} + ${levelObj.xpCurrent.toLocaleString()} XP`;
};

const skillFormatRunecrafting = xp => {
    const xp_table = leveling.runecrafting_xp;

    let levelObj = {
        xp: 0,
        level: 0,
        xpCurrent: 0,
        xpForNext: xp_table[1],
        progress: 0
    };

    let xpTotal = 0;
    let level = 0;

    let xpForNext = Infinity;

    let maxLevel = Object.keys(xp_table).sort((a, b) => Number(a) - Number(b)).map(a => Number(a)).pop();

    for(let x = 1; x <= maxLevel; x++){
        xpTotal += xp_table[x];

        if(xpTotal > xp){
            xpTotal -= xp_table[x];
            break;
        }else{
            level = x;
        }
    }

    let xpCurrent = Math.floor(xp - xpTotal);

    if(level < maxLevel)
        xpForNext = Math.ceil(xp_table[level + 1]);

    let progress = Math.max(0, Math.min(xpCurrent / xpForNext, 1));

    levelObj = {
        xp,
        level,
        maxLevel,
        xpCurrent,
        xpForNext,
        progress
    };

    return `Level ${levelObj.level} + ${levelObj.current.toLocaleString()} XP`;
};

const overrides = {
    bank: {
        mappedBy: 'profile_id'
    },

    unique_minions: {
        mappedBy: 'profile_id'
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

        if(overrides.hasOwnProperty(lbName))
            for(const key in overrides[lbName])
                options[key] = overrides[lbName][key];

        if(lbName.startsWith('collection_')){
            const collectionName = lbName.split("_").slice(1).join("_").toUpperCase();
            const collectionData = collections.collection_data.filter(a => a.skyblockId == collectionName);

            if(collectionData.length > 0)
                options['name'] = collectionData[0].name + ' Collection';
        }

        if(lbName.includes('_best_time')){
            options['sortedBy'] = 1;
            options['format'] = raceFormat;
        }

        if(lbName.startsWith('skill_')){
            const skill = lbName.split("_")[1];

            options['format'] = skill == 'runecrafting' ? skillFormatRunecrafting : skillFormat;
        }

        if(lbName.includes('_slayer_boss_kills_')){
            const tier = Number(lbName.split("_").pop()) + 1;

            if(lbName.startsWith('zombie_slayer'))
                options['name'] = `Kills Revenant Horror Tier ${tier}`;
            else if(lbName.startsWith('spider_slayer'))
                options['name'] = `Kills Tarantula Broodfather Tier ${tier}`;
            else if(lbName.startsWith('wolf_slayer'))
                options['name'] = `Kills Sven Packmaster Tier ${tier}`;;
        }

        return options;
    }
}

const constants = require('./constants');
const helper = require('./helper');
const { SitemapItemStream } = require('sitemap');
const { getId } = helper;
const moment = require('moment');

module.exports = {
    makeLore: function(item) {
        let lore_raw;
        if(helper.hasPath(item, 'tag', 'display', 'Lore'))
            lore_raw = item.tag.display.Lore;
        
        for(let i = 0; i < lore_raw.length; ++i) {
            if (!lore_raw[i].includes(":"))
                continue;
            
            let split = lore_raw[i].split(" ");

            if(split.length < 2)
                continue;

            const statType = split[0].split(":")[0];

            switch(statType.substring(2)){
                case 'Damage':
                    lore_raw[i] = statType + ": " + split[1].substring(0, 3) + item.stats.damage + " " + split.slice(2).join(" ");
                    break;
                case 'Health':
                    lore_raw[i] = statType + ": " + split[1].substring(0, 3) + item.stats.health + " " + split.slice(2).join(" ");
                    break;
                case 'Defense':
                    lore_raw[i] = statType + ": " + split[1].substring(0, 3) + item.stats.defense + " " + split.slice(2).join(" ");
                    break;
                case 'Strength':
                    lore_raw[i] = statType + ": " + split[1].substring(0, 3) + item.stats.strength + " " + split.slice(2).join(" ");
                    break;
                case 'Speed':
                    lore_raw[i] = statType + ": " + split[1].substring(0, 3) + item.stats.speed + " " + split.slice(2).join(" ");
                    break;
                case 'Crit Chance':
                    lore_raw[i] = statType + ": " + split[1].substring(0, 3) + item.stats.crit_chance + " " + split.slice(2).join(" ");
                    break;
                case 'Crit Damage':
                    lore_raw[i] = statType + ": " + split[1].substring(0, 3) + item.stats.crit_damage + " " + split.slice(2).join(" ");
                    break;
                case 'Bonus Attack Speed':
                    lore_raw[i] = statType + ": " + split[1].substring(0, 3) + item.stats.bonus_attack_speed + " " + split.slice(2).join(" ");
                    break;
                case 'Intelligence':
                    lore_raw[i] = statType + ": " + split[1].substring(0, 3) + item.stats.intelligence + " " + split.slice(2).join(" ");
                    break;
                case 'Sea Creature Chance':
                    lore_raw[i] = statType + ": " + split[1].substring(0, 3) + item.stats.sea_creature_chance + " " + split.slice(2).join(" ");
                    break;
                case 'Magic Find':
                    lore_raw[i] = statType + ": " + split[1].substring(0, 3) + item.stats.magic_find + " " + split.slice(2).join(" ");
                    break;
                case 'Pet Luck':
                    lore_raw[i] = statType + ": " + split[1].substring(0, 3) + item.stats.pet_luck + " " + split.slice(2).join(" ");
                    break;
            }
        }

        const enchantments = helper.getPath(item, 'tag', 'ExtraAttributes', 'enchantments') || {};
        const hasEnchantments = Object.keys(enchantments).length > 0;

        // Set HTML lore to be displayed on the website
        if (true) {
            // lore_raw = item.tag.display.Lore;

            item.lore = '';

            for (const [index, line] of lore_raw.entries()) {
                if (index == 0 && line == '')
                    continue;

                item.lore += helper.renderLore(line, hasEnchantments);

                if (index + 1 < lore_raw.length)
                    item.lore += '<br>';
            }

            if (helper.hasPath(item, 'tag', 'ExtraAttributes', 'rarity_upgrades')) {
                const { rarity_upgrades } = item.tag.ExtraAttributes;

                if (rarity_upgrades > 0)
                    item.lore += "<br>" + helper.renderLore(`§8(Recombobulated)`);
            }

            let hasAnvilUses = false;

            if (helper.hasPath(item, 'tag', 'ExtraAttributes', 'anvil_uses')) {
                let { anvil_uses } = item.tag.ExtraAttributes;

                let hot_potato_count = 0;

                if ('hot_potato_count' in item.tag.ExtraAttributes)
                    ({ hot_potato_count } = item.tag.ExtraAttributes);

                anvil_uses -= hot_potato_count;

                if (anvil_uses > 0 && lore_raw) {
                    hasAnvilUses = true;

                    item.lore += "<br><br>" + helper.renderLore(`§7Anvil Uses: §c${anvil_uses}`);
                }
            }

            if (helper.hasPath(item, 'tag', 'ExtraAttributes', 'timestamp')) {
                item.lore += "<br>";

                const { timestamp } = item.tag.ExtraAttributes;

                let obtainmentDate;

                if (!isNaN(timestamp))
                    obtainmentDate = moment(parseInt(timestamp));
                else if (timestamp.includes("AM") || timestamp.includes("PM"))
                    obtainmentDate = moment(timestamp, "M/D/YY h:mm A");
                else
                    obtainmentDate = moment(timestamp, "D/M/YY HH:mm");

                if (!obtainmentDate.isValid())
                    obtainmentDate = moment(timestamp, "M/D/YY HH:mm");

                item.lore += "<br>" + helper.renderLore(`§7Obtained: §c${obtainmentDate.format("D MMM YYYY")}`);
            }

            /*if (helper.hasPath(item, 'tag', 'ExtraAttributes', 'spawnedFor')) {
                if (!helper.hasPath(item, 'tag', 'ExtraAttributes', 'timestamp'))
                    item.lore += "<br>";

                const spawnedFor = item.tag.ExtraAttributes.spawnedFor.replace(/\-/g, '');
                const spawnedForUser = await helper.resolveUsernameOrUuid(spawnedFor, db, cacheOnly);

                item.lore += "<br>" + helper.renderLore(`§7By: §c<a href="/stats/${spawnedFor}">${spawnedForUser.display_name}</a>`);
            }*/

            if (helper.hasPath(item, 'tag', 'ExtraAttributes', 'baseStatBoostPercentage')) {

                const boost = item.tag.ExtraAttributes.baseStatBoostPercentage;

                item.lore += "<br><br>" + helper.renderLore(`§7Dungeon Item Quality: ${boost == 50 ? '§6' : '§c'}${boost}/50%`);
            }

            if (helper.hasPath(item, 'tag', 'ExtraAttributes', 'item_tier')) {

                const floor = item.tag.ExtraAttributes.item_tier;

                item.lore += "<br>"

                item.lore += helper.renderLore(`§7Obtained From: §bFloor ${floor}`);
            }
        }
    }
}
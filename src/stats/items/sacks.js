import * as constants from "../../constants.js";
import { db } from "../../mongo.js";
import _ from "lodash";

export async function getSacks(sacksCounts) {
  try {
    const sacks = [];
    for (const sackId in constants.SACKS) {
      const sack = constants.SACKS[sackId];

      const sackItems = sack.items.filter((a) => {
        const items = typeof a === "object" ? a.items : [a];

        return items.some((b) => Object.keys(sacksCounts).includes(b));
      });
      if (sackItems.length === 0) {
        continue;
      }

      const sackItem = Object.assign({}, constants.BASE_SACK);

      sackItem.containsItems = [];
      sackItem.texture_path = `/head/${sack.texture}`;
      sackItem.display_name = _.startCase(sackId.toLowerCase());

      if (sackId === "RUNE_SACK") {
        for (const runeData of sack.items) {
          const itemCount = runeData.items.map((a) => sacksCounts[a] ?? 0).reduce((a, b) => a + b, 0);

          const lore = runeData.items
            .map((a) => {
              return [`§e${"I".repeat(runeData.items.indexOf(a) + 1)}§7: §e${(sacksCounts[a] ?? 0).toLocaleString()}`];
            })
            .flat();

          const count = itemCount === 0 ? 1 : itemCount;
          const sackContent = {
            Count: count,
            Damage: 3,
            id: 397,
            itemIndex: sackItem.containsItems.length,
            display_name: runeData.name,
            rarity: runeData.rarity,
            texture_path: `/head/${runeData.texture}`,
            tag: {
              display: {
                Name: `§a${runeData.name}`,
                Lore: lore,
              },
            },
            categories: [],
          };

          sackItem.containsItems.push(sackContent);
        }
      } else {
        for (const item of sack.items) {
          const hypixelItem = await db.collection("items").findOne({ id: constants.ITEM_SACKS[item] ?? item });
          if (hypixelItem === null) {
            continue;
          }

          const itemName = hypixelItem.name ?? _.startCase(item.toLowerCase());
          const count = sacksCounts[item] === 0 ? 1 : sacksCounts[item];
          const sackContent = {
            Count: count ?? 1,
            Damage: hypixelItem.damage ?? 3,
            id: hypixelItem.item_id ?? 397,
            itemIndex: sackItem.containsItems.length,
            display_name: itemName,
            tag: {
              display: {
                Name: `§a${itemName}`,
                Lore: [`§8Stored: §e${(sacksCounts[item] ?? 0).toLocaleString()}`],
              },
            },
            categories: [],
          };

          if (hypixelItem.glowing === true) {
            sackContent.tag.ench = [];
          }

          if (sackContent.id == 397 && hypixelItem.texture) {
            sackContent.texture_path = `/head/${hypixelItem.texture}`;
          }

          sackItem.containsItems.push(sackContent);
        }
      }

      sacks.push(sackItem);
    }

    return sacks;
  } catch (error) {
    console.log(error);
    return null;
  }
}

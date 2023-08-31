import * as constants from "../constants.js";
import { processItems } from "../lib.js";
import * as helper from "../helper.js";
import _ from "lodash";

async function processMuseumItems(items, museumData, customTextures, packs, options = { cacheOnly: false }) {
  for (const item of items) {
    if (item.items?.data === undefined) continue;

    const data = await processItems(item.items.data, "museum", customTextures, packs, options.cacheOnly);

    if (item.donated_time) {
      data.map((i) =>
        helper.addToItemLore(i, ["", `§7Donated: §c<local-time timestamp="${item.donated_time}"></local-time>`])
      );
    }

    if (item.borrowing) {
      data.map((i) => helper.addToItemLore(i, ["", `§7Status: §cBorrowing`]));
    }

    museumData.push(...data);
  }
}

async function getMuseumData(profile, customTextures, packs, options = { cacheOnly: false }) {
  const museumData = { items: [], special: [] };
  await Promise.all([
    processMuseumItems(Object.values(profile.museum.items), museumData.items, customTextures, packs, options),
    processMuseumItems(profile.museum.special, museumData.special, customTextures, packs, options),
  ]);

  return museumData;
}

function markChildrenAsDonated(children, output) {
  output.items[children] = {
    donated_as_child: true,
  };

  const childOfChild = constants.MUSEUM.children[children];
  if (childOfChild !== undefined) {
    markChildrenAsDonated(childOfChild, output);
  }
}

async function processMuseum(profile, customTextures, packs, options = { cacheOnly: false }) {
  const member = profile.museum;
  if (member.items === undefined || member.special === undefined) {
    return null;
  }

  const processedMuseumData = await getMuseumData(profile, customTextures, packs, options);
  const output = {
    items: [],
    specialItems: processedMuseumData.special,
  };

  const museumItemsData = member.items;
  for (const item of constants.getMuseumItems()) {
    const itemData = museumItemsData[item];
    if (itemData === undefined) {
      continue;
    }

    output.items[item] = {
      donated_time: itemData.donated_time,
      borrowing: itemData.borrowing,
      itemData: processedMuseumData.items.find((i) => helper.getId(i) === item),
    };

    // Could be done better but can't be bothered right now
    if (output.items[item].itemData === undefined) {
      if (constants.MUSEUM.armor_to_id[item] !== undefined) {
        output.items[item].itemData = processedMuseumData.items.find((i) =>
          helper.getId(i).includes(constants.MUSEUM.armor_to_id[item][0])
        );
      }

      if (output.items[item].itemData === undefined) {
        const alias = constants.MUSEUM.aliases[item];
        if (alias !== undefined) {
          output.items[item].itemData = processedMuseumData.items.find((i) => helper.getId(i) === alias);
        }
      }
    }

    const children = constants.MUSEUM.children[item];
    if (children !== undefined && output.items[item] !== undefined) {
      markChildrenAsDonated(children, output);
    }
  }

  return {
    ...output,
    value: profile.museum?.value ?? 0,
    appraisal: profile.museum?.appraisal,
    total: {
      amount: Object.keys(output.items).length,
      total: constants.getMuseumItems().length,
    },
    weapons: {
      amount: Object.keys(output.items).filter((i) => constants.MUSEUM.weapons.includes(i)).length,
      total: constants.MUSEUM.weapons.length,
    },
    armor: {
      amount: Object.keys(output.items).filter((i) => constants.MUSEUM.armor.includes(i)).length,
      total: constants.MUSEUM.armor.length,
    },
    rarities: {
      amount: Object.keys(output.items).filter((i) => constants.MUSEUM.rarities.includes(i)).length,
      total: constants.MUSEUM.rarities.length,
    },
    special: {
      amount: processedMuseumData.special.length,
    },
  };
}

export async function getMuseumItems(profile, customTextures, packs, options = { cacheOnly: false }) {
  try {
    const museum = await processMuseum(profile, customTextures, packs, options.cacheOnly);
    if (museum === null) {
      return null;
    }

    const output = [];
    for (let i = 0; i < 6 * 9; i++) {
      output[i] = helper.generateItem({ id: undefined });
    }

    for (const item of constants.MUSEUM.inventory) {
      updateMuseumItemProgress(item, museum);

      output[item.position] = helper.generateItem(item);

      const inventoryType = item.inventoryType;
      if (inventoryType === undefined) {
        continue;
      }

      const museumItems = (constants.MUSEUM[inventoryType] ?? museum.specialItems).length;
      const pages = Math.ceil(museumItems / constants.MUSEUM.item_slots.length);

      for (let page = 0; page < pages; page++) {
        // ? UI
        for (let i = 0; i < 6 * 9; i++) {
          if (output[item.position].containsItems[i]) {
            const presetItem = output[item.position].containsItems[i];

            updateMuseumItemProgress(presetItem, museum);

            output[item.position].containsItems[presetItem.position + page * 54] = helper.generateItem(presetItem);
          }

          output[item.position].containsItems[i + page * 54] ??= helper.generateItem({ id: undefined });
        }

        for (let i = 0; i < 4; i++) {
          output[item.position].containsItems[i + page * 54] = helper.generateItem({ id: undefined });
        }

        // ? ITEMS
        for (const [index, slot] of Object.entries(constants.MUSEUM.item_slots)) {
          const itemSlot = parseInt(index) + page * constants.MUSEUM.item_slots.length;
          if (inventoryType === "special") {
            const museumItem = museum.specialItems[itemSlot];
            if (museumItem === undefined) {
              continue;
            }

            output[item.position].containsItems[slot + page * 54] = helper.generateItem(museumItem);
          } else {
            const itemId = constants.MUSEUM[inventoryType][itemSlot];
            const museumItem = museum.items[itemId];

            const itemData = museumItem
              ? museumItem.itemData ?? constants.MUSEUM.higher_tier_donated
              : constants.MUSEUM.missing_item[inventoryType];

            itemData.display_name = _.startCase(constants.MUSEUM.armor_to_id[itemId]?.[0] ?? itemId);
            if (itemData.display_name === "") {
              continue;
            }

            output[item.position].containsItems[slot + page * 54] = helper.generateItem(itemData);
          }
        }
      }
    }

    return output;
  } catch (error) {
    console.log(error);
    return null;
  }
}

function updateMuseumItemProgress(presetItem, museum) {
  if (presetItem.progressType === undefined) {
    return;
  }

  if (presetItem.progressType === "appraisal") {
    const { appraisal, value } = museum;

    return helper.addToItemLore(presetItem, [
      `§7Museum Appraisal Unlocked: ${appraisal ? "§aYes" : "§cNo"}`,
      "",
      `§7Museum Value: §6${Math.floor(value).toLocaleString()} Coins §7(§6${helper.formatNumber(value)}§7)`,
    ]);
  }

  if (presetItem.progressType === "special") {
    const { amount } = museum[presetItem.inventoryType];

    return helper.addToItemLore(presetItem, [`§7Items Donated: §b${amount}`, "", "§eClick to view!"]);
  }

  const { amount, total } = museum[presetItem.progressType];

  helper.addToItemLore(presetItem, [
    `§7Items Donated: §e${Math.floor((amount / total) * 100)}§6%`,
    `§9§l${helper.formatProgressBar(amount, total, 9)} §b${amount} §9/ §b${total}`,
    "",
    "§eClick to view!",
  ]);
}

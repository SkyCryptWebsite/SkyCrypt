import * as constants from "../../constants.js";
import { processItems } from "./processing.js";
import * as helper from "../../helper.js";
import _ from "lodash";

async function processMuseumItems(items, museumData, customTextures, packs, options = { cacheOnly: false }) {
  for (const [id, data] of Object.entries(items)) {
    const {
      donated_time: donatedTime,
      borrowing,
      items: { data: decodedData },
    } = data;

    const encodedData = await processItems(decodedData, "museum", customTextures, packs, options.cacheOnly);

    if (donatedTime) {
      encodedData.map((i) =>
        helper.addToItemLore(i, ["", `§7Donated: §c<local-time timestamp="${donatedTime}"></local-time>`])
      );
    }

    if (borrowing) {
      encodedData.map((i) => helper.addToItemLore(i, ["", `§7Status: §cBorrowing`]));
    }

    museumData[id] = {
      donated_time: donatedTime,
      borrowing: borrowing ?? false,
      data: encodedData.filter((i) => i.id),
    };
  }
}

async function getMuseumData(profile, customTextures, packs, options = { cacheOnly: false }) {
  const museumData = { items: {}, special: [] };

  await Promise.all([
    processMuseumItems(profile.museum.items, museumData.items, customTextures, packs, options),
    processMuseumItems(profile.museum.special, museumData.special, customTextures, packs, options),
  ]);

  return museumData;
}

function markChildrenAsDonated(children, output) {
  output[children] = {
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

  const output = {};
  for (const item of constants.getMuseumItems()) {
    const itemData = processedMuseumData.items[item];
    if (itemData === undefined) {
      continue;
    }

    output[item] = itemData;

    const children = constants.MUSEUM.children[item];
    if (children !== undefined) {
      markChildrenAsDonated(children, output);
    }
  }

  return {
    value: profile.museum.value ?? 0,
    appraisal: profile.museum.appraisal,
    total: {
      amount: Object.keys(output).length,
      total: constants.getMuseumItems().length,
    },
    weapons: {
      amount: Object.keys(output).filter((i) => constants.MUSEUM.weapons.includes(i)).length,
      total: constants.MUSEUM.weapons.length,
    },
    armor: {
      amount: Object.keys(output).filter((i) => constants.MUSEUM.armor.includes(i)).length,
      total: constants.MUSEUM.armor.length,
    },
    rarities: {
      amount: Object.keys(output).filter((i) => constants.MUSEUM.rarities.includes(i)).length,
      total: constants.MUSEUM.rarities.length,
    },
    special: {
      amount: processedMuseumData.special.length,
    },
    items: output,
    specialItems: processedMuseumData.special,
  };
}

export async function getMuseumItems(profile, customTextures, packs, options = { cacheOnly: false }) {
  const museum = await processMuseum(profile, customTextures, packs, options.cacheOnly);
  if (museum === null) {
    return null;
  }

  const output = [];
  for (let i = 0; i < 6 * 9; i++) {
    output[i] = helper.generateItem({ id: undefined });
  }

  for (const itemData of constants.MUSEUM.inventory) {
    const item = _.cloneDeep(itemData);
    updateMuseumItemProgress(item, museum);

    output[item.position] = helper.generateItem(item);

    const inventoryType = item.inventoryType;
    if (inventoryType === undefined) {
      continue;
    }

    const museumItems = museum[inventoryType].total ?? museum[inventoryType].amount;
    const pages = Math.ceil(museumItems / constants.MUSEUM.item_slots.length);

    for (let page = 0; page < pages; page++) {
      // FRAME
      for (let i = 0; i < 6 * 9; i++) {
        if (output[item.position].containsItems[i]) {
          const presetItem = output[item.position].containsItems[i];

          updateMuseumItemProgress(presetItem, museum);

          output[item.position].containsItems[presetItem.position + page * 54] = helper.generateItem(presetItem);
        }

        output[item.position].containsItems[i + page * 54] ??= helper.generateItem({ id: undefined });
      }

      // CLEAR FIRST 4 ITEMS
      for (let i = 0; i < 4; i++) {
        output[item.position].containsItems[i + page * 54] = helper.generateItem({ id: undefined });
      }

      // CATEGORIES
      for (const [index, slot] of Object.entries(constants.MUSEUM.item_slots)) {
        const itemSlot = parseInt(index) + page * constants.MUSEUM.item_slots.length;

        // SPECIAL ITEMS CATEGORY
        if (inventoryType === "special") {
          const museumItem = museum.specialItems[itemSlot];
          if (museumItem === undefined) {
            continue;
          }

          const itemData = museumItem.data[0];

          output[item.position].containsItems[slot + page * 54] = helper.generateItem(itemData);
          continue;
        }

        // WEAPONS, ARMOR & RARITIES
        const itemId = constants.MUSEUM[inventoryType][itemSlot];
        if (itemId === undefined) {
          continue;
        }

        const museumItem = museum.items[itemId];

        // MISSING ITEM
        if (museumItem === undefined) {
          const itemData = _.cloneDeep(constants.MUSEUM.missing_item[inventoryType]);
          itemData.display_name = _.startCase(constants.MUSEUM.armor_to_id[itemId] ?? itemId);

          output[item.position].containsItems[slot + page * 54] = helper.generateItem(itemData);
          continue;
        }

        // DONATED HIGHER TIER
        if (museumItem.donated_as_child) {
          const itemData = _.cloneDeep(constants.MUSEUM.higher_tier_donated);
          itemData.display_name = _.startCase(constants.MUSEUM.armor_to_id[itemId] ?? itemId);

          output[item.position].containsItems[slot + page * 54] = helper.generateItem(itemData);
          continue;
        }

        // NORMAL ITEM
        const itemData = museumItem.data[0];
        if (museumItem.data.length > 1) {
          itemData.containsItems = museumItem.data.map((i) => helper.generateItem(i));
        }

        output[item.position].containsItems[slot + page * 54] = helper.generateItem(itemData);
      }
    }
  }

  return {
    museumItems: museum,
    museum: output,
  };
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

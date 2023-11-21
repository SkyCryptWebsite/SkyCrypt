import * as constants from "../constants.js";
import * as helper from "../helper.js";

/**
 * Checks if an accessory is present in an array of accessories.
 *
 * @param {Object[]} accessories - The array of accessories to search.
 * @param {Object|string} accessory - The accessory object or ID to find.
 * @param {Object} [options] - The options object.
 * @param {boolean} [options.ignoreRarity=false] - Whether to ignore the rarity of the accessory when searching.
 * @returns {boolean} True if the accessory is found, false otherwise.
 */
function hasAccessory(accessories, accessory, options = { ignoreRarity: false }) {
  const id = typeof accessory === "object" ? accessory.id : accessory;

  if (options.ignoreRarity === false) {
    return accessories.some(
      (a) => a.id === id && constants.RARITIES.indexOf(a.rarity) >= constants.RARITIES.indexOf(accessory.rarity)
    );
  } else {
    return accessories.some((a) => a.id === id);
  }
}

/**
 * Finds an accessory in an array of accessories by its ID.
 *
 * @param {Object[]} accessories - The array of accessories to search.
 * @param {string} accessory - The ID of the accessory to find.
 * @returns {Object|undefined} The accessory object if found, or undefined if not found.
 */
function getAccessory(accessories, accessory) {
  return accessories.find((a) => a.id === accessory);
}

function getMissing(accessories) {
  const ACCESSORIES = constants.getAllAccessories();
  const unique = ACCESSORIES.map(({ id, tier: rarity }) => ({ id, rarity }));

  for (const { id } of unique) {
    if (id in constants.ACCESSORY_ALIASES === false) continue;

    for (const duplicate of constants.ACCESSORY_ALIASES[id]) {
      if (hasAccessory(accessories, duplicate, { ignoreRarity: true }) === true) {
        getAccessory(accessories, duplicate).id = id;
      }
    }
  }

  let missing = unique.filter((accessory) => hasAccessory(accessories, accessory) === false);
  for (const { id } of missing) {
    const upgrades = constants.getUpgradeList(id);
    if (upgrades === undefined) {
      continue;
    }

    for (const upgrade of upgrades.filter((item) => upgrades.indexOf(item) > upgrades.indexOf(id))) {
      if (hasAccessory(accessories, upgrade) === true) {
        missing = missing.filter((item) => item.id !== id);
      }
    }
  }

  const upgrades = [];
  const other = [];
  for (const { id, rarity } of missing) {
    const ACCESSORY = ACCESSORIES.find((a) => a.id === id && a.tier === rarity);

    const object = {
      ...ACCESSORY,
      display_name: ACCESSORY.name ?? null,
      rarity: rarity,
    };

    if ((constants.getUpgradeList(id) && constants.getUpgradeList(id)[0] !== id) || ACCESSORY.rarities) {
      upgrades.push(object);
    } else {
      other.push(object);
    }
  }

  return {
    missing: other,
    upgrades: upgrades,
  };
}

export async function getMissingAccessories(calculated, items, packs) {
  const accessoryIds = items.accessories.accessory_ids;
  if (!accessoryIds || accessoryIds?.length === 0) {
    return;
  }

  const output = getMissing(accessoryIds);
  for (const key in output) {
    for (const item of output[key]) {
      let price = 0;

      if (item.customPrice === true) {
        if (item.upgrade) {
          price = (await helper.getItemPrice(item.upgrade.item)) * item.upgrade.cost[item.rarity];
        }

        if (item.id === "POWER_ARTIFACT") {
          for (const { slot_type: slot } of item.gemstone_slots) {
            price += await helper.getItemPrice(`PERFECT_${slot}_GEM`);
          }
        }
      } else {
        price = await helper.getItemPrice(item.id);
      }

      item.extra = { price };
      if (price > 0) {
        helper.addToItemLore(
          item,
          `§7Price: §6${Math.round(price).toLocaleString()} Coins §7(§6${helper.formatNumber(
            Math.floor(price / helper.getMagicalPower(item.rarity, item.id))
          )} §7per MP)`
        );
      }

      item.tag ??= {};
      item.tag.ExtraAttributes ??= {};
      item.tag.ExtraAttributes.id ??= item.id;
      item.Damage ??= item.damage;
      item.id = item.item_id;

      helper.applyResourcePack(item, packs);
    }

    output[key].sort((a, b) => {
      const aPrice = a.extra?.price || 0;
      const bPrice = b.extra?.price || 0;

      if (aPrice === 0) return 1;
      if (bPrice === 0) return -1;

      return aPrice - bPrice;
    });
  }

  const accessories = items.accessories.accessories;

  output.unique = accessories.filter((a) => a.isUnique === true).length;
  output.total = constants.UNIQUE_ACCESSORIES_COUNT;

  output.recombobulated = accessories.filter((a) => a?.extra?.recombobulated === true).length;
  output.total_recombobulated = constants.RECOMBABLE_ACCESSORIES_COUNT;

  const activeAccessories = accessories.filter((a) => a.isUnique === true && a.isInactive === false);

  output.magical_power = {
    accessories: activeAccessories.reduce((a, b) => a + helper.getMagicalPower(b.rarity, helper.getId(b)), 0),
    abiphone: calculated.crimson_isle?.abiphone?.active ? Math.floor(calculated.crimson_isle.abiphone.active / 2) : 0,
    rift_prism: accessoryIds.find((a) => a.id === "RIFT_PRISM") ? 11 : 0,
  };

  output.magical_power.total = Object.values(output.magical_power).reduce((a, b) => a + b, 0);

  output.magical_power.rarities = {};
  for (const rarity in constants.MAGICAL_POWER) {
    output.magical_power.rarities[rarity] = activeAccessories
      .filter((a) => a.rarity === rarity)
      .reduce((a, b) => a + helper.getMagicalPower(rarity, helper.getId(b)), 0);
  }

  return output;
}

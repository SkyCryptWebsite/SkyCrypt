import * as constants from "../../constants.js";
import * as helper from "../../helper.js";
import { itemSorter } from "./processing.js";

export function getAccessories(userProfile, armor, accessoryBag, inventory, enderchest, storage) {
  const output = {};
  const accessories = [];
  const accessoryIds = [];
  const accessoryRarities = {
    common: 0,
    uncommon: 0,
    rare: 0,
    epic: 0,
    legendary: 0,
    mythic: 0,
    special: 0,
    very_special: 0,
    hegemony: null,
    abicase: null,
    rift_prism: userProfile.rift?.access?.consumed_prism ? true : null,
  };

  // Add accessories from armor
  for (const accessory of armor.filter((a) => a.categories.includes("accessory"))) {
    const id = helper.getId(accessory);
    if (id === "") {
      continue;
    }

    const insertAccessory = Object.assign({ isUnique: true, isInactive: false }, accessory);

    accessories.push(insertAccessory);
    accessoryIds.push({
      id: id,
      rarity: insertAccessory.rarity,
    });
  }

  // Add accessories from inventory and accessory bag
  for (const accessory of accessoryBag.concat(inventory.filter((a) => a.categories.includes("accessory")))) {
    const id = helper.getId(accessory);
    if (id === "") {
      continue;
    }

    const insertAccessory = Object.assign({ isUnique: true, isInactive: false }, accessory);

    // mark lower tiers as inactive
    if (constants.getUpgradeList(id) !== undefined) {
      accessories.find((a) => {
        if (constants.getUpgradeList(id).includes(helper.getId(a)) === false) {
          return;
        }

        insertAccessory.isInactive = true;
        insertAccessory.isUnique = false;
      });
    }

    // mark accessory inactive if player has two exactly same accessories
    accessories.map((a) => {
      if (a.isInactive == true) {
        return;
      }

      if (helper.getId(a) === helper.getId(insertAccessory)) {
        insertAccessory.isInactive = true;
        a.isInactive = true;

        // give accessories with higher rarity priority, mark lower rarity as inactive
        if (constants.RARITIES.indexOf(a.rarity) > constants.RARITIES.indexOf(insertAccessory.rarity)) {
          a.isInactive = false;
          a.isUnique = true;
          insertAccessory.isUnique = false;
        } else if (constants.RARITIES.indexOf(insertAccessory.rarity) > constants.RARITIES.indexOf(a.rarity)) {
          insertAccessory.isInactive = false;
          insertAccessory.isUnique = true;
          a.isUnique = false;
        } else {
          insertAccessory.isInactive = false;
          insertAccessory.isUnique = false;
          a.isInactive = true;
          a.isUnique = true;
        }
      }
    });

    // mark accessory aliases as inactive
    const ACCESSORY_ALIASES = constants.ACCESSORY_ALIASES;
    if (id in ACCESSORY_ALIASES || Object.keys(ACCESSORY_ALIASES).find((a) => ACCESSORY_ALIASES[a].includes(id))) {
      let accessoryDuplicates = constants.ACCESSORY_ALIASES[id];
      if (accessoryDuplicates === undefined) {
        const aliases = Object.keys(ACCESSORY_ALIASES).filter((a) => ACCESSORY_ALIASES[a].includes(id));
        accessoryDuplicates = aliases.concat(constants.ACCESSORY_ALIASES[aliases]);
      }

      for (const duplicate of accessoryDuplicates) {
        accessoryBag.concat(inventory.filter((a) => a.categories.includes("accessory"))).map((a) => {
          if (helper.getId(a) === duplicate) {
            a.isInactive = true;
            a.isUnique = false;
          }
        });
      }
    }

    accessories.push(insertAccessory);
    accessoryIds.push({
      id: id,
      rarity: insertAccessory.rarity,
    });

    if (insertAccessory.isInactive === false) {
      accessoryRarities[insertAccessory.rarity]++;
      if (id == "HEGEMONY_ARTIFACT") {
        accessoryRarities.hegemony = { rarity: insertAccessory.rarity };
      }
      if (id === "ABICASE") {
        accessoryRarities.abicase = { model: insertAccessory.extra?.model };
      }
    }
  }

  // Add accessories from enderchest and backpacks
  for (const item of enderchest.concat(storage)) {
    if ("categories" in item === false) {
      continue;
    }

    let items = [item];
    if (!item.categories.includes("accessory") && "containsItems" in item && Array.isArray(item.containsItems)) {
      items = item.containsItems.slice(0);
    }

    for (const accessory of items.filter((a) => a.categories && a.categories.includes("accessory"))) {
      const insertAccessory = Object.assign({ isUnique: false, isInactive: true }, accessory);

      accessories.push(insertAccessory);
    }
  }

  for (const accessory of accessories) {
    accessory.base_name = accessory.display_name;

    if (accessory.tag?.ExtraAttributes?.modifier != undefined) {
      accessory.base_name = accessory.display_name.split(" ").slice(1).join(" ");
      accessory.reforge = accessory.tag.ExtraAttributes.modifier;
    }

    if (accessory.tag?.ExtraAttributes?.talisman_enrichment != undefined) {
      accessory.enrichment = accessory.tag.ExtraAttributes.talisman_enrichment.toLowerCase();
    }

    if (accessory.isUnique === false || accessory.isInactive === true) {
      const source = accessory.extra?.source;
      if (source !== undefined) {
        accessory.tag.display.Lore.push("", `§7Location: §c${source}`);
      }
    }
  }

  if (accessoryRarities.rift_prism === true) {
    accessoryIds.push({
      id: "RIFT_PRISM",
      rarity: "rare",
    });
  }

  output.accessories = accessories.sort(itemSorter);
  output.accessory_ids = accessoryIds;
  output.accessory_rarities = accessoryRarities;

  return output;
}

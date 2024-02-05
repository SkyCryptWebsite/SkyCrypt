import { processItems } from "./items/processing.js";
import * as items from "./items/items.js";
import * as helper from "../helper.js";
import { v4 } from "uuid";

export async function getItems(
  profile,
  paramBingo,
  customTextures = false,
  packs,
  options = { cacheOnly: false, debugId: `${helper.getClusterId()}/unknown@getItems` },
) {
  try {
    const output = {};

    throw new Error("This function is not implemented yet.");

    console.debug(`${options.debugId}: getItems called.`);
    const timeStarted = Date.now();

    // Process inventories returned by API
    const inventoryTypes = [
      { name: "armor", property: "inv_armor" },
      { name: "equipment", property: "equipment_contents" },
      { name: "inventory", property: "inv_contents" },
      { name: "wardrobe", property: "wardrobe_contents" },
      { name: "ender chest", property: "ender_chest_contents" },
      { name: "accessory bag", property: "talisman_bag", bagContents: true },
      { name: "fishing bag", property: "fishing_bag", bagContents: true },
      { name: "quiver", property: "quiver", bagContents: true },
      { name: "potion bag", property: "potion_bag", bagContents: true },
      { name: "candy bag", property: "candy_inventory_contents", shared: true },
      { name: "personal vault", property: "personal_vault_contents" },
    ];

    const promises = inventoryTypes.map((type) => {
      if (type.shared === true) {
        if (profile.shared_inventory === undefined || profile.shared_inventory[type.property] === undefined) {
          return [];
        }

        return processItems(
          profile.shared_inventory[type.property].data,
          type.name,
          customTextures,
          packs,
          options.cacheOnly,
        );
      } else if (type.bagContents === true) {
        if (
          profile.inventory === undefined ||
          profile.inventory.bag_contents === undefined ||
          profile.inventory.bag_contents[type.property] === undefined
        ) {
          return [];
        }

        return processItems(
          profile.inventory.bag_contents[type.property].data,
          type.name,
          customTextures,
          packs,
          options.cacheOnly,
        );
      } else {
        if (profile.inventory === undefined || profile.inventory[type.property] === undefined) {
          return [];
        }

        return processItems(profile.inventory[type.property].data, type.name, customTextures, packs, options.cacheOnly);
      }
    });

    let [
      armor,
      equipment,
      inventory,
      wardrobe_inventory,
      enderchest,
      accessory_bag,
      fishing_bag,
      quiver,
      potion_bag,
      candy_bag,
      personal_vault,
    ] = await Promise.all(promises);

    const storage = [];
    if (profile.inventory && profile.inventory.backpack_contents) {
      const storageSize = Math.max(18, Object.keys(profile.inventory.backpack_contents).length);

      const promises = [];

      for (let slot = 0; slot < storageSize; slot++) {
        storage.push({});

        if (profile.inventory.backpack_contents[slot] && profile.inventory.backpack_icons[slot]) {
          const iconPromise = processItems(
            profile.inventory.backpack_icons[slot].data,
            "storage_icons",
            customTextures,
            packs,
            options.cacheOnly,
          );
          const itemsPromise = await processItems(
            profile.inventory.backpack_contents[slot].data,
            "storage",
            customTextures,
            packs,
            options.cacheOnly,
          );

          promises.push(iconPromise, itemsPromise);

          (async (slot, iconPromise, itemsPromise) => {
            const [icon, items] = await Promise.all([iconPromise, itemsPromise]);

            for (const [index, item] of items.entries()) {
              item.isInactive = true;
              item.inBackpack = true;
              item.item_index = index;
            }

            const storageUnit = icon[0];
            storageUnit.containsItems = items;
            storage[slot] = storageUnit;
          })(slot, iconPromise, itemsPromise);
        }
      }

      await Promise.all(promises);
    }

    const wardrobe = items.getWardrobe(wardrobe_inventory);

    const hotm = "mining_core" in profile ? await items.getHotmItems(profile, packs) : [];

    output.armor = items.getArmor(armor.filter((x) => x.rarity));
    output.equipment = items.getEquipment(equipment.filter((x) => x.rarity));
    output.wardrobe = wardrobe;
    output.wardrobe_inventory = wardrobe_inventory;
    output.inventory = inventory;
    output.enderchest = enderchest;
    output.accessory_bag = accessory_bag;
    output.fishing_bag = fishing_bag;
    output.quiver = quiver;
    output.potion_bag = potion_bag;
    output.personal_vault = personal_vault;
    output.storage = storage;
    output.hotm = hotm;
    output.candy_bag = candy_bag;

    const museum =
      "museum" in profile ? await items.getMuseumItems(profile, customTextures, packs, options.cacheOnly) : [];

    output.museumItems = museum?.museumItems ?? [];
    output.museum = museum?.museum ?? [];

    output.bingo_card = await items.getBingoCard(paramBingo, options.cacheOnly);

    const allItems = armor.concat(
      equipment,
      inventory,
      enderchest,
      accessory_bag,
      fishing_bag,
      quiver,
      potion_bag,
      personal_vault,
      wardrobe_inventory,
      storage,
      hotm,
      candy_bag,
    );

    for (const [index, item] of allItems.entries()) {
      item.item_index = index;
      item.itemId = v4("itemId");

      if ("containsItems" in item && Array.isArray(item.containsItems)) {
        item.containsItems.forEach((a, idx) => {
          a.backpackIndex = item.item_index;
          a.itemId = v4("itemId");
        });
      }
    }

    output.accessories = items.getAccessories(profile, armor, accessory_bag, inventory, enderchest, storage);

    // Add candy bag contents as backpack contents to candy bag
    for (const item of allItems) {
      if (helper.getId(item) == "TRICK_OR_TREAT_BAG") {
        item.containsItems = candy_bag;
      }
    }

    output.weapons = items.getWeapons(allItems);
    output.farming_tools = items.getSkilllTools("farming", allItems);
    output.mining_tools = items.getSkilllTools("mining", allItems);
    output.fishing_tools = items.getSkilllTools("fishing", allItems);
    output.pets = items.getPets(allItems);

    // Check if inventory access disabled by user
    output.disabled = {
      inventory: inventory.length === 0,
      personal_vault: personal_vault.length === 0,
    };

    output.allItems = allItems;

    console.log(Object.keys(output));

    console.debug(`${options.debugId}: getItems returned. (${Date.now() - timeStarted}ms)`);
    return output;
  } catch (error) {
    console.error(error);

    return {
      armor: {
        armor: [],
      },
      equipment: {
        equipment: [],
      },
      wardrobe: [],
      wardrobe_inventory: [],
      inventory: [],
      enderchest: [],
      accessory_bag: [],
      fishing_bag: [],
      quiver: [],
      potion_bag: [],
      personal_vault: [],
      storage: [],
      hotm: [],
      candy_bag: [],
      museumItems: {},
      museum: [],
      bingo_card: [],
      accessories: {
        accessories: [],
      },
      weapons: [],
      farming_tools: [],
      mining_tools: [],
      fishing_tools: [],
      pets: [],
      disabled: {},
      allItems: [],
    };
  }
}

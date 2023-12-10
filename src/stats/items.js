import { processItems } from "./items/processing.js";
import * as items from "./items/items.js";
import * as helper from "../helper.js";
import { v4 } from "uuid";

export async function getItems(
  profile,
  paramBingo,
  customTextures = false,
  packs,
  options = { cacheOnly: false, debugId: `${helper.getClusterId()}/unknown@getItems` }
) {
  const output = {};

  console.debug(`${options.debugId}: getItems called.`);
  const timeStarted = Date.now();

  // Process inventories returned by API
  const armor =
    "inv_armor" in profile.inventory
      ? await processItems(profile.inventory.inv_armor.data, "armor", customTextures, packs, options.cacheOnly)
      : [];
  const equipment =
    "equipment_contents" in profile.inventory
      ? await processItems(
          profile.inventory.equipment_contents.data,
          "equipment",
          customTextures,
          packs,
          options.cacheOnly
        )
      : [];
  const inventory =
    "inv_contents" in profile.inventory
      ? await processItems(profile.inventory.inv_contents.data, "inventory", customTextures, packs, options.cacheOnly)
      : [];
  const wardrobe_inventory =
    "wardrobe_contents" in profile.inventory
      ? await processItems(
          profile.inventory.wardrobe_contents.data,
          "wardrobe",
          customTextures,
          packs,
          options.cacheOnly
        )
      : [];
  const enderchest =
    "ender_chest_contents" in profile.inventory
      ? await processItems(
          profile.inventory.ender_chest_contents.data,
          "ender chest",
          customTextures,
          packs,
          options.cacheOnly
        )
      : [];
  const accessory_bag =
    "talisman_bag" in profile.inventory.bag_contents
      ? await processItems(
          profile.inventory.bag_contents.talisman_bag.data,
          "accessory bag",
          customTextures,
          packs,
          options.cacheOnly
        )
      : [];
  const fishing_bag =
    "fishing_bag" in profile.inventory.bag_contents
      ? await processItems(
          profile.inventory.bag_contents.fishing_bag.data,
          "fishing bag",
          customTextures,
          packs,
          options.cacheOnly
        )
      : [];
  const quiver =
    "quiver" in profile.inventory.bag_contents
      ? await processItems(
          profile.inventory.bag_contents.quiver.data,
          "quiver",
          customTextures,
          packs,
          options.cacheOnly
        )
      : [];
  const potion_bag =
    "potion_bag" in profile.inventory.bag_contents
      ? await processItems(
          profile.inventory.bag_contents.potion_bag.data,
          "potion bag",
          customTextures,
          packs,
          options.cacheOnly
        )
      : [];
  const candy_bag = profile.shared_inventory
    ? "candy_inventory_contents" in profile.shared_inventory
      ? await processItems(
          profile.shared_inventory.candy_inventory_contents.data,
          "candy bag",
          customTextures,
          packs,
          options.cacheOnly
        )
      : []
    : [];
  const personal_vault =
    "personal_vault_contents" in profile.inventory
      ? await processItems(
          profile.inventory.personal_vault_contents.data,
          "personal vault",
          customTextures,
          packs,
          options.cacheOnly
        )
      : [];

  let storage = [];
  if (profile.inventory.backpack_contents) {
    const storageSize = Math.max(18, Object.keys(profile.inventory.backpack_contents).length);
    for (let slot = 0; slot < storageSize; slot++) {
      storage.push({});

      if (profile.inventory.backpack_contents[slot] && profile.inventory.backpack_icons[slot]) {
        const icon = await processItems(
          profile.inventory.backpack_icons[slot].data,
          "storage",
          customTextures,
          packs,
          options.cacheOnly
        );
        const items = await processItems(
          profile.inventory.backpack_contents[slot].data,
          "storage",
          customTextures,
          packs,
          options.cacheOnly
        );

        for (const [index, item] of items.entries()) {
          item.isInactive = true;
          item.inBackpack = true;
          item.item_index = index;
        }

        const storageUnit = icon[0];
        storageUnit.containsItems = items;
        storage[slot] = storageUnit;
      }
    }
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
    candy_bag
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

  console.debug(`${options.debugId}: getItems returned. (${Date.now() - timeStarted}ms)`);
  return output;
}

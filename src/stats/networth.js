import { getPreDecodedNetworth } from "skyhelper-networth";

export async function getNetworth(userProfile, profile, calculated) {
  const networthOptions = { cache: true, onlyNetworth: true, v2Endpoint: true };
  const bank = profile.banking?.balance ?? 0;
  const items = calculated.items ?? {};

  const specialMuseumItems = items.museumItems?.specialItems
    ? items.museumItems.specialItems.map((a) => a.data).flat()
    : [];
  const normalMuseumItems = items.museumItems?.items
    ? Object.values(items.museumItems.items)
        .filter((a) => a && a.data !== undefined && a.borrowing === false)
        .map((a) => a.data)
        .flat()
    : [];

  const museumItems = [...normalMuseumItems, ...specialMuseumItems];

  const networthItems = {
    armor: items.armor?.armor ?? [],
    equipment: items.equipment?.equipment ?? [],
    wardrobe: items.wardrobe_inventory ?? [],
    inventory: items.inventory ?? [],
    enderchest: items.enderchest ?? [],
    accessories: items.accessory_bag ?? [],
    personal_vault: items.personal_vault ?? [],
    storage: items.storage ? items.storage.concat(items.storage.map((item) => item.containsItems).flat()) : [],
    fishing_bag: items.fishing_bag ?? [],
    potion_bag: items.potion_bag ?? [],
    candy_inventory: items.candy_bag ?? [],
    museum: museumItems,
  };

  const networth = await getPreDecodedNetworth(userProfile, networthItems, bank, networthOptions);

  return networth;
}

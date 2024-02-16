import { getPreDecodedNetworth } from "skyhelper-networth";

export async function getNetworth(userProfile, profile, calculated) {
  const networthOptions = { cache: true, onlyNetworth: true, v2Endpoint: true };
  const bank = profile.banking?.balance ?? 0;

  const specialMuseumItems = calculated.items.museumItems.specialItems
    ? calculated.items.museumItems.specialItems.map((a) => a.data).flat()
    : [];
  const normalMuseumItems = calculated.items.museumItems.items
    ? Object.values(calculated.items.museumItems.items)
        .filter((a) => a && a.data !== undefined && a.borrowing === false)
        .map((a) => a.data)
        .flat()
    : [];

  const museumItems = [...normalMuseumItems, ...specialMuseumItems];

  const networthItems = {
    armor: calculated.items.armor?.armor ?? [],
    equipment: calculated.items.equipment?.equipment ?? [],
    wardrobe: calculated.items.wardrobe_inventory ?? [],
    inventory: calculated.items.inventory ?? [],
    enderchest: calculated.items.enderchest ?? [],
    accessories: calculated.items.accessory_bag ?? [],
    personal_vault: calculated.items.personal_vault ?? [],
    storage: calculated.items.storage
      ? calculated.items.storage.concat(calculated.items.storage.map((item) => item.containsItems).flat())
      : [],
    fishing_bag: calculated.items.fishing_bag ?? [],
    potion_bag: calculated.items.potion_bag ?? [],
    candy_inventory: calculated.items.candy_bag ?? [],
    museum: museumItems,
  };

  const networth = await getPreDecodedNetworth(userProfile, networthItems, bank, networthOptions);

  return networth;
}

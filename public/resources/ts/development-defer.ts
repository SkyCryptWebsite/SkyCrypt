import { ALL_ITEMS } from "./stats-defer";

// Announce dev mode in console
console.log(
  "%cSKYCRYPT ⌨ DEV MODE",
  [
    "background: #0bca51",
    "color: #fff",
    "padding: 8px 16px",
    'font-family: "Fira Code", "Montserrat", sans-serif',
    "font-size: 16px",
    "font-weight: 700",
    "line-height: 1",
  ].join(";")
);

// Alt+Click on any .rich-item to console.log the item object
document.addEventListener("click", (e) => {
  const element = e.target as HTMLElement;

  if (!e.altKey || !element.classList.contains("rich-item")) {
    return;
  }

  let item: DisplayItem | Item | Pet | undefined = undefined;
  if (element.hasAttribute("data-item-id")) {
    const itemId = element.getAttribute("data-item-id") as string;
    item = ALL_ITEMS.get(itemId) as Item;
  } else if (element.hasAttribute("data-pet-index")) {
    item = calculated.pets[parseInt(element.getAttribute("data-pet-index") as string)];
  } else if (element.hasAttribute("data-missing-pet-index")) {
    item = calculated.missingPets[parseInt(element.getAttribute("data-missing-pet-index") as string)];
  } else if (element.hasAttribute("data-missing-pet-skin-index")) {
    item = calculated.missingPetSkins[parseInt(element.getAttribute("data-missing-pet-skin-index") as string)];
  } else if (element.hasAttribute("data-missing-accessory-index")) {
    item =
      calculated.missingAccessories.missing[parseInt(element.getAttribute("data-missing-accessory-index") as string)];
  } else if (element.hasAttribute("data-upgrade-accessory-index")) {
    item =
      calculated.missingAccessories.upgrades[parseInt(element.getAttribute("data-upgrade-accessory-index") as string)];
  }

  console.log(item);
});

import { itemSorter } from "./processing.js";
import * as constants from "../../constants.js";
import * as helper from "../../helper.js";

export function getCategory(allItems, category) {
  const output = allItems.filter((a) => a.categories?.includes(category));

  for (const item of allItems) {
    if (!Array.isArray(item.containsItems)) {
      continue;
    }

    output.push(...getCategory(item.containsItems, category));
  }

  return output.sort(itemSorter);
}

export function getWeapons(allItems) {
  const weapons = getCategory(allItems, "weapon");

  const countsOfId = {};
  for (const weapon of weapons) {
    const id = helper.getId(weapon);

    countsOfId[id] = (countsOfId[id] || 0) + 1;

    if (countsOfId[id] > 2 && constants.RARITIES.indexOf(weapon.rarity) < constants.RARITIES.indexOf("legendary")) {
      weapon.hidden = true;
    }
  }

  const highestPriorityWeapon = getCategory(allItems, "sword").filter((a) => a.backpackIndex === undefined)[0];

  return {
    weapons: weapons,
    highest_priority_weapon: highestPriorityWeapon,
  };
}

export function getFarmingTools(allItems) {
  const tools = getCategory(allItems, "farming_tool");

  const highestPriorityTool = getCategory(allItems, "farming_tool").filter((a) => a.backpackIndex === undefined)[0];

  return {
    tools: tools,
    highest_priority_tool: highestPriorityTool,
  };
}

export function getSkilllTools(skill, allItems) {
  const tools = getCategory(allItems, `${skill}_tool`);

  const highestPriorityTool = getCategory(allItems, `${skill}_tool`).filter((a) => a.backpackIndex === undefined)[0];

  return {
    tools: tools,
    highest_priority_tool: highestPriorityTool,
  };
}

export function getPets(allItems) {
  const output = allItems
    .filter((a) => a.tag?.ExtraAttributes?.petInfo)
    .map((a) => ({
      uuid: a.tag.ExtraAttributes.uuid,
      type: a.tag.ExtraAttributes.petInfo.type,
      exp: a.tag.ExtraAttributes.petInfo.exp,
      active: a.tag.ExtraAttributes.petInfo.active,
      tier: a.tag.ExtraAttributes.petInfo.tier,
      heldItem: a.tag.ExtraAttributes.petInfo.heldItem || null,
      candyUsed: a.tag.ExtraAttributes.petInfo.candyUsed,
      skin: a.tag.ExtraAttributes.petInfo.skin || null,
    }));

  for (const item of allItems) {
    if (!Array.isArray(item.containsItems)) {
      continue;
    }

    output.push(
      ...item.containsItems
        .filter((a) => a.tag?.ExtraAttributes?.petInfo)
        .map((a) => ({
          uuid: a.tag.ExtraAttributes.uuid,
          type: a.tag.ExtraAttributes.petInfo.type,
          exp: a.tag.ExtraAttributes.petInfo.exp,
          active: a.tag.ExtraAttributes.petInfo.active,
          tier: a.tag.ExtraAttributes.petInfo.tier,
          heldItem: a.tag.ExtraAttributes.petInfo.heldItem || null,
          candyUsed: a.tag.ExtraAttributes.petInfo.candyUsed,
          skin: a.tag.ExtraAttributes.petInfo.skin || null,
        })),
    );
  }

  return output;
}

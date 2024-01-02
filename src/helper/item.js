import { db } from "../mongo.js";
import sanitize from "mongo-sanitize";
import * as constants from "../constants.js";
import * as helper from "../helper.js";

/**
 * Gathers Item Data visualized similarily to in-game NBT format based on a query
 * @param {Object} query Query with optional properties
 * @param {string} [query.skyblockId] Item SkyBlock ID
 * @param {number} [query.id] Item Vanilla ID
 * @param {string} [query.name] Item name
 * @param {number} [query.damage] Item damage value
 * @returns {*} Item Data
 */
export async function getItemData(query = {}) {
  query = Object.assign({ skyblockId: undefined, id: undefined, name: undefined, Damage: undefined }, query);
  const item = { id: -1, damage: 0, Count: 1, tag: { ExtraAttributes: {} } };
  let dbItem = {};

  /**
   * Look for DB items if possible with Skyblock ID or query name
   */
  if (query.skyblockId !== undefined && query.skyblockId !== null) {
    query.skyblockId = sanitize(query.skyblockId);

    if (query.skyblockId.includes(":")) {
      const split = query.skyblockId.split(":");

      query.skyblockId = split[0];
      query.damage = new Number(split[1]);
    }

    dbItem = { ...item, ...constants.ITEMS.get(query.skyblockId) };
  }

  if (query.name !== undefined) {
    const results = await db
      .collection("items")
      .find({ $text: { $search: query.name } })
      .toArray();

    const filteredResults = results.filter((a) => a.name.toLowerCase() == query.name.toLowerCase());

    if (filteredResults.length > 0) {
      dbItem = filteredResults[0] ?? {};
    }
  }

  if (query.id !== undefined) {
    item.id = query.id;
  }

  if (query.name !== undefined) {
    item.tag.display = { Name: query.name };
  }

  if ("item_id" in dbItem) {
    item.id = dbItem.item_id;
  }

  if ("damage" in dbItem) {
    item.Damage = query.damage ?? dbItem.damage;
  }

  if ("name" in dbItem) {
    item.tag.display = { Name: dbItem.name };
  }

  if ("id" in dbItem) {
    item.tag.ExtraAttributes.id = dbItem.id;
  }

  if ("texture" in dbItem) {
    item.texture_path = `/head/${dbItem.texture}`;
  }

  if (dbItem.item_id >= 298 && dbItem.item_id <= 301) {
    const type = ["helmet", "chestplate", "leggings", "boots"][dbItem.item_id - 298];

    if (dbItem?.color !== undefined) {
      const color = helper.rgbToHex(dbItem.color) ?? "955e3b";

      item.texture_path = `/leather/${type}/${color}`;
    }
  }

  if (item === null) {
    item.texture_path = "/head/bc8ea1f51f253ff5142ca11ae45193a4ad8c3ab5e9c6eec8ba7a4fcb7bac40";
  }

  return item;
}

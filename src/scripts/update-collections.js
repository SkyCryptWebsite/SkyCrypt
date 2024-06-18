import { db } from "../mongo.js";
import axios from "axios";

import "axios-debug-log";

async function updateCollections() {
  try {
    const { data } = await axios("https://api.hypixel.net/resources/skyblock/collections");
    if (data.collections === undefined) {
      throw new Error("Failed to fetch collections.");
    }

    const output = {};
    for (const [category, collection] of Object.entries(data.collections)) {
      output[category] = {
        name: collection.name,
        items: await Promise.all(
          Object.keys(collection.items).map(async (id) => {
            return {
              id,
              name: collection.items[id].name,
              texture: `${displayID(id)}`,
              maxTier: collection.items[id].maxTiers,
              tiers: collection.items[id].tiers,
            };
          }),
        ),
      };
    }

    await db
      .collection("collections")
      .updateOne({ _id: "collections" }, { $set: { collections: output } }, { upsert: true });
  } catch (e) {
    console.error(e);
  }

  setTimeout(updateCollections, 1000 * 60 * 60 * 12);
}

function displayID(input) {
  const replacements = {
    "GLACITE": "/item/PACKED_ICE", 
    "SULPHUR_ORE": "/item/GLOWSTONE_DUST",
    "HARD_STONE": "/item/STONE",
    "MITHRIL_ORE": "/item/PRISMARINE_CRYSTALS",
    "WILTED_BERBERIS": "/item/DEAD_BUSH",
    "HALF_EATEN_CARROT": "/item/CARROT_ITEM",
    "CADUCOUS_STEM": "/item/DOUBLE_PLANT:4",
    "HEMOVIBE": "/item/REDSTONE_ORE",
    "MAGMA_FISH": "/head/f56b5955b295522c9689481960c01a992ca1c7754cf4ee313c8dd0c356d335f",
    "METAL_HEART": "/head/f0278ee53a53b7733c7b8452fcf794dfbfbc3b032e750a6993573b5bd0299135",
    "AGARICUS_CAP": "/head/4ce0a230acd6436abc86f13be72e9ba94537ee54f0325bb862577a1e062f37",
    "CHILI_PEPPER": "/head/f859c8df1109c08a756275f1d2887c2748049fe33877769a7b415d56eda469d8",
    "GEMSTONE_COLLECTION": "/head/aac15f6fcf2ce963ef4ca71f1a8685adb97eb769e1d11194cbbd2e964a88978c",
    "TUNGSTEN": "/head/d811f3e723bbd46393f8aad8556b1df8ed33f559be827f47fe736f704c35586e",
    "UMBER": "/head/b565b5aa83d4aa7f7af22dc1271b2f0b27441f9ac1495f6b4653cf68dfb105ef"
  };

  if (replacements[input]) {
    return replacements[input];
  }

  return `/item/${input}`;
}

updateCollections();

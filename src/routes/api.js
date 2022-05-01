import * as helper from "../helper.js";
import * as lib from "../lib.js";
import { collection_data } from "../constants.js";
import cors from "cors";

/**
 * converts an array of objects to a table
 *
 * based on github.com/tillhub/tableify
 *
 * @param items {Iterable}
 */
export function tableify(items) {
  const keys = new Set();

  // get unique keys of all objects
  for (const item of items) {
    for (const key in item) {
      keys.add(key);
    }
  }

  let html = "<table><tbody>";

  for (const item of items) {
    html += "<tr>";
    for (const key of keys) {
      html += "<td>";
      html += item[key] || "";
      html += "</td>";
    }
    html += "</tr>";
  }

  html += "</tbody></table>";

  return html;
}

function handleError(e, res) {
  console.error(e);

  res.set("Content-Type", "text/plain");
  res.status(500).send("Something went wrong");
}

export default (app, db) => {
  const productInfo = {};

  async function init() {
    const bazaarProducts = await db.collection("bazaar").find().toArray();

    const itemInfo = await db
      .collection("items")
      .find({ id: { $in: bazaarProducts.map((a) => a.productId) } })
      .toArray();

    for (const product of bazaarProducts) {
      const info = itemInfo.find((a) => a.id == product.productId);

      if (info != undefined) {
        productInfo[product.productId] = info;
      }
    }
  }

  const initPromise = init();

  app.all("/api/:player/profiles", cors(), async (req, res) => {
    try {
      const { allProfiles } = await lib.getProfile(db, req.params.player, null, { cacheOnly: true });

      const profiles = [];

      for (const profile of allProfiles) {
        const members = (
          await Promise.all(Object.keys(profile.members).map((a) => helper.resolveUsernameOrUuid(a, db)))
        ).map((a) => a.display_name);

        profiles.push({
          profile_id: profile.profile_id,
          cute_name: profile.cute_name,
          members: "html" in req.query ? members.join(", ") : members,
        });
      }

      if ("html" in req.query) {
        res.send(tableify(profiles));
      } else {
        res.status(403).send("Old JSON API has been disabled.");
      }
    } catch (e) {
      handleError(e, res);
    }
  });

  app.all("/api/:player/:profile/pets", cors(), async (req, res) => {
    try {
      const { profile, uuid } = await lib.getProfile(db, req.params.player, req.params.profile, { cacheOnly: true });
      const userProfile = profile.members[uuid];

      const pets = await lib.getPets(userProfile);

      for (const pet of pets) {
        delete pet.lore;

        const petLevel = Object.assign({}, pet.level);
        delete pet.level;
        delete pet.tier;

        for (const key in petLevel) {
          pet[key] = petLevel[key];
        }
      }

      if ("html" in req.query) {
        res.send(
          tableify(
            pets.map((a) => [
              a.type,
              a.exp,
              a.active,
              a.rarity,
              a.texture_path,
              a.display_name,
              a.level,
              a.xpCurrent,
              a.xpForNext,
              a.progress,
              a.xpMaxLevel,
            ])
          )
        );
      } else {
        res.status(403).send("Old JSON API has been disabled.");
      }
    } catch (e) {
      console.error(e, res);
    }
  });

  app.all("/api/:player/:profile/minions", cors(), async (req, res) => {
    try {
      const { profile } = await lib.getProfile(db, req.params.player, req.params.profile, { cacheOnly: true });

      const minions = [];

      const coopMembers = profile.members;

      for (const member in coopMembers) {
        if (!("crafted_generators" in coopMembers[member])) {
          continue;
        }

        for (const minion of coopMembers[member].crafted_generators) {
          const minionName = minion.replaceAll(/(_[0-9]+)/g, "");

          const minionLevel = parseInt(minion.split("_").pop());

          if (minions.find((a) => a.minion == minionName) == undefined) {
            minions.push({ minion: minionName, level: minionLevel });
          }

          let minionObject = minions.find((a) => a.minion == minionName);

          if (minionObject.level < minionLevel) {
            minionObject.level = minionLevel;
          }
        }
      }

      if ("html" in req.query) {
        res.send(tableify(minions));
      } else {
        res.status(403).send("Old JSON API has been disabled.");
      }
    } catch (e) {
      handleError(e, res);
    }
  });

  app.all("/api/:player/:profile/accessories", cors(), async (req, res) => {
    try {
      const { profile, uuid } = await lib.getProfile(db, req.params.player, req.params.profile, { cacheOnly: true });
      const userProfile = profile.members[uuid];

      const items = await lib.getItems(userProfile);

      const talismans = items.talismans
        .filter((a) => a.isUnique)
        .map((a) => {
          return {
            id: a.tag.ExtraAttributes.id,
            rarity: a.rarity,
            reforge: a.reforge,
            name: a.base_name,
            isActive: a.isInactive ? "false" : "true",
          };
        });

      if ("html" in req.query) {
        res.send(tableify(talismans));
      } else {
        res.status(403);
      }
    } catch (e) {
      handleError(e, res);
    }
  });

  app.all("/api/:player/:profile/collections", cors(), async (req, res) => {
    try {
      const { profile, uuid } = await lib.getProfile(db, req.params.player, req.params.profile, { cacheOnly: true });

      const collections = await lib.getCollections(uuid, profile);

      for (const collection in collections) {
        collections[collection].name = collection_data.find((a) => a.skyblockId == collection).name;
      }

      if ("html" in req.query) {
        res.send(
          tableify(
            Object.keys(collections).map((a) => [
              a,
              collections[a].name,
              collections[a].tier,
              collections[a].amount,
              collections[a].totalAmount,
            ])
          )
        );
      } else {
        res.status(403).send("Old JSON API has been disabled.");
      }
    } catch (e) {
      handleError(e, res);
    }
  });

  app.all("/api/:player/:profile/skills", cors(), async (req, res) => {
    try {
      const { profile, allProfiles, uuid } = await lib.getProfile(db, req.params.player, req.params.profile);
      const userProfile = profile.members[uuid];

      const items = await lib.getItems(userProfile);
      const calculated = await lib.getStats(db, profile, allProfiles, items);

      if ("html" in req.query) {
        const response = [];

        for (const skill in calculated.levels) {
          const pushArr = [helper.titleCase(skill), calculated.levels[skill].level.toString()];

          if ("progress" in req.query) {
            pushArr.push(
              calculated.levels[skill].maxLevel,
              calculated.levels[skill].xp,
              calculated.levels[skill].xpCurrent,
              calculated.levels[skill].xpForNext
            );
          }

          response.push(pushArr);
        }

        for (const slayer in calculated.slayers) {
          const pushArr = [helper.titleCase(slayer), calculated.slayers[slayer].level.currentLevel.toString()];

          if ("progress" in req.query) {
            pushArr.push(
              calculated.slayers[slayer].level.maxLevel,
              calculated.slayers[slayer].xp,
              calculated.slayers[slayer].xp,
              calculated.slayers[slayer].level.xpForNext
            );
          }

          response.push(pushArr);
        }

        response.push(["Fairy Souls", calculated.fairy_souls.collected.toString()]);

        res.send(tableify(response));
      } else {
        res.status(403).send("Old JSON API has been disabled.");
      }
    } catch (e) {
      handleError(e, res);
    }
  });

  app.all("/api/:player/:profile/cakebag", cors(), async (req, res) => {
    try {
      const { profile, uuid } = await lib.getProfile(db, req.params.player, req.params.profile, { cacheOnly: true });
      const userProfile = profile.members[uuid];

      const items = await lib.getItems(userProfile);

      const allItems = items.armor.concat(items.inventory, items.talisman_bag, items.enderchest);

      const cakeBags = allItems.filter((a) => a?.tag?.ExtraAttributes?.id == "NEW_YEAR_CAKE_BAG");

      if (cakeBags.length == 0) {
        res.set("Content-Type", "text/plain");
        res.send("Player has no cake bag");
      } else {
        const cakeBag = cakeBags[0];

        let cakes = [];

        for (const item of cakeBag.containsItems) {
          if (item.tag?.ExtraAttributes?.new_years_cake) {
            cakes.push({ cake: item.tag.ExtraAttributes.new_years_cake });
          }
        }

        cakes = cakes.sort((a, b) => a.cake - b.cake);

        res.send(tableify(cakes));
      }
    } catch (e) {
      handleError(e, res);
    }
  });

  app.all("/api/:player/:profile/items", cors(), async (req, res) => {
    try {
      const { profile, uuid } = await lib.getProfile(db, req.params.player, req.params.profile);
      const userProfile = profile.members[uuid];

      const items = await lib.getItems(userProfile);

      const allItems = items.inventory.concat(items.enderchest);

      for (const item of allItems) {
        if (Array.isArray(item.containsItems)) {
          allItems.push(...item.containsItems);
        }
      }

      if ("html" in req.query) {
        res.send(
          tableify(
            allItems
              .filter((a) => helper.getId(a).length > 0)
              .map((a) => [helper.getId(a), a.Count, a.display_name, a.rarity, a.type])
          )
        );
      } else {
        res.status(403).send("Old JSON API has been disabled.");
      }
    } catch (e) {
      handleError(e, res);
    }
  });

  app.all("/api/:player/:profile/weapons", cors(), async (req, res) => {
    try {
      const { profile, uuid } = await lib.getProfile(db, req.params.player, req.params.profile, { cacheOnly: true });
      const userProfile = profile.members[uuid];

      const items = await lib.getItems(userProfile);

      let output = [];

      for (const weapon of items.weapons) {
        const enchantments = weapon.tag.ExtraAttributes.enchantments;
        let enchantmentsOutput = enchantments;

        const stats = weapon.stats;
        let statsOutput = weapon.stats;

        const extra = weapon.extra;
        let extraOutput = weapon.extra;

        if (weapon.tag?.ExtraAttributes) {
          if ("html" in req.query) {
            if (enchantments !== undefined) {
              enchantmentsOutput = [];

              for (const enchantment in enchantments) {
                enchantmentsOutput.push(enchantment + "=" + enchantments[enchantment]);
              }

              enchantmentsOutput = enchantmentsOutput.join(",");
            }

            if (stats !== undefined) {
              statsOutput = [];

              for (const stat in stats) {
                statsOutput.push(stat + "=" + stats[stat]);
              }

              statsOutput = statsOutput.join(",");
            }

            if (extra !== undefined) {
              extraOutput = [];

              for (const value in extra) {
                extraOutput.push(value + "=" + extra[value]);
              }

              extraOutput = extraOutput.join(",");
            }
          }
        }

        output.push({
          id: helper.getId(weapon),
          name: weapon.display_name,
          rarity: weapon.rarity,
          enchantments: enchantmentsOutput,
          stats: statsOutput,
          extra: extraOutput,
        });
      }

      if ("html" in req.query) {
        res.send(tableify(output));
      } else {
        res.status(403).send("Old JSON API has been disabled.");
      }
    } catch (e) {
      handleError(e, res);
    }
  });

  app.all("/api/:player/:profile/armor", cors(), async (req, res) => {
    try {
      const { profile, uuid } = await lib.getProfile(db, req.params.player, req.params.profile, { cacheOnly: true });
      const userProfile = profile.members[uuid];

      const items = await lib.getItems(userProfile);

      let output = [];

      for (const armor of items.armor) {
        const enchantments = armor.tag.ExtraAttributes.enchantments;
        let enchantmentsOutput = enchantments;

        const stats = armor.stats;
        let statsOutput = stats;

        if ("html" in req.query && enchantments !== undefined) {
          enchantmentsOutput = [];

          for (const enchantment in enchantments) {
            enchantmentsOutput.push(enchantment + "=" + enchantments[enchantment]);
          }

          enchantmentsOutput = enchantmentsOutput.join(",");
        }

        if ("html" in req.query && stats !== undefined) {
          statsOutput = [];

          for (const stat in stats) {
            statsOutput.push(stat + "=" + stats[stat]);
          }

          statsOutput = statsOutput.join(",");
        }

        output.push({
          id: helper.getId(armor),
          name: armor.display_name,
          rarity: armor.rarity,
          enchantments: enchantmentsOutput,
          stats: statsOutput,
        });
      }

      if ("html" in req.query) {
        res.send(tableify(output));
      } else {
        res.status(403).send("Old JSON API has been disabled.");
      }
    } catch (e) {
      handleError(e, res);
    }
  });

  app.all("/api/:player/:profile/wardrobe", cors(), async (req, res) => {
    try {
      const { profile, uuid } = await lib.getProfile(db, req.params.player, req.params.profile, { cacheOnly: true });
      const userProfile = profile.members[uuid];

      const items = await lib.getItems(userProfile);

      let output = [];

      for (const wardrobe of items.wardrobe) {
        for (const armor of wardrobe) {
          if (armor === null) {
            output.push({});
            continue;
          }

          const enchantments = armor.tag.ExtraAttributes.enchantments;
          let enchantmentsOutput = enchantments;

          const stats = armor.stats;
          let statsOutput = stats;

          if ("html" in req.query && enchantments !== undefined) {
            enchantmentsOutput = [];

            for (const enchantment in enchantments) {
              enchantmentsOutput.push(enchantment + "=" + enchantments[enchantment]);
            }

            enchantmentsOutput = enchantmentsOutput.join(",");
          }

          if ("html" in req.query && stats !== undefined) {
            statsOutput = [];

            for (const stat in stats) {
              statsOutput.push(stat + "=" + stats[stat]);
            }

            statsOutput = statsOutput.join(",");
          }

          output.push({
            id: helper.getId(armor),
            name: armor.display_name,
            rarity: armor.rarity,
            enchantments: enchantmentsOutput,
            stats: statsOutput,
          });
        }
      }

      if ("html" in req.query) {
        res.send(tableify(output));
      } else {
        res.status(403).send("Old JSON API has been disabled.");
      }
    } catch (e) {
      handleError(e, res);
    }
  });

  app.all("/api/bazaar", cors(), async (req, res) => {
    await initPromise;

    try {
      const output = [];

      for await (const product of db.collection("bazaar").find()) {
        const itemInfo = productInfo[product.productId];

        const productName = itemInfo ? itemInfo.name : helper.titleCase(product.productId.replaceAll(/(_+)/g, " "));

        output.push({
          id: product.productId,
          name: productName,
          buyPrice: product.buyPrice,
          sellPrice: product.sellPrice,
          buyVolume: product.buyVolume,
          sellVolume: product.sellVolume,
          tag: itemInfo?.tag ?? null,
          price: (product.buyPrice + product.sellPrice) / 2,
        });
      }

      if ("html" in req.query) {
        res.send(tableify(output.map((a) => [a.name, +a.price.toFixed(3)])));
      } else {
        res.json(output);
      }
    } catch (e) {
      handleError(e, res);
    }
  });
};

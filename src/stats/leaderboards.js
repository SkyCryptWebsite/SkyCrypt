import { redisClient } from "../redis.js";
import * as helper from "../helper.js";
import * as constants from "../constants.js";
import * as stats from "../stats.js";
import * as lib from "../lib.js";
import { db } from "../mongo.js";
import _ from "lodash";

function getMax(calculated, value, path) {
  const currentValue = value ?? 0;
  const newValue = _.get(calculated, path) ?? 0;

  if (newValue > currentValue) {
    return newValue;
  }

  return currentValue;
}

function processBestiaryMobs(values, calculated, mobs, category, subCategory = null) {
  for (const mob of mobs) {
    const mobId = mob.name.replaceAll(" ", "_").toLowerCase();
    const path = ["bestiary", "categories", category];
    if (subCategory) {
      path.push(subCategory);
    }

    path.push("mobs", mobs.indexOf(mob), "kills");

    values[`bestiary_${mobId}_kills`] = getMax(calculated, values[`bestiary_${mobId}_kills`], path);
  }
}

export async function updateLeaderboardData(
  uuid,
  allProfiles,
  options = {
    cacheOnly: true,
    debugId: `${helper.getClusterId()}/unknown@updateLeaderboardData`,
    updateLeaderboards: false,
  }
) {
  try {
    if (constants.BLOCKED_PLAYERS.includes(uuid)) {
      return;
    }

    console.debug(`${options.debugId}: updateLeaderboardData called.`);
    const timeStarted = Date.now();

    const values = {};
    for (const profile of allProfiles) {
      if (profile.cute_name !== "Blueberry") {
        continue;
      }

      const museum = await lib.getMuseum(db, profile, options);
      for (const member in museum) {
        profile.members[member].museum = museum[member];
      }

      const paramBingo = profile.game_mode === "bingo" ? await lib.getBingoProfile(db, uuid, options) : null;
      const items = await stats.getItems(profile.members[profile.uuid], paramBingo, true, [], options);
      const calculated = await lib.getStats(db, profile, paramBingo, allProfiles, items, [], options);

      if (calculated.skills?.skills !== undefined) {
        for (const skill in calculated.skills.skills) {
          values[`skill_${skill}_xp`] = getMax(calculated, values[`skill_${skill}_xp`], [
            "skills",
            "skills",
            skill,
            "xp",
          ]);
        }

        values["total_skill_xp"] = getMax(calculated, values["total_skill_xp"], ["skills", "totalSkillXp"]);
      }

      if (calculated.slayer !== undefined) {
        for (const slayer in calculated.slayer.slayers) {
          values[`slayer_${slayer}_xp`] = getMax(calculated, values[`slayer_${slayer}_xp`], [
            "slayer",
            "slayers",
            slayer,
            "level",
            "xp",
          ]);

          for (const tier in calculated.slayer.slayers[slayer].kills) {
            const formattedTier = tier === "total" ? "total" : `tier_${tier}`;

            values[`slayer_${slayer}_${formattedTier}_kills`] = getMax(
              calculated,
              values[`slayer_${slayer}_${formattedTier}_kills`],
              ["slayer", "slayers", slayer, "kills", tier]
            );
          }
        }

        values["total_slayer_xp"] = getMax(calculated, values["total_slayer_xp"], ["slayer", "total_slayer_xp"]);
      }

      if (calculated.bestiary !== undefined) {
        for (const category in calculated.bestiary.categories) {
          const categoryData = calculated.bestiary.categories[category];

          if (categoryData.mobs === undefined) {
            for (const subCategory in categoryData) {
              if (subCategory === "name" || subCategory === "texture") {
                continue;
              }

              processBestiaryMobs(values, calculated, categoryData[subCategory].mobs, category, subCategory);
            }
          } else {
            processBestiaryMobs(values, calculated, categoryData.mobs, category);
          }
        }

        values["bestiary_milestone"] = getMax(calculated, values["bestiary_milestone"], ["bestiary", "milestone"]);
      }

      if (calculated.mining.core?.powder !== undefined) {
        for (const powder in calculated.mining.core.powder) {
          for (const key in calculated.mining.core.powder[powder]) {
            values[`${powder}_powder_${key}`] = getMax(calculated, values[`${powder}_powder_${key}`], [
              "mining",
              "core",
              "powder",
              powder,
              key,
            ]);
          }
        }
      }

      values["mining_commissions"] = getMax(calculated, values["mining_commissions"], [
        "mining",
        "commissions",
        "completions",
      ]);

      values["crystal_nucleus_completed"] = getMax(calculated, values["crystal_nucleus_completed"], [
        "mining",
        "core",
        "crystal_nucleus",
        "times_completed",
      ]);

      if (calculated.dungeons !== undefined) {
        values["skill_dungeoneering_xp"] = getMax(calculated, values["skill_dungeoneering_xp"], [
          "dungeons",
          "catacombs",
          "level",
          "xp",
        ]);

        values["dungeons_catacombs_completions"] = getMax(calculated, values["dungeons_catacombs_completions"], [
          "dungeons",
          "catacombs",
          "completions",
        ]);

        values["dungeons_secrets_found"] = getMax(calculated, values["dungeons_secrets_found"], [
          "dungeons",
          "secrets_found",
        ]);

        if (calculated.dungeons?.classes?.classes !== undefined) {
          for (const className in calculated.dungeons.classes.classes) {
            values[`dungeons_${className}_class_xp`] = getMax(calculated, values[`dungeons_${className}_class_xp`], [
              "dungeons",
              "classes",
              "classes",
              className,
              "level",
              "xp",
            ]);
          }
        }

        values["dungeons_classes_total_xp"] = getMax(calculated, values["dungeons_classes_total_xp"], [
          "dungeons",
          "classes",
          "experience",
        ]);

        values["dungeons_classes_average_level"] = getMax(calculated, values["dungeons_classes_average_level"], [
          "dungeons",
          "classes",
          "average_level",
        ]);

        for (const [key, value] of Object.entries(calculated.dungeons)) {
          if (["catacombs", "master_catacombs"].includes(key) === false) {
            continue;
          }

          for (const [floor, floorData] of Object.entries(value.floors ?? {})) {
            if (floorData?.stats === undefined) {
              continue;
            }

            for (const stat in floorData.stats) {
              values[`dungeons_${key}_floor_${floor}_${stat}`] = getMax(
                calculated,
                values[`dungeons_${key}_floor_${floor}_${stat}`],
                ["dungeons", key, "floors", floor, "stats", stat]
              );
            }
          }
        }
      }

      if (calculated.crimson_isle !== undefined) {
        const crimsonIsle = calculated.crimson_isle;

        values["crimson_isle_factions_mages_reputation"] = getMax(
          calculated,
          values["crimson_isle_factions_mages_reputation"],
          ["crimson_isle", "factions", "mages_reputation"]
        );

        values["crimson_isle_factions_barbarians_reputation"] = getMax(
          calculated,
          values["crimson_isle_factions_barbarians_reputation"],
          ["crimson_isle", "factions", "barbarians_reputation"]
        );

        if (crimsonIsle?.kuudra?.tiers !== undefined) {
          for (const tier in crimsonIsle.kuudra.tiers) {
            values[`crimson_isle_kuudra_tier_${tier}_kills`] = getMax(
              calculated,
              values[`crimson_isle_kuudra_tier_${tier}_kills`],
              ["crimson_isle", "kuudra", "tiers", tier, "completions"]
            );
          }
        }

        values["crimson_isle_kuudra_total_kills"] = getMax(calculated, values["crimson_isle_kuudra_total_kills"], [
          "crimson_isle",
          "kuudra",
          "total",
        ]);

        if (crimsonIsle.dojo !== undefined) {
          for (const challenge in crimsonIsle.dojo.dojo) {
            const id = crimsonIsle.dojo.dojo[challenge].name.toLowerCase();

            values[`crimson_isle_dojo_${id}_points`] = getMax(calculated, values[`crimson_isle_dojo_${id}_points`], [
              "crimson_isle",
              "dojo",
              "dojo",
              challenge,
              "points",
            ]);

            values[`crimson_isle_dojo_${id}_time`] = getMax(calculated, values[`crimson_isle_dojo_${id}_time`], [
              "crimson_isle",
              "dojo",
              "dojo",
              challenge,
              "time",
            ]);
          }
        }

        values["crimson_isle_dojo_total_points"] = getMax(calculated, values["crimson_isle_dojo_total_points"], [
          "crimson_isle",
          "dojo",
          "total_points",
        ]);
      }

      if (calculated.collections !== undefined) {
        for (const [category, categoryData] of Object.entries(calculated.collections)) {
          if (categoryData.collections === undefined) {
            continue;
          }

          for (const collection of categoryData.collections) {
            const amount = collection.totalAmont ? "totalAmount" : "amount";
            const id = (collection.id ?? collection.name).toLowerCase();

            values[`collection_${id}_amount`] = getMax(calculated, values[`collection_${id}_amount`], [
              "collections",
              category,
              "collections",
              categoryData.collections.indexOf(collection),
              amount,
            ]);
          }
        }
      }

      values["skyblock_level_xp"] = getMax(calculated, values["skyblock_level_xp"], ["skyblock_level", "xp"]);

      values["first_join"] = getMax(calculated, values["first_join"], ["user_data", "first_join", "unix"]);

      if (calculated.currencies !== undefined) {
        for (const currency in calculated.currencies) {
          values[`currency_${currency}`] = getMax(calculated, values[`currency_${currency}`], ["currencies", currency]);
        }
      }

      values["networth"] = getMax(calculated, values["networth"], ["networth", "networth"]);
      values["unsoulbound_networth"] = getMax(calculated, values["unsoulbound_networth"], [
        "networth",
        "unsoulboundNetworth",
      ]);

      values["total_pets"] = getMax(calculated, values["total_pets"], ["pets", "total_pets"]);
      values["total_pet_skins"] = getMax(calculated, values["total_pet_skins"], ["pets", "amount_pet_skins"]);
      values["total_pet_xp"] = getMax(calculated, values["total_pet_xp"], ["pets", "total_pet_xp"]);

      values["total_fairy_souls"] = getMax(calculated, values["total_fairy_souls"], ["fairy_souls", "total"]);
    }

    const multi = redisClient.pipeline();
    for (const key in values) {
      if (!values[key]) {
        continue;
      }

      multi.zadd(`lb_${key}`, values[key], uuid);
    }

    await multi.exec();

    console.log(`${options.debugId}: updateLeaderboardData returned. (${Date.now() - timeStarted}ms)`);
  } catch (e) {
    const req = { params: { player: uuid } };

    helper.sendWebhookMessage(e, req, "updateLeaderboardData");
  }
}

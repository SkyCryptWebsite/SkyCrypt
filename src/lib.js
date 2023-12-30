import { getPreDecodedNetworth } from "skyhelper-networth";
import sanitize from "mongo-sanitize";
import retry from "async-retry";
import axios from "axios";

import * as constants from "./constants.js";
import credentials from "./credentials.js";
import * as helper from "./helper.js";
import * as stats from "./stats.js";
import { SkyCryptError } from "./constants/error.js";

const hypixel = axios.create({
  baseURL: "https://api.hypixel.net/",
});

async function executeFunctions(functions) {
  const errors = {};
  const results = {};

  async function handlePromise(key, fn, args, promise, awaitPromises, condition) {
    try {
      if (condition) {
        if (promise !== undefined) {
          Object.assign(args.output, results);
        }
        results[key] = await fn(...Object.values(args));
      }
    } catch (error) {
      console.error(`Failed to execute function ${key}: ${error}`);
      errors[key] = error;
    }
  }

  const promises = Object.entries(functions).map(([key, { fn, args, promise }]) =>
    handlePromise(key, fn, args, promise, undefined, promise === undefined)
  );

  await Promise.all(promises);

  const promises2 = Object.entries(functions).map(([key, { fn, args, promise, awaitPromises }]) =>
    handlePromise(key, fn, args, promise, awaitPromises, promise !== undefined && awaitPromises === undefined)
  );

  await Promise.all(promises2);

  const promises3 = Object.entries(functions).map(([key, { fn, args, promise, awaitPromises }]) =>
    handlePromise(key, fn, args, promise, awaitPromises, promise !== undefined && awaitPromises !== undefined)
  );

  await Promise.all(promises3);

  return { results, errors };
}

export async function getStats(
  db,
  profile,
  bingoProfile,
  allProfiles,
  items,
  packs,
  options = { cacheOnly: false, debugId: `${helper.getClusterId()}/unknown@getStats`, updateLeaderboards: true }
) {
  const output = {};

  console.debug(`${options.debugId}: getStats called.`);
  const timeStarted = Date.now();

  const userProfile = profile.members[profile.uuid];
  const hypixelProfile = await helper.getRank(profile.uuid, db, options.cacheOnly);

  output.stats = Object.assign({}, constants.BASE_STATS);

  const playerObject = await helper.resolveUsernameOrUuid(profile.uuid, db, options.cacheOnly);

  output.display_name = playerObject.display_name;

  if ("wardrobe_equipped_slot" in userProfile) {
    output.wardrobe_equipped_slot = userProfile.wardrobe_equipped_slot;
  }

  const userInfo = await db.collection("usernames").findOne({ uuid: profile.uuid });

  const memberUuids = [];
  for (const [uuid, memberProfile] of Object.entries(profile?.members ?? {})) {
    if (memberProfile?.coop_invitation?.confirmed === false || memberProfile.deletion_notice?.timestamp !== undefined) {
      memberProfile.removed = true;
    }

    memberUuids.push(uuid);
  }

  const members = await Promise.all(
    memberUuids.map(async (a) => {
      return {
        ...(await helper.resolveUsernameOrUuid(a, db, options.cacheOnly)),
        removed: profile.members[a]?.removed || false,
      };
    })
  );

  if (userInfo) {
    output.display_name = userInfo.username;

    members.push({
      uuid: profile.uuid,
      display_name: userInfo.username,
      removed: profile.members[profile.uuid]?.removed || false,
    });

    if ("emoji" in userInfo) {
      output.display_emoji = userInfo.emoji;
    }

    if ("emojiImg" in userInfo) {
      output.display_emoji_img = userInfo.emojiImg;
    }

    if (userInfo.username == "jjww2") {
      output.display_emoji = constants.randomEmoji();
    }
  }

  // fetches the guild and stores it in the database, on the front end it will be fetched from the database if the button is clicked
  getGuild(db, profile.uuid, options);

  output.rank_prefix = helper.renderRank(hypixelProfile);
  output.uuid = profile.uuid;
  output.skin_data = playerObject.skin_data;

  output.profile = { profile_id: profile.profile_id, cute_name: profile.cute_name, game_mode: profile.game_mode };
  output.profiles = {};

  for (const sbProfile of allProfiles.filter((a) => a.profile_id != profile.profile_id)) {
    output.profiles[sbProfile.profile_id] = {
      profile_id: sbProfile.profile_id,
      cute_name: sbProfile.cute_name,
      game_mode: sbProfile.game_mode,
    };
  }

  output.members = members.filter((a) => a.uuid != profile.uuid);

  output.social = hypixelProfile.socials;

  output.visited_zones = userProfile.player_data?.visited_zones || [];

  output.visited_modes = userProfile.player_data?.visited_modes || [];

  output.perks = userProfile.player_data?.perks || {};

  output.harp_quest = userProfile.quests?.harp_quest || {};

  const specialMuseumItems = items.museumItems.specialItems
    ? items.museumItems.specialItems.map((a) => a.data).flat()
    : [];
  const normalMuseumItems = items.museumItems.items
    ? Object.values(items.museumItems.items)
        .filter((a) => a && a.data !== undefined && a.borrowing === false)
        .map((a) => a.data)
        .flat()
    : [];

  const museumItems = [...normalMuseumItems, ...specialMuseumItems];

  output.networth =
    (await getPreDecodedNetworth(
      userProfile,
      {
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
      },
      output.currencies?.bank ?? 0,
      { cache: true, onlyNetworth: true, v2Endpoint: true }
    )) ?? {};

  const profileMembers = profile.members;
  const uuid = profile.uuid;

  const functions = {
    fairy_souls: { fn: stats.getFairySouls, args: { userProfile, profile } },
    skills: { fn: stats.getSkills, args: { userProfile, hypixelProfile, members: profileMembers } },
    slayer: { fn: stats.getSlayer, args: { userProfile } },
    kills: { fn: stats.getKills, args: { userProfile } },
    deaths: { fn: stats.getDeaths, args: { userProfile } },
    minions: { fn: stats.getMinions, args: { profile } },
    bestiary: { fn: stats.getBestiary, args: { userProfile } },
    dungeons: { fn: stats.getDungeons, args: { userProfile, hypixelProfile } },
    fishing: { fn: stats.getFishing, args: { userProfile } },
    farming: { fn: stats.getFarming, args: { userProfile } },
    enchanting: { fn: stats.getEnchanting, args: { userProfile } },
    mining: { fn: stats.getMining, args: { userProfile, hypixelProfile } },
    crimson_isle: { fn: stats.getCrimsonIsle, args: { userProfile } },
    collections: { fn: stats.getCollections, args: { uuid, profile, output }, promise: true },
    skyblock_level: { fn: stats.getSkyBlockLevel, args: { userProfile } },
    misc: { fn: stats.getMisc, args: { profile, userProfile, hypixelProfile } },
    bingo: { fn: stats.getBingoData, args: { bingoProfile } },
    user_data: { fn: stats.getUserData, args: { userProfile } },
    currencies: { fn: stats.getCurrenciesData, args: { userProfile, profile } },
    weight: { fn: stats.getWeight, args: { output }, promise: true },
    accessories: { fn: stats.getMissingAccessories, args: { output, items, packs } },
    temp_stats: { fn: stats.getTempStats, args: { userProfile } },
    rift: { fn: stats.getRift, args: { userProfile } },
    pets: { fn: stats.getPets, args: { userProfile, output, items, profile }, promise: true, awaitPromises: true },
  };

  const { results, errors } = await executeFunctions(functions, [userProfile, hypixelProfile, profile.members]);

  Object.assign(output, results);
  output.errors = errors;
  if (Object.keys(errors).length > 0) {
    for (const error in errors) {
      helper.sendWebhookMessage(errors[error], { params: { player: profile.uuid, profile: profile.profile_id } });
    }
  }

  console.debug(`${options.debugId}: getStats returned. (${Date.now() - timeStarted}ms)`);

  /*if (options.updateLeaderboards === true) {
    stats.updateLeaderboardData(profile.uuid, allProfiles, {
      debugId: `${helper.getClusterId()}/${profile.uuid}@updateLeaderboardData`,
    });
  }*/

  return output;
}

export async function getProfile(
  db,
  paramPlayer,
  paramProfile,
  options = { cacheOnly: false, debugId: `${helper.getClusterId()}/unknown@getProfile` }
) {
  console.debug(`${options.debugId}: getProfile called.`);
  const timeStarted = Date.now();

  if (paramPlayer.length != 32) {
    try {
      const { uuid } = await helper.resolveUsernameOrUuid(paramPlayer, db);

      paramPlayer = uuid;
    } catch (e) {
      console.error(e);
      throw new SkyCryptError(e);
    }
  }

  if (paramProfile) {
    paramProfile = paramProfile.toLowerCase();
  }

  const params = {
    key: credentials.hypixel_api_key,
    uuid: paramPlayer,
  };

  let allSkyBlockProfiles = [];

  let profileObject = await db.collection("profileStore").findOne({ uuid: sanitize(paramPlayer) });

  let lastCachedSave = 0;

  if (profileObject) {
    const profileData = db
      .collection("profileCache")
      .find({ profile_id: { $in: Object.keys(profileObject.profiles) } });
    for await (const doc of profileData) {
      if (doc.members?.[paramPlayer] == undefined) {
        continue;
      }

      Object.assign(doc, profileObject.profiles[doc.profile_id]);

      allSkyBlockProfiles.push(doc);
    }
  } else {
    profileObject = { last_update: 0 };
  }

  let response = null;

  lastCachedSave = Math.max(profileObject.last_update, Date.now() || 0);

  if (
    !options.cacheOnly &&
    ((Date.now() - lastCachedSave > 190 * 1000 && Date.now() - lastCachedSave < 300 * 1000) ||
      Date.now() - profileObject.last_update >= 300 * 1000)
  ) {
    try {
      profileObject.last_update = Date.now();
      response = await retry(
        async () => {
          return await hypixel.get("v2/skyblock/profiles", { params });
        },
        { retries: 2 }
      );

      const { data } = response;

      if (!data.success) {
        throw new SkyCryptError("Request to Hypixel API failed. Please try again!");
      }

      if (data.profiles == null) {
        throw new SkyCryptError("Player has no SkyBlock profiles.");
      }

      allSkyBlockProfiles = data.profiles;
    } catch (e) {
      if (e?.response?.data?.cause != undefined) {
        throw new SkyCryptError(`Hypixel API Error: ${e.response.data.cause}.`);
      }

      throw new SkyCryptError(e);
    }
  }

  if (allSkyBlockProfiles.length == 0) {
    throw new SkyCryptError("Player has no SkyBlock profiles.");
  }

  for (const profile of allSkyBlockProfiles) {
    profile.uuid = paramPlayer;
  }

  let skyBlockProfiles = [];

  if (paramProfile) {
    if (paramProfile.length == 36) {
      skyBlockProfiles = allSkyBlockProfiles.filter((a) => a.profile_id.toLowerCase() == paramProfile);
    } else {
      skyBlockProfiles = allSkyBlockProfiles.filter((a) => a.cute_name.toLowerCase() == paramProfile);
    }
  }

  if (skyBlockProfiles.length == 0) {
    skyBlockProfiles = allSkyBlockProfiles;
  }

  const profiles = [];

  for (const profile of skyBlockProfiles) {
    let memberCount = 0;

    for (let i = 0; i < Object.keys(profile.members).length; i++) {
      memberCount++;
    }

    if (memberCount == 0) {
      if (paramProfile) {
        throw new SkyCryptError("Uh oh, this SkyBlock profile has no players.");
      }

      continue;
    }

    profiles.push(profile);
  }

  if (profiles.length == 0) {
    throw new SkyCryptError("No data returned by Hypixel API, please try again!");
  }

  let profile;

  const storeProfiles = {};

  for (const _profile of allSkyBlockProfiles) {
    const userProfile = _profile.members[paramPlayer];

    if (!userProfile) {
      continue;
    }

    if (response && response.request.fromCache !== true) {
      const insertCache = {
        last_update: new Date(),
        members: _profile.members,
      };

      if ("banking" in _profile) {
        insertCache.banking = _profile.banking;
      }

      if ("community_upgrades" in _profile) {
        insertCache.community_upgrades = _profile.community_upgrades;
      }

      db.collection("profileCache")
        .updateOne({ profile_id: _profile.profile_id }, { $set: insertCache }, { upsert: true })
        .catch(console.error);
    }

    storeProfiles[_profile.profile_id] = {
      profile_id: _profile.profile_id ?? null,
      cute_name: _profile.cute_name ?? "Unknown",
      game_mode: _profile.game_mode ?? "normal",
      selected: _profile.selected ?? false,
    };
  }

  for (const _profile of profiles) {
    if (_profile === undefined || _profile === null) {
      return;
    }

    if (
      _profile?.selected ||
      _profile.profile_id.toLowerCase() == paramProfile ||
      _profile.cute_name.toLowerCase() == paramProfile
    ) {
      profile = _profile;
    }
  }

  if (!profile) {
    profile = profiles[0];

    if (!profile) {
      throw new SkyCryptError("Couldn't find any Skyblock profile that belongs to this player.");
    }
  }

  const userProfile = profile.members[paramPlayer];

  if (profileObject && "current_area" in profileObject) {
    userProfile.current_area = profileObject.current_area;
  }

  userProfile.current_area_updated = true;

  if (response && response.request.fromCache !== true) {
    const apisEnabled =
      "inv_contents" in userProfile &&
      Object.keys(userProfile).filter((a) => a.startsWith("experience_skill_")).length > 0 &&
      "collection" in userProfile;

    const insertProfileStore = {
      last_update: new Date(),
      apis: apisEnabled,
      profiles: storeProfiles,
    };

    try {
      const statusResponse = await hypixel.get("status", {
        params: { uuid: paramPlayer, key: credentials.hypixel_api_key },
      });

      const areaData = statusResponse.data.session;

      if (areaData.online && areaData.gameType == "SKYBLOCK") {
        const areaName = constants.AREA_NAMES[areaData.mode] || helper.titleCase(areaData.mode.replaceAll("_", " "));

        userProfile.current_area = areaName;
        insertProfileStore.current_area = areaName;
      }
    } catch (e) {
      console.error(e);
    }

    // updateLeaderboardPositions(db, paramPlayer, allSkyBlockProfiles).catch(console.error);

    db.collection("profileStore")
      .updateOne({ uuid: sanitize(paramPlayer) }, { $set: insertProfileStore }, { upsert: true })
      .catch(console.error);
  }

  console.debug(`${options.debugId}: getProfile returned. (${Date.now() - timeStarted}ms)`);
  return { profile: profile, allProfiles: allSkyBlockProfiles, uuid: paramPlayer };
}

export async function getBingoProfile(
  db,
  paramPlayer,
  options = { cacheOnly: false, debugId: `${helper.getClusterId()}/unknown@getProfile` }
) {
  console.debug(`${options.debugId}: getBingoProfile called.`);
  const timeStarted = Date.now();

  if (paramPlayer.length != 32) {
    try {
      const { uuid } = await helper.resolveUsernameOrUuid(paramPlayer, db);

      paramPlayer = uuid;
    } catch (e) {
      console.error(e);
      throw e;
    }
  }

  const params = {
    key: credentials.hypixel_api_key,
    uuid: paramPlayer,
  };

  let profileData = (await db.collection("bingoProfilesCache").findOne({ uuid: sanitize(paramPlayer) })) || {
    last_save: 0,
  };

  const lastCachedSave = profileData.last_save ?? 0;
  if (
    (!options.cacheOnly &&
      ((Date.now() - lastCachedSave > 190 * 1000 && Date.now() - lastCachedSave < 300 * 1000) ||
        Date.now() - profileData.last_save >= 300 * 1000)) ||
    lastCachedSave === 0
  ) {
    try {
      const response = await retry(
        async () => {
          return await hypixel.get("skyblock/bingo", { params });
        },
        { retries: 2 }
      );

      const { data } = response;

      if (!data.success) {
        throw new SkyCryptError("Request to Hypixel API failed. Please try again!");
      }

      profileData = data;
      profileData.last_save = Date.now();

      db.collection("bingoProfilesCache").updateOne(
        { uuid: sanitize(paramPlayer) },
        { $set: profileData },
        { upsert: true }
      );
    } catch (e) {
      if (e?.response?.data?.cause === "No bingo data could be found") {
        return null;
      }

      if (e?.response?.data?.cause != undefined) {
        throw new SkyCryptError(`Hypixel API Error: ${e.response.data.cause}.`);
      }

      throw e;
    }
  }

  console.debug(`${options.debugId}: getBingoProfile returned. (${Date.now() - timeStarted}ms)`);
  return profileData;
}

export async function getMuseum(
  db,
  paramProfile,
  options = { cacheOnly: false, debugId: `${helper.getClusterId()}/unknown@getProfile` }
) {
  console.debug(`${options.debugId}: getMuseum called.`);
  const timeStarted = Date.now();

  const profileID = paramProfile.profile_id;
  if (profileID.length !== 36) {
    throw new SkyCryptError("Invalid profile ID.");
  }

  let museumData = await db.collection("museumCache").findOne({ profile_id: profileID });
  if (!options.cacheOnly && (museumData == undefined || museumData.last_save < Date.now() - 1000 * 60 * 30)) {
    try {
      const params = {
        key: credentials.hypixel_api_key,
        profile: profileID,
      };

      const response = await retry(
        async () => {
          return await hypixel.get("skyblock/museum", { params });
        },
        { retries: 2 }
      );

      const { data } = response;

      if (data === undefined || data.success === false) {
        throw new SkyCryptError("Request to Hypixel API failed. Please try again!");
      }

      if (data.members === null || Object.keys(data.members).length === 0) {
        console.debug(`${options.debugId}: getMuseum returned. (${Date.now() - timeStarted}ms)`);
        return null;
      }

      museumData = { museum: data.members, last_save: Date.now() };
      db.collection("museumCache").updateOne({ profile_id: profileID }, { $set: museumData }, { upsert: true });
    } catch (e) {
      console.log(e);
      if (e?.response?.data?.cause != undefined) {
        throw new SkyCryptError(`Hypixel API Error: ${e.response.data.cause}.`);
      }

      throw new SkyCryptError(`Hypixel API Error: Failed to fetch Museum data.`);
    }
  }

  console.debug(`${options.debugId}: getMuseum returned. (${Date.now() - timeStarted}ms)`);
  return museumData?.museum;
}

export async function getGuild(
  db,
  paramPlayer,
  options = { cacheOnly: false, debugId: `${helper.getClusterId()}/unknown@getGuild` }
) {
  console.debug(`${options.debugId}: getGuild called.`);

  const timeStarted = Date.now();

  let output = await db.collection("guildCache").findOne({ uuid: paramPlayer });
  if (!options.cacheOnly && (!output || output.last_save < Date.now() - 1000 * 60 * 5)) {
    try {
      const params = {
        key: credentials.hypixel_api_key,
        player: paramPlayer,
      };

      const response = await retry(
        async () => {
          return await hypixel.get("guild", { params });
        },
        { retries: 2 }
      );

      const { data } = response;

      if (data === undefined || data.success === false) {
        throw new SkyCryptError("Request to Hypixel API failed. Please try again!");
      }

      const guildData = data.guild;
      if (!guildData) {
        console.debug(`${options.debugId}: getGuild returned. (${Date.now() - timeStarted}ms)`);
        return null;
      }

      const findMemberByRank = (members, rank) => members.find((member) => rank.includes(member.rank.toLowerCase()));
      const findMemberByUuid = (members, uuid) => members.find((member) => member.uuid == uuid);

      // we love Hypixel's consistency
      const guildMasterRank = ["guild master", "guildmaster"];
      const guildMaster = findMemberByRank(guildData.members, guildMasterRank);
      const guildMasterDetails = guildMaster ? await helper.resolveUsernameOrUuid(guildMaster?.uuid, db, true) : null;

      const playerMember = findMemberByUuid(guildData.members, paramPlayer);
      const playerDetails = await helper.resolveUsernameOrUuid(paramPlayer, db, true);

      output = {
        last_updated: Date.now(),
        guildMaster: {
          uuid: guildMaster?.uuid,
          username: guildMasterDetails ? guildMasterDetails?.display_name : null,
        },
        player: {
          uuid: paramPlayer,
          username: playerDetails?.display_name,
          rank: playerMember.rank,
        },
        name: guildData.name,
        level: helper.getGuildLevel(guildData.exp),
        members: guildData.members.length,
        tag: guildData.tag,
      };

      db.collection("guildCache").updateOne({ uuid: paramPlayer }, { $set: output }, { upsert: true });
    } catch (e) {
      console.log(e);

      if (e?.response?.data?.cause != undefined) {
        throw new SkyCryptError(`Hypixel API Error: ${e.response.data.cause}.`);
      }

      throw new SkyCryptError(`Hypixel API Error: Failed to fetch Guild data.`);
    }
  }

  console.debug(`${options.debugId}: getGuild returned. (${Date.now() - timeStarted}ms)`);
  return output;
}

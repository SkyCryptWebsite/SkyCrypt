import * as constants from "../constants.js";

export function getRift(userProfile) {
  if (!("rift" in userProfile) || (userProfile.visited_zones && userProfile.visited_zones.includes("rift") === false)) {
    return;
  }

  const rift = userProfile.rift;

  const killedEyes = [];
  for (const [key, data] of constants.RIFT_EYES.entries()) {
    data.unlocked = rift.wither_cage?.killed_eyes && rift.wither_cage.killed_eyes[key] !== undefined;

    killedEyes.push(data);
  }

  const timecharms = [];
  for (const [key, data] of constants.RIFT_TIMECHARMS.entries()) {
    data.unlocked = rift.gallery?.secured_trophies && rift.gallery.secured_trophies[key]?.type !== undefined;
    data.unlocked_at = rift.gallery?.secured_trophies && rift.gallery.secured_trophies[key]?.timestamp;

    timecharms.push(data);
  }

  return {
    motes: {
      purse: userProfile.currencies?.motes_purse ?? 0,
      lifetime: userProfile.player_stats.rift?.lifetime_motes_earned ?? 0,
      orbs: userProfile.player_stats.rift?.motes_orb_pickup ?? 0,
    },
    enigma: {
      souls: rift.enigma?.found_souls?.length ?? 0,
      total_souls: constants.RIFT_ENIGMA_SOULS,
    },
    wither_cage: {
      killed_eyes: killedEyes,
    },
    timecharms: {
      timecharms: timecharms,
      obtained_timecharms: timecharms.filter((a) => a.unlocked).length,
    },
    dead_cats: {
      montezuma: rift?.dead_cats?.montezuma ?? {},
      found_cats: rift?.dead_cats?.found_cats ?? [],
    },
    castle: {
      grubber_stacks: rift.castle?.grubber_stacks ?? 0,
      max_burgers: constants.MAX_GRUBBER_STACKS,
    },
  };
}

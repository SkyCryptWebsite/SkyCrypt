import { STATS_DATA } from "../../common/constants/stats.js";

export const TROPHY_FISH = {
  BLOBFISH: {
    display_name: "Blobfish",
    texture: "3e77a61f2a25f19bb047be985b965f069d857502881bea3f9682d00bfd5cc3e7",
    description: "§7Caught everywhere.",
    rarity: "common",
  },
  FLYFISH: {
    display_name: "Flyfish",
    texture: "5140c42fc3a1ba2fe77c45b975fa87e8f54a1b1833bc76e6339b4c262304011d",
    description: "§7Caught from §a8 §7blocks or higher above lava in the §cBlazing Volcano§7.",
    rarity: "uncommon",
  },
  GOLDEN_FISH: {
    display_name: "Golden Fish",
    texture: "fcfa31d81eae819936834e6664430daf8affbff30b48a1daa7ca1b4c20e3fe7d",
    description:
      "§7Has a chance to spawn after §a15 §7minutes of fishing, increasing linearly until reaching 100% at 20 minutes. The §6Golden Fish §7is rolled when your fishing hook is thrown out, regardless of if you catch a fish or not. You are not required to Trophy Fish to catch this one.",
    rarity: "legendary",
  },
  GUSHER: {
    display_name: "Gusher",
    texture: "afb8c51bfcd996840010bcce2a3575ae26352e00446d3ec313fcbf1f88108512",
    description: "§7Caught within §a7-16 §7minutes after a §cBlazing Volcano §7eruption.",
    rarity: "common",
  },
  KARATE_FISH: {
    display_name: "Karate Fish",
    texture: "901ef47164aba899674cac1e04dda29895ba670807a162e888681c6428e42a83",
    description:
      "§7Caught in the lava pools near the §eDojo§7. Note - Half of the lava pools do not actually count as being in the §eDojo §7area. If you stand in the same place as your bobber and do not see '§eDojo§7' in the sidebar, you cannot catch the §5Karate Fish §7there.",
    rarity: "epic",
  },
  LAVA_HORSE: {
    display_name: "Lavahorse",
    texture: "1176ea86635c4e849469ed694b3c0c3f7ec7677ed0682bee5ef6d59ea669677f",
    description: "§7Caught everywhere.",
    rarity: "rare",
  },
  MANA_RAY: {
    display_name: "Mana Ray",
    texture: "fdb2cad06f475b036ad71d61469b8e670e189204350adab6079dc85e1f7d58f2",
    description: `§7Caught when you have at least §b1,200 ${STATS_DATA.intelligence.symbol} Intelligence§7.`,
    rarity: "rare",
  },
  MOLDFIN: {
    display_name: "Moldfin",
    texture: "54f33dc405ba447b35926b48d90600302aeebb140ad330d885886cb1029a8af",
    description: "§7Caught in the §5Mystic Marsh§7.",
    rarity: "epic",
  },
  OBFUSCATED_FISH_1: {
    display_name: "Obfuscated 1",
    texture: "e1f4d91e1bf8d3c4258fe0f28ec2fa40670e25ba06ac4b5cb1abf52a83731a9c",
    description: "§7Caught with §fCorrupted Bait§7.",
    rarity: "common",
  },
  OBFUSCATED_FISH_2: {
    display_name: "Obfuscated 2",
    texture: "8321e19aa4b3163c8990b066b1cd0895c3c97a799057327507db0ffc80d90575",
    description: "§7Caught whilst using Obfuscated 1 as bait.",
    rarity: "uncommon",
  },
  OBFUSCATED_FISH_3: {
    display_name: "Obfuscated 3",
    texture: "df478663687d16f79b9c32546a7c3ec2736e87ce69779991e52deaf622abd8c2",
    description: "§7Caught with §9Obfuscated 2 §7as bait.",
    rarity: "rare",
  },
  SKELETON_FISH: {
    display_name: "Skeleton Fish",
    texture: "923e0a25048b60a2cc092f72943159ec170063bb235aa79690ef34ab181d691",
    description: "§7Caught in the §cBurning Desert§7.",
    rarity: "epic",
  },
  SLUGFISH: {
    display_name: "Slugfish",
    texture: "d82efd885e6e2a964efb857de724b2ef043f1dcbbe618f10ec3742c6f2cecab",
    description: "§7Caught when the bobber has been active for at least §a30 §7seconds.",
    rarity: "uncommon",
  },
  SOUL_FISH: {
    display_name: "Soul Fish",
    texture: "7fe554d346c20c161aa85cfdc1b89779c9f64e726a5bb28ace8078e6594052d7",
    description: "§7Caught in the §2Stronghold§7.",
    rarity: "epic",
  },
  STEAMING_HOT_FLOUNDER: {
    display_name: "Steaming-Hot Flounder",
    texture: "8b88f88f3053c434660eeb4c7b2344bc21ab52596cea5a66d0f9db8c0e050209",
    description: "§7Caught when the bobber is within §a2 §7blocks of a Geyser in the §cBlazing Volcano§7.",
    rarity: "common",
  },
  SULPHUR_SKITTER: {
    display_name: "Sulphur Skitter",
    texture: "4fbf7111609f2ec23d9b3f285e1755b62193bd7c3d770576e2b18c48afeb0e29",
    description: "§7Caught when standing within §a8 §7blocks of a Sulphur Ore.",
    rarity: "common",
  },
  VANILLE: {
    display_name: "Vanille",
    texture: "57120222cce38d53ba69fc6540e97bff9abdbe22ba6068d4ee9af52ecc56842f",
    description: "§7Caught when using a §aStarter Lava Rod §7with no Enchantments.",
    rarity: "rare",
  },
  VOLCANIC_STONEFISH: {
    display_name: "Volcanic Stonefish",
    texture: "38f89cbaa61ecc99a8321d53f070cef8414efc3eac47bf6fe143056fed9ee8",
    description: "§7Caught in the §cBlazing Volcano§7.",
    rarity: "rare",
  },
};

export const TROPHY_FISH_STAGES = {
  1: {
    formatted: `Bronze Hunter`,
    type: "bronze",
  },
  2: {
    formatted: `Silver Hunter`,
    type: "silver",
  },
  3: {
    formatted: `Gold Hunter`,
    type: "gold",
  },
  4: {
    formatted: `Diamond Hunter`,
    type: "diamond",
  },
};

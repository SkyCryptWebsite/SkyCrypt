export const SPECIAL_SETS = [
  {
    pieces: ["SKELETON_HELMET", "GUARDIAN_CHESTPLATE", "CREEPER_LEGGINGS", "SPIDER_BOOTS"],
    name: "Monster Hunter Armor",
  },
  {
    pieces: ["SKELETON_HELMET", "GUARDIAN_CHESTPLATE", "CREEPER_LEGGINGS", "TARANTULA_BOOTS"],
    name: "Monster Raider Armor",
  },
  {
    pieces: ["SPONGE_HELMET", "SPONGE_CHESTPLATE", "SPONGE_LEGGINGS", "SPONGE_BOOTS"],
    name: "Sponge Armor",
  },
  {
    pieces: ["FAIRY_HELMET", "FAIRY_CHESTPLATE", "FAIRY_LEGGINGS", "FAIRY_BOOTS"],
    name: "Fairy Armor",
  },
  {
    pieces: ["DIVER_HELMET", "DIVER_CHESTPLATE", "DIVER_LEGGINGS", "DIVER_BOOTS"],
    name: "Diver Armor",
  },
  {
    pieces: ["LEAFLET_HELMET", "LEAFLET_CHESTPLATE", "LEAFLET_LEGGINGS", "LEAFLET_BOOTS"],
    name: "Leaflet Armor",
  },
  {
    pieces: ["MASTIFF_HELMET", "MASTIFF_CHESTPLATE", "MASTIFF_LEGGINGS", "MASTIFF_BOOTS"],
    name: "Mastiff Armor",
  },
  {
    pieces: ["ADAPTIVE_HELMET", "ADAPTIVE_CHESTPLATE", "ADAPTIVE_LEGGINGS", "ADAPTIVE_BOOTS"],
    name: "Adaptive Armor",
  },
];

export const CUSTOM_ARMOR_ABILTIES = {
  SUPERIOR_DRAGON_ARMOR: {
    name: "Superior Dragon Armor",
    helmet: "SUPERIOR_DRAGON_HELMET",
    chestplate: "SUPERIOR_DRAGON_CHESTPLATE",
    leggings: "SUPERIOR_DRAGON_LEGGINGS",
    boots: "SUPERIOR_DRAGON_BOOTS",
    bonus: {
      statsMultiplier: 0.05,
    },
  },
  YOUNG_DRAGON_ARMOR: {
    name: "Young Dragon Armor",
    helmet: "YOUNG_DRAGON_HELMET",
    chestplate: "YOUNG_DRAGON_CHESTPLATE",
    leggings: "YOUNG_DRAGON_LEGGINGS",
    boots: "YOUNG_DRAGON_BOOTS",
    bonus: {
      speed: 75,
      speed_cap: 500,
    },
  },
  HOLY_DRAGON_ARMOR: {
    name: "Holy Dragon Armor",
    helmet: "HOLY_DRAGON_HELMET",
    chestplate: "HOLY_DRAGON_CHESTPLATE",
    leggings: "HOLY_DRAGON_LEGGINGS",
    boots: "HOLY_DRAGON_BOOTS",
    bonus: {
      health_regen: 200,
    },
  },
  LAPIS_ARMOR: {
    name: "Lapis Armor",
    helmet: "LAPIS_ARMOR_HELMET",
    chestplate: "LAPIS_ARMOR_CHESTPLATE",
    leggings: "LAPIS_ARMOR_LEGGINGS",
    boots: "LAPIS_ARMOR_BOOTS",
    bonus: {
      health: 60,
    },
  },
  CHEAP_TUXEDO_ARMOR: {
    name: "Cheap Tuxedo Armor",
    helmet: "CHEAP_TUXEDO_HELMET",
    chestplate: "CHEAP_TUXEDO_CHESTPLATE",
    leggings: "CHEAP_TUXEDO_LEGGINGS",
    boots: "CHEAP_TUXEDO_BOOTS",
    bonus: {
      health_cap: 75,
    },
  },
  FANCY_TUXEDO_ARMOR: {
    name: "Fancy Tuxedo Armor",
    helmet: "FANCY_TUXEDO_HELMET",
    chestplate: "FANCY_TUXEDO_CHESTPLATE",
    leggings: "FANCY_TUXEDO_LEGGINGS",
    boots: "FANCY_TUXEDO_BOOTS",
    bonus: {
      health_cap: 150,
    },
  },
  ELEGANT_TUXEDO_ARMOR: {
    name: "Elegant Tuxedo Armor",
    helmet: "ELEGANT_TUXEDO_HELMET",
    chestplate: "ELEGANT_TUXEDO_CHESTPLATE",
    leggings: "ELEGANT_TUXEDO_LEGGINGS",
    boots: "ELEGANT_TUXEDO_BOOTS",
    bonus: {
      health_cap: 250,
    },
  },
};

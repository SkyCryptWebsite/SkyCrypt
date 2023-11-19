export const DUNGEONS = {
  bosses: {
    bonzo: {
      name: "Bonzo",
      texture: "12716ecbf5b8da00b05f316ec6af61e8bd02805b21eb8e440151468dc656549c",
      floors: ["catacombs_1", "master_catacombs_1"],
      collection: "catacombs_1",
    },
    scarf: {
      name: "Scarf",
      texture: "7de7bbbdf22bfe17980d4e20687e386f11d59ee1db6f8b4762391b79a5ac532d",
      floors: ["catacombs_2", "master_catacombs_2"],
      collection: "catacombs_2",
    },
    professor: {
      name: "The Professor",
      texture: "9971cee8b833a62fc2a612f3503437fdf93cad692d216b8cf90bbb0538c47dd8",
      floors: ["catacombs_3", "master_catacombs_3"],
      collection: "catacombs_3",
    },
    thorn: {
      name: "Thorn",
      texture: "8b6a72138d69fbbd2fea3fa251cabd87152e4f1c97e5f986bf685571db3cc0",
      floors: ["catacombs_4", "master_catacombs_4"],
      collection: "catacombs_4",
    },
    livid: {
      name: "Livid",
      texture: "c1007c5b7114abec734206d4fc613da4f3a0e99f71ff949cedadc99079135a0b",
      floors: ["catacombs_5", "master_catacombs_5"],
      collection: "catacombs_5",
    },
    sadan: {
      name: "Sadan",
      texture: "fa06cb0c471c1c9bc169af270cd466ea701946776056e472ecdaeb49f0f4a4dc",
      floors: ["catacombs_6", "master_catacombs_6"],
      collection: "catacombs_6",
    },
    necron: {
      name: "Necron",
      texture: "a435164c05cea299a3f016bbbed05706ebb720dac912ce4351c2296626aecd9a",
      floors: ["catacombs_7", "master_catacombs_7"],
      collection: "catacombs_7",
    },
  },
  floors: {
    catacombs_0: {
      name: "entrance",
      texture: "35c3024f4d9d12ddf5959b6aea3c810f5ee85176aab1b2e7f462aa1c194c342b",
    },
    catacombs_1: {
      name: "floor_1",
      texture: "726f384acdfbb7218e96efac630e9ae1a14fd2f820ab660cc68322a59b165a12",
    },
    catacombs_2: {
      name: "floor_2",
      texture: "ebaf2ae74553a64587840d6e70fb27d2c0ae2f8bdfacbe56654c8db4001cdc98",
    },
    catacombs_3: {
      name: "floor_3",
      texture: "5a2f67500a65f3ce79d34ec150de93df8f60ebe52e248f5e1cdb69b0726256f7",
    },
    catacombs_4: {
      name: "floor_4",
      texture: "5720917cda0567442617f2721e88be9d2ffbb0b26a3f4c2fe21655814d4f4476",
    },
    catacombs_5: {
      name: "floor_5",
      texture: "5720917cda0567442617f2721e88be9d2ffbb0b26a3f4c2fe21655814d4f4476",
    },
    catacombs_6: {
      name: "floor_6",
      texture: "3ce69d2ddcc81c9fc2e9948c92003eb0f7ebf0e7e952e801b7f2069dcee76d85",
    },
    catacombs_7: {
      name: "floor_7",
      texture: "76965e3fd619de6b0a7ce1673072520a9360378e1cb8c19d4baf0c86769d3764",
    },
    master_catacombs_1: {
      name: "floor_1",
      texture: "1eb5b21af330af122b268b7aa390733bd1b699b4d0923233ecd24f81e08b9bce",
    },
    master_catacombs_2: {
      name: "floor_2",
      texture: "32292e4e0fa62667256ef8da0f01982a996499f4d5d894bd058c3e6f3d2fb2d9",
    },
    master_catacombs_3: {
      name: "floor_3",
      texture: "c969f6b148648aa8d027228a52fb5a3ca1ee84dc76e47851f14db029a730a8a3",
    },
    master_catacombs_4: {
      name: "floor_4",
      texture: "d7b69021f9c09647dfd9b34df3deaff70cfc740f6a26f612dd47503fc34c97f0",
    },
    master_catacombs_5: {
      name: "floor_5",
      texture: "d65cbce40e60e7a59a87fa8f4ecb6ccfc1514338c262614bf33739a6263f5405",
    },
    master_catacombs_6: {
      name: "floor_6",
      texture: "d65cbce40e60e7a59a87fa8f4ecb6ccfc1514338c262614bf33739a6263f5405",
    },
    master_catacombs_7: {
      name: "floor_7",
      texture: "d65cbce40e60e7a59a87fa8f4ecb6ccfc1514338c262614bf33739a6263f5405",
    },
  },
  level_bonuses: {
    dungeon_catacombs: {
      1: { item_boost: 4 },
      6: { item_boost: 5 },
      11: { item_boost: 6 },
      16: { item_boost: 7 },
      21: { item_boost: 8 },
      26: { item_boost: 9 },
      31: { item_boost: 10 },
      36: { item_boost: 12 },
      41: { item_boost: 14 },
      46: { item_boost: 16 },
      47: { item_boost: 17 },
      48: { item_boost: 18 },
      49: { item_boost: 19 },
      50: { item_boost: 20 },
    },
  },
  journals: {
    karylles_diary: {
      name: "Karyelle's Diary",
      pages: 10,
    },
    the_study: {
      name: "The Study",
      pages: 9,
    },
    expedition_volume_1: {
      name: "The Expedition Volume 1",
      pages: 4,
    },
    uncanny_remains: {
      name: "Uncanny Remains",
      pages: 7,
    },
    expedition_volume_2: {
      name: "The Expedition Volume 2",
      pages: 5,
    },
    grim_adversity: {
      name: "Grim Adversity",
      pages: 9,
    },
    expedition_volume_3: {
      name: "The Expedition Volume 3",
      pages: 10,
    },
    expedition_volume_4: {
      name: "The Expedition Volume 4",
      pages: 11,
    },
    the_walls: {
      name: "The Walls",
      pages: 24,
    },
    the_eye: {
      name: "The Eye",
      pages: 8,
    },
    aftermath: {
      name: "Aftermath",
      pages: 5,
    },
    the_apprentice: {
      name: "The Apprentice",
      pages: 6,
    },
    the_follower: {
      name: "The Follower",
      pages: 14,
    },
    the_apprentice_2: {
      name: "The Apprentice, Part 2",
      pages: 14,
    },
    the_apprentice_3: {
      name: "The Apprentice, Part 3",
      pages: 25,
    },
    the_follower_2: {
      name: "The Follower, Part 2",
      pages: 11,
    },
    murderer: {
      name: "Murderer",
      pages: 17,
    },
    the_follower_3: {
      name: "The Follower, Part 3",
      pages: 9,
    },
    the_father: {
      name: "The Father",
      pages: 5,
    },
    the_watcher: {
      name: "The Watcher",
      pages: 11,
    },
    memories: {
      name: "Memories",
      pages: 70,
    },
    the_orb: {
      name: "The Orb",
      pages: 6,
    },
    necrons_dilemma: {
      name: "Necron's Dilemma",
      pages: 10,
    },
    necrons_magic_scroll: {
      name: "Necron's Magic Scroll",
      pages: 0,
    },
    until_we_meet_again: {
      name: "Until we meet again",
      pages: 10,
    },
  },
};

/*
  Animted skins created at ezgif.com/apng-maker with the following settings:
  - Skins that change based on time of day
      - Delay time: 500
      - Enable crossfade frames: delay = 3, count = 10
  - Skins that are always animated
      - Delay time: 20 (but do what looks best)
      - No crossfade
      - Don't stack frames (unless needed)

  skins: Array of objects containing all skins ever released
  {
    id: string,
    name: string,
    texture: string,
    release: int,
  }

  animations: Array of objects containing all animations for skins and items
  {
    id: string,
    texture: string,
    animation: object -> AnimationObject
  }

  AnimationObject: either day/night (for animations that change based on the time of the day)
    or progressive timings in ms (for cyclic animations). If null the information about the
    animation are missing.
  {
    day: string,
    night: string,
  }
  {
    0: string,
    100: string,
    ...: string,
    int: string,
  }
*/

const skins = [
  {
    id: "PET_SKIN_ENDERMAN",
    name: "Spooky",
    texture: "/head/ea84cc8818c293484fdaafc8fa2f0bf39e55733a247d68023df2c6c6b9b671d0",
    release: new Date("2020-09-08 18:00:00 GMT+1").getTime(),
  },
  {
    id: "PET_SKIN_ENDERMAN_SLAYER",
    name: "Void Conqueror",
    texture: "/head/8fff41e1afc597b14f77b8e44e2a134dabe161a1526ade80e6290f2df331dc11",
    release: new Date("2021-05-31 23:00:00 GMT+1").getTime(),
  },
  {
    id: "PET_SKIN_GUARDIAN",
    name: "Watcher",
    texture: "/head/37cc76e7af29f5f3fbfd6ece794160811eff96f753459fa61d7ad176a064e3c5",
    release: new Date("2020-10-01 18:00:00 GMT+1").getTime(),
  },
  {
    id: "PET_SKIN_TIGER_TWILIGHT",
    name: "Twilight",
    texture: "https://sky.shiiyu.moe/head/896211dc599368dbd9056c0116ab61063991db793be93066a858eb4e9ce56438",
    release: new Date("2020-10-20 18:00:00 GMT+1").getTime(),
  },
  {
    id: "PET_SKIN_RABBIT",
    name: "Pretty",
    texture: "/head/a34631d940fddb689ddef6a3b352c50220c460dba05cd18dc83192b59dc647f8",
    release: new Date("2020-09-12 18:00:00 GMT+1").getTime(),
  },
  {
    id: "PET_SKIN_RABBIT_AQUAMARINE",
    name: "Aquamarine",
    texture: "/head/35a2119d122961852c010c1007ab2aff95b4bbeb74407463f6d2e1ff0792c812",
    release: new Date("2021-04-15 18:00:00 GMT+1").getTime(),
  },
  {
    id: "PET_SKIN_RABBIT_ROSE",
    name: "Rose",
    texture: "/head/d7cddf5b20cb50d6600e5333c6bb3fb15b4741f17e3675fc2bfc09c2cd09e619",
    release: new Date("2021-04-15 18:00:00 GMT+1").getTime(),
  },
  {
    id: "PET_SKIN_WITHER",
    name: "Dark",
    texture: "/head/224c2d14a0219af5ccfcaa36e8a333e271724ed61276611f9529e16c10273a0d",
    release: new Date("2020-11-15 18:00:00 GMT+1").getTime(),
  },
  {
    id: "PET_SKIN_ROCK_COOL",
    name: "Cool",
    texture: "/head/fefcdbb7d95502acc1ae35a32a40ce4dec8f4c9f0da26c9d9fe7c2c3eb748f6",
    release: new Date("2020-09-23 18:00:00 GMT+1").getTime(),
  },
  {
    id: "PET_SKIN_ROCK_SMILE",
    name: "Smile",
    texture: "/head/713c8b2916a275db4c1762cf5f13d7b95b91d60baf5164a447d6efa7704cf11b",
    release: new Date("2020-09-23 18:00:00 GMT+1").getTime(),
  },
  {
    id: "PET_SKIN_ROCK_THINKING",
    name: "Thinking",
    texture: "/head/dd2f781f03c365bbc5dd1e7186ab38dc69465e836c9fe066a9a844f34a4da92",
    release: new Date("2020-09-23 18:00:00 GMT+1").getTime(),
  },
  {
    id: "PET_SKIN_ROCK_LAUGH",
    name: "Laughing",
    texture: "/head/8cc1ef513d5f616675242174acde7b9d6259a47c4fe8f6e4b6e20920319d7073",
    release: new Date("2020-09-23 18:00:00 GMT+1").getTime(),
  },
  {
    id: "PET_SKIN_ROCK_DERP",
    name: "Derp",
    texture: "/head/c4f89fbd12c209f7f26c1f34a1bd7f47635814759c09688dd212b205c73a8c02",
    release: new Date("2020-09-23 18:00:00 GMT+1").getTime(),
  },
  {
    id: "PET_SKIN_ROCK_EMBARRASSED",
    name: "Embarrassed",
    texture: "/head/27ff34992e66599e8529008be3fb577cb0ab545294253e25a0cc988e416c849",
    release: new Date("2020-09-23 18:00:00 GMT+1").getTime(),
  },
  {
    id: "PET_SKIN_SHEEP_WHITE",
    name: "White",
    texture: "/head/b92a1a5c325f25f7438a0abb4f86ba6cf75552d02c7349a7292981459b31d2f7",
    release: new Date("2020-11-07 18:00:00 GMT+1").getTime(),
  },
  {
    id: "PET_SKIN_SHEEP_PURPLE",
    name: "Purple",
    texture: "/head/99a88cf7dd33063587c6b540e6130abc5d07f1a65c47573ab3c1ad3ccec8857f",
    release: new Date("2020-11-07 18:00:00 GMT+1").getTime(),
  },
  {
    id: "PET_SKIN_SHEEP_BLACK",
    name: "Black",
    texture: "/head/aa9dcda642a807cd2daa4aa6be87cef96e08a8c8f5cec2657dda4266c6a884c2",
    release: new Date("2020-11-07 18:00:00 GMT+1").getTime(),
  },
  {
    id: "PET_SKIN_SHEEP_PINK",
    name: "Pink",
    texture: "/head/afa7747684dcb96192d90342cea62742ec363da07cb5e6e25eecec888cd2076",
    release: new Date("2020-11-07 18:00:00 GMT+1").getTime(),
  },
  {
    id: "PET_SKIN_SHEEP_LIGHT_BLUE",
    name: "Light Blue",
    texture: "/head/722220de1a863bc5d9b9e7a6a3b03214c9f3d698ed3fe0d28220f3b93b7685c5",
    release: new Date("2020-11-07 18:00:00 GMT+1").getTime(),
  },
  {
    id: "PET_SKIN_SHEEP_LIGHT_GREEN",
    name: "Light Green",
    texture: "/head/cf183ec2fe58faa43e568419b7a0dc446ece4ea0be52ec784c94e1d74b75939d",
    release: new Date("2020-11-07 18:00:00 GMT+1").getTime(),
  },
  {
    id: "PET_SKIN_SHEEP_NEON_YELLOW",
    name: "Neon Yellow",
    texture: "/head/94263428c23da9165b2639a8f2428ff4835227945c9e1038461cf644d67cc82a",
    release: new Date("2021-01-05 18:00:00 GMT+1").getTime(),
  },
  {
    id: "PET_SKIN_SHEEP_NEON_RED",
    name: "Neon Red",
    texture: "/head/4918be142a20b2b39bc582f421f6ae87b3184b5c9523d16fbe6d69530107886a",
    release: new Date("2021-01-05 18:00:00 GMT+1").getTime(),
  },
  {
    id: "PET_SKIN_SHEEP_NEON_BLUE",
    name: "Neon Blue",
    texture: "/head/e55b3fe9311c99342ea565483cbf9e969a258faf7afa30270fb9a0929377acfd",
    release: new Date("2021-01-05 18:00:00 GMT+1").getTime(),
  },
  {
    id: "PET_SKIN_SHEEP_NEON_GREEN",
    name: "Neon Green",
    texture: "/head/2c14d66911554bd0882339074bf6b8110c2d3509b69e7a6144e4d5a7164bacc8",
    release: new Date("2021-01-05 18:00:00 GMT+1").getTime(),
  },
  {
    id: "PET_SKIN_SILVERFISH",
    name: "Fortified",
    texture: "/head/d8552ff591042c4a38f8ba0626784ae28c4545a97d423fd9037c341035593273",
    release: new Date("2020-11-22 18:00:00 GMT+1").getTime(),
  },
  {
    id: "PET_SKIN_SILVERFISH_FOSSILIZED",
    name: "Fossilized",
    texture: "/head/ca3a363368ed1e06cee3900717f062e02ec39aee1747675392255b48f7f83600",
    release: new Date("2021-01-22 18:00:00 GMT+1").getTime(),
  },
  {
    id: "PET_SKIN_ELEPHANT_PINK",
    name: "Pink",
    texture: "/head/570eef474ec0e56cc34c2307eaa39f024612f8cd7248e7d5b14169ebd307c742",
    release: new Date("2020-12-05 18:00:00 GMT+1").getTime(),
  },
  {
    id: "PET_SKIN_ELEPHANT_BLUE",
    name: "Blue",
    texture: "/head/4b62969c005815d0409136380febc5ac468aaba9bda4db80954fa5426ee0a323",
    release: new Date("2020-12-05 18:00:00 GMT+1").getTime(),
  },
  {
    id: "PET_SKIN_ELEPHANT_ORANGE",
    name: "Orange",
    texture: "/head/554a34a80c474206d3700b8fced6b44fab0b0ed0b05c1293ff0c5d86eda251d1",
    release: new Date("2020-12-05 18:00:00 GMT+1").getTime(),
  },
  {
    id: "PET_SKIN_ELEPHANT_RED",
    name: "Red",
    texture: "/head/ba5c66ec66cb6b4b5550085f583b4e5c1cee5247bec5fbcc5c318c30c66cab42",
    release: new Date("2021-02-13 18:00:00 GMT+1").getTime(),
  },
  {
    id: "PET_SKIN_ELEPHANT_PURPLE",
    name: "Purple",
    texture: "/head/5ff9df290b6c5a4984fc6e516605f9816b9882f7bf04db08d3f7ee32d1969a44",
    release: new Date("2021-02-13 18:00:00 GMT+1").getTime(),
  },
  {
    id: "PET_SKIN_ELEPHANT_GREEN",
    name: "Green",
    texture: "/head/360c122ade5b2fedca14aa78c834a7b0ac9cb5da2a0c93112163086f90c13b68",
    release: new Date("2021-02-13 18:00:00 GMT+1").getTime(),
  },
  {
    id: "PET_SKIN_ELEPHANT_MONOCHROME",
    name: "Monochrome",
    texture: "https://sky.shiiyu.moe/head/4bdf0f628c05e86cabdee2f5858dd5def7f8b8d940cbf25f9937e2ffb53432f4",
    release: new Date("2021-03-22 18:00:00 GMT+1").getTime(),
  },
  {
    id: "PET_SKIN_JERRY_RED_ELF",
    name: "Red Elf",
    texture: "/head/1d82f9c36e824c1e37963a849bf5abd76d3b349125023504af58369086089ee9",
    release: new Date("2020-12-25 18:00:00 GMT+1").getTime(),
  },
  {
    id: "PET_SKIN_JERRY_GREEN_ELF",
    name: "Green Elf",
    texture: "/head/4ec5455f43426ca1874b5c7b4a492ec3722a502f8b9599e758e133fed8b3c1e4",
    release: new Date("2020-12-25 18:00:00 GMT+1").getTime(),
  },
  {
    id: "PET_SKIN_YETI_GROWN_UP",
    name: "Grown-up",
    texture: "/head/f5f29a975529276d916fc67998833c11ee178ff21e5941afdfb0fa7010f8374e",
    release: new Date("2020-12-15 18:00:00 GMT+1").getTime(),
  },
  {
    id: "PET_SKIN_MONKEY_GOLDEN",
    name: "Golden",
    texture: "/head/e9281c4d87d68526b0749d4361e6ef786c8a35717aa053da704b1d53410d37a6",
    release: new Date("2021-01-13 18:00:00 GMT+1").getTime(),
  },
  {
    id: "PET_SKIN_MONKEY_GORILLA",
    name: "Gorilla",
    texture: "https://sky.shiiyu.moe/head/c3eb3e37e9873bfc176b9ed8ef4fbef833de144546bfaefdf24863c3eb87bb86",
    release: new Date("2021-05-13 18:00:00 GMT+1").getTime(),
  },
  {
    id: "PET_SKIN_HORSE_ZOMBIE",
    name: "Zombie",
    texture: "/head/578211e1b4d99d1c7bfda4838e48fc884c3eae376f58d932bc2f78b0a919f8e7",
    release: new Date("2021-01-29 18:00:00 GMT+1").getTime(),
  },
  {
    id: "PET_SKIN_DRAGON_NEON_BLUE",
    name: "Neon Blue",
    texture: "/head/96a4b9fbcf8c3e7e1232e57d6a2870ba3ea30f76407ae1197fd52e9f76ca46ac",
    release: new Date("2021-02-08 18:00:00 GMT+1").getTime(),
  },
  {
    id: "PET_SKIN_DRAGON_NEON_PURPLE",
    name: "Neon Purple",
    texture: "/head/54bdf5ba6289b29e27c57db1ec7f76151c39492d409268e00a9838e8c963159",
    release: new Date("2021-02-08 18:00:00 GMT+1").getTime(),
  },
  {
    id: "PET_SKIN_DRAGON_NEON_RED",
    name: "Neon Red",
    texture: "/head/e05c9b4f4218677c5b4bcc9c7d9e29e18d1684a536781fede1280fc5e6961538",
    release: new Date("2021-02-08 18:00:00 GMT+1").getTime(),
  },
  {
    id: "PET_SKIN_DRAGON_PASTEL",
    name: "Pastel",
    texture: "/head/4a62ec4e019fe0fed059663ae59daa0d91729517bf33ae7f7d7e722913602df4",
    release: new Date("2021-06-30 18:00:00 GMT+1").getTime(),
  },
  {
    id: "PET_SKIN_WHALE_ORCA",
    name: "Orca",
    texture: "/head/b008ca9c00cecf499685030e8ef0c230a32908619ce9dc10690b69111591faa1",
    release: new Date("2021-03-09 18:00:00 GMT+1").getTime(),
  },
  {
    id: "PET_SKIN_CHICKEN_BABY_CHICK",
    name: "Baby Chick",
    texture: "/head/1bde55ed54cb5c87661b86c349186a9d5baffb3cb934b449a2d329e399d34bf",
    release: new Date("2021-04-05 18:00:00 GMT+1").getTime(),
  },
  {
    id: "PET_SKIN_BLACK_CAT_IVORY",
    name: "Ivory",
    texture: "/head/f51b17d7ded6c7e8f3b2dac12378a6fc4e9228b911986f64c8af45837ae6d9e1",
    release: new Date("2021-04-26 18:00:00 GMT+1").getTime(),
  },
  {
    id: "PET_SKIN_BLACK_CAT_ONYX",
    name: "Onyx",
    texture: "/head/be924115d3a8bbacfd4fafb6cc70f99a2f7580e4583a50fa9b9c285a98ac0c56",
    release: new Date("2021-04-26 18:00:00 GMT+1").getTime(),
  },
  {
    id: "PET_SKIN_ENDERMITE_RADIANT",
    name: "Radiant",
    texture: "https://sky.shiiyu.moe/head/2fc4a7542b754420b1b19f9a28ea00040555a9e876052b97f65840308a93348d",
    release: new Date("2021-06-02 18:00:00 GMT+1").getTime(),
  },
  {
    id: "PET_SKIN_WOLF",
    name: "Dark Wolf",
    texture: "/head/c8e414e762e1024c799e70b7a527c22fb95648f141d660b10c512cc124334218",
    release: new Date("2021-08-10 18:00:00 GMT+1").getTime(),
  },
  {
    id: "PET_SKIN_HOUND_BEAGLE",
    name: "Beagle",
    texture: "/head/877364e0ce27f0239b7754706b93022d0cf945854015d6096f9cf43d24a38269",
    release: new Date("2021-08-24 18:00:00 GMT+1").getTime(),
  },
  {
    id: "PET_SKIN_SQUID_GLOW",
    name: "Glow",
    texture: "/head/fca9982520eee4066bab0ae697f3b3656084b6639ba89113bd8e23ab7288563d",
    release: new Date("2021-09-14 18:00:00 GMT+1").getTime(),
  },
  {
    id: "SNOW_SNOWGLOBE",
    name: "Snowglobe",
    texture: "/head/13229f8525726684fb0227dad7621f05f0b8b5d58a8693fd0ea0688349f1d53c",
    release: new Date("2020-12-25 18:00:00 GMT+1").getTime(),
  },
];

const animations = [
  {
    id: "PET_SKIN_TIGER_TWILIGHT",
    texture: "/resources/img/items/tiger_twilight.png",
    animation: {
      day: "/head/896211dc599368dbd9056c0116ab61063991db793be93066a858eb4e9ce56438",
      night: "/head/25afc37dc1909ee0a3eb8d0404271fc47660cff1153495412d6e9896632eaa8e",
    },
  },
  {
    id: "PET_SKIN_ELEPHANT_MONOCHROME",
    texture: "/resources/img/items/elephant_monochrome.png",
    animation: {
      day: "/head/4bdf0f628c05e86cabdee2f5858dd5def7f8b8d940cbf25f9937e2ffb53432f4",
      night: "/head/176e8db6cd2db2fd11747c750d24040f3435b3301d91949f33f9615d16dab060",
    },
  },
  {
    id: "PET_SKIN_MONKEY_GORILLA",
    texture: "/resources/img/items/monkey_gorilla.png",
    animation: {
      0: "/head/ac75d405235a58c68bddadad082e895e84feadfffd9f69c00a2194498732d48",
      1000: "/head/2a8be837b3361464b5ca555029658f0fdc9432cb351f088996f6da7210e1fc75",
      1200: "/head/75c6a5d6361a7b847fa6bbf6905c381f764a84f1c820d8e82c76e7db0feb9ee7",
      1500: "/head/e6227de20348cf220bb15a6c5d1c7d5405b0bbd9f759cecf891c3991f07f4f9f",
      1800: "/head/20cbac153bc024d35a6d7df3d57b6ee814ae01e643bcd2f77a2aaae0acd771d2",
      3600: "/head/e6227de20348cf220bb15a6c5d1c7d5405b0bbd9f759cecf891c3991f07f4f9f",
      3800: "/head/75c6a5d6361a7b847fa6bbf6905c381f764a84f1c820d8e82c76e7db0feb9ee7",
      4100: "/head/2a8be837b3361464b5ca555029658f0fdc9432cb351f088996f6da7210e1fc75",
      4300: "/head/ac75d405235a58c68bddadad082e895e84feadfffd9f69c00a2194498732d48",
    },
  },
  {
    id: "PET_SKIN_ENDERMITE_RADIANT",
    texture: "/resources/img/items/endermite_radiant.png",
    animation: {
      0: "/head/3840ad985c0b08811ab0a137ca736119d079dbf2143462145eb62b6ecbd2d7cc",
      250: "/head/7019bf6fa4602458a9b20ad09cca45ef5ccc6257081ae323f9bbfca0cbc947e9",
      400: "/head/b2e7419ad458452240b03d8e32016218c70a694a97b9973f4d8ba974056248bd",
      500: "/head/116743eb37c69387615fe4816bc9727ba269f64d1f0bf83b788e3e32c6b06147",
      700: "/head/2fc4a7542b754420b1b19f9a28ea00040555a9e876052b97f65840308a93348d",
      950: "/head/116743eb37c69387615fe4816bc9727ba269f64d1f0bf83b788e3e32c6b06147",
      1150: "/head/b2e7419ad458452240b03d8e32016218c70a694a97b9973f4d8ba974056248bd",
      1300: "/head/7019bf6fa4602458a9b20ad09cca45ef5ccc6257081ae323f9bbfca0cbc947e9",
      1600: "/head/3840ad985c0b08811ab0a137ca736119d079dbf2143462145eb62b6ecbd2d7cc",
      1650: "/head/b8705a24c728644bfec2195f315e5d354060638e2bd9bf8df73d84146c8d1406",
      1900: "/head/4d671df85ea9ee52885d7d774f0c9462c8e8bf048e77aa06160c1cc5f45273be",
      2050: "/head/adb8259926a17a493a85669387f6e3d77876dac3c838b6c7d6f919ebc53217a5",
      2200: "/head/a028ac35c7c7e98f2a6bcd1d1b17b94e79510c6e239f7195717232dcbc7f1e0c",
      2500: "/head/adb8259926a17a493a85669387f6e3d77876dac3c838b6c7d6f919ebc53217a5",
      2650: "/head/4d671df85ea9ee52885d7d774f0c9462c8e8bf048e77aa06160c1cc5f45273be",
      2800: "/head/b8705a24c728644bfec2195f315e5d354060638e2bd9bf8df73d84146c8d1406",
      3000: "/head/3840ad985c0b08811ab0a137ca736119d079dbf2143462145eb62b6ecbd2d7cc",
      3650: "/head/b2e7419ad458452240b03d8e32016218c70a694a97b9973f4d8ba974056248bd",
      3950: "/head/2fc4a7542b754420b1b19f9a28ea00040555a9e876052b97f65840308a93348d",
      4200: "/head/116743eb37c69387615fe4816bc9727ba269f64d1f0bf83b788e3e32c6b06147",
      4350: "/head/b2e7419ad458452240b03d8e32016218c70a694a97b9973f4d8ba974056248bd",
      4500: "/head/7019bf6fa4602458a9b20ad09cca45ef5ccc6257081ae323f9bbfca0cbc947e9",
      4800: "/head/3840ad985c0b08811ab0a137ca736119d079dbf2143462145eb62b6ecbd2d7cc",
      4950: "/head/b8705a24c728644bfec2195f315e5d354060638e2bd9bf8df73d84146c8d1406",
      5100: "/head/4d671df85ea9ee52885d7d774f0c9462c8e8bf048e77aa06160c1cc5f45273be",
      5250: "/head/adb8259926a17a493a85669387f6e3d77876dac3c838b6c7d6f919ebc53217a5",
      5450: "/head/a028ac35c7c7e98f2a6bcd1d1b17b94e79510c6e239f7195717232dcbc7f1e0c",
      5700: "/head/adb8259926a17a493a85669387f6e3d77876dac3c838b6c7d6f919ebc53217a5",
      5850: "/head/4d671df85ea9ee52885d7d774f0c9462c8e8bf048e77aa06160c1cc5f45273be",
      6000: "/head/b8705a24c728644bfec2195f315e5d354060638e2bd9bf8df73d84146c8d1406",
    },
  },
  {
    id: "PET_SKIN_SQUID_GLOW",
    texture: "/resources/img/items/squid_glow.png",
    animation: {
      0: "/head/162eba7072c3054e310daf2e6970cc65a4346a9c4118399f4d68a2d7e66612b7",
      50: "/head/f2ff4c824c39727c6bb8a126379a5ded2ba9aed24b59879f6b3af461e44df84a",
      290: "/head/a1309033f08a444dea956d0d8099e5d132b14509617ee00ce0c4687879900546",
      800: "/head/65d43d64e8e3e43f4de13ed1e2ca0ead1e88c4017ca466b8d057408029a80d19",
      1040: "/head/8e0785c6f4a4d84a7a5289f2f435d10a5a7a4c4debc41d3cf95665ae658ba181",
      1290: "/head/3d1ca6068e4b8cce378e554618034c014ff6219dc37bf0b0635848fa3cebbec",
      1560: "/head/cfad4bbfc7a9ce14877e99ca5ca16b8d9d9ec3d0c065829e42766bcdbd4a0191",
      1780: "/head/4167e70f8470d5d69aedb2a98c916f4b5a77d7ca8d051fbf70fb1b80ba7f9802",
      2040: "/head/fca9982520eee4066bab0ae697f3b3656084b6639ba89113bd8e23ab7288563d",
      2300: "/head/727581cfcf9905729b336dcf13784eac227bcdd709c4e92e018d45c4896ae29b",
      2550: "/head/e0f95d0e5c64f46851b3c5d5d75cc0b7a9e09a1121740cd00e3cf25fa362306a",
    },
  },
  {
    id: "SINFUL_DICE",
    texture: "/resources/img/items/sinful_dice.png",
    animation: {
      0: "/head/6e22c298e7c6336af17909ac1f1ee6834b58b1a3cc99aba255ca7eaeb476173",
      500: "/head/71b7a73fc934c9de9160c0fd59df6e42efd5d0378e342b68612cfec3e894834a",
      1000: "/head/abe677a1e163a9f9e0afcfcde0c95365553478f99ab11152a4d97cf85dbe66f",
      1500: "/head/af2996efc2bb054f53fb0bd106ebae675936efe1fef441f653c2dce349738e",
      2000: "/head/e0d2a3ce4999fed330d3a5d0a9e218e37f4f57719808657396d832239e12",
      2500: "/head/41a2c088637fee9ae3a36dd496e876e657f509de55972dd17c18767eae1f3e9",
    },
  },
  {
    id: "SNOW_SNOWGLOBE",
    texture: "/resources/img/items/skin_snowglobe.png",
    animation: null,
  },
];

const gen_pet_skins = {};
const gen_item_skins = {};
const gen_animated_items = {};

skins.forEach((skin) => {
  if (skin.id.startsWith("PET_SKIN_")) {
    gen_pet_skins[skin.id] = {
      name: skin.name,
      texture: skin.texture,
      release: skin.release,
    };
  } else {
    gen_item_skins[skin.id] = {
      name: skin.name,
      texture: skin.texture,
    };
  }
});

animations.forEach((anim) => {
  // Update texture in pet_skins
  if (gen_pet_skins[anim.id]) {
    gen_pet_skins[anim.id].texture = anim.texture;
  }

  // Update texture in item_skins
  if (gen_item_skins[anim.id]) {
    gen_item_skins[anim.id].texture = anim.texture;
  }

  // Push the item in animated_items (skins too!)
  if (!gen_animated_items[anim.id]) {
    gen_animated_items[anim.id] = {};
  }
  gen_animated_items[anim.id].texture = anim.texture;
});

export const pet_skins = gen_pet_skins;
export const item_skins = gen_item_skins;
export const animated_items = gen_animated_items;

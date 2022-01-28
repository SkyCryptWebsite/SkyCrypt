/*
  Animted skins created at ezgif.com/apng-maker with the following settings:
  - Skins that change based on time of day
      - Delay time: 500
      - Enable crossfade frames: delay = 3, count = 10 (but adjust these values based on final file size)
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
    animation is missing.
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

/*
..######..##....##.####.##....##..######.
.##....##.##...##...##..###...##.##....##
.##.......##..##....##..####..##.##......
..######..#####.....##..##.##.##..######.
.......##.##..##....##..##..####.......##
.##....##.##...##...##..##...###.##....##
..######..##....##.####.##....##..######.
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
    texture: "/head/896211dc599368dbd9056c0116ab61063991db793be93066a858eb4e9ce56438",
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
    texture: "/head/4bdf0f628c05e86cabdee2f5858dd5def7f8b8d940cbf25f9937e2ffb53432f4",
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
    texture: "/head/c3eb3e37e9873bfc176b9ed8ef4fbef833de144546bfaefdf24863c3eb87bb86",
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
    texture: "/head/2fc4a7542b754420b1b19f9a28ea00040555a9e876052b97f65840308a93348d",
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
  {
    id: "PET_SKIN_TIGER_SABER_TOOTH",
    name: "Saber-Tooth",
    texture: "/head/e92dba2fbd699d541b2fa0fbcaff640ad8c311987ade59a13b2a65d0ce319316",
    release: new Date("2021-09-28 18:00:00 GMT+1").getTime(),
  },
  {
    id: "REAPER_SPIRIT",
    name: "Spirit",
    texture: "/head/724d2072918054a95a4f4bbc931bf3929d01cb012368bc4c78d0a3acc9cdbeea",
    release: new Date("2020-09-19 18:00:00 GMT+1").getTime(),
  },
  {
    id: "SUPERIOR_SHIMMER",
    name: "Shimmer",
    texture: "/head/cb3deae44a93acf001ae6bef1e1f4d56e4b7eca4ba14699d071023a24eed2c2e",
    release: new Date("2020-11-27 18:00:00 GMT+1").getTime(),
  },
  {
    id: "UNSTABLE_SHIMMER",
    name: "Shimmer",
    texture: "/head/17397c1603be4bcf52eae0d2ad66e1663aad724a8f069ba87aa41aa8d2b48820",
    release: new Date("2020-07-21 18:00:00 GMT+1").getTime(),
  },
  {
    id: "YOUNG_SHIMMER",
    name: "Shimmer",
    texture: "/head/e1ad5d83e55890290f52e4ad06e4351a2e87998d1cb3e76cc952a076deb7882b",
    release: new Date("2020-07-21 18:00:00 GMT+1").getTime(),
  },
  {
    id: "WISE_SHIMMER",
    name: "Shimmer",
    texture: "/head/25d7c5909f742e2e85ba7f2c7449f9e12a5c42c5a1132974df7f4ef204d6ca1e",
    release: new Date("2020-07-21 18:00:00 GMT+1").getTime(),
  },
  {
    id: "STRONG_SHIMMER",
    name: "Shimmer",
    texture: "/head/ad3241f4419f06d17d88b21cc8e412f4ef11d7cfadd882e269da5a490e08f0e4",
    release: new Date("2020-07-21 18:00:00 GMT+1").getTime(),
  },
  {
    id: "PROTECTOR_SHIMMER",
    name: "Shimmer",
    texture: "/head/72cd120841228d2812ca07433a3ec4640de81fa1f4bb9b42269c741403196fdb",
    release: new Date("2020-07-21 18:00:00 GMT+1").getTime(),
  },
  {
    id: "OLD_SHIMMER",
    name: "Shimmer",
    texture: "/head/78bf606f5ace4e3cfb81a14742992ff5a868d1f0f9d14b4bec9393859e0e0a00",
    release: new Date("2020-07-21 18:00:00 GMT+1").getTime(),
  },
  {
    id: "HOLY_SHIMMER",
    name: "Shimmer",
    texture: "/head/c96696eb13cced8f5c521892d90fe8e2b129469520ade8d1d9f87225e7179761",
    release: new Date("2020-07-21 18:00:00 GMT+1").getTime(),
  },
  {
    id: "PET_SKIN_PARROT_GOLD_MACAW",
    name: "Gold Macaw",
    texture: "/head/5dad34650f8d1c6afbfd979b38d7e1412e636215b8f85240e06d998278879b8b",
    release: new Date("2021-10-20 18:00:00 GMT+1").getTime(),
  },
  {
    id: "PET_SKIN_BAT_VAMPIRE",
    name: "Vampire",
    texture: "/head/473af69ed9bf67e2f5403dd7d28bbe32034749bbfb635ac1789a412053cdcbf0",
    release: new Date("2021-10-31 18:00:00 GMT+1").getTime(),
  },
  {
    id: "PET_SKIN_PHOENIX_ICE",
    name: "Ice",
    texture: "/head/12582057e52d0f7fffd1a1f93acf196db5f09b76f1ba3ede28476cc4cd82da97",
    release: new Date("2021-11-25 18:00:00 GMT+1").getTime(),
  },
  {
    id: "PET_SKIN_OCELOT_SNOW_TIGER",
    name: "Snow Tiger",
    texture: "/head/496499b99c88314b1459fc5b515c477b069bf2229a2833abb2e1ff20b5f29457",
    release: new Date("2021-12-14 18:00:00 GMT+1").getTime(),
  },
  {
    id: "PET_SKIN_BLAZE_FROZEN",
    name: "Frozen",
    texture: "/head/9617a34c8ff467fdb45be3ff17863fcff7e8424c8dd9b99666edd13b44b32e8c",
    release: new Date("2021-12-24 18:00:00 GMT+1").getTime(),
  },
  {
    id: "PET_SKIN_DOLPHIN_SNUBNOSE_GREEN",
    name: "Green Snubfin",
    texture: "/head/5f2879bd8b0bafdd71dbd3fc5850afc6c53da60d4252182cfc80737a00d72408",
    release: new Date("2022-01-19 18:00:00 GMT+1").getTime(),
  },
  {
    id: "PET_SKIN_DOLPHIN_SNUBNOSE_RED",
    name: "Red Snubfin",
    texture: "/head/779df5b4da325c0d740251b4204a0cd22d9fdb88cecb6eff6176ef4f2ecedb1e",
    release: new Date("2022-01-19 18:00:00 GMT+1").getTime(),
  },
  {
    id: "PET_SKIN_DOLPHIN_SNUBNOSE_PURPLE",
    name: "Purple Snubfin",
    texture: "/head/fd0b213c15dd7b8c67512bc18bf14d32dc4b57b9c305d1c7514aa3e2609a78a4",
    release: new Date("2022-01-19 18:00:00 GMT+1").getTime(),
  },
  {
    id: "PET_SKIN_DOLPHIN_SNUBFIN",
    name: "Snubfin",
    texture: "/head/279413c788c7f450234bdab0cf0d0291c57f730e380c6d4c7746fde15928381",
    release: new Date("2022-01-19 18:00:00 GMT+1").getTime(),
  },
];

/*
....###....##....##.####.##.....##....###....########.####..#######..##....##..######.
...##.##...###...##..##..###...###...##.##......##.....##..##.....##.###...##.##....##
..##...##..####..##..##..####.####..##...##.....##.....##..##.....##.####..##.##......
.##.....##.##.##.##..##..##.###.##.##.....##....##.....##..##.....##.##.##.##..######.
.#########.##..####..##..##.....##.#########....##.....##..##.....##.##..####.......##
.##.....##.##...###..##..##.....##.##.....##....##.....##..##.....##.##...###.##....##
.##.....##.##....##.####.##.....##.##.....##....##....####..#######..##....##..######.
*/

const animations = [
  {
    id: "PET_SKIN_TIGER_TWILIGHT",
    texture: "/resources/img/items/pet_skin_tiger_twilight.png",
    animation: {
      day: "/head/896211dc599368dbd9056c0116ab61063991db793be93066a858eb4e9ce56438",
      night: "/head/25afc37dc1909ee0a3eb8d0404271fc47660cff1153495412d6e9896632eaa8e",
    },
  },
  {
    id: "PET_SKIN_ELEPHANT_MONOCHROME",
    texture: "/resources/img/items/pet_skin_elephant_monochrome.png",
    animation: {
      day: "/head/4bdf0f628c05e86cabdee2f5858dd5def7f8b8d940cbf25f9937e2ffb53432f4",
      night: "/head/176e8db6cd2db2fd11747c750d24040f3435b3301d91949f33f9615d16dab060",
    },
  },
  {
    id: "PET_SKIN_MONKEY_GORILLA",
    texture: "/resources/img/items/pet_skin_monkey_gorilla.png",
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
    texture: "/resources/img/items/pet_skin_endermite_radiant.png",
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
    texture: "/resources/img/items/pet_skin_squid_glow.png",
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
    texture: "/resources/img/items/snow_snowglobe.png",
    animation: {
      0: "/head/16d9b6791ffb7395fe5b44dd0b8f6b8d4c5bf3b90ddc92a10d3b8c83ec2efd20",
      60: "/head/13229f8525726684fb0227dad7621f05f0b8b5d58a8693fd0ea0688349f1d53c",
      310: "/head/962c440e980121d86cb46139fafda81e22f0ef0a2e176b9c483a73a6a6ad862c",
      570: "/head/4bb7f26f50d6424c7152d912e7bb4852e50825256f00027643e5250966c9aae9",
      820: "/head/e021d2664656b1422e1e672585039ddf349b60a96f7f2c5673e3fe9d3aa8f5ea",
      1070: "/head/4ed6e77773f2bce73fedb3595289371cfcc2da157e2a90732c6e072fc1374d9e",
      1320: "/head/b71c5c072025c253e9a8d523a9b1a515296af697ef3afd255f6ad8510a36ed41",
      1560: "/head/485fa2a1372e86bd48b9622cc1712c6a199f09d87ed83704718e91f63ae217f4",
      1820: "/head/2ec0015699f67147fbb2c4f2c87fed245b6b9e7e00fc0b7d3b7a124b599be0fd",
      2060: "/head/5fc97d7cd008257df603b1431629ec9fd3847b03d7d26a7b4adb8f71b4e8408c",
      2310: "/head/2fed033e4baa8254af8f7c5e87b47638038cc7830e44823c97956687f7ad8e9",
    },
  },
  {
    id: "REAPER_SPIRIT",
    texture: "/resources/img/items/reaper_spirit.png",
    animation: {
      day: "/head/724d2072918054a95a4f4bbc931bf3929d01cb012368bc4c78d0a3acc9cdbeea",
      night: "/head/c1d178e0da8a4ef28ade6b8f76b73611bf835e08fd8da9d0960d4b6dc18857f3",
    },
  },
  {
    id: "SUPERIOR_SHIMMER",
    texture: "/resources/img/items/superior_shimmer.png",
    animation: {
      0: "/head/cb3deae44a93acf001ae6bef1e1f4d56e4b7eca4ba14699d071023a24eed2c2e",
      1390: "/head/4dfbe709ad0b540768a271138ed6e3a0026f063302678dc97c5f0855c0a8e5b",
      1540: "/head/1fbec3d1d98f24ea216507b0bdbd11363f0751c91ce7d533ba46f99819d32bbf",
      1680: "/head/b83240d6638d777e81c4fcccf300f30db3a9c28010fb16c08cc050a7c842fba6",
      1850: "/head/495a0afab4cbc222c454566185020e349ca11d0d9019c367bbe58047431c5b",
      2000: "/head/1a91e2c50e8469882e1d5681b582111f15f1f9dfb544a7fef2b910aaaa9d910d",
      2140: "/head/b6f626a9bad16f9b388f00412456fb0eaadbea4181327d6abe7a8fedaafd634e",
      2290: "/head/15cec5963ad37f3427bb20391fe52af3a0fa91fba58cdee1f6a4c1819a25bfd2",
      2440: "/head/68dd1b3b61e4ef32d68c392ecc9cd3cdefd3c26e2ebcc5275813bf6864f9c413",
      2590: "/head/166e1e6249b4e41eb89dd895247cc7b4070352875cc45e5c13e16b42efa8084d",
    },
  },
  {
    id: "UNSTABLE_SHIMMER",
    texture: "/resources/img/items/unstable_shimmer.png",
    animation: {
      0: "/head/17397c1603be4bcf52eae0d2ad66e1663aad724a8f069ba87aa41aa8d2b48820",
      660: "/head/91baf345a30ed4066c3acc8c115b743628bf0f9a745dc7a3c7b276edbf7cf98e",
      830: "/head/35ee2404c0fc6fdc101b0e76e8072da7fcb88fffabbbe4586df2c5037904f8",
      950: "/head/af00ed6ece411141cda7f3e0bce92396245a06818122f19af489c502f493dbb5",
      1120: "/head/b43690995b0323064a6d1d58d2dfc38ca4c358056c83122d9bd4f641d1d6db46",
      1260: "/head/db3a9728cfceb107c41f12ca054ecc839f8aae0bec52a6c51b0adff15399a173",
      1430: "/head/baacb2fe057d7d925c1853fc23328c3d45ba25b139abdc6e4b37272e796ef622",
      1560: "/head/1c3a818eafd47598c5b37155e74c794e04b993d7380ebc230fccc140107d5d0c",
      1720: "/head/6f05a4e9c5b56927273990149bfa656c3f5a3c83fa698acbd66ddfcf9d030727",
      1860: "/head/a75adcc4baa8cb3639c95dcb889d8f15aca72d3f999731a055accd7d9a5a8102",
    },
  },
  {
    id: "YOUNG_SHIMMER",
    texture: "/resources/img/items/young_shimmer.png",
    animation: {
      0: "/head/e1ad5d83e55890290f52e4ad06e4351a2e87998d1cb3e76cc952a076deb7882b",
      1820: "/head/294d6721f2017255771e9de26ffe696175b336eff71c277fdc1210bb507fadd1",
      1930: "/head/a737e50acdeee12d13b927b4a40b89ce939e3c5ad3863ac6bb4d5c14592386e4",
      2120: "/head/2cc475f887ff3cdc65f27be8f40f712deb618f232182dc516b0ee9de831fc1a9",
      2240: "/head/4e2dae1b889e8cbc5d953c6e2408136ac5088c671314ea38b2ceed09a608275e",
      2380: "/head/84075dbad5c693b6157a370790f725da10b8390970e503ef5a529277193aac97",
      2540: "/head/992146376c63ebd0a5aa9239af74a11610dd13c869a0106c5f6dd08c48b028c3",
      2730: "/head/5ce158fc4e502309a87bed14feb15a8f98f676fae7f3fa26e2a60e6bdd0a632e",
      2870: "/head/df365cd3a83fe8730256df57ed6902f91954ba8760a6bc7fb69672473bcfe85d",
      2990: "/head/422a3eabc82b5089bd2db80872de155f1d5203484b00a86227c81100b1e44fc1",
    },
  },
  {
    id: "WISE_SHIMMER",
    texture: "/resources/img/items/wise_shimmer.png",
    animation: {
      0: "/head/25d7c5909f742e2e85ba7f2c7449f9e12a5c42c5a1132974df7f4ef204d6ca1e",
      1770: "/head/548115e4f39f8ba74ae4d0e136a6509e03fab0f4f5a4d106c9d9882b0cc95f8c",
      1920: "/head/28a26bfd54037051bd9b993d157771b21e8910108b22a6e0ee85a5f3591a76d2",
      2080: "/head/1dd7deef500d605f15496cb9c33a5199d70285f9ffb076cbb1e33db1de68256e",
      2210: "/head/11e0dafa1c973649d16cf9371978cd398d48e63e3fe6f7e2fcc68d8b1d0d7a63",
      2390: "/head/d8aaf3a94345271221839cae64ea0e46d7194bdccd9188b473a88792df45f203",
      2530: "/head/15c88cc6c75a1058bff9c8e11bd6c2c3aee1d56dbb414da4659fec2ad38b9507",
      2680: "/head/67d4d373b8949d1288156102473bc3f3fa07d04950a2a3d41fe7d1885fc08c22",
      2820: "/head/98d38b09739cb2c34c585d2559f0adb45dfbcdc24695b517a5469beee883ac34",
      2970: "/head/b45eea4959e43a89d844766be5031d2e6d99101715d7e23fcede2083675afb68",
    },
  },
  {
    id: "STRONG_SHIMMER",
    texture: "/resources/img/items/strong_shimmer.png",
    animation: {
      0: "/head/ad3241f4419f06d17d88b21cc8e412f4ef11d7cfadd882e269da5a490e08f0e4",
      2000: "/head/427f5fdaff5e1e853e29bcdbd02dccc02529b7b6b8956c5a77e691edd8a14e32",
      2150: "/head/b6150c9ceecd48e5eeed2fc332af09e1013ce3281e46d25ce1418bf6e6ff8f77",
      2320: "/head/e156d89aa752848f2bf4c6ac6ba1b145ae8be5bacc2f049ccb19ff9cd6f7806c",
      2460: "/head/777db55f07b1a59b90235c82c0a9b9c80003bfcaaa75f3d662b00e85c9ffe1a",
      2610: "/head/5a6574f9192970ad6d58efe6c01f6fd5a0f2608a09f9f88be1ad2facaef20dce",
      2750: "/head/93ce091eef8be41cb2355a3079c1669e0e5965bfa00bf69649e70abe477cc5fe",
      2920: "/head/cb394649f001d418d341829bbb7282b5f19963bd5b78ec27bcb448c867f3ed82",
      3070: "/head/a8a6658e583e348e86e3a6560e95c01e97f2681ca1565b7614b3dabdf14d3638",
      3230: "/head/6a251637c534fcaa14fb9e9c6a06e01b70a44c9cd52b5216191189af45861388",
    },
  },
  {
    id: "PROTECTOR_SHIMMER",
    texture: "/resources/img/items/protector_shimmer.png",
    animation: {
      0: "/head/72cd120841228d2812ca07433a3ec4640de81fa1f4bb9b42269c741403196fdb",
      2010: "/head/6c7eb2926df159c5e4220263b340348ce4a20f307759f35e416f275b577712af",
      2160: "/head/ce3259aeb7440e85d426470c4719e52322628621f9238f38065b81c9f01c46fc",
      2310: "/head/9b9a22613019de020b08b07d7dd5b092f61ae9d15b90844c85f509bf38c02714",
      2460: "/head/3c5069b2db9813905b96037830cac5405c69baf9cd5479a5ed7f2e010706645d",
      2600: "/head/d37daa0bbb044cd4885ce74cb39bc1f3f2c16773129c31efd9cc9e602868027b",
      2750: "/head/9f2a18972804fd958d1e58fc77ab1857aef7b0452ec0caf116c764ad6e7ad1b",
      2890: "/head/54f460eb414c810ff0ef821c838833862065e1ea1e23bddeae93f269fe3d2bca",
      3050: "/head/238955b9636407eb7fc812f4ef6b2f9339ffe50b1352f1987bc3e31ff494c4cc",
      3200: "/head/20c584baef019b24ab30dffd3ee13dbafaa97ea667af94b95ceb97f5d5ec190e",
    },
  },
  {
    id: "OLD_SHIMMER",
    texture: "/resources/img/items/old_shimmer.png",
    animation: {
      0: "/head/78bf606f5ace4e3cfb81a14742992ff5a868d1f0f9d14b4bec9393859e0e0a00",
      2140: "/head/90cb01939b8a94572bff0d17dd827e18c399dedae63dca7bdc7b1cc066cbf49",
      2300: "/head/9f6589f30c89e363f50deb9bd1d07d0cb357d1a0a453f65df2c5ac9682ef8daf",
      2450: "/head/ce6b668cb2554cea0d6b80fd73e4435f34ae90ad8e6f7332035d3c4392654b55",
      2610: "/head/b697f558314159646315e81985d0c5634dcb6c81940674cae0555028fb1fee5c",
      2750: "/head/e2e5aecb1a5c484145723f48a286193e3b8445b3d45ebef15a9a2ccfd9cf2089",
      2880: "/head/bf5ae5fddd30b8e0385f459b4a0117e19f7a0431748eaad7606ea4120fb533a7",
      3050: "/head/8d81fe4729d9e4bf6d6bb9680c3f6b4d3c0f939b0540b596aabafab261205737",
      3190: "/head/1b29950bb5a21cdcf4d25f54e43937858fe6be1b88d881bb4ac35fec880d6900",
    },
  },
  {
    id: "HOLY_SHIMMER",
    texture: "/resources/img/items/holy_shimmer.png",
    animation: {
      0: "/head/c96696eb13cced8f5c521892d90fe8e2b129469520ade8d1d9f87225e7179761",
      2000: "/head/7aadd6f365cfed2d311ad3e3d237a53cbbbabe38436447c8cbe5f835d031c7a5",
      2150: "/head/53a005e06482753d599b292ab6a03ee935f620d081dfef6d987e43635934a42b",
      2290: "/head/e157c0679c8e1a9f96ef3bb661a2aa62b8547a3011e207066bccfc4d0faa72c6",
      2450: "/head/68bfd7f1015a02edc11694d6432ac7f02cd4e8e394695403fd248572560184b1",
      2600: "/head/5fbaaed1e0b5909490631c3821f0e3846f2dc856ed24b5cc0a2c0f708cb32216",
      2750: "/head/8df802e5bc3b2b961c1c309d1767a283ce5a74c322eb7b57de826844fdcc2f5a",
      2900: "/head/c933a2a52fb0dd8429c3bb13336ae6e4ba2da28c594b3a3299527a2e1b158f97",
      3060: "/head/4e5ebceed5165cc33301e769e12603cd5de352e90c2c3ce2403c1e0fc889d123",
      3190: "/head/923fc9abad079f4382ecd48a7b7428c19082e0f5e2afb8d71c4599627dff25fd",
    },
  },
  {
    id: "FAIRY_HELMET",
    texture: "/resources/img/items/fairy_helmet.png",
    animation: null,
  },
  {
    id: "FAIRY_CHESTPLATE",
    texture: "/resources/img/items/fairy_chestplate.png",
    animation: null,
  },
  {
    id: "FAIRY_LEGGINGS",
    texture: "/resources/img/items/fairy_leggings.png",
    animation: null,
  },
  {
    id: "FAIRY_BOOTS",
    texture: "/resources/img/items/fairy_boots.png",
    animation: null,
  },
  {
    id: "PET_SKIN_BAT_VAMPIRE",
    texture: "/resources/img/items/pet_skin_bat_vampire.png",
    animation: {
      0: "/head/473af69ed9bf67e2f5403dd7d28bbe32034749bbfb635ac1789a412053cdcbf0",
      200: "/head/9fe39e362f74f05186818eb9f69fce89325c70f55d1b85214155fbc82bd67863",
      270: "/head/af254f20be3680f2b042a4289ae63089e08ae26e137f74dc5318cc57a67a42df",
      370: "/head/a349d2ea1872ed47a387c89894e0265187a00219ee4da63b75b907016d3cd6aa",
      480: "/head/434d14248f21329e090fa46b1914a762415d4c0739c4cebc660b9fce305961c3",
      600: "/head/46574a3327abba60da5ccae9ccb8f30788a6a243bce7150c9c7dab8c15d76e53",
      660: "/head/453a525e531c5d24fbee6cc83c6767a6de4882df6c099bbe8513e7dbe35abad0",
      780: "/head/f14d63fbe721f986971136b0f812a99f9a7d6689179365b4499f6fa2c45ece3",
      900: "/head/d20db6a87d2eb5ace95807b66a3af0e9853c70ed8b51a2c036958c01e83c5d01",
      990: "/head/7fc09aaa2987ac6875307d5730352d6e222034c6104287fe41eeea04ac44e0cb",
      1170: "/head/d20db6a87d2eb5ace95807b66a3af0e9853c70ed8b51a2c036958c01e83c5d01",
      1280: "/head/f14d63fbe721f986971136b0f812a99f9a7d6689179365b4499f6fa2c45ece3",
      1390: "/head/453a525e531c5d24fbee6cc83c6767a6de4882df6c099bbe8513e7dbe35abad0",
      1460: "/head/46574a3327abba60da5ccae9ccb8f30788a6a243bce7150c9c7dab8c15d76e53",
      1570: "/head/434d14248f21329e090fa46b1914a762415d4c0739c4cebc660b9fce305961c3",
      1680: "/head/a349d2ea1872ed47a387c89894e0265187a00219ee4da63b75b907016d3cd6aa",
      1790: "/head/af254f20be3680f2b042a4289ae63089e08ae26e137f74dc5318cc57a67a42df",
      1870: "/head/9fe39e362f74f05186818eb9f69fce89325c70f55d1b85214155fbc82bd67863",
    },
  },
  {
    id: "PET_SKIN_BLAZE_FROZEN",
    texture: "/resources/img/items/pet_skin_blaze_frozen.png",
    animation: {
      0: "/head/47b78c3ff3e695dd5b2606fe266e19e628299815548dd2eb72ea864b7b8dfb18",
      230: "/head/6ba8927cac02e5e49142c141790ee695e7f5b2e3e44c528aa23db0c138b8996b",
      340: "/head/ad8dd3d82074f8ee731ed28b5cb4c53416ee9977ac965e53916070f0d07b3980",
      410: "/head/314d2152f639dff120b1246a67970f9e688606017e354db15638a900616ef795",
      510: "/head/486a3c5719d0b46d2f20d510d4acedefd994163c2800c702da01181e9c91c57e",
      640: "/head/4b0c880ffc254cb2fb44039125e49c67ff3116e5514bd8ffe42a24c98982bae8",
    },
  },
  {
    id: "PET_SKIN_DOLPHIN_SNUBFIN",
    texture: "/resources/img/items/pet_skin_dolphin_snubfin.png",
    animation: {
      0: "/head/e7df31c808b3e0e8907943e4cadf37f6bfd0af177913ba81d96115c6139d98b9",
      90: "/head/60098af339abd2fdd2b0046c6a5ca5ae351e429d0198e9711da42f78780bb5db",
      220: "/head/39f759bda7792e9810c4524d6d3f4463cd306c32a61f27077b58396dea89d551",
      380: "/head/78ebcc36ec0984c48721eaf8a662b94c4702823432e478046c65f641030b5b13",
      530: "/head/229bde70c7ab11489220ae2e15f0c68caba0b8ceeb726fc1bce518d37a900632",
      670: "/head/70271de0b78de131253e5723df01e3f3a89204658c5a1a77ded86e9d4d48337",
      820: "/head/a5ccc6f0a9b69bd1583f030400dc2d2997e9a1731b5f961c0eab2df9d653a583",
      1000: "/head/81ecf02070175e5704d7d82e727f552796343bcb2e75855e78c58a6161223ca0",
      1280: "/head/cd5cad5afe1ba4b7a4e303dce968c97ae06988702ed5dbd553035d936abd5159",
      1420: "/head/279413c788c7f450234bdab0cf0d0291c57f730e380c6d4c7746fde15928381",
    },
  },
];

/*
..######...########.##....##....########.##.....##.########...#######..########..########..######.
.##....##..##.......###...##....##........##...##..##.....##.##.....##.##.....##....##....##....##
.##........##.......####..##....##.........##.##...##.....##.##.....##.##.....##....##....##......
.##...####.######...##.##.##....######......###....########..##.....##.########.....##.....######.
.##....##..##.......##..####....##.........##.##...##........##.....##.##...##......##..........##
.##....##..##.......##...###....##........##...##..##........##.....##.##....##.....##....##....##
..######...########.##....##....########.##.....##.##.........#######..##.....##....##.....######.
*/

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

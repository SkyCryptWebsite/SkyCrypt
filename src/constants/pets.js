const symbols = {
	health: "❤",
	defense: "❈",
	strength: "❁",
	crit_chance: "☣",
	crit_damage: "☠",
	intelligence: "✎",
	speed: "✦",
	sea_creature_chance: "α",
	magic_find: "✯",
	pet_luck: "♣",
	attack_speed: "⚔️",
	true_defense: "❂",
	ferocity: "⫽",
}

module.exports = {
    pet_rarity_offset: {
        common: 0,
        uncommon: 6,
        rare: 11,
        epic: 16,
        legendary: 20,
        mythic: 20
    },

    pet_levels: [
        100,
        110,
        120,
        130,
        145,
        160,
        175,
        190,
        210,
        230,
        250,
        275,
        300,
        330,
        360,
        400,
        440,
        490,
        540,
        600,
        660,
        730,
        800,
        880,
        960,
        1050,
        1150,
        1260,
        1380,
        1510,
        1650,
        1800,
        1960,
        2130,
        2310,
        2500,
        2700,
        2920,
        3160,
        3420,
        3700,
        4000,
        4350,
        4750,
        5200,
        5700,
        6300,
        7000,
        7800,
        8700,
        9700,
        10800,
        12000,
        13300,
        14700,
        16200,
        17800,
        19500,
        21300,
        23200,
        25200,
        27400,
        29800,
        32400,
        35200,
        38200,
        41400,
        44800,
        48400,
        52200,
        56200,
        60400,
        64800,
        69400,
        74200,
        79200,
        84700,
        90700,
        97200,
        104200,
        111700,
        119700,
        128200,
        137200,
        146700,
        156700,
        167700,
        179700,
        192700,
        206700,
        221700,
        237700,
        254700,
        272700,
        291700,
        311700,
        333700,
        357700,
        383700,
        411700,
        441700,
        476700,
        516700,
        561700,
        611700,
        666700,
        726700,
        791700,
        861700,
        936700,
        1016700,
        1101700,
        1191700,
        1286700,
        1386700,
        1496700,
        1616700,
        1746700,
        1886700
    ],

    pet_data: {
        "BAT": {
            head: "/head/382fc3f71b41769376a9e92fe3adbaac3772b999b219c9d6b4680ba9983e527",
            type: "mining",
            emoji: "🦇"
        },
        "BLAZE": {
            head: "/head/b78ef2e4cf2c41a2d14bfde9caff10219f5b1bf5b35a49eb51c6467882cb5f0",
            type: "combat",
            emoji: "🔥"
        },
        "CHICKEN": {
            head: "/head/7f37d524c3eed171ce149887ea1dee4ed399904727d521865688ece3bac75e",
            type: "farming",
            emoji: "🐔"
        },
        "HORSE": {
            head: "/head/36fcd3ec3bc84bafb4123ea479471f9d2f42d8fb9c5f11cf5f4e0d93226",
            type: "combat",
            emoji: "🐴"
        },
        "JERRY": {
            head: "/head/822d8e751c8f2fd4c8942c44bdb2f5ca4d8ae8e575ed3eb34c18a86e93b",
            type: "combat",
            emoji: "🧑"
        },
        "OCELOT": {
            head: "/head/5657cd5c2989ff97570fec4ddcdc6926a68a3393250c1be1f0b114a1db1",
            type: "foraging",
            emoji: "🐈"
        },
        "PIGMAN": {
            head: "/head/63d9cb6513f2072e5d4e426d70a5557bc398554c880d4e7b7ec8ef4945eb02f2",
            type: "combat",
            emoji: "🐷"
        },
        "RABBIT": {
            head: "/head/117bffc1972acd7f3b4a8f43b5b6c7534695b8fd62677e0306b2831574b",
            type: "farming",
            emoji: "🐇"
        },
        "SHEEP": {
            head: "/head/64e22a46047d272e89a1cfa13e9734b7e12827e235c2012c1a95962874da0",
            type: "alchemy",
            emoji: "🐑"
        },
        "SILVERFISH": {
            head: "/head/da91dab8391af5fda54acd2c0b18fbd819b865e1a8f1d623813fa761e924540",
            type: "mining",
            emoji: "🐛"
        },
        "WITHER_SKELETON": {
            head: "/head/f5ec964645a8efac76be2f160d7c9956362f32b6517390c59c3085034f050cff",
            type: "mining",
            emoji: "💀"
        },
        "SKELETON_HORSE": {
            head: "/head/47effce35132c86ff72bcae77dfbb1d22587e94df3cbc2570ed17cf8973a",
            type: "combat",
            emoji: "🐴"
        },
        "WOLF": {
            head: "/head/dc3dd984bb659849bd52994046964c22725f717e986b12d548fd169367d494",
            type: "combat",
            emoji: "🐺"
        },
        "ENDERMAN": {
            head: "/head/6eab75eaa5c9f2c43a0d23cfdce35f4df632e9815001850377385f7b2f039ce1",
            type: "combat",
            emoji: "🔮"
        },
        "PHOENIX": {
            head: "/head/23aaf7b1a778949696cb99d4f04ad1aa518ceee256c72e5ed65bfa5c2d88d9e",
            type: "combat",
            emoji: "🐦"
        },
        "MAGMA_CUBE": {
            head: "/head/38957d5023c937c4c41aa2412d43410bda23cf79a9f6ab36b76fef2d7c429",
            type: "combat",
            emoji: "🌋"
        },
        "FLYING_FISH": {
            head: "/head/40cd71fbbbbb66c7baf7881f415c64fa84f6504958a57ccdb8589252647ea",
            type: "fishing",
            emoji: "🐟"
        },
        "BLUE_WHALE": {
            head: "/head/dab779bbccc849f88273d844e8ca2f3a67a1699cb216c0a11b44326ce2cc20",
            type: "fishing",
            emoji: "🐋"
        },
        "TIGER": {
            head: "/head/fc42638744922b5fcf62cd9bf27eeab91b2e72d6c70e86cc5aa3883993e9d84",
            type: "combat",
            emoji: "🐯"
        },
        "LION": {
            head: "/head/38ff473bd52b4db2c06f1ac87fe1367bce7574fac330ffac7956229f82efba1",
            type: "foraging",
            emoji: "🦁"
        },
        "PARROT": {
            head: "/head/5df4b3401a4d06ad66ac8b5c4d189618ae617f9c143071c8ac39a563cf4e4208",
            type: "alchemy",
            emoji: "🦜"
        },
        "SNOWMAN": {
            head: "/head/11136616d8c4a87a54ce78a97b551610c2b2c8f6d410bc38b858f974b113b208",
            type: "combat",
            emoji: "⛄"
        },
        "TURTLE": {
            head: "/head/212b58c841b394863dbcc54de1c2ad2648af8f03e648988c1f9cef0bc20ee23c",
            type: "combat",
            emoji: "🐢"
        },
        "BEE": {
            head: "/head/7e941987e825a24ea7baafab9819344b6c247c75c54a691987cd296bc163c263",
            type: "farming",
            emoji: "🐝"
        },
        "ENDER_DRAGON": {
            head: "/head/aec3ff563290b13ff3bcc36898af7eaa988b6cc18dc254147f58374afe9b21b9",
            type: "combat",
            emoji: "🐲"
        },
        "GUARDIAN": {
            head: "/head/221025434045bda7025b3e514b316a4b770c6faa4ba9adb4be3809526db77f9d",
            type: "enchanting",
            emoji: "🐡"
        },
        "SQUID": {
            head: "/head/01433be242366af126da434b8735df1eb5b3cb2cede39145974e9c483607bac",
            type: "fishing",
            emoji: "🦑"
        },
        "GIRAFFE": {
            head: "/head/176b4e390f2ecdb8a78dc611789ca0af1e7e09229319c3a7aa8209b63b9",
            type: "foraging",
            emoji: "🦒"
        },
        "ELEPHANT": {
            head: "/head/7071a76f669db5ed6d32b48bb2dba55d5317d7f45225cb3267ec435cfa514",
            type: "farming",
            emoji: "🐘"
        },
        "MONKEY": {
            head: "/head/13cf8db84807c471d7c6922302261ac1b5a179f96d1191156ecf3e1b1d3ca",
            type: "foraging",
            emoji: "🐒"
        },
        "SPIDER": {
            head: "/head/cd541541daaff50896cd258bdbdd4cf80c3ba816735726078bfe393927e57f1",
            type: "combat",
            emoji: "🕷️"
        },
        "ENDERMITE": {
            head: "/head/5a1a0831aa03afb4212adcbb24e5dfaa7f476a1173fce259ef75a85855",
            type: "mining",
            emoji: "🐛"
        },
        "GHOUL": {
            head: "/head/87934565bf522f6f4726cdfe127137be11d37c310db34d8c70253392b5ff5b",
            type: "combat",
            emoji: "🧟"
        },
        "JELLYFISH": {
            head: "/head/913f086ccb56323f238ba3489ff2a1a34c0fdceeafc483acff0e5488cfd6c2f1",
            type: "alchemy",
            emoji: "🎐"
        },
        "PIG": {
            head: "/head/621668ef7cb79dd9c22ce3d1f3f4cb6e2559893b6df4a469514e667c16aa4",
            type: "farming",
            emoji: "🐷"
        },
        "ROCK": {
            head: "/head/cb2b5d48e57577563aca31735519cb622219bc058b1f34648b67b8e71bc0fa",
            type: "mining",
            emoji: "🗿"
        },
        "SKELETON": {
            head: "/head/fca445749251bdd898fb83f667844e38a1dff79a1529f79a42447a0599310ea4",
            type: "combat",
            emoji: "💀"
        },
        "ZOMBIE": {
            head: "/head/56fc854bb84cf4b7697297973e02b79bc10698460b51a639c60e5e417734e11",
            type: "combat",
            emoji: "🧟"
        },
        "DOLPHIN": {
            head: "/head/cefe7d803a45aa2af1993df2544a28df849a762663719bfefc58bf389ab7f5",
            type: "fishing",
            emoji: "🐬"
        },
        "BABY_YETI": {
            head: "/head/ab126814fc3fa846dad934c349628a7a1de5b415021a03ef4211d62514d5",
            type: "fishing",
            emoji: "❄️"
        },
        "MEGALODON": {
            head: "/head/a94ae433b301c7fb7c68cba625b0bd36b0b14190f20e34a7c8ee0d9de06d53b9",
            type: "fishing",
            emoji: "🦈"
        },
        "GOLEM": {
            head: "/head/89091d79ea0f59ef7ef94d7bba6e5f17f2f7d4572c44f90f76c4819a714",
            type: "combat",
            emoji: "🗿"
        },
        "HOUND": {
            head: "/head/b7c8bef6beb77e29af8627ecdc38d86aa2fea7ccd163dc73c00f9f258f9a1457",
            type: "combat",
            emoji: "👹"
        },
        "TARANTULA": {
            head: "/head/8300986ed0a04ea79904f6ae53f49ed3a0ff5b1df62bba622ecbd3777f156df8",
            type: "combat",
            emoji: "🕸️"
        },
        "BLACK_CAT": {
            head: "/head/e4b45cbaa19fe3d68c856cd3846c03b5f59de81a480eec921ab4fa3cd81317",
            type: "combat",
            emoji: "🐱"
        },
        "SPIRIT": {
            head: "/head/8d9ccc670677d0cebaad4058d6aaf9acfab09abea5d86379a059902f2fe22655",
            type: "combat",
            emoji: "👻"
        },
        "GRIFFIN": {
            head: "/head/4c27e3cb52a64968e60c861ef1ab84e0a0cb5f07be103ac78da67761731f00c8",
            type: "combat",
            emoji: "🦅"
        },
        "MITHRIL_GOLEM": {
            head: "/head/c1b2dfe8ed5dffc5b1687bc1c249c39de2d8a6c3d90305c95f6d1a1a330a0b1",
            type: "mining",
            emoji: "🗿"
        },
        "GRANDMA_WOLF": {
            head: "/head/4e794274c1bb197ad306540286a7aa952974f5661bccf2b725424f6ed79c7884",
            type: "combat",
            emoji: "👵"
        },
        "RAT": {
            head: "/head/a8abb471db0ab78703011979dc8b40798a941f3a4dec3ec61cbeec2af8cffe8",
            type: "combat",
            emoji: "🐀"
        }
    },

    /*
        Animted skins created at ezgif.com/apng-maker with the following settings:
        - Delay time: 500
        - Enable crossfade frames: delay = 3, count = 10
    */
    pet_skins: {
        "ENDERMAN": {
            "ENDERMAN": {
                name: "Spooky",
                head: "/head/ea84cc8818c293484fdaafc8fa2f0bf39e55733a247d68023df2c6c6b9b671d0",
                release: 1560284720000,
            },
        },
        "GUARDIAN": {
            "GUARDIAN": {
                name: "Watcher",
                head: "/head/37cc76e7af29f5f3fbfd6ece794160811eff96f753459fa61d7ad176a064e3c5",
                release: 1560284720000,
            },
        },
        "TIGER": {
            "TIGER_TWILIGHT": {
                name: "Twilight",
                head: "/resources/img/items/tiger_twilight.png",
                release: 1560284720000,
                animation: {
                    day: "/head/896211dc599368dbd9056c0116ab61063991db793be93066a858eb4e9ce56438",
                    night: "/head/25afc37dc1909ee0a3eb8d0404271fc47660cff1153495412d6e9896632eaa8e",
                }
            },
        },
        "RABBIT": {
            "RABBIT": {
                name: "Pretty",
                head: "/head/a34631d940fddb689ddef6a3b352c50220c460dba05cd18dc83192b59dc647f8",
                release: 1560284720000,
            },
            "RABBIT_AQUAMARINE": {
                name: "Aquamarine",
                head: "/head/35a2119d122961852c010c1007ab2aff95b4bbeb74407463f6d2e1ff0792c812",
                release: new Date('2021-04-15 18:00:00 GMT+1').getTime(),
            },
            "RABBIT_ROSE": {
                name: "Rose",
                head: "/head/d7cddf5b20cb50d6600e5333c6bb3fb15b4741f17e3675fc2bfc09c2cd09e619",
                release: new Date('2021-04-15 18:00:00 GMT+1').getTime(),
            },
        },
        "WITHER_SKELETON": {
            "WITHER": {
                name: "Dark",
                head: "/head/224c2d14a0219af5ccfcaa36e8a333e271724ed61276611f9529e16c10273a0d",
                release: 1560284720000,
            },
        },
        "ROCK": {
            "ROCK_COOL": {
                name: "Cool",
                head: "/head/fefcdbb7d95502acc1ae35a32a40ce4dec8f4c9f0da26c9d9fe7c2c3eb748f6",
                release: 1560284720000,
            },
            "ROCK_SMILE": {
                name: "Smile",
                head: "/head/713c8b2916a275db4c1762cf5f13d7b95b91d60baf5164a447d6efa7704cf11b",
                release: 1560284720000,
            },
            "ROCK_THINKING": {
                name: "Thinking",
                head: "/head/dd2f781f03c365bbc5dd1e7186ab38dc69465e836c9fe066a9a844f34a4da92",
                release: 1560284720000,
            },
            "ROCK_LAUGH": {
                name: "Laughing",
                head: "/head/8cc1ef513d5f616675242174acde7b9d6259a47c4fe8f6e4b6e20920319d7073",
                release: 1560284720000,
            },
            "ROCK_DERP": {
                name: "Derp",
                head: "/head/c4f89fbd12c209f7f26c1f34a1bd7f47635814759c09688dd212b205c73a8c02",
                release: 1560284720000,
            },
            "ROCK_EMBARRASSED": {
                name: "Embarrassed",
                head: "/head/27ff34992e66599e8529008be3fb577cb0ab545294253e25a0cc988e416c849",
                release: 1560284720000,
            },
        },
        "SHEEP": {
            "SHEEP_WHITE": {
                name: "White",
                head: "/head/b92a1a5c325f25f7438a0abb4f86ba6cf75552d02c7349a7292981459b31d2f7",
                release: 1560284720000,
            },
            "SHEEP_PURPLE": {
                name: "Purple",
                head: "/head/99a88cf7dd33063587c6b540e6130abc5d07f1a65c47573ab3c1ad3ccec8857f",
                release: 1560284720000,
            },
            "SHEEP_BLACK": {
                name: "Black",
                head: "/head/aa9dcda642a807cd2daa4aa6be87cef96e08a8c8f5cec2657dda4266c6a884c2",
                release: 1560284720000,
            },
            "SHEEP_PINK": {
                name: "Pink",
                head: "/head/afa7747684dcb96192d90342cea62742ec363da07cb5e6e25eecec888cd2076",
                release: 1560284720000,
            },
            "SHEEP_LIGHT_BLUE": {
                name: "Light Blue",
                head: "/head/722220de1a863bc5d9b9e7a6a3b03214c9f3d698ed3fe0d28220f3b93b7685c5",
                release: 1560284720000,
            },
            "SHEEP_LIGHT_GREEN": {
                name: "Light Green",
                head: "/head/cf183ec2fe58faa43e568419b7a0dc446ece4ea0be52ec784c94e1d74b75939d",
                release: 1560284720000,
            },
            "SHEEP_NEON_YELLOW": {
                name: "Neon Yellow",
                head: "/head/94263428c23da9165b2639a8f2428ff4835227945c9e1038461cf644d67cc82a",
                release: 1560284720000,
            },
            "SHEEP_NEON_RED": {
                name: "Neon Red",
                head: "/head/4918be142a20b2b39bc582f421f6ae87b3184b5c9523d16fbe6d69530107886a",
                release: 1560284720000,
            },
            "SHEEP_NEON_BLUE": {
                name: "Neon Blue",
                head: "/head/e55b3fe9311c99342ea565483cbf9e969a258faf7afa30270fb9a0929377acfd",
                release: 1560284720000,
            },
            "SHEEP_NEON_GREEN": {
                name: "Neon Green",
                head: "/head/2c14d66911554bd0882339074bf6b8110c2d3509b69e7a6144e4d5a7164bacc8",
                release: 1560284720000,
            },
        },
        "SILVERFISH": {
            "SILVERFISH": {
                name: "Fortified",
                head: "/head/d8552ff591042c4a38f8ba0626784ae28c4545a97d423fd9037c341035593273",
                release: 1560284720000,
            },
            "SILVERFISH_FOSSILIZED": {
                name: "Fossilized",
                head: "/head/ca3a363368ed1e06cee3900717f062e02ec39aee1747675392255b48f7f83600",
                release: 1611334800000,
            },
        },
        "ELEPHANT": {
            "ELEPHANT_PINK": {
                name: "Pink",
                head: "/head/570eef474ec0e56cc34c2307eaa39f024612f8cd7248e7d5b14169ebd307c742",
                release: 1560284720000,
            },
            "ELEPHANT_BLUE": {
                name: "Blue",
                head: "/head/4b62969c005815d0409136380febc5ac468aaba9bda4db80954fa5426ee0a323",
                release: 1560284720000,
            },
            "ELEPHANT_ORANGE": {
                name: "Orange",
                head: "/head/554a34a80c474206d3700b8fced6b44fab0b0ed0b05c1293ff0c5d86eda251d1",
                release: 1560284720000,
            },
            "ELEPHANT_RED": {
                name: "Red",
                head: "/head/ba5c66ec66cb6b4b5550085f583b4e5c1cee5247bec5fbcc5c318c30c66cab42",
                release: new Date('2021-02-13 18:00:00 GMT+1').getTime(),
            },
            "ELEPHANT_PURPLE": {
                name: "Purple",
                head: "/head/5ff9df290b6c5a4984fc6e516605f9816b9882f7bf04db08d3f7ee32d1969a44",
                release: new Date('2021-02-13 18:00:00 GMT+1').getTime(),
            },
            "ELEPHANT_GREEN": {
                name: "Green",
                head: "/head/360c122ade5b2fedca14aa78c834a7b0ac9cb5da2a0c93112163086f90c13b68",
                release: new Date('2021-02-13 18:00:00 GMT+1').getTime(),
            },
            "ELEPHANT_MONOCHROME": {
                name: "Monochrome",
                head: "/resources/img/items/elephant_monochrome.png",
                release: new Date('2021-03-22 18:00:00 GMT+1').getTime(),
                animation: {
                    day: "/head/4bdf0f628c05e86cabdee2f5858dd5def7f8b8d940cbf25f9937e2ffb53432f4",
                    night: "/head/176e8db6cd2db2fd11747c750d24040f3435b3301d91949f33f9615d16dab060",
                }
            },
        },
        "JERRY": {
            "JERRY_RED_ELF": {
                name: "Red Elf",
                head: "/head/1d82f9c36e824c1e37963a849bf5abd76d3b349125023504af58369086089ee9",
                release: 1560284720000,
            },
            "JERRY_GREEN_ELF": {
                name: "Green Elf",
                head: "/head/4ec5455f43426ca1874b5c7b4a492ec3722a502f8b9599e758e133fed8b3c1e4",
                release: 1560284720000,
            },
        },
        "BABY_YETI": {
            "YETI_GROWN_UP": {
                name: "Grown-up",
                head: "/head/f5f29a975529276d916fc67998833c11ee178ff21e5941afdfb0fa7010f8374e",
                release: 1560284720000,
            },
        },
        "MONKEY": {
            "MONKEY_GOLDEN": {
                name: "Golden",
                head: "/head/e9281c4d87d68526b0749d4361e6ef786c8a35717aa053da704b1d53410d37a6",
                release: 1610557200000,
            },
        },
        "SKELETON_HORSE": {
            "HORSE_ZOMBIE": {
                name: "Zombie",
                head: "/head/578211e1b4d99d1c7bfda4838e48fc884c3eae376f58d932bc2f78b0a919f8e7",
                release: 1611939600000,
            },
        },
        "ENDER_DRAGON": {
            "DRAGON_NEON_BLUE": {
                name: "Neon Blue",
                head: "/head/96a4b9fbcf8c3e7e1232e57d6a2870ba3ea30f76407ae1197fd52e9f76ca46ac",
                release: 1612803600000,
            },
            "DRAGON_NEON_PURPLE": {
                name: "Neon Purple",
                head: "/head/54bdf5ba6289b29e27c57db1ec7f76151c39492d409268e00a9838e8c963159",
                release: 1612803600000,
            },
            "DRAGON_NEON_RED": {
                name: "Neon Red",
                head: "/head/e05c9b4f4218677c5b4bcc9c7d9e29e18d1684a536781fede1280fc5e6961538",
                release: 1612803600000,
            },
        },
        "BLUE_WHALE": {
            "WHALE_ORCA": {
                name: "Orca",
                head: "/head/b008ca9c00cecf499685030e8ef0c230a32908619ce9dc10690b69111591faa1",
                release: new Date('2021-03-09 18:00:00 GMT+1').getTime(),
            },
        },
        "CHICKEN": {
            "CHICKEN_BABY_CHICK": {
                name: "Baby Chick",
                head: "/head/1bde55ed54cb5c87661b86c349186a9d5baffb3cb934b449a2d329e399d34bf",
                release: new Date('2021-04-05 18:00:00 GMT+1').getTime(),
            },
        },
        "BLACK_CAT": {
            "BLACK_CAT_IVORY": {
                name: "Ivory",
                head: "/head/f51b17d7ded6c7e8f3b2dac12378a6fc4e9228b911986f64c8af45837ae6d9e1",
                release: new Date('2021-04-26 18:00:00 GMT+1').getTime(),
            },
            "BLACK_CAT_ONYX": {
                name: "Onyx",
                head: "/head/be924115d3a8bbacfd4fafb6cc70f99a2f7580e4583a50fa9b9c285a98ac0c56",
                release: new Date('2021-04-26 18:00:00 GMT+1').getTime(),
            },
        },
    },

    pet_value: {
        "common": 1,
        "uncommon": 2,
        "rare": 3,
        "epic": 4,
        "legendary": 5,
        "mythic": 6
    },

    pet_rewards: {
        0: {
            magic_find: 0
        },
        10: {
            magic_find: 1
        },
        25: {
            magic_find: 2
        },
        50: {
            magic_find: 3
        },
        75: {
            magic_find: 4
        },
        100: {
            magic_find: 5
        },
        130: {
            magic_find: 6
        },
        175: {
            magic_find: 7
        }
    },

    pet_items: {
        PET_ITEM_ALL_SKILLS_BOOST_COMMON: {
            name: "All Skills Exp Boost",
            tier: "COMMON",
            description: "§7Gives +§a10% §7pet exp for all skills"
        },
        PET_ITEM_BIG_TEETH_COMMON: {
            name: "Big Teeth",
            tier: "COMMON",
            description: `§7Increases §9${symbols.crit_chance} Crit Chance §7by §a5`,
            stats: {
                crit_chance: 5
            }
        },
        PET_ITEM_IRON_CLAWS_COMMON: {
            name: "Iron Claws",
            tier: "COMMON",
            description: `§7Increases the pet's §9${symbols.crit_damage} Crit Damage §7by §a40% §7and §9${symbols.crit_chance} Crit Chance §7by §a40%`,
            multStats: {
                crit_chance: 1.4,
                crit_damage: 1.4
            }
        },
        PET_ITEM_SHARPENED_CLAWS_UNCOMMON: {
            name: "Sharpened Claws",
            tier: "UNCOMMON",
            description: `§7Increases §9${symbols.crit_damage} Crit Damage §7by §a15`,
            stats: {
                crit_damage: 15
            }
        },
        PET_ITEM_HARDENED_SCALES_UNCOMMON: {
            name: "Hardened Scales",
            tier: "UNCOMMON",
            description: `§7Increases §a${symbols.defense} Defense §7by §a25`,
            stats: {
                defense: 25
            }
        },
        PET_ITEM_BUBBLEGUM: {
            name: "Bubblegum",
            tier: "RARE",
            description: "§7Your pet fuses its power with placed §aOrbs §7to give them §a2x §7duration"
        },
        PET_ITEM_LUCKY_CLOVER: {
            name: "Lucky Clover",
            tier: "EPIC",
            description: `§7Increases §b${symbols.magic_find} Magic Find §7by §a7`,
            stats: {
                magic_find: 7
            }
        },
        PET_ITEM_TEXTBOOK: {
            name: "Textbook",
            tier: "LEGENDARY",
            description: `§7Increases the pet's §b${symbols.intelligence} Intelligence §7by §a100%`,
            multStats: {
                intelligence: 2
            }
        },
        PET_ITEM_SADDLE: {
            name: "Saddle",
            tier: "UNCOMMON",
            description: "§7Increase horse speed by §a50% §7 and jump boost by §a100%"
        },
        PET_ITEM_EXP_SHARE: {
            name: "Exp Share",
            tier: "EPIC",
            description: "§7While unequipped this pet gains §a25% §7of the equipped pet's xp, this is §7split between all pets holding the item."
        },
        PET_ITEM_TIER_BOOST: {
            name: "Tier Boost",
            tier: "LEGENDARY",
            description: "§7Boosts the §ararity §7of your pet by 1 tier!"
        },
        PET_ITEM_COMBAT_SKILL_BOOST_COMMON: {
            name: "Combat Exp Boost",
            tier: "COMMON",
            description: "§7Gives +§a20% §7pet exp for Combat"
        },
        PET_ITEM_COMBAT_SKILL_BOOST_UNCOMMON: {
            name: "Combat Exp Boost",
            tier: "UNCOMMON",
            description: "§7Gives +§a30% §7pet exp for Combat"
        },
        PET_ITEM_COMBAT_SKILL_BOOST_RARE: {
            name: "Combat Exp Boost",
            tier: "RARE",
            description: "§7Gives +§a40% §7pet exp for Combat"
        },
        PET_ITEM_COMBAT_SKILL_BOOST_EPIC: {
            name: "Combat Exp Boost",
            tier: "EPIC",
            description: "§7Gives +§a50% §7pet exp for Combat"
        },
        PET_ITEM_FISHING_SKILL_BOOST_COMMON: {
            name: "Fishing Exp Boost",
            tier: "COMMON",
            description: "§7Gives +§a20% §7pet exp for Fishing"
        },
        PET_ITEM_FISHING_SKILL_BOOST_UNCOMMON: {
            name: "Fishing Exp Boost",
            tier: "UNCOMMON",
            description: "§7Gives +§a30% §7pet exp for Fishing"
        },
        PET_ITEM_FISHING_SKILL_BOOST_RARE: {
            name: "Fishing Exp Boost",
            tier: "RARE",
            description: "§7Gives +§a40% §7pet exp for Fishing"
        },
        PET_ITEM_FISHING_SKILL_BOOST_EPIC: {
            name: "Fishing Exp Boost",
            tier: "EPIC",
            description: "§7Gives +§a50% §7pet exp for Fishing"
        },
        PET_ITEM_FORAGING_SKILL_BOOST_COMMON: {
            name: "Foraging Exp Boost",
            tier: "COMMON",
            description: "§7Gives +§a20% §7pet exp for Foraging"
        },
        PET_ITEM_FORAGING_SKILL_BOOST_UNCOMMON: {
            name: "Foraging Exp Boost",
            tier: "UNCOMMON",
            description: "§7Gives +§a30% §7pet exp for Foraging"
        },
        PET_ITEM_FORAGING_SKILL_BOOST_RARE: {
            name: "Foraging Exp Boost",
            tier: "RARE",
            description: "§7Gives +§a40% §7pet exp for Foraging"
        },
        PET_ITEM_FORAGING_SKILL_BOOST_EPIC: {
            name: "Foraging Exp Boost",
            tier: "EPIC",
            description: "§7Gives +§a50% §7pet exp for Foraging"
        },
        PET_ITEM_MINING_SKILL_BOOST_COMMON: {
            name: "Mining Exp Boost",
            tier: "COMMON",
            description: "§7Gives +§a20% §7pet exp for Mining"
        },
        PET_ITEM_MINING_SKILL_BOOST_UNCOMMON: {
            name: "Mining Exp Boost",
            tier: "UNCOMMON",
            description: "§7Gives +§a30% §7pet exp for Mining"
        },
        PET_ITEM_MINING_SKILL_BOOST_RARE: {
            name: "Mining Exp Boost",
            tier: "RARE",
            description: "§7Gives +§a40% §7pet exp for Mining"
        },
        PET_ITEM_MINING_SKILL_BOOST_EPIC: {
            name: "Mining Exp Boost",
            tier: "EPIC",
            description: "§7Gives +§a50% §7pet exp for Mining"
        },
        PET_ITEM_FARMING_SKILL_BOOST_COMMON: {
            name: "Farming Exp Boost",
            tier: "COMMON",
            description: "§7Gives +§a20% §7pet exp for Farming"
        },
        PET_ITEM_FARMING_SKILL_BOOST_UNCOMMON: {
            name: "Farming Exp Boost",
            tier: "UNCOMMON",
            description: "§7Gives +§a30% §7pet exp for Farming"
        },
        PET_ITEM_FARMING_SKILL_BOOST_RARE: {
            name: "Farming Exp Boost",
            tier: "RARE",
            description: "§7Gives +§a40% §7pet exp for Farming"
        },
        PET_ITEM_FARMING_SKILL_BOOST_EPIC: {
            name: "Farming Exp Boost",
            tier: "EPIC",
            description: "§7Gives +§a50% §7pet exp for Farming"
        },
        // new pet items from 0.9 update yay
        REINFORCED_SCALES: {
            name: "Reinforced Scales",
            tier: "RARE",
            description: `§7Increases §a${symbols.defense} Defense §7by §a40`,
            stats: {
                defense: 40
            }
        },
        GOLD_CLAWS: {
            name: "Gold Claws",
            tier: "UNCOMMON",
            description: `§7Increases the pet's §9${symbols.crit_damage} Crit Damage §7by §a50% §7and §9${symbols.crit_chance} Crit Chance §7by §a50%`,
            multStats: {
                crit_chance: 1.5,
                crit_damage: 1.5
            }
        },
        ALL_SKILLS_SUPER_BOOST: {
            name: "All Skills Exp Super-Boost",
            tier: "COMMON",
            description: "§7Gives +§a20% §7pet exp for all skills"
        },
        BIGGER_TEETH: {
            name: "Bigger Teeth",
            tier: "UNCOMMON",
            description: `§7Increases §9${symbols.crit_chance} Crit Chance §7by §a10`,
            stats: {
                crit_chance: 10
            }
        },
        SERRATED_CLAWS: {
            name: "Serrated Claws",
            tier: "RARE",
            description: `§7Increases §9${symbols.crit_damage} Crit Damage §7by §a25`,
            stats: {
                crit_damage: 25
            }
        },
        WASHED_UP_SOUVENIR: {
            name: "Washed-up Souvenir",
            tier: "LEGENDARY",
            description: `§7Increases §3${symbols.sea_creature_chance} Sea Creature Chance §7by §a5`,
            stats: {
                sea_creature_chance: 5
            }
        },
        ANTIQUE_REMEDIES: {
            name: "Antique Remedies",
            tier: "EPIC",
            description: `§7Increases the pet's §c${symbols.strength} Strength §7by §a80%`,
            multStats: {
                strength: 1.8
            }
        },
        CROCHET_TIGER_PLUSHIE: {
            name: "Crochet Tiger Plushie",
            tier: "EPIC",
            description: `§7Increases §e${symbols.attack_speed} Bonus Attack Speed §7by §a35`,
            stats: {
                bonus_attack_speed: 35
            }
        },
        DWARF_TURTLE_SHELMET: {
            name: "Dwarf Turtle Shelmet",
            tier: "RARE",
            description: `§7Makes the pet's owner immune to knockback.`
        },
        PET_ITEM_VAMPIRE_FANG: {
            name: "Vampire Fang",
            tier: "LEGENDARY",
            description: "§7Upgrades a Bat pet from §6Legendary §7to §dMythic §7adding a bonus perk and bonus stats!"
        },
        PET_ITEM_SPOOKY_CUPCAKE: {
            name: "Spooky Cupcake",
            tier: "UNCOMMON",
            description: `§7Increases §c${symbols.strength} Strength §7by §a30 §7and §f${symbols.speed} Speed §7by §a20`,
            stats: {
                strength: 30,
                speed: 20
            }
        },
        MINOS_RELIC: {
            name: "Minos Relic",
            tier: "EPIC",
            description: `§7Increases all pet stats by §a33.3%`,
            multAllStats: 1.333,
        },
        PET_ITEM_TOY_JERRY: {
            name: "Jerry 3D Glasses",
            tier: "LEGENDARY",
            description: "§7Upgrades a Jerry pet from §6Legendary §7to §dMythic §7and granting it a new perk!"
        },
        REAPER_GEM: {
            name: "Reaper Gem",
            tier: "LEGENDARY",
            description: `§7Gain §c8${symbols.ferocity} Ferocity §7for 5s on kill`
        },
    }
}

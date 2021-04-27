module.exports = {
    minion_types: [
        'farming',
        'mining',
        'combat',
        'foraging',
        'fishing'
    ],

    minion_slots: {
        0: 5,
        5: 6,
        15: 7,
        30: 8,
        50: 9,
        75: 10,
        100: 11,
        125: 12,
        150: 13,
        175: 14,
        200: 15,
        225: 16,
        250: 17,
        275: 18,
        300: 19,
        350: 20,
        400: 21,
        450: 22,
        500: 23,
        550: 24,
        600: 25,
        650: 26,
    },

    minions_max_uniques: 609,
    minions_max_slots: 25, // From unique tiers (excludes community shop upgrades)

    minions: {
        COBBLESTONE: {
            type: 'mining',
            head: '/head/2f93289a82bd2a06cbbe61b733cfdc1f1bd93c4340f7a90abd9bdda774109071',
            tiers: 12
        },
        OBSIDIAN: {
            type: 'mining',
            head: '/head/320c29ab966637cb9aecc34ee76d5a0130461e0c4fdb08cdaf80939fa1209102',
            tiers: 12
        },
        GLOWSTONE: {
            type: 'mining',
            head: '/head/20f4d7c26b0310990a7d3a3b45948b95dd4ab407a16a4b6d3b7cb4fba031aeed'
        },
        GRAVEL: {
            type: 'mining',
            head: '/head/7458507ed31cf9a38986ac8795173c609637f03da653f30483a721d3fbe602d'
        },
        SAND: {
            type: 'mining',
            head: '/head/81f8e2ad021eefd1217e650e848b57622144d2bf8a39fbd50dab937a7eac10de'
        },
        CLAY: {
            type: 'fishing',
            head: '/head/af9b312c8f53da289060e6452855072e07971458abbf338ddec351e16c171ff8'
        },
        ICE: {
            type: 'mining',
            head: '/head/e500064321b12972f8e5750793ec1c823da4627535e9d12feaee78394b86dabe'
        },
        SNOW: {
            type: 'mining',
            head: '/head/f6d180684c3521c9fc89478ba4405ae9ce497da8124fa0da5a0126431c4b78c3'
        },
        COAL: {
            type: 'mining',
            head: '/head/425b8d2ea965c780652d29c26b1572686fd74f6fe6403b5a3800959feb2ad935',
            tiers: 12
        },
        IRON: {
            type: 'mining',
            head: '/head/af435022cb3809a68db0fccfa8993fc1954dc697a7181494905b03fdda035e4a',
            tiers: 12
        },
        GOLD: {
            type: 'mining',
            head: '/head/f6da04ed8c810be29bba53c62e712d65cfb25238117b94d7e85a4615775bf14f',
            tiers: 12
        },
        DIAMOND: {
            type: 'mining',
            head: '/head/2354bbe604dfe58bf92e7729730d0c8e37844e831ee3816d7e8427c27a1824a2',
            tiers: 12
        },
        LAPIS: {
            type: 'mining',
            head: '/head/64fd97b9346c1208c1db3957530cdfc5789e3e65943786b0071cf2b2904a6b5c',
            tiers: 12
        },
        REDSTONE: {
            type: 'mining',
            head: '/head/1edefcf1a89d687a0a4ecf1589977af1e520fc673c48a0434be426612e8faa67',
            tiers: 12
        },
        EMERALD: {
            type: 'mining',
            head: '/head/9bf57f3401b130c6b53808f2b1e119cc7b984622dac7077bbd53454e1f65bbf0',
            tiers: 12
        },
        MITHRIL: {
            type: 'mining',
            head: '/head/c62fa670ff8599b32ab344195ba15f3ef64c3a8aa8a37821c08375950cb74cd0',
            tiers: 12
        },
        QUARTZ: {
            type: 'mining',
            head: '/head/d270093be62dfd3019f908043db570b5dfd366fd5345fccf9da340e75c701a60'
        },
        ENDER_STONE: {
            name: 'End Stone',
            type: 'mining',
            head: '/head/7994be3dcfbb4ed0a5a7495b7335af1a3ced0b5888b5007286a790767c3b57e6'
        },
        WHEAT: {
            type: 'farming',
            tiers: 12,
            head: '/head/bbc571c5527336352e2fee2b40a9edfa2e809f64230779aa01253c6aa535881b'
        },
        MELON: {
            type: 'farming',
            tiers: 12,
            head: '/head/95d54539ac8d3fba9696c91f4dcc7f15c320ab86029d5c92f12359abd4df811e'
        },
        PUMPKIN: {
            type: 'farming',
            tiers: 12,
            head: '/head/f3fb663e843a7da787e290f23c8af2f97f7b6f572fa59a0d4d02186db6eaabb7'
        },
        CARROT: {
            type: 'farming',
            tiers: 12,
            head: '/head/4baea990b45d330998cb0c1f8515c27b24f93bff1df0db056e647f8200d03b9d'
        },
        POTATO: {
            type: 'farming',
            tiers: 12,
            head: '/head/7dda35a044cb0374b516015d991a0f65bf7d0fb6566e350496642cf2059ff1d9'
        },
        MUSHROOM: {
            type: 'farming',
            tiers: 12,
            head: '/head/4a3b58341d196a9841ef1526b367209cbc9f96767c24f5f587cf413d42b74a93'
        },
        CACTUS: {
            type: 'farming',
            tiers: 12,
            head: '/head/ef93ec6e67a6cd272c9a9684b67df62584cb084a265eee3cde141d20e70d7d72'
        },
        COCOA: {
            type: 'farming',
            tiers: 12,
            head: '/head/acb680e96f6177cd8ffaf27e9625d8b544d720afc50738801818d0e745c0e5f7'
        },
        SUGAR_CANE: {
            type: 'farming',
            tiers: 12,
            head: '/head/2fced0e80f0d7a5d1f45a1a7217e6a99ea9720156c63f6efc84916d4837fabde'
        },
        NETHER_WARTS: {
            name: 'Nether Wart',
            type: 'farming',
            tiers: 12,
            head: '/head/71a4620bb3459c1c2fa74b210b1c07b4a02254351f75173e643a0e009a63f558'
        },
        FLOWER: {
            type: 'foraging',
            head: '/head/baa7c59b2f792d8d091aecacf47a19f8ab93f3fd3c48f6930b1c2baeb09e0f9b'
        },
        FISHING: {
            type: 'fishing',
            head: '/head/53ea0fd89524db3d7a3544904933830b4fc8899ef60c113d948bb3c4fe7aabb1'
        },
        ZOMBIE: {
            type: 'combat',
            head: '/head/196063a884d3901c41f35b69a8c9f401c61ac9f6330f964f80c35352c3e8bfb0'
        },
        REVENANT: {
            type: 'combat',
            head: '/head/a3dce8555923558d8d74c2a2b261b2b2d630559db54ef97ed3f9c30e9a20aba',
            tiers: 12
        },
        SKELETON: {
            type: 'combat',
            head: '/head/2fe009c5cfa44c05c88e5df070ae2533bd682a728e0b33bfc93fd92a6e5f3f64'
        },
        CREEPER: {
            type: 'combat',
            head: '/head/54a92c2f8c1b3774e80492200d0b2218d7b019314a73c9cb5b9f04cfcacec471'
        },
        SPIDER: {
            type: 'combat',
            head: '/head/e77c4c284e10dea038f004d7eb43ac493de69f348d46b5c1f8ef8154ec2afdd0'
        },
        TARANTULA: {
            type: 'combat',
            head: '/head/97e86007064c9ce26eb4bad8ac9aa30aac309e70a9e0b615936318dea40a721'
        },
        CAVESPIDER: {
            name: 'Cave Spider',
            type: 'combat',
            head: '/head/5d815df973bcd01ee8dfdb3bd74f0b7cb8fef2a70559e4faa5905127bbb4a435'
        },
        BLAZE: {
            type: 'combat',
            head: '/head/3208fbd64e97c6e00853d36b3a201e4803cae43dcbd6936a3cece050912e1f20'
        },
        MAGMA_CUBE: {
            type: 'combat',
            head: '/head/18c9a7a24da7e3182e4f62fa62762e21e1680962197c7424144ae1d2c42174f7'
        },
        ENDERMAN: {
            type: 'combat',
            head: '/head/e460d20ba1e9cd1d4cfd6d5fb0179ff41597ac6d2461bd7ccdb58b20291ec46e'
        },
        GHAST: {
            type: 'combat',
            head: '/head/2478547d122ec83a818b46f3b13c5230429559e40c7d144d4ec225f92c1494b3'
        },
        SLIME: {
            type: 'combat',
            head: '/head/c95eced85db62c922724efca804ea0060c4a87fcdedf2fd5c4f9ac1130a6eb26'
        },
        COW: {
            type: 'farming',
            tiers: 12,
            head: '/head/c2fd8976e1b64aebfd38afbe62aa1429914253df3417ace1f589e5cf45fbd717'
        },
        PIG: {
            type: 'farming',
            tiers: 12,
            head: '/head/a9bb5f0c56408c73cfa412345c8fc51f75b6c7311ae60e7099c4781c48760562'
        },
        CHICKEN: {
            type: 'farming',
            tiers: 12,
            head: '/head/a04b7da13b0a97839846aa5648f5ac6736ba0ca9fbf38cd366916e417153fd7f'
        },
        SHEEP: {
            type: 'farming',
            tiers: 12,
            head: '/head/fd15d4b8bce708f77f963f1b4e87b1b969fef1766a3e9b67b249c59d5e80e8c5'
        },
        RABBIT: {
            type: 'farming',
            tiers: 12,
            head: '/head/ef59c052d339bb6305cad370fd8c52f58269a957dfaf433a255597d95e68a373'
        },
        OAK: {
            type: 'foraging',
            head: '/head/57e4a30f361204ea9cded3fbff850160731a0081cc452cfe26aed48e97f6364b'
        },
        BIRCH: {
            type: 'foraging',
            head: '/head/eb74109dbb88178afb7a9874afc682904cedb3df75978a51f7beeb28f924251'
        },
        SPRUCE: {
            type: 'foraging',
            head: '/head/7ba04bfe516955fd43932dcb33bd5eac20b38a231d9fa8415b3fb301f60f7363'
        },
        DARK_OAK: {
            type: 'foraging',
            head: '/head/5ecdc8d6b2b7e081ed9c36609052c91879b89730b9953adbc987e25bf16c5581'
        },
        ACACIA: {
            type: 'foraging',
            head: '/head/42183eaf5b133b838db13d145247e389ab4b4f33c67846363792dc3d82b524c0'
        },
        JUNGLE: {
            type: 'foraging',
            head: '/head/2fe73d981690c1be346a16331819c4e8800859fcdc3e5153718c6ad45861924c'
        }
    }
};

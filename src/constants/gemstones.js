module.exports = {
  /*
   * gemstone stats values:
   * - int: exact value tested by dukioooo on 9 august 2021
   * - null: value doesn't exist, gem can't be applied to any item of that rarity
   * - "-1": missing value
   */
  gemstones: {
    JADE: {
      name: "Jade",
      color: "a",
      stats: {
        ROUGH: {
          mining_fortune: [null, 2, 3, 8, 10, 12],
        },
        FLAWED: {
          mining_fortune: [null, 2.5, 3.5, 10, 14, 18],
        },
        FINE: {
          mining_fortune: [null, 3.5, 5, 15, 20, 25],
        },
        FLAWLESS: {
          mining_fortune: [null, 5, 7.5, 20, 27, 35],
        },
        PERFECT: {
          mining_fortune: [null, -1, -1, -1, -1, -1],
        },
      },
    },
    AMBER: {
      name: "Amber",
      color: "6",
      stats: {
        ROUGH: {
          mining_speed: [2, 4, 6, 16, 20, 24],
        },
        FLAWED: {
          mining_speed: [3, 5, 7, 18, 24, 30],
        },
        FINE: {
          mining_speed: [5, 7, 10, 28, 36, 45],
        },
        FLAWLESS: {
          mining_speed: [7, 10, 15, 44, 58, 75],
        },
        PERFECT: {
          mining_speed: [10, 14, 20, 60, 80, 100],
        },
      },
    },
    TOPAZ: {
      name: "Topaz",
      color: "e",
      stats: {
        ROUGH: {
          pristine: [null, null, 0.2, 0.4, 0.4, 0.4],
        },
        FLAWED: {
          pristine: [null, null, 0.4, 0.8, 0.8, 0.8],
        },
        FINE: {
          pristine: [null, null, 0.6, 1.2, 1.2, 1.2],
        },
        FLAWLESS: {
          pristine: [null, null, 0.8, 1.6, 1.6, 1.6],
        },
        PERFECT: {
          pristine: [null, null, 1, 2, 2, 2],
        },
      },
    },
    SAPPHIRE: {
      name: "Sapphire",
      color: "b",
      stats: {
        ROUGH: {
          intelligence: [null, null, 0.5, 2, 2, 3],
        },
        FLAWED: {
          intelligence: [null, null, 1, 3, 3, 4],
        },
        FINE: {
          intelligence: [null, null, 1.5, 4, 4, 5],
        },
        FLAWLESS: {
          intelligence: [null, null, 2.5, 6, 7, 8],
        },
        PERFECT: {
          intelligence: [null, null, -1, -1, -1, -1],
        },
      },
    },
    AMETHYST: {
      name: "Amethyst",
      color: "5",
      stats: {
        ROUGH: {
          defense: [null, 1, 1.5, 4, 5, 6],
        },
        FLAWED: {
          defense: [null, 1.5, 2, 5, 6, 8],
        },
        FINE: {
          defense: [null, 2, 2.5, 6, 8, 10],
        },
        FLAWLESS: {
          defense: [null, 2.5, 4, 11, 14, 18],
        },
        PERFECT: {
          defense: [null, -1, -1, -1, -1, -1],
        },
      },
    },
    JASPER: {
      name: "Jasper",
      color: "d",
      stats: {
        ROUGH: {
          strength: [null, null, 0.5, 2, 2, 3],
        },
        FLAWED: {
          strength: [null, null, 1, 3, 3, 4],
        },
        FINE: {
          strength: [null, null, 1.5, 4, 4, 5],
        },
        FLAWLESS: {
          strength: [null, null, -1, -1, -1, -1],
        },
        PERFECT: {
          strength: [null, null, -1, -1, -1, -1],
        },
      },
    },
    RUBY: {
      name: "Ruby",
      color: "c",
      stats: {
        ROUGH: {
          health: [0.5, 1, 1.5, 4, 5, 6],
        },
        FLAWED: {
          health: [1, 1.5, 2, 5, 6, 8],
        },
        FINE: {
          health: [1.5, 2, 2.5, 6, 8, 10],
        },
        FLAWLESS: {
          health: [2, 2.5, 4, 11, 14, 18],
        },
        PERFECT: {
          health: [2.5, 3.5, 5, 15, 20, 25],
        },
      },
    },
  },
};

/*
 * gemstone stats values:
 * - int: exact value
 * - null: value doesn't exist, gem can't be applied to any item of that rarity
 */
export const gemstones = {
  JADE: {
    name: "Jade",
    color: "a",
    stats: {
      ROUGH: {
        mining_fortune: [null, 4, 6, 8, 10, 12],
      },
      FLAWED: {
        mining_fortune: [null, 5, 7, 10, 14, 18],
      },
      FINE: {
        mining_fortune: [null, 7, 10, 15, 20, 25],
      },
      FLAWLESS: {
        mining_fortune: [null, 10, 15, 20, 27, 35],
      },
      PERFECT: {
        mining_fortune: [null, 14, 20, 30, 40, 50],
      },
    },
  },
  AMBER: {
    name: "Amber",
    color: "6",
    stats: {
      ROUGH: {
        mining_speed: [4, 8, 12, 16, 20, 24],
      },
      FLAWED: {
        mining_speed: [6, 10, 14, 18, 24, 30],
      },
      FINE: {
        mining_speed: [10, 14, 20, 28, 36, 45],
      },
      FLAWLESS: {
        mining_speed: [14, 20, 30, 44, 58, 75],
      },
      PERFECT: {
        mining_speed: [20, 28, 40, 60, 80, 100],
      },
    },
  },
  TOPAZ: {
    name: "Topaz",
    color: "e",
    stats: {
      ROUGH: {
        pristine: [null, null, 0.4, 0.4, 0.4, 0.4],
      },
      FLAWED: {
        pristine: [null, null, 0.8, 0.8, 0.8, 0.8],
      },
      FINE: {
        pristine: [null, null, 1.2, 1.2, 1.2, 1.2],
      },
      FLAWLESS: {
        pristine: [null, null, 1.6, 1.6, 1.6, 1.6],
      },
      PERFECT: {
        pristine: [null, null, 2, 2, 2, 2],
      },
    },
  },
  SAPPHIRE: {
    name: "Sapphire",
    color: "b",
    stats: {
      ROUGH: {
        intelligence: [2, 2, 3, 4, 5, 6],
      },
      FLAWED: {
        intelligence: [4, 4, 5, 6, 7, 8],
      },
      FINE: {
        intelligence: [6, 6, 7, 8, 9, 10],
      },
      FLAWLESS: {
        intelligence: [8, 9, 10, 12, 14, 16],
      },
      PERFECT: {
        intelligence: [10, 12, 14, 17, 20, 25],
      },
    },
  },
  AMETHYST: {
    name: "Amethyst",
    color: "5",
    stats: {
      ROUGH: {
        defense: [1, 2, 3, 4, 5, 7],
      },
      FLAWED: {
        defense: [3, 4, 5, 6, 8, 10],
      },
      FINE: {
        defense: [4, 5, 6, 8, 10, 14],
      },
      FLAWLESS: {
        defense: [5, 7, 10, 14, 18, 22],
      },
      PERFECT: {
        defense: [6, 9, 13, 18, 24, 30],
      },
    },
  },
  JASPER: {
    name: "Jasper",
    color: "d",
    stats: {
      ROUGH: {
        strength: [null, null, 1, 2, 2, 3],
      },
      FLAWED: {
        strength: [null, null, 2, 3, 3, 4],
      },
      FINE: {
        strength: [null, null, 3, 4, 4, 5],
      },
      FLAWLESS: {
        strength: [null, null, 5, 6, 7, 8],
      },
      PERFECT: {
        strength: [null, null, 7, 9, 10, 12],
      },
    },
  },
  RUBY: {
    name: "Ruby",
    color: "c",
    stats: {
      ROUGH: {
        health: [1, 2, 3, 4, 5, 7],
      },
      FLAWED: {
        health: [3, 4, 5, 6, 8, 10],
      },
      FINE: {
        health: [4, 5, 6, 8, 10, 14],
      },
      FLAWLESS: {
        health: [5, 7, 10, 14, 18, 22],
      },
      PERFECT: {
        health: [6, 9, 13, 18, 24, 30],
      },
    },
  },
};

/*
 * gemstone stats values:
 * - int: exact value
 * - null: unknown value
 */
export const gemstones = {
  JADE: {
    name: "Jade",
    color: "a",
    stats: {
      ROUGH: {
        mining_fortune: [null, 4, 6, 8, 10, 12, 14],
      },
      FLAWED: {
        mining_fortune: [null, 5, 7, 10, 14, 18, 22],
      },
      FINE: {
        mining_fortune: [null, 7, 10, 15, 20, 25, 30],
      },
      FLAWLESS: {
        mining_fortune: [null, 10, 15, 20, 27, 35, 44],
      },
      PERFECT: {
        mining_fortune: [null, 14, 20, 30, 40, 50, 60],
      },
    },
  },
  AMBER: {
    name: "Amber",
    color: "6",
    stats: {
      ROUGH: {
        mining_speed: [4, 8, 12, 16, 20, 24, 28],
      },
      FLAWED: {
        mining_speed: [6, 10, 14, 18, 24, 30, 36],
      },
      FINE: {
        mining_speed: [10, 14, 20, 28, 36, 45, 54],
      },
      FLAWLESS: {
        mining_speed: [14, 20, 30, 44, 58, 75, 92],
      },
      PERFECT: {
        mining_speed: [20, 28, 40, 60, 80, 100, 120],
      },
    },
  },
  TOPAZ: {
    name: "Topaz",
    color: "e",
    stats: {
      ROUGH: {
        pristine: [null, null, 0.4, 0.4, 0.4, 0.4, 0.5],
      },
      FLAWED: {
        pristine: [null, null, 0.8, 0.8, 0.8, 0.8, 0.9],
      },
      FINE: {
        pristine: [null, null, 1.2, 1.2, 1.2, 1.2, 1.3],
      },
      FLAWLESS: {
        pristine: [null, null, 1.6, 1.6, 1.6, 1.6, 1.8],
      },
      PERFECT: {
        pristine: [null, null, 2, 2, 2, 2, 2.2],
      },
    },
  },
  SAPPHIRE: {
    name: "Sapphire",
    color: "b",
    stats: {
      ROUGH: {
        intelligence: [2, 2, 3, 4, 5, 6, null],
      },
      FLAWED: {
        intelligence: [4, 4, 5, 6, 7, 8, null],
      },
      FINE: {
        intelligence: [6, 6, 7, 8, 9, 10, null],
      },
      FLAWLESS: {
        intelligence: [8, 9, 10, 12, 14, 16, null],
      },
      PERFECT: {
        intelligence: [10, 12, 14, 17, 20, 25, null],
      },
    },
  },
  AMETHYST: {
    name: "Amethyst",
    color: "5",
    stats: {
      ROUGH: {
        defense: [1, 2, 3, 4, 5, 7, null],
      },
      FLAWED: {
        defense: [3, 4, 5, 6, 8, 10, null],
      },
      FINE: {
        defense: [4, 5, 6, 8, 10, 14, null],
      },
      FLAWLESS: {
        defense: [5, 7, 10, 14, 18, 22, null],
      },
      PERFECT: {
        defense: [6, 9, 13, 18, 24, 30, null],
      },
    },
  },
  JASPER: {
    name: "Jasper",
    color: "d",
    stats: {
      ROUGH: {
        strength: [null, null, 1, 2, 2, 3, null],
      },
      FLAWED: {
        strength: [null, null, 2, 3, 3, 4, null],
      },
      FINE: {
        strength: [null, null, 3, 4, 4, 5, null],
      },
      FLAWLESS: {
        strength: [null, null, 5, 6, 7, 8, null],
      },
      PERFECT: {
        strength: [null, null, 7, 9, 10, 12, null],
      },
    },
  },
  RUBY: {
    name: "Ruby",
    color: "c",
    stats: {
      ROUGH: {
        health: [1, 2, 3, 4, 5, 7, null],
      },
      FLAWED: {
        health: [3, 4, 5, 6, 8, 10, null],
      },
      FINE: {
        health: [4, 5, 6, 8, 10, 14, null],
      },
      FLAWLESS: {
        health: [5, 7, 10, 14, 18, 22, null],
      },
      PERFECT: {
        health: [6, 9, 13, 18, 24, 30, null],
      },
    },
  },
  OPAL: {
    name: "Opal",
    color: "f",
    stats: {
      ROUGH: {
        true_defense: [null, null, null, 2, 2, 3, null],
      },
      FLAWED: {
        true_defense: [null, null, null, 3, 3, 4, null],
      },
      FINE: {
        true_defense: [null, null, null, 4, 4, 5, null],
      },
      FLAWLESS: {
        true_defense: [null, null, null, 6, 8, 9, null],
      },
      PERFECT: {
        true_defense: [null, null, null, null, 11, 13, null],
      },
    },
  },
};

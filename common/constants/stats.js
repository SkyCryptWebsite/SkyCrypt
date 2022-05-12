/*
 * Ordered object of stats: {
 *   name: string
 *   nameLore: string // name found in items lore
 *   nameShort: string // up to 16 chars
 *   nameTiny: string // up to 6 chars
 *   symbol: string
 *   suffix: string
 *   color: string
 * }
 */
export const statsData = {
  health: {
    name: "Health",
    nameLore: "Health",
    nameShort: "Health",
    nameTiny: "HP",
    symbol: "❤",
    suffix: "",
    color: "c",
  },
  defense: {
    name: "Defense",
    nameLore: "Defense",
    nameShort: "Defense",
    nameTiny: "Def",
    symbol: "❈",
    suffix: "",
    color: "a",
  },
  strength: {
    name: "Strength",
    nameLore: "Strength",
    nameShort: "Strength",
    nameTiny: "Str",
    symbol: "❁",
    suffix: "",
    color: "c",
  },
  speed: {
    name: "Speed",
    nameLore: "Speed",
    nameShort: "Speed",
    nameTiny: "Spd",
    symbol: "✦",
    suffix: "",
    color: "f",
  },
  crit_chance: {
    name: "Crit Chance",
    nameLore: "Crit Chance",
    nameShort: "Crit Chance",
    nameTiny: "CC",
    symbol: "☣",
    suffix: "%",
    color: "9",
  },
  crit_damage: {
    name: "Crit Damage",
    nameLore: "Crit Damage",
    nameShort: "Crit Damage",
    nameTiny: "CD",
    symbol: "☠",
    suffix: "%",
    color: "9",
  },
  intelligence: {
    name: "Intelligence",
    nameLore: "Intelligence",
    nameShort: "Intelligence",
    nameTiny: "Int",
    symbol: "✎",
    suffix: "",
    color: "b",
  },
  bonus_attack_speed: {
    name: "Bonus Attack Speed",
    nameLore: "Bonus Attack Speed",
    nameShort: "Attack Speed",
    nameTiny: "Atk",
    symbol: "⚔",
    suffix: "%",
    color: "e",
  },
  sea_creature_chance: {
    name: "Sea Creature Chance",
    nameLore: "Sea Creature Chance",
    nameShort: "SC Chance",
    nameTiny: "SCC",
    symbol: "α",
    suffix: "%",
    color: "3",
  },
  magic_find: {
    name: "Magic Find",
    nameLore: "Magic Find",
    nameShort: "Magic Find",
    nameTiny: "MF",
    symbol: "✯",
    suffix: "",
    color: "b",
  },
  pet_luck: {
    name: "Pet Luck",
    nameLore: "Pet Luck",
    nameShort: "Pet Luck",
    nameTiny: "PL",
    symbol: "♣",
    suffix: "",
    color: "d",
  },
  true_defense: {
    name: "True Defense",
    nameLore: "True Defense",
    nameShort: "True Defense",
    nameTiny: "TD",
    symbol: "❂",
    suffix: "",
    color: "f",
  },
  ferocity: {
    name: "Ferocity",
    nameLore: "Ferocity",
    nameShort: "Ferocity",
    nameTiny: "Frc",
    symbol: "⫽",
    suffix: "",
    color: "c",
  },
  ability_damage: {
    name: "Ability Damage",
    nameLore: "Ability Damage",
    nameShort: "Ability Damage",
    nameTiny: "AD",
    symbol: "๑",
    suffix: "%",
    color: "c",
  },
  mining_speed: {
    name: "Mining Speed",
    nameLore: "Mining Speed",
    nameShort: "Mining Speed",
    nameTiny: "MngSpd",
    symbol: "⸕",
    suffix: "",
    color: "6",
  },
  mining_fortune: {
    name: "Mining Fortune",
    nameLore: "Mining Fortune",
    nameShort: "Mining Fortune",
    nameTiny: "MngFrt",
    symbol: "☘",
    suffix: "",
    color: "6",
  },
  farming_fortune: {
    name: "Farming Fortune",
    nameLore: "Farming Fortune",
    nameShort: "Farming Fortune",
    nameTiny: "FrmFrt",
    symbol: "☘",
    suffix: "",
    color: "6",
  },
  foraging_fortune: {
    name: "Foraging Fortune",
    nameLore: "Foraging Fortune",
    nameShort: "Foraging Fortune",
    nameTiny: "FrgFrt",
    symbol: "☘",
    suffix: "",
    color: "6",
  },
  pristine: {
    name: "Pristine",
    nameLore: "Pristine",
    nameShort: "Pristine",
    nameTiny: "Prs",
    symbol: "✧",
    suffix: "",
    color: "5",
  },
};

const _symbols = {
  powder: "᠅",
  soulflow: "⸎",
  dungeon_upgrade: "⚚",
  dye: "✿",
};
for (const stat in statsData) {
  _symbols[stat] = statsData[stat].symbol;
}
export const symbols = _symbols;

// todo: leaving this here while we still have stats in backend (temporarely)
export const statNames = {
  Health: "health",
  Defense: "defense",
  Strength: "strength",
  Speed: "speed",
  "Crit Chance": "crit_chance",
  "Crit Damage": "crit_damage",
  "Bonus Attack Speed": "bonus_attack_speed",
  Intelligence: "intelligence",
  "Sea Creature Chance": "sea_creature_chance",
  "Magic Find": "magic_find",
  "Pet Luck": "pet_luck",
  Ferocity: "ferocity",
  "Ability Damage": "ability_damage",
  "Mining Speed": "mining_speed",
  "Mining Fortune": "mining_fortune",
  "Farming Fortune": "farming_fortune",
  "Foraging Fortune": "foraging_fortune",
  Pristine: "pristine",
  "True Defense": "true_defense",
};

// todo: grab these constants from src/constants/misc: base_stats, stat_template

export const STATS_BONUS = {
  // ? Skills
  skill_farming: {
    1: { health: 2, farming_fortune: 4 },
    15: { health: 3, farming_fortune: 4 },
    20: { health: 4, farming_fortune: 4 },
    // ! Hypixel Admins made a mistake, Farming 25 for some reason doesn't give any stats
    25: { health: 0, farming_fortune: 0 },
    26: { health: 5, farming_fortune: 4 },
  },
  skill_mining: {
    1: { defense: 1, mining_fortune: 4 },
    15: { defense: 2, mining_fortune: 4 },
  },
  skill_combat: {
    1: { crit_chance: 0.5 },
  },
  skill_foraging: {
    1: { strength: 1, foraging_fortune: 4 },
    15: { strength: 2, foraging_fortune: 4 },
  },
  skill_fishing: {
    1: { health: 2 },
    15: { health: 3 },
    20: { health: 4 },
    26: { health: 5 },
  },
  skill_enchanting: {
    1: { intelligence: 1, ability_damage: 0.5 },
    15: { intelligence: 2, ability_damage: 0.5 },
  },
  skill_alchemy: {
    1: { intelligence: 1 },
    15: { intelligence: 2 },
  },
  skill_taming: {
    1: { pet_luck: 1 },
  },
  skill_dungeoneering: {
    1: { health: 2 },
    51: { health: 0 },
  },
  skill_social: {},
  skill_carpentry: {
    1: { health: 1},
    // ! Hypixel Admins made a mistake here, Carpentry 50 for some reason doesn't give health either
    50: { health: 49 }
  },
  skill_runecrafting: {},
  // ? Slayers
  slayer_zombie: {
    1: { health: 2 },
    2: { health: 2 },
    3: { health: 3 },
    4: { health: 3 },
    5: { health: 4 },
    6: { health: 4 },
    7: { health: 5 },
    8: { health: 5 },
    9: { health: 6 },
  },
  slayer_spider: {
    1: { crit_damage: 1 },
    2: { crit_damage: 1 },
    3: { crit_damage: 1 },
    4: { crit_damage: 1 },
    5: { crit_damage: 2 },
    6: { crit_damage: 2 },
    7: { crit_chance: 1 },
    8: { crit_damage: 3 },
    9: { crit_damage: 3 },
  },
  slayer_wolf: {
    1: { speed: 1 },
    2: { health: 2 },
    3: { speed: 1 },
    4: { health: 2 },
    5: { crit_damage: 1 },
    6: { health: 3 },
    7: { crit_damage: 2 },
    8: { speed: 1 },
    9: { health: 5 },
  },
  slayer_enderman: {
    1: { health: 1 },
    2: { intelligence: 1 },
    3: { health: 2 },
    4: { intelligence: 2 },
    5: { health: 3 },
    6: { intelligence: 3 },
    7: { health: 4 },
    8: { intelligence: 4 },
    9: { health: 5 },
  },
  slayer_blaze: {
    1: { health: 3 },
    2: { strength: 1 },
    3: { health: 4 },
    4: { true_defense: 1 },
    5: { health: 5 },
    6: { strength: 2 },
    7: { health: 6 },
    8: { true_defense: 2 },
    9: { health: 7 },
  },
};
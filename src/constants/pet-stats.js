import { symbols } from "../../common/constants.js";
import { round, floor } from "../helper.js";

function formatStat(stat) {
  const statFloored = Math.floor(stat);
  if (statFloored > 0) {
    return `§a+${statFloored}`;
  } else {
    return `§a${statFloored}`;
  }
}

class Pet {
  constructor(rarity, level) {
    this.rarity = rarity;
    this.level = level;
  }

  lore(newStats = false) {
    if (!newStats) {
      newStats = this.stats;
    }
    const list = [];
    for (const stat in newStats) {
      switch (stat) {
        case "health":
          list.push(`§7Health: ${formatStat(newStats[stat])}`);
          break;
        case "defense":
          list.push(`§7Defense: ${formatStat(newStats[stat])}`);
          break;
        case "strength":
          list.push(`§7Strength: ${formatStat(newStats[stat])}`);
          break;
        case "crit_chance":
          list.push(`§7Crit Chance: ${formatStat(newStats[stat])}`);
          break;
        case "crit_damage":
          list.push(`§7Crit Damage: ${formatStat(newStats[stat])}`);
          break;
        case "intelligence":
          list.push(`§7Intelligence: ${formatStat(newStats[stat])}`);
          break;
        case "speed":
          list.push(`§7Speed: ${formatStat(newStats[stat])}`);
          break;
        case "bonus_attack_speed":
          list.push(`§7Bonus Attack Speed: ${formatStat(newStats[stat])}`);
          break;
        case "sea_creature_chance":
          list.push(`§7Sea Creature Chance: ${formatStat(newStats[stat])}%`);
          break;
        case "magic_find":
          list.push(`§7Magic Find: ${formatStat(newStats[stat])}`);
          break;
        case "pet_luck":
          list.push(`§7Pet Luck: ${formatStat(newStats[stat])}`);
          break;
        case "true_defense":
          list.push(`§7True Defense: ${formatStat(newStats[stat])}`);
          break;
        case "ability_damage":
          list.push(`§7Ability Damage: ${formatStat(newStats[stat])}%`);
          break;
        case "damage":
          list.push(`§7Damage: ${formatStat(newStats[stat])}`);
          break;
        case "ferocity":
          list.push(`§7Ferocity: ${formatStat(newStats[stat])}`);
          break;
        case "mining_speed":
          list.push(`§7Mining Speed: ${formatStat(newStats[stat])}`);
          break;
        case "mining_fortune":
          list.push(`§7Mining Fortune: ${formatStat(newStats[stat])}`);
          break;
        default:
          list.push(`§cUNKNOWN: ${stat}`);
          break;
      }
    }
    return list;
  }

  modifyStats(stats) {
    // no-op
  }

  modifyWeapon(weapon, name) {
    // no-op
  }

  modifyArmor(helmet, hName, chest, cName, legs, lName, boots, bName) {
    // no-op
  }
}

class Bee extends Pet {
  get stats() {
    return {
      strength: 5 + this.level * 0.25,
      intelligence: this.level * 0.5,
      speed: this.level * 0.1,
    };
  }

  get abilities() {
    const list = [this.first];
    if (this.rarity > 1) {
      list.push(this.second);
    }
    if (this.rarity > 3) {
      list.push(this.third);
    }
    return list;
  }

  get first() {
    const intMult =
      this.rarity > 3 ? 0.19 : this.rarity > 2 ? 0.14 : this.rarity > 1 ? 0.09 : this.rarity > 0 ? 0.04 : 0.02;
    const strMult =
      this.rarity > 3 ? 0.14 : this.rarity > 2 ? 0.11 : this.rarity > 1 ? 0.07 : this.rarity > 0 ? 0.04 : 0.02;
    return {
      name: "§6Hive",
      desc: [
        `§7Gain §b+${round(this.level * intMult + 1, 1)} ${symbols.intelligence} Intelligence §7and §c+${round(
          this.level * strMult + 1,
          1
        )} ${symbols.strength} Strength §7for each nearby bee.`,
        `§8Max 15 bees`,
      ],
    };
  }

  get second() {
    const mult = this.rarity > 2 ? 1 : 0.5;
    return {
      name: "§6Busy Buzz Buzz",
      desc: [`§7Has §a${round(this.level * mult, 1)}% §7chance for flowers to drop an extra one`],
    };
  }

  get third() {
    const mult = 0.2;
    return {
      name: "§6Weaponized Honey",
      desc: [`§7Gain §a${round(5 + this.level * mult, 1)}% §7of received damage as §6${symbols.health} Absorption`],
    };
  }

  modifyStats(stats) {
    const intMult =
      this.rarity > 3 ? 0.19 : this.rarity > 2 ? 0.14 : this.rarity > 1 ? 0.09 : this.rarity > 0 ? 0.04 : 0.02;
    const strMult =
      this.rarity > 3 ? 0.14 : this.rarity > 2 ? 0.11 : this.rarity > 1 ? 0.07 : this.rarity > 0 ? 0.04 : 0.02;
    stats["strength"] += round(this.level * strMult + 1, 1);
    stats["intelligence"] += round(this.level * intMult + 1, 1);
  }
}

class Chicken extends Pet {
  get stats() {
    return {
      health: this.level * 2,
    };
  }

  get abilities() {
    const list = [this.first];
    if (this.rarity > 1) {
      list.push(this.second);
    }
    if (this.rarity > 3) {
      list.push(this.third);
    }
    return list;
  }

  get first() {
    const mult = this.rarity > 2 ? 0.5 : this.rarity > 0 ? 0.4 : 0.3;
    return {
      name: "§6Light Feet",
      desc: [`§7Reduces fall damage by §a${round(this.level * mult, 1)}%`],
    };
  }

  get second() {
    const mult = this.rarity > 2 ? 1 : 0.8;
    return {
      name: "§6Eggstra",
      desc: [`§7Killing chickens has a §a${round(this.level * mult, 1)}% §7chance to drop an egg`],
    };
  }

  get third() {
    const mult = 0.3;
    return {
      name: "§6Mighty Chickens",
      desc: [`§7Chicken minions work §a${round(this.level * mult, 1)}% §7faster while on your island`],
    };
  }
}

class Elephant extends Pet {
  get stats() {
    return {
      intelligence: this.level * 0.75,
      health: this.level * 1,
    };
  }

  get abilities() {
    const list = [this.first];
    if (this.rarity > 1) {
      list.push(this.second);
    }
    if (this.rarity > 3) {
      list.push(this.third);
    }
    return list;
  }

  get first() {
    const mult = this.rarity > 2 ? 0.2 : this.rarity > 0 ? 0.15 : 0.1;
    return {
      name: "§6Stomp",
      desc: [
        `§7Gain §a${round(this.level * mult, 1)} ${symbols.defense} Defense §7for every §f100 ${symbols.speed} Speed`,
      ],
    };
  }

  get second() {
    const mult = 0.01;
    return {
      name: "§6Walking Fortress",
      desc: [
        `§7Gain §c${round(this.level * mult, 1)} ${symbols.health} Health §7for every §a10 ${symbols.defense} Defense`,
      ],
    };
  }

  get third() {
    const mult = 1.8;
    return {
      name: "§6Trunk Efficiency",
      desc: [
        `§7Grants §a+${round(this.level * mult, 1)} §6${
          symbols.farming_fortune
        } Farming Fortune§7, which increases your chance for multiple drops`,
      ],
    };
  }

  modifyStats(stats) {
    const fmult = this.rarity > 2 ? 0.2 : this.rarity > 0 ? 0.15 : 0.1;
    stats["defense"] += round((this.level * fmult * stats["speed"]) / 100, 1);
    if (this.rarity > 1) {
      const mult = 0.01;
      stats["health"] += round((this.level * mult * stats["defense"]) / 10, 1);
    }
    if (this.rarity > 3) {
      stats["farming fortune"] += round(this.level * 0.5);
    }
  }
}

class Pig extends Pet {
  get stats() {
    return {
      speed: this.level * 0.25,
    };
  }

  get abilities() {
    const list = [this.first, this.second];
    if (this.rarity > 1) {
      list.push(this.third);
    }
    if (this.rarity > 3) {
      list.push(this.fourth);
    }
    return list;
  }

  get first() {
    return {
      name: "§6Ridable",
      desc: [`§7Right-click your summoned pet to ride it!`],
    };
  }

  get second() {
    const mult = this.rarity > 2 ? 0.5 : this.rarity > 0 ? 0.4 : 0.3;
    return {
      name: "§6Run",
      desc: [`§7Increases the speed of your mount by §a${round(this.level * mult, 1)}%`],
    };
  }

  get third() {
    const mult = this.rarity > 2 ? 0.5 : 0.4;
    return {
      name: "§6Sprint",
      desc: [
        `§7While holding an Enchanted Carrot on a Stick, increase the speed of your mount by §a${round(
          this.level * mult,
          1
        )}%`,
      ],
    };
  }

  get fourth() {
    return {
      name: "§6Trample",
      desc: [`§7While on your private island, break all crops your pig rides over`],
    };
  }
}

class Rabbit extends Pet {
  get stats() {
    return {
      health: this.level * 1,
      speed: this.level * 0.2,
    };
  }

  get abilities() {
    const list = [this.first];
    if (this.rarity > 1) {
      list.push(this.second);
    }
    if (this.rarity > 3) {
      list.push(this.third);
    }
    return list;
  }

  get first() {
    const mult = this.rarity > 2 ? 0.5 : this.rarity > 1 ? 0.4 : 0.3;
    return {
      name: "§6Happy Feet ",
      desc: [`§7Jump Potions also give §a+${round(this.level * mult, 0)} §7speed`],
    };
  }

  get second() {
    const mult = this.rarity > 2 ? 0.3 : 0.25;
    return {
      name: "§6Farming Exp Boost ",
      desc: [`§7Boosts your Farming Exp by §a${round(this.level * mult, 1)}%`],
    };
  }

  get third() {
    const mult = 0.3;
    return {
      name: "§6Efficient Farming",
      desc: [`§7Farming minions work §a${round(this.level * mult, 1)}% §7faster while on your island.`],
    };
  }
}

class Armadillo extends Pet {
  get stats() {
    return {
      defense: this.level * 2,
    };
  }

  get abilities() {
    const list = [this.first, this.second, this.third];
    if (this.rarity > 1) {
      list.push(this.fourth);
    }
    if (this.rarity > 3) {
      list.push(this.fifth);
    }
    return list;
  }

  get first() {
    return {
      name: "§6Rideable",
      desc: [`§7Right-click on your summoned pet to ride it!`],
    };
  }

  get second() {
    return {
      name: "§6Tunneler",
      desc: [`§7The Armadillo breaks all stone or ore in it's path while you are riding it in the §3Crystal Hollows`],
    };
  }

  get third() {
    return {
      name: "§6Earth Surfer",
      desc: [`§7The Armadillo moves faster based on your §fSpeed`],
    };
  }

  get fourth() {
    const mult = this.rarity > 2 ? 0.3 : 0.2;
    return {
      name: "§6Rolling Miner",
      desc: [`§7Every §a${round(60 - this.level * mult, 1)} §7seconds, the next gemstone you mine gives 2x drops.`],
    };
  }

  get fifth() {
    const mult = 0.5;
    return {
      name: "§6Mobile Tank",
      desc: [
        `§7For every §a${round(100 - this.level * mult, 1)} §7Defense, gain §f+1 ${symbols.speed} Speed §7and §6+1 ${
          symbols.mining_speed
        } Mining Speed`,
      ],
    };
  }
}

class Bat extends Pet {
  get stats() {
    const stats = {
      intelligence: this.level * 1,
      speed: this.level * 0.05,
    };
    if (this.rarity > 4) {
      stats.sea_creature_chance = this.level * 0.05;
    }
    return stats;
  }

  get abilities() {
    const list = [this.first];
    if (this.rarity > 1) {
      list.push(this.second);
    }
    if (this.rarity > 3) {
      list.push(this.third);
    }
    if (this.rarity > 4) {
      list.push(this.fourth);
    }
    return list;
  }

  get first() {
    const mult = this.rarity > 2 ? 0.2 : this.rarity > 1 ? 0.15 : 0.1;
    return {
      name: "§6Candy Lover",
      desc: [`§7Increases the chance for mobs to drop Candy by §a${round(this.level * mult, 1)}%`],
    };
  }

  get second() {
    const mult_intel = this.rarity > 2 ? 0.5 : 0.4;
    const mult_speed = this.rarity > 2 ? 0.3 : 0.2;
    return {
      name: "§6Nightmare",
      desc: [
        `§7During night, gain §a${round(this.level * mult_intel, 1)} §9${symbols.intelligence} Intelligence, §a${round(
          this.level * mult_speed,
          1
        )} §f${symbols.speed} Speed§7, and night vision`,
      ],
    };
  }

  get third() {
    const mult = 0.5;
    return {
      name: "§6Wings of Steel",
      desc: [`§7Deals §a+${round(this.level * mult, 1)}% §7damage to §6Spooky §7enemies during the §6Spooky Festival`],
    };
  }

  get fourth() {
    const mult = 0.25;
    return {
      name: "§6Sonar",
      desc: [`§7+§a${round(this.level * mult, 1)}% §7chance to fish up spooky sea creatures`],
    };
  }
}

class Endermite extends Pet {
  get stats() {
    return {
      intelligence: this.level * 1,
    };
  }

  get abilities() {
    const list = [this.first];
    if (this.rarity > 1) {
      list.push(this.second);
    }
    if (this.rarity > 3) {
      list.push(this.third);
    }
    return list;
  }

  get first() {
    const mult = this.rarity > 1 ? 0.5 : this.rarity > 0 ? 0.4 : 0.3;
    return {
      name: "§6More Stonks",
      desc: [
        `§7Gain more exp orbs for breaking end stone and gain a +§a${round(
          this.level * mult,
          1
        )}% §7chance to get an extra block dropped.`,
      ],
    };
  }

  get second() {
    const mult = 0.05;
    return {
      name: "§6Pearl Muncher",
      desc: [`§7Upon picking up an ender pearl, consume it and gain §a${5 + round(this.level * mult, 1)} §6coins`],
    };
  }

  get third() {
    const mult = 0.4;
    return {
      name: "§6Pearl Powered",
      desc: [`§7Upon consuming an ender pearl, gain +§a${10 + round(this.level * mult, 1)} §7speed for 10 seconds`],
    };
  }
}

class MithrilGolem extends Pet {
  get stats() {
    return {
      true_defense: this.level * 0.5,
    };
  }

  get abilities() {
    const list = [this.first, this.second];
    if (this.rarity > 3) {
      list.push(this.third);
    }
    return list;
  }

  get first() {
    const mult = 1;
    return {
      name: "§6Mithril Affinity",
      desc: [`§7Gain +§a${round(this.level * mult, 1)} §6${symbols.mining_speed} Mining Speed §7when mining §eMithril`],
    };
  }

  get second() {
    const mult = 0.2;
    return {
      name: "§6The Smell Of Powder",
      desc: [`§7Gain +§a${round(this.level * mult, 1)}% §7more §2Mithril Powder`],
    };
  }

  get third() {
    const mult = 0.2;
    return {
      name: "§6Danger Averse",
      desc: [`§7Increases your combat stats by +§a${round(this.level * mult, 1)}% §7on mining islands`],
    };
  }
}

class Rock extends Pet {
  get stats() {
    return {
      defense: this.level * 2,
      true_defense: this.level * 0.1,
    };
  }

  get abilities() {
    const list = [this.first, this.second];
    if (this.rarity > 1) {
      list.push(this.third);
    }
    if (this.rarity > 3) {
      list.push(this.fourth);
    }
    return list;
  }

  get first() {
    return {
      name: "§6Ridable",
      desc: [`§7Right-click on your summoned pet to ride it!`],
    };
  }

  get second() {
    return {
      name: "§6Sailing Stone",
      desc: [`§7Sneak to move your rock to your location (15s cooldown)`],
    };
  }

  get third() {
    const mult = this.rarity > 2 ? 0.25 : 0.2;
    return {
      name: "§6Fortify",
      desc: [`§7While sitting on your rock, gain +§a${round(this.level * mult, 1)}% §7defense`],
    };
  }

  get fourth() {
    const mult = 0.3;
    return {
      name: "§6Steady Ground",
      desc: [`§7While sitting on your rock, gain +§a${round(this.level * mult, 1)}§7% damage`],
    };
  }
}

class Scatha extends Pet {
  get stats() {
    return {
      defense: this.level * 1,
      mining_speed: this.level * 1,
    };
  }

  get abilities() {
    const list = [this.first];
    if (this.rarity > 1) {
      list.push(this.second);
    }
    if (this.rarity > 3) {
      list.push(this.third);
    }
    return list;
  }

  get first() {
    const mult = this.rarity > 2 ? 1.25 : 1;
    return {
      name: "§6Grounded",
      desc: [`§7Gain §6+${round(this.level * mult - 0.01, 1)}${symbols.mining_fortune} Mining Fortune§7`],
    };
  }

  get second() {
    const mult = this.rarity > 2 ? 0.03 : 0.025;
    return {
      name: "§6Burrowing",
      desc: [`§7Grants a §a+${round(this.level * mult, 1)}% §7chance to find treasure while mining`],
    };
  }

  get third() {
    const mult = 1;
    return {
      name: "§6Wormhole",
      desc: [`§7Gives a §a${round(this.level * mult, 1)}% §7to mine 2 adjacent stone or hard stone`],
    };
  }
}

class Silverfish extends Pet {
  get stats() {
    return {
      defense: this.level * 1,
      health: this.level * 0.2,
    };
  }

  get abilities() {
    const list = [this.first];
    if (this.rarity > 1) {
      list.push(this.second);
    }
    if (this.rarity > 3) {
      list.push(this.third);
    }
    return list;
  }

  get first() {
    const mult = this.rarity > 2 ? 0.15 : this.rarity > 0 ? 0.1 : 0.05;
    return {
      name: "§6True Defense Boost",
      desc: [`§7Boosts your §f${symbols.true_defense} True Defense §7by §a${floor(this.level * mult, 1)}`],
    };
  }

  get second() {
    const mult = this.rarity > 2 ? 0.3 : 0.25;
    return {
      name: "§6Mining Exp Boost",
      desc: [`§7Boosts your Mining exp by §a${round(this.level * mult, 1)}%`],
    };
  }

  get third() {
    return {
      name: "§6Dexterity",
      desc: [`§7Gives permanent haste III`],
    };
  }

  modifyStats(stats) {
    const mult = this.rarity > 2 ? 0.15 : this.rarity > 0 ? 0.1 : 0.05;
    stats["true defense"] += floor(this.level * mult, 1);
  }
}

class WitherSkeleton extends Pet {
  get stats() {
    return {
      crit_chance: this.level * 0.05,
      intelligence: this.level * 0.25,
      crit_damage: this.level * 0.25,
      defense: this.level * 0.25,
      strength: this.level * 0.25,
    };
  }

  get abilities() {
    const list = [this.first];
    if (this.rarity > 1) {
      list.push(this.second);
    }
    if (this.rarity > 3) {
      list.push(this.third);
    }
    return list;
  }

  get first() {
    const mult = this.rarity > 2 ? 0.3 : this.rarity > 1 ? 0.1 : 0.05;
    return {
      name: "§6Stronger Bones",
      desc: [`§7Take §a${round(this.level * mult, 1)}% §7less damage from skeletons`],
    };
  }

  get second() {
    const mult = 0.25;
    return {
      name: "§6Wither Blood",
      desc: [`§7Deal §a${round(this.level * mult, 1)}% §7more damage to wither mobs`],
    };
  }

  get third() {
    const mult = 2;
    return {
      name: "§6Death's Touch",
      desc: [
        `§7Upon hitting an enemy inflict the wither effect for §a${round(
          this.level * mult,
          1
        )}% §7damage over 3 seconds`,
        `§8Does not stack`,
      ],
    };
  }
}

class Bal extends Pet {
  get stats() {
    return {
      ferocity: this.level * 0.1,
      strength: this.level * 0.25,
    };
  }

  get abilities() {
    const list = [this.first];
    if (this.rarity > 1) {
      list.push(this.second);
    }
    if (this.rarity > 3) {
      list.push(this.third);
    }
    return list;
  }

  get first() {
    return {
      name: "§6Protective Skin",
      desc: [`§7§7Gives §cheat immunity.`],
    };
  }

  get second() {
    const mult = 0.1;
    return {
      name: "§6Fire Whip",
      desc: [
        `§7Every §a5s §7while in combat the Balrog will strike nearby enemies with his fire whip dealing §c${round(
          this.level * mult,
          1
        )}% §7of your damage as §ftrue damage.`,
      ],
    };
  }

  get third() {
    const mult = 0.15;
    return {
      name: "§6Made of Lava",
      desc: [`§7Gain §a${round(this.level * mult, 1)}% §7on ALL stats when inside the §cMagma Fields.`],
    };
  }
}

class BlackCat extends Pet {
  get stats() {
    return {
      speed: this.level * 0.25,
      intelligence: this.level * 1,
    };
  }

  get abilities() {
    const list = [this.first];
    if (this.rarity > 1) {
      list.push(this.second);
    }
    if (this.rarity > 3) {
      list.push(this.third);
    }
    return list;
  }

  get first() {
    const mult = 1;
    return {
      name: "§6Hunter",
      desc: [`§7Increases your speed and speed cap by +§a${round(this.level * mult, 1)}`],
    };
  }

  get second() {
    const mult = 0.15;
    return {
      name: "§6Omen",
      desc: [`§7Grants §d${floor(this.level * mult, 1)} ${symbols.pet_luck} Pet Luck`],
    };
  }

  get third() {
    const mult = 0.15;
    return {
      name: "§6Supernatural",
      desc: [`§7Grants §b${floor(this.level * mult, 1)} ${symbols.magic_find} Magic Find`],
    };
  }

  modifyStats(stats) {
    const mult = 0.15;
    stats["pet luck"] += floor(this.level * mult, 1);
    stats["magic find"] += floor(this.level * mult, 1);
  }
}

class Blaze extends Pet {
  get stats() {
    return {
      intelligence: this.level * 1,
      defense: 10 + this.level * 0.2,
    };
  }

  get abilities() {
    const list = [this.first];
    if (this.rarity > 1) {
      list.push(this.second);
    }
    if (this.rarity > 3) {
      list.push(this.third);
    }
    return list;
  }

  get first() {
    const mult = 0.1;
    return {
      name: "§6Nether Embodiment",
      desc: [`§7Increases all stats by §a${round(this.level * mult, 1)}% §7while on the Blazing Fortress`],
    };
  }

  get second() {
    const mult = 0.4;
    return {
      name: "§6Bling Armor",
      desc: [`§7Upgrades §cBlaze Armor §7stats and ability by §a${round(this.level * mult, 1)}%`],
    };
  }

  get third() {
    return {
      name: "§6Fusion-Style Potato",
      desc: [`§7Doubles effects of hot potato books`],
    };
  }

  modifyArmor(helmet, hName, chest, cName, legs, lName, boots, bName) {
    // Third perk double HPB
    if (this.rarity > 3) {
      // This is required since double HPB are not saved in the API when the player is offline
      if (helmet?.extra?.hpbs > 0) {
        helmet.stats.defense += 2 * helmet.extra.hpbs;
        helmet.stats.health += 4 * helmet.extra.hpbs;
        helmet.extra.hpbs *= 2;
      }
      if (chest?.extra?.hpbs > 0) {
        chest.stats.defense += 2 * chest.extra.hpbs;
        chest.stats.health += 4 * chest.extra.hpbs;
        chest.extra.hpbs *= 2;
      }
      if (legs?.extra?.hpbs > 0) {
        legs.stats.defense += 2 * legs.extra.hpbs;
        legs.stats.health += 4 * legs.extra.hpbs;
        legs.extra.hpbs *= 2;
      }
      if (boots?.extra?.hpbs > 0) {
        boots.stats.defense += 2 * boots.extra.hpbs;
        boots.stats.health += 4 * boots.extra.hpbs;
        boots.extra.hpbs *= 2;
      }
    }

    // Fixing blaze + frozen blaze armors bonus stats
    const mult = 1 + round(this.level * 0.4, 1) / 100;

    if (hName.includes("BLAZE_HELMET")) {
      for (const stat in helmet.stats) {
        helmet.stats[stat] = round(helmet.stats[stat] * mult, 1);
      }
    }
    if (cName.includes("BLAZE_CHESTPLATE")) {
      for (const stat in chest.stats) {
        chest.stats[stat] = round(chest.stats[stat] * mult, 1);
      }
    }
    if (lName.includes("BLAZE_LEGGINGS")) {
      for (const stat in legs.stats) {
        legs.stats[stat] = round(legs.stats[stat] * mult, 1);
      }
    }
    if (bName.includes("BLAZE_BOOTS")) {
      for (const stat in boots.stats) {
        boots.stats[stat] = round(boots.stats[stat] * mult, 1);
      }
    }
  }
}

class EnderDragon extends Pet {
  get stats() {
    return {
      strength: this.level * 0.5,
      crit_chance: this.level * 0.1,
      crit_damage: this.level * 0.5,
    };
  }

  get abilities() {
    const list = [this.first];
    if (this.rarity > 1) {
      list.push(this.second);
    }
    if (this.rarity > 3) {
      list.push(this.third);
    }
    return list;
  }

  get first() {
    const mult = 0.25;
    return {
      name: "§6End Strike",
      desc: [`§7Deal §a${round(this.level * mult, 1)}% §7more damage to end mobs`],
    };
  }

  get second() {
    return {
      name: "§6One With The Dragon",
      desc: [
        `§7Buffs the Aspect of the Dragons sword by §a${round(this.level * 0.5, 1)} §c${
          symbols.strength
        } Damage and §a${round(this.level * 0.3, 1)} §c${symbols.strength} Strength`,
      ],
    };
  }

  get third() {
    const mult = 0.1;
    return {
      name: "§6Superior",
      desc: [`§7Increases all stats by §a${round(this.level * mult, 1)}%`],
    };
  }

  modifyStats(stats) {
    if (this.rarity > 3) {
      const mult = 0.1;
      for (const stat in stats) {
        stats[stat] *= 1 + round(this.level * mult, 1) / 100;
      }
    }
  }

  modifyWeapon(weapon, name) {
    if (name == "ASPECT_OF_THE_DRAGON") {
      weapon.stats["damage"] += round(this.level * 0.5, 1);
      weapon.stats["strength"] += round(this.level * 0.3, 1);
    }
  }
}

class GoldenDragon extends Pet {
  get stats() {
    const stats = {};
    if (this.level >= 100) {
      stats.strength = round(Math.max(0, this.level - 100) * 0.25 + 25 - 0.01, 0);
      stats.magic_find = round(floor(this.level / 10) * 0.5);
      stats.bonus_attack_speed = round(Math.max(0, this.level - 100) * 0.25 + 25 - 0.01, 0);
    }
    return stats;
  }

  get abilities() {
    const list = [];
    if (this.level < 100) {
      list.push(this.hatching_first);
      list.push(this.hatching_second);
    } else {
      list.push(this.first);
      list.push(this.second);
      list.push(this.third);
      list.push(this.fourth);
    }
    return list;
  }

  get hatching_first() {
    return {
      name: "§7Perks",
      desc: [`§c§l???`],
    };
  }

  get hatching_second() {
    return {
      name: "§7Hatches at level §b100",
      desc: [""],
    };
  }

  get first() {
    const value = Math.max(0, this.level - 100) * 0.5 + 50;
    return {
      name: "§6Gold's Power",
      desc: [`§7Adds §c+${round(value, 1)} ${symbols.strength} Strength §7to all §6golden §7weapons`],
    };
  }

  get second() {
    return {
      name: "§6Shining Scales",
      desc: [
        `§7For each digit in your §6gold collection §7gain §c+10 ${symbols.strength} Strength §7and §b+2 ${symbols.magic_find} Magic Find`,
      ],
    };
  }

  get third() {
    const value = Math.max(0, this.level - 100) * 0.2 + 20;
    return {
      name: "§6Dragon's Greed",
      desc: [
        `§7Gain §a${round(value, 1)}% §7of your §b${symbols.magic_find} Magic Find §7as §c${symbols.strength} Strength`,
      ],
    };
  }

  get fourth() {
    const value = this.level * 0.00125;

    return {
      name: "§6Legendary Treasure",
      desc: [`§7Gain §c${round(value, 4)}% §7damage for every milion coins in your bank`],
    };
  }
}

class Enderman extends Pet {
  get stats() {
    return {
      crit_damage: this.level * 0.75,
    };
  }

  get abilities() {
    const list = [this.first];
    if (this.rarity > 1) {
      list.push(this.second);
    }
    if (this.rarity > 3) {
      list.push(this.third);
    }
    if (this.rarity > 4) {
      list.push(this.fourth);
    }
    return list;
  }

  get first() {
    const mult = this.rarity > 2 ? 0.3 : this.rarity > 0 ? 0.2 : 0.1;
    return {
      name: "§6Enderian",
      desc: [`§7Take §a${round(this.level * mult, 1)}% §7less damage from end monsters`],
    };
  }

  get second() {
    const mult = this.rarity > 2 ? 0.5 : 0.4;
    return {
      name: "§6Teleport Savvy",
      desc: [
        `§7Buffs the Aspect of the End ability granting §a${round(
          this.level * mult,
          1
        )} §7weapon damage for 5s on use.`,
      ],
    };
  }

  get third() {
    const mult = 0.25;
    return {
      name: "§6Zealot Madness",
      desc: [`§7Increases your odds to find a special Zealot by §a${round(this.level * mult, 1)}%.`],
    };
  }

  get fourth() {
    const mult = 0.4;
    return {
      name: "§6Enderman Slayer",
      desc: [`§7Gain +§a${round(this.level * mult, 1)}% §7more combat xp from endermen`],
    };
  }
}

class Ghoul extends Pet {
  get stats() {
    return {
      intelligence: this.level * 0.75,
      health: this.level * 1,
      ferocity: this.level * 0.05,
    };
  }

  get abilities() {
    const list = [this.first];
    if (this.rarity > 1) {
      list.push(this.second);
    }
    if (this.rarity > 3) {
      list.push(this.third);
    }
    return list;
  }

  get first() {
    const mult = this.rarity > 2 ? 0.25 : this.rarity > 1 ? 0.25 : 0.1;
    return {
      name: "§6Amplified Healing",
      desc: [`§7Increase all healing by §a${round(this.level * mult, 1)}%`],
    };
  }

  get second() {
    const mult = this.rarity > 2 ? 0.5 : 0.1;
    return {
      name: "§6Zombie Arm",
      desc: [`§7Increase the health and range of the Zombie sword by §a${round(this.level * mult, 1)}%`],
    };
  }

  get third() {
    const mult = 1;
    return {
      name: "§6Reaper Soul",
      desc: [`§7Increases the health and lifespan of the Reaper Scythe zombies by §a${round(this.level * mult, 1)}%`],
    };
  }
}

class Golem extends Pet {
  get stats() {
    return {
      health: this.level * 1.5,
      strength: this.level * 0.5,
    };
  }

  get abilities() {
    const list = [this.first];
    if (this.rarity > 1) {
      list.push(this.second);
    }
    if (this.rarity > 3) {
      list.push(this.third);
    }
    return list;
  }

  get first() {
    const mult = 0.3;
    return {
      name: "§6Last Stand",
      desc: [`§7While less than 15% HP, deal §a${round(this.level * mult, 1)}% §7more damage`],
    };
  }

  get second() {
    const mult = this.rarity > 3 ? 0.25 : 0.2;
    return {
      name: "§6Ricochet",
      desc: [
        `§7Your iron plating causes §a${round(this.level * mult, 1)}% §7of attacks to ricochet and hit the attacker`,
      ],
    };
  }

  get third() {
    const mult = 3;
    return {
      name: "§6Toss",
      desc: [
        `§7Every 5 hits, throw the enemy up into the air and deal ${
          200 + round(this.level * mult, 1)
        }% damage (10s cooldown)`,
      ],
    };
  }
}

class Griffin extends Pet {
  get stats() {
    return {
      strength: this.level * 0.25,
      crit_chance: this.level * 0.1,
      crit_damage: this.level * 0.5,
      intelligence: this.level * 0.1,
      magic_find: this.level * 0.1,
    };
  }

  get abilities() {
    const list = [this.first];
    if (this.rarity > 0) {
      list.push(this.second);
    }
    if (this.rarity > 2) {
      list.push(this.third);
    }
    if (this.rarity > 3) {
      list.push(this.fourth);
    }
    return list;
  }

  get first() {
    return {
      name: "§6Odyssey",
      desc: [
        `§2Mythological creatures §7you find and burrows you dig scale in §cdifficulty §7and §6rewards §7based on your equipped Griffin's rarity.`,
      ],
    };
  }

  get second() {
    const regen = this.rarity > 3 ? "VII" : this.rarity > 1 ? "VI" : "V";
    const strength = this.rarity > 2 ? "VIII" : "VII";
    return {
      name: "§6Legendary Constitution",
      desc: [`§7Permanent §cRegeneration ${regen} §7and §4Strength ${strength}§7.`],
    };
  }

  get third() {
    const mult = this.rarity > 3 ? 0.2 : 0.1625;
    return {
      name: "§6Perpetual Empathy",
      desc: [
        `§7Heal nearby players for §a${round(this.level * mult, 0)}% §7of the final damage you receive.`,
        `§8Excludes other griffins.`,
      ],
    };
  }

  get fourth() {
    return {
      name: "§6King of Kings",
      desc: [
        `§7Gain §c+${round(1 + this.level * 0.14, 1)}% §c${symbols.strength} Strength §7when above §c85% §7health.`,
      ],
    };
  }
}

class Guardian extends Pet {
  get stats() {
    return {
      intelligence: this.level * 1,
      defense: this.level * 0.5,
    };
  }

  get abilities() {
    const list = [this.first];
    if (this.rarity > 1) {
      list.push(this.second);
    }
    if (this.rarity > 3) {
      list.push(this.third);
    }
    return list;
  }

  get first() {
    // let mult = this.rarity > 2 ? 0.2 : this.rarity > 2 ? 0.15 : this.rarity > 1 ? 0.1 : this.rarity > 0 ? 0.06 : 0.02;
    const mult = this.rarity > 3 ? 0.2 : this.rarity > 2 ? 0.15 : this.rarity > 1 ? 0.1 : this.rarity > 0 ? 0.04 : 0.02;
    return {
      name: "§6Lazerbeam",
      desc: [
        `§7Zap your enemies for §b${round(this.level * mult, 1)}x §7your §b${
          symbols.intelligence
        } Intelligence §7every §a3s`,
      ],
    };
  }

  get second() {
    const mult = this.rarity > 2 ? 0.3 : 0.25;
    return {
      name: "§6Enchanting Exp Boost",
      desc: [`§7Boosts your Enchanting exp by §a${round(this.level * mult, 1)}%`],
    };
  }

  get third() {
    const mult = 0.3;
    return {
      name: "§6Mana Pool",
      desc: [`§7Regenerate §b${round(this.level * mult, 1)}% §7extra mana, doubled when near or in water`],
    };
  }
}

class Horse extends Pet {
  get stats() {
    return {
      intelligence: this.level * 0.5,
      speed: this.level * 0.25,
    };
  }

  get abilities() {
    const list = [this.first];
    if (this.rarity > 1) {
      list.push(this.second);
    }
    if (this.rarity > 3) {
      list.push(this.third);
    }
    return list;
  }

  get first() {
    return {
      name: "§6Ridable",
      desc: [`§7Right-click your summoned pet to ride it!`],
    };
  }

  get second() {
    const mult = this.rarity > 2 ? 1.2 : 1.1;
    return {
      name: "§6Run",
      desc: [`§7Increase the speed of your mount by §a${round(this.level * mult, 1)}%`],
    };
  }

  get third() {
    const mult = 0.25;
    return {
      name: "§6Ride Into Battle",
      desc: [`§7When riding your horse, gain +§a${round(this.level * mult, 1)}% §7bow damage`],
    };
  }
}

class Hound extends Pet {
  get stats() {
    return {
      strength: this.level * 0.4,
      bonus_attack_speed: this.level * 0.15,
      ferocity: this.level * 0.05,
    };
  }

  get abilities() {
    const list = [this.first];
    if (this.rarity > 1) {
      list.push(this.second);
    }
    if (this.rarity > 3) {
      list.push(this.third);
    }
    return list;
  }

  get first() {
    const mult = 0.05;
    return {
      name: "§6Scavenger",
      desc: [`§7Gain +§a${round(this.level * mult, 1)} §7coins per monster kill`],
    };
  }

  get second() {
    const mult = 0.1;
    return {
      name: "§6Finder",
      desc: [`§7Increases the chance for monsters to drop their armor by §a${round(this.level * mult, 1)}%`],
    };
  }

  get third() {
    const mult = 0.1;
    return {
      name: "§6Fury Claws",
      desc: [`§7Grants ${round(this.level * mult, 1)}	§e${symbols.bonus_attack_speed} Bonus Attack Speed`],
    };
  }

  modifyStats(stats) {
    if (this.rarity > 3) {
      const mult = 0.1;
      stats["attack speed"] += round(this.level * mult, 1);
    }
  }
}

class MagmaCube extends Pet {
  get stats() {
    return {
      health: this.level * 0.5,
      defense: this.level * 0.33,
      strength: this.level * 0.2,
    };
  }

  get abilities() {
    const list = [this.first];
    if (this.rarity > 1) {
      list.push(this.second);
    }
    if (this.rarity > 3) {
      list.push(this.third);
    }
    return list;
  }

  get first() {
    const mult = this.rarity > 2 ? 0.3 : this.rarity > 1 ? 0.25 : 0.2;
    return {
      name: "§6Slimy Minions",
      desc: [`§7Slime minions work §a${round(this.level * mult, 1)}% §7faster while on your island`],
    };
  }

  get second() {
    const mult = 0.2;
    return {
      name: "§6Salt Blade",
      desc: [`§7Deal §a${round(this.level * mult, 1)}% §7more damage to slimes`],
    };
  }

  get third() {
    const mult = 0.5;
    return {
      name: "§6Hot Ember",
      desc: [`§7Buffs the stats of Ember Armor by §a${round(this.level * mult, 1)}%`],
    };
  }

  modifyArmor(helmet, hName, chest, cName, legs, lName, boots, bName) {
    if (this.rarity <= 3) {
      return;
    }
    const mult = 1 + round(this.level, 1) / 100;
    if (hName.includes("EMBER")) {
      for (const stat in helmet.stats) {
        helmet.stats[stat] = round(helmet.stats[stat] * mult, 1);
      }
    }
    if (cName.includes("EMBER")) {
      for (const stat in chest.stats) {
        chest.stats[stat] = round(chest.stats[stat] * mult, 1);
      }
    }
    if (lName.includes("EMBER")) {
      for (const stat in legs.stats) {
        legs.stats[stat] = round(legs.stats[stat] * mult, 1);
      }
    }
    if (bName.includes("EMBER")) {
      for (const stat in boots.stats) {
        boots.stats[stat] = round(boots.stats[stat] * mult, 1);
      }
    }
  }
}

class Phoenix extends Pet {
  get stats() {
    return {
      strength: 10 + this.level * 0.5,
      intelligence: 50 + this.level * 1,
    };
  }

  get abilities() {
    const list = [this.first, this.second];
    if (this.rarity > 3) {
      list.push(this.third);
      list.push(this.fourth);
    }
    return list;
  }

  get first() {
    const start_strength = this.rarity > 3 ? 15 : 10;
    const mult_strength = this.rarity > 3 ? 0.15 : 0.1;
    const mult_time = 0.02;
    return {
      name: "§6Rekindle",
      desc: [
        `§7Before death, become §eimmune §7and gain §c${start_strength + round(this.level * mult_strength, 1)} ${
          symbols.strength
        } Strength §7for ${2 + round(this.level * mult_time, 1)} §7seconds`,
        `§73 minutes cooldown`,
      ],
    };
  }

  get second() {
    const mult_damage = this.rarity > 3 ? 0.14 : 0.12;
    const mult_time = 0.04;
    return {
      name: "§6Fourth Flare",
      desc: [
        `§7On 4th melee strike, §6ignite §7mobs, dealing §c${1 + round(this.level * mult_damage, 1)}x §7your §9${
          symbols.crit_damage
        } Crit Damage §7each second for §a${2 + floor(this.level * mult_time, 0)} §7seconds`,
      ],
    };
  }

  get third() {
    return {
      name: "§6Magic Bird",
      desc: [`§7You may always fly on your private island`],
    };
  }

  get fourth() {
    return {
      name: "§6Eternal Coins",
      desc: [`§7Don't lose coins from death.`],
    };
  }
}

class Pigman extends Pet {
  get stats() {
    return {
      strength: this.level * 0.5,
      defense: this.level * 0.5,
      ferocity: this.level * 0.05,
    };
  }

  get abilities() {
    const list = [this.first];
    if (this.rarity > 1) {
      list.push(this.second);
    }
    if (this.rarity > 3) {
      list.push(this.third);
    }
    return list;
  }

  get first() {
    const mult = 0.3;
    return {
      name: "§6Bacon Farmer",
      desc: [`§7Pig minions work §a${round(this.level * mult, 1)}% §7faster while on your island`],
    };
  }

  get second() {
    const mult_damage = 0.4;
    const mult_strength = 0.25;
    return {
      name: "§6Pork Master",
      desc: [
        `§7Buffs the Pigman sword by §a${round(this.level * mult_damage, 1)} §c${
          symbols.strength
        } Damage and §7§a${round(this.level * mult_strength, 1)} §c${symbols.strength} Strength`,
      ],
    };
  }

  get third() {
    const mult = 0.25;
    return {
      name: "§6Giant Slayer",
      desc: [`§7Deal §a${round(this.level * mult, 1)}% §7extra damage to monsters level 100 and up`],
    };
  }
}

class Rat extends Pet {
  get stats() {
    return {
      strength: this.level * 0.5,
      crit_damage: this.level * 0.1,
      health: this.level,
    };
  }

  get abilities() {
    const list = [this.first];
    if (this.rarity > 1) {
      list.push(this.second);
    }
    if (this.rarity > 3) {
      list.push(this.third);
    }
    return list;
  }

  get first() {
    return {
      name: "§6Morph",
      desc: [`§7Right-click your summoned pet to morph into it!`],
    };
  }

  get second() {
    return {
      name: "§6CHEESE!",
      desc: [`§7As a Rat, you smell §e§lCHEESE §r§7nearby! Yummy!`],
    };
  }

  get third() {
    const mult_mf = 0.05;
    const mult_time = 0.2;
    return {
      name: "§6Rat's Blessing",
      desc: [
        `§7Has a chance to grant a random player §b+${floor(2 + this.level * mult_mf, 1)} ${
          symbols.magic_find
        } Magic Find §7for §a${round(
          20 + this.level * mult_time,
          0
        )} §7seconds after finding a yummy piece of Cheese! If the player gets a drop during this buff, you have a §a20% §7to get it too.`,
      ],
    };
  }
}

class SkeletonHorse extends Pet {
  get stats() {
    return {
      speed: this.level * 0.5,
      intelligence: this.level * 1,
    };
  }

  get abilities() {
    const list = [this.first];
    if (this.rarity > 1) {
      list.push(this.second);
    }
    if (this.rarity > 3) {
      list.push(this.third);
    }
    return list;
  }

  get first() {
    return {
      name: "§6Ridable",
      desc: [`§7Right-click your summoned pet to ride it!`],
    };
  }

  get second() {
    const mult = this.rarity > 2 ? 1.5 : 0.1;
    return {
      name: "§6Run",
      desc: [`§7Increase the speed of your mount by §a${round(this.level * mult, 1)}%`],
    };
  }

  get third() {
    const mult = 0.4;
    return {
      name: "§6Ride Into Battle",
      desc: [`§7When riding your horse, gain +§a${round(this.level * mult, 1)}% §7bow damage`],
    };
  }
}

class Skeleton extends Pet {
  get stats() {
    return {
      crit_chance: this.level * 0.15,
      crit_damage: this.level * 0.3,
    };
  }

  get abilities() {
    const list = [this.first];
    if (this.rarity > 1) {
      list.push(this.second);
    }
    if (this.rarity > 3) {
      list.push(this.third);
    }
    return list;
  }

  get first() {
    const mult = this.rarity > 2 ? 0.2 : this.rarity > 0 ? 0.15 : 0.1;
    return {
      name: "§6Bone Arrows",
      desc: [`§7Increase arrow damage by §a${round(this.level * mult, 1)}% §7which is tripled while in dungeons`],
    };
  }

  get second() {
    const mult = this.rarity > 2 ? 0.2 : 0.17;
    return {
      name: "§6Combo",
      desc: [
        `§7Gain a combo stack for every bow hit granting +§a3 §c${symbols.strength} Strength§7. Max §a${round(
          this.level * mult,
          1
        )} §7stacks, stacks disappear after 8 seconds`,
      ],
    };
  }

  get third() {
    return {
      name: "§6Skeletal Defense",
      desc: [
        `§7Your skeleton shoots an arrow dealing §a30x §7your §9${symbols.crit_damage} Crit Damage §7when a mob gets close to you (5s cooldown)`,
      ],
    };
  }
}

class Snowman extends Pet {
  get stats() {
    return {
      damage: this.level * 0.25,
      strength: this.level * 0.25,
      crit_damage: this.level * 0.25,
    };
  }

  get abilities() {
    const list = [this.first];
    if (this.rarity > 1) {
      list.push(this.second);
    }
    if (this.rarity > 3) {
      list.push(this.third);
    }
    return list;
  }

  get first() {
    const mult = 0.04;
    return {
      name: "§6Blizzard",
      desc: [`§7Slow all enemies within §a${4 + round(this.level * mult, 1)} §7blocks`],
    };
  }

  get second() {
    const mult = 0.15;
    return {
      name: "§6Frostbite",
      desc: [
        `§7Your freezing aura slows enemy attacks causing you to take §a${floor(
          this.level * mult,
          1
        )}% §7reduced damage`,
      ],
    };
  }

  get third() {
    return {
      name: "§6Snow Cannon",
      desc: [
        `§7Your snowman fires a snowball dealing §a5x §7your §c${symbols.strength} Strength §7when a mob gets close to you (1s cooldown)`,
      ],
    };
  }
}

class Spider extends Pet {
  get stats() {
    return {
      strength: this.level * 0.1,
      crit_chance: this.level * 0.1,
    };
  }

  get abilities() {
    const list = [this.first];
    if (this.rarity > 1) {
      list.push(this.second);
    }
    if (this.rarity > 3) {
      list.push(this.third);
    }
    return list;
  }

  get first() {
    const mult = 0.1;
    return {
      name: "§6One With The Spider",
      desc: [
        `§7Gain §a${round(this.level * mult, 1)} §c${symbols.strength} Strength §7for every nearby spider`,
        `§8Max 10 spiders`,
      ],
    };
  }

  get second() {
    const mult = 0.4;
    return {
      name: "§6Web-weaver",
      desc: [`§7Upon hitting a monster it becomes slowed by §a${round(this.level * mult, 1)}%`],
    };
  }

  get third() {
    const mult = 0.3;
    return {
      name: "§6Spider Whisperer",
      desc: [`§7Spider and tarantula minions work §a${round(this.level * mult, 1)}% §7faster while on your island`],
    };
  }
}

class Spirit extends Pet {
  get stats() {
    return {
      intelligence: this.level * 1,
      speed: this.level * 0.3,
    };
  }

  get abilities() {
    const list = [this.first];
    if (this.rarity > 1) {
      list.push(this.second);
    }
    if (this.rarity > 3) {
      list.push(this.third);
    }
    return list;
  }

  get first() {
    return {
      name: "§6Spirit Assistance",
      desc: [`§7Spawns and assists you when you are ghost in dungeons.`],
    };
  }

  get second() {
    const mult = 0.45;
    return {
      name: "§6Spirit Cooldowns",
      desc: [`§7Reduces the cooldown of your ghost abilities in dungeons by §a${round(5 + this.level * mult, 1)}%§7.`],
    };
  }

  get third() {
    return {
      name: "§6Half Life",
      desc: [
        `§7If you are the first player to die in a dungeon, the score penalty for that death is reduced to §a1§7.`,
      ],
    };
  }
}

class Tarantula extends Pet {
  get stats() {
    return {
      crit_chance: this.level * 0.1,
      crit_damage: this.level * 0.3,
      strength: this.level * 0.1,
    };
  }

  get abilities() {
    const list = [this.first];
    if (this.rarity > 1) {
      list.push(this.second);
    }
    if (this.rarity > 3) {
      list.push(this.third);
    }
    return list;
  }

  get first() {
    const mult = 0.3;
    return {
      name: "§6Webbed Cells",
      desc: [`§7Anti-healing is §a${round(this.level * mult, 1)}% §7less effective against you`],
    };
  }

  get second() {
    const mult = 0.5;
    return {
      name: "§6Eight Legs",
      desc: [`§7Decreases the mana cost of Spider, Tarantula and Thorn's boots by §a${round(this.level * mult, 1)}%`],
    };
  }

  get third() {
    const mult = 0.4;
    return {
      name: "§6Arachnid Slayer",
      desc: [`§7Gain +§a${round(this.level * mult, 1)}% §7more combat xp from spiders`],
    };
  }
}

class Tiger extends Pet {
  get stats() {
    return {
      strength: 5 + this.level * 0.1,
      crit_chance: this.level * 0.05,
      crit_damage: this.level * 0.5,
      ferocity: this.level * 0.25,
    };
  }

  get abilities() {
    const list = [this.first];
    if (this.rarity > 1) {
      list.push(this.second);
    }
    if (this.rarity > 3) {
      list.push(this.third);
    }
    return list;
  }

  get first() {
    const mult = this.rarity > 2 ? 0.3 : this.rarity > 0 ? 0.2 : 0.1;
    return {
      name: "§6Merciless Swipe",
      desc: [`§7Gain 	§c+${round(this.level * mult, 1)}% ${symbols.ferocity} Ferocity.`],
    };
  }

  get second() {
    const mult = this.rarity > 2 ? 0.55 : 0.3;
    return {
      name: "§6Hemorrhage",
      desc: [`§7Melee attacks reduce healing by §6${round(this.level * mult, 1)}% §7for §a10s`],
    };
  }

  get third() {
    const mult = 0.2;
    return {
      name: "§6Apex Predator",
      desc: [
        `§7Deal §c+${round(this.level * mult, 1)}% §7damage against targets with no other mobs within §a15 §7blocks`,
      ],
    };
  }

  modifyStats(stats) {
    const mult = this.rarity > 2 ? 0.3 : this.rarity > 0 ? 0.2 : 0.1;
    stats.ferocity += round(this.level * mult, 1);
  }
}

class Turtle extends Pet {
  get stats() {
    return {
      health: this.level * 0.5,
      defense: this.level * 1,
    };
  }

  get abilities() {
    const list = [this.first];
    if (this.rarity > 1) {
      list.push(this.second);
    }
    if (this.rarity > 3) {
      list.push(this.third);
      list.push(this.fourth);
    }
    return list;
  }

  get first() {
    const mult = 0.3;
    return {
      name: "§6Turtle Tactics",
      desc: [`§7Gain §a+${round(this.level * mult, 1)}% ${symbols.defense} Defense`],
    };
  }

  get second() {
    const defense = this.rarity > 3 ? round(5 + this.level * 0.25, 1) : round(4.95 + this.level * 0.15, 1);
    return {
      name: "§6Genius Amniote",
      desc: [
        `§7Grants §a+${defense} ${symbols.defense} Defense §7for every player around you, up to 4 nearby players.`,
      ],
    };
  }

  get third() {
    return {
      name: "§6Unflippable",
      desc: [`§7Gain §aimmunity §7to knockback`],
    };
  }

  get fourth() {
    const bonus = this.level * 0.25;
    return {
      name: "§6Turtle Shell",
      desc: [`§7When under §c33% §7maximum HP, you take §a${bonus}% §7less damage.`],
    };
  }

  modifyStats(stats) {
    const mult = 0.3;
    stats["defense"] *= round(this.level * mult, 1) / 100;
  }
}

class Wolf extends Pet {
  get stats() {
    return {
      health: this.level * 0.5,
      crit_damage: this.level * 0.1,
      speed: this.level * 0.2,
      true_defense: this.level * 0.1,
    };
  }

  get abilities() {
    const list = [this.first];
    if (this.rarity > 1) {
      list.push(this.second);
    }
    if (this.rarity > 3) {
      list.push(this.third);
    }
    return list;
  }

  get first() {
    const mult = this.rarity > 2 ? 0.3 : this.rarity > 1 ? 0.2 : 0.1;
    return {
      name: "§6Alpha Dog",
      desc: [`§7Take §a${round(this.level * mult, 1)}% §7less damage from wolves`],
    };
  }

  get second() {
    const mult = this.rarity > 2 ? 0.15 : 0.1;
    return {
      name: "§6Pack Leader",
      desc: [
        `§7Gain §a${round(this.level * mult, 1)} §9 ${
          symbols.crit_damage
        } Crit Damage §7for every nearby wolf monsters`,
        `§8Max 10 wolves`,
      ],
    };
  }

  get third() {
    const mult = 0.3;
    return {
      name: "§6Combat Exp Boost",
      desc: [`§7Boosts your Combat exp by §a${round(this.level * mult, 1)}%`],
    };
  }
}

class GrandmaWolf extends Pet {
  get stats() {
    return {
      health: this.level * 1,
      strength: this.level * 0.25,
    };
  }

  get abilities() {
    const list = [this.first];
    return list;
  }

  get first() {
    return {
      name: "§6Kill Combo",
      desc: [
        `§7Gain buffs for combo kills. Effects stack as you increase your combo.`,
        ``,
        `§a5 Combo §8(lasts §a${Math.floor((8 + this.level * 0.02) * 10) / 10}s§8)`,
        `§8+§b3% §b${symbols.magic_find} Magic Find`,
        `§a10 Combo §8(lasts §a${Math.floor((6 + this.level * 0.02) * 10) / 10}s§8)`,
        `§8+§610 §7coins per kill`,
        `§a15 Combo §8(lasts §a${Math.floor((4 + this.level * 0.02) * 10) / 10}s§8)`,
        `§8+§b3% §b${symbols.magic_find} Magic Find`,
        `§a20 Combo §8(lasts §a${Math.floor((3 + this.level * 0.02) * 10) / 10}s§8)`,
        `§8+§315% §7Combat Exp`,
        `§a25 Combo §8(lasts §a${Math.floor((3 + this.level * 0.01) * 10) / 10}s§8)`,
        `§8+§b3% §b${symbols.magic_find} Magic Find`,
        `§a30 Combo §8(lasts §a${Math.floor((2 + this.level * 0.01) * 10) / 10}s§8)`,
        `§8+§610 §7coins per kill`,
      ],
    };
  }
}

class Zombie extends Pet {
  get stats() {
    return {
      crit_damage: this.level * 0.3,
      health: this.level * 1,
    };
  }

  get abilities() {
    const list = [this.first];
    if (this.rarity > 1) {
      list.push(this.second);
    }
    if (this.rarity > 3) {
      list.push(this.third);
    }
    return list;
  }

  get first() {
    const mult = this.rarity > 2 ? 0.25 : this.rarity > 1 ? 0.2 : 0.1;
    return {
      name: "§6Chomp",
      desc: [`§7Gain +§a${round(this.level * mult, 1)} §7hp per zombie kill`],
    };
  }

  get second() {
    const mult = 0.25;
    return {
      name: "§6Rotten Blade",
      desc: [`§7Deal §a${round(this.level * mult, 1)}% §7more damage to zombies`],
    };
  }

  get third() {
    const mult = 0.2;
    return {
      name: "§6Living Dead",
      desc: [`§7Increases the defense of all undead armor sets by §a${round(this.level * mult, 1)}%`],
    };
  }
}

class Giraffe extends Pet {
  get stats() {
    return {
      health: this.level * 1,
      crit_chance: this.level * 0.05,
    };
  }

  get abilities() {
    const list = [this.first];
    if (this.rarity > 1) {
      list.push(this.second);
    }
    if (this.rarity > 3) {
      list.push(this.third);
    }
    return list;
  }

  get first() {
    const mult = this.rarity > 3 ? 0.25 : this.rarity > 2 ? 0.2 : this.rarity > 1 ? 0.15 : 0.1;
    return {
      name: "§6Good Heart",
      desc: [`§7Regen §c${round(this.level * mult, 1)} ${symbols.health} §7per second`],
    };
  }

  get second() {
    const strMult = this.rarity > 2 ? 0.5 : 0.4;
    const cdMult = this.rarity > 3 ? 0.4 : this.rarity > 2 ? 0.25 : 0.1;
    return {
      name: "§6Higher Ground",
      desc: [
        `§7Grants §c+${round(this.level * strMult, 1)} ${symbols.strength} Strength §7and §9+${round(
          this.level * cdMult + 20,
          1
        )} ${symbols.crit_damage} Crit Damage §7when mid air or jumping`,
      ],
    };
  }

  get third() {
    const mult = 0.25;
    return {
      name: "§6Long Neck",
      desc: [`§7See enemies from afar and gain §a${round(this.level * mult, 1)}% §7dodge chance`],
    };
  }
}

class Lion extends Pet {
  get stats() {
    return {
      strength: this.level * 0.5,
      speed: this.level * 0.25,
      ferocity: this.level * 0.05,
    };
  }

  get abilities() {
    const list = [this.first];
    if (this.rarity > 1) {
      list.push(this.second);
    }
    if (this.rarity > 3) {
      list.push(this.third);
    }
    return list;
  }

  get first() {
    const mult =
      this.rarity > 3 ? 0.2 : this.rarity > 2 ? 0.15 : this.rarity > 1 ? 0.1 : this.rarity > 0 ? 0.05 : 0.025;
    return {
      name: "§6Primal Force",
      desc: [`§7Adds §c+${round(this.level * mult, 1)} ${symbols.strength} Damage §7to your weapons`],
    };
  }

  get second() {
    const mult = this.rarity > 2 ? 1 : 0.75;
    return {
      name: "§6First Pounce",
      desc: [
        `§7First Strike, Triple-Strike, and §d§lCombo §r§7are §a${round(this.level * mult, 1)}% §7more effective.`,
      ],
    };
  }

  get third() {
    const mult = 0.15;
    return {
      name: "§6King of the Jungle",
      desc: [
        `§7Deal §c+${round(this.level * mult, 1)}% ${symbols.strength} Damage §7against mobs that have attacked you.`,
      ],
    };
  }
}

class Monkey extends Pet {
  get stats() {
    return {
      speed: this.level * 0.2,
      intelligence: this.level * 0.5,
    };
  }

  get abilities() {
    const list = [this.first];
    if (this.rarity > 1) {
      list.push(this.second);
    }
    if (this.rarity > 3) {
      list.push(this.third);
    }
    return list;
  }

  get first() {
    const mult = this.rarity > 2 ? 0.6 : this.rarity > 0 ? 0.5 : 0.4;
    return {
      name: "§6Treeborn",
      desc: [
        `§7Grants §a+${round(this.level * mult, 1)} §6${
          symbols.foraging_fortune
        } Foraging Fortune§7, which increases your chance at double logs`,
      ],
    };
  }

  get second() {
    const mult = this.rarity > 2 ? 1 : 0.8;
    return {
      name: "§6Vine Swing",
      desc: [`§7Gain +§a${round(this.level * mult, 1)}	§f${symbols.speed} Speed §7while in The Park`],
    };
  }

  get third() {
    const mult = 0.5;
    return {
      name: "§6Evolved Axes",
      desc: [`§7Reduce the cooldown of Jungle Axe and Treecapitator by §a${round(this.level * mult, 1)}%`],
    };
  }

  modifyStats(stats) {
    const mult = this.rarity > 2 ? 0.6 : this.rarity > 0 ? 0.5 : 0.4;
    if (this.rarity > 3) {
      stats["foraging fortune"] += round(this.level * mult);
    }
  }
}

class Ocelot extends Pet {
  get stats() {
    return {
      speed: this.level * 0.5,
      ferocity: this.level * 0.1,
    };
  }

  get abilities() {
    const list = [this.first];
    if (this.rarity > 1) {
      list.push(this.second);
    }
    if (this.rarity > 3) {
      list.push(this.third);
    }
    return list;
  }

  get first() {
    const mult = this.rarity > 2 ? 0.3 : 0.25;
    return {
      name: "§6Foraging Exp Boost",
      desc: [`§7Boosts your Foraging exp by §a${round(this.level * mult, 1)}%`],
    };
  }

  get second() {
    const mult = 0.3;
    return {
      name: "§6Tree Hugger",
      desc: [`§7Foraging minions work §a${round(this.level * mult, 1)}% §7faster while on your island`],
    };
  }

  get third() {
    const mult = 0.3;
    return {
      name: "§6Tree Essence",
      desc: [`§7Gain a §a${round(this.level * mult, 1)}% §7chance to get exp from breaking a log`],
    };
  }
}

class BabyYeti extends Pet {
  get stats() {
    return {
      intelligence: this.level * 0.75,
      strength: this.level * 0.4,
    };
  }

  get abilities() {
    const list = [this.first, this.second];
    if (this.rarity > 3) {
      list.push(this.third);
    }
    return list;
  }

  get first() {
    const mult = 0.5;
    return {
      name: "§6Cold Breeze",
      desc: [
        `§7Gives §a${round(this.level * mult, 1)} §c${symbols.strength} Strength §7and §9${
          symbols.crit_damage
        } Crit Damage §7when near snow`,
      ],
    };
  }

  get second() {
    const mult = this.rarity > 3 ? 0.75 : 0.5;
    return {
      name: "§6Ice Shields",
      desc: [`§7Gain §a${floor(this.level * mult, 1)}% §7of your strength as §a${symbols.defense} Defense`],
    };
  }

  get third() {
    const mult = 1;
    return {
      name: "§6Yeti Fury",
      desc: [
        `§7Buff the Yeti sword by §a${round(this.level * mult, 1)} §c${symbols.strength} Damage §7and §9${
          symbols.intelligence
        } Intelligence`,
      ],
    };
  }

  modifyStats(stats) {
    if (this.rarity > 2) {
      const mult = 1;
      stats["defense"] += (round(this.level * mult, 1) / 100) * stats["strength"];
    }
  }
}

class BlueWhale extends Pet {
  get stats() {
    return {
      health: this.level * 2,
    };
  }

  get abilities() {
    const list = [this.first];
    if (this.rarity > 1) {
      list.push(this.second);
    }
    if (this.rarity > 3) {
      list.push(this.third);
    }
    return list;
  }

  get first() {
    const mult = this.rarity > 3 ? 2.5 : this.rarity > 2 ? 2 : this.rarity > 1 ? 1.5 : this.rarity > 0 ? 1 : 0.5;
    return {
      name: "§6Ingest",
      desc: [`§7All potions heal §c+${round(this.level * mult, 1)} ${symbols.health}`],
    };
  }

  get second() {
    const mult = 0.01;
    const health = this.rarity > 3 ? "20.0" : this.rarity > 2 ? "25.0" : "30.0";
    return {
      name: "§6Bulk",
      desc: [
        `§7Gain §a${round(this.level * mult, 1)} ${symbols.defense} Defense §7per §c${health} Max ${
          symbols.health
        } Health`,
      ],
    };
  }

  get third() {
    const mult = 0.2;
    return {
      name: "§6Archimedes",
      desc: [`§7Gain §c+${round(this.level * mult, 1)}% Max ${symbols.health} Health`],
    };
  }

  modifyStats(stats) {
    if (this.rarity > 1) {
      const mult = 0.01;
      const health = this.rarity > 3 ? 20 : this.rarity > 2 ? 25 : 30;
      stats["defense"] += round((this.level * mult * stats["health"]) / health, 1);
    }
    if (this.rarity > 3) {
      const mult = 0.2;
      stats["health"] *= 1 + round((this.level * mult) / 100, 1);
    }
  }
}

class Ammonite extends Pet {
  get stats() {
    return {
      sea_creature_chance: this.level * 0.07,
    };
  }

  get abilities() {
    const list = [this.first];
    if (this.rarity > 1) {
      list.push(this.second);
    }
    if (this.rarity > 3) {
      list.push(this.third);
    }
    return list;
  }

  get first() {
    return {
      name: "§6Heart of the Sea",
      desc: [
        `§7Each Heart of the Mountain level grants §3+${round(this.level * 0.01, 1)} ${
          symbols.sea_creature_chance
        } Sea Creature Chance`,
      ],
    };
  }

  get second() {
    return {
      name: "§6Not a Snail",
      desc: [
        `§7Each fishing and mining level grants §f+${round(this.level * 0.02, 1)} ${
          symbols.speed
        } Speed §7and §a+${round(this.level * 0.02, 1)} ${symbols.defense} Defense`,
      ],
    };
  }

  get third() {
    return {
      name: "§6Gift of the Ammonite",
      desc: [`§7Increases your fishing speed by §a${round(this.level * 0.006, 1)}% §7for each mining level`],
    };
  }
}

class Dolphin extends Pet {
  get stats() {
    return {
      sea_creature_chance: this.level * 0.05,
      intelligence: this.level * 1,
    };
  }

  get abilities() {
    const list = [this.first];
    if (this.rarity > 1) {
      list.push(this.second);
    }
    if (this.rarity > 3) {
      list.push(this.third);
    }
    return list;
  }

  get first() {
    const mult = this.rarity > 2 ? 0.05 : this.rarity > 0 ? 0.04 : 0.03;
    const max = this.rarity > 2 ? 25 : this.rarity > 0 ? 20 : 15;
    return {
      name: "§6Pod Tactics",
      desc: [
        `§7Increases your fishing speed by §a${round(
          this.level * mult,
          1
        )}% §7for each nearby player within 10 blocks up to §a${max}%`,
      ],
    };
  }

  get second() {
    const mult = this.rarity > 2 ? 0.1 : 0.07;
    return {
      name: "§6Echolocation",
      desc: [`§7Increases sea creatures catch chance by §a${round(this.level * mult, 1)}%`],
    };
  }

  get third() {
    return {
      name: "§6Splash Surprise",
      desc: [`§7Stun sea creatures for §a5s §7after fishing them up`],
    };
  }

  modifyStats(stats) {
    if (this.rarity > 1) {
      const mult = this.rarity > 2 ? 0.1 : 0.07;
      stats["sea creature chance"] *= 1 + round((this.level * mult) / 100, 1);
    }
  }
}

class FlyingFish extends Pet {
  get stats() {
    return {
      defense: this.level * 0.5,
      strength: this.level * 0.5,
    };
  }

  get abilities() {
    const list = [this.first];
    if (this.rarity > 1) {
      list.push(this.second);
    }
    if (this.rarity > 3) {
      list.push(this.third);
    }
    return list;
  }

  get first() {
    const mult = this.rarity > 2 ? 0.4 : 0.3;
    return {
      name: "§6Quick Reel",
      desc: [`§7Increases fishing speed by §a${round(this.level * mult, 1)}%`],
    };
  }

  get second() {
    const mult = this.rarity > 2 ? 0.5 : 0.4;
    return {
      name: "§6Water Bender",
      desc: [
        `§7Gives §a${round(this.level * mult, 1)} §c${symbols.strength} Strength §7and §a${
          symbols.defense
        } Defense §7when near water`,
      ],
    };
  }

  get third() {
    const mult = 0.3;
    return {
      name: "§6Deep Sea Diver",
      desc: [`§7Increases the stats of Diver Armor by §a${round(this.level * mult, 1)}%`],
    };
  }

  modifyArmor(helmet, hName, chest, cName, legs, lName, boots, bName) {
    if (this.rarity > 3) {
      const mult = 1 + round(this.level * 0.3, 1) / 100;
      if (hName.includes("DIVERS")) {
        for (const stat in helmet.stats) {
          helmet.stats[stat] = round(helmet.stats[stat] * mult, 1);
        }
      }
      if (cName.includes("DIVERS")) {
        for (const stat in chest.stats) {
          chest.stats[stat] = round(chest.stats[stat] * mult, 1);
        }
      }
      if (lName.includes("DIVERS")) {
        for (const stat in legs.stats) {
          legs.stats[stat] = round(legs.stats[stat] * mult, 1);
        }
      }
      if (bName.includes("DIVERS")) {
        for (const stat in boots.stats) {
          boots.stats[stat] = round(boots.stats[stat] * mult, 1);
        }
      }
    }
  }
}

class Megalodon extends Pet {
  get stats() {
    return {
      strength: this.level * 0.5,
      magic_find: this.level * 0.1,
      ferocity: this.level * 0.05,
    };
  }

  get abilities() {
    const list = [this.first];
    if (this.rarity > 1) {
      list.push(this.second);
    }
    if (this.rarity > 3) {
      list.push(this.third);
    }
    return list;
  }

  get first() {
    const mult = 0.25;
    return {
      name: "§6Blood Scent",
      desc: [
        `§7Deal up to §c+${round(mult * this.level, 1)}% ${
          symbols.strength
        } §7Damage based on the enemy's missing health`,
      ],
    };
  }

  get second() {
    const mult = 0.2;
    return {
      name: "§6Enhanced scales",
      desc: [`§7Increases the stats of Shark Armor by §a${round(mult * this.level, 1)}%`],
    };
  }

  get third() {
    const mult = 0.5;
    return {
      name: "§6Feeding frenzy",
      desc: [
        `§7On kill gain §c${round(mult * this.level, 1)} ${symbols.strength} Damage §7and §f${
          symbols.speed
        } Speed §7for 5 seconds`,
      ],
    };
  }

  modifyArmor(helmet, hName, chest, cName, legs, lName, boots, bName) {
    if (this.rarity > 1) {
      const mult = 1 + round(this.level * 0.2, 1) / 100;
      if (hName.includes("SHARK")) {
        for (const stat in helmet.stats) {
          helmet.stats[stat] = round(helmet.stats[stat] * mult, 1);
        }
      }
      if (cName.includes("SHARK")) {
        for (const stat in chest.stats) {
          chest.stats[stat] = round(chest.stats[stat] * mult, 1);
        }
      }
      if (lName.includes("SHARK")) {
        for (const stat in legs.stats) {
          legs.stats[stat] = round(legs.stats[stat] * mult, 1);
        }
      }
      if (bName.includes("SHARK")) {
        for (const stat in boots.stats) {
          boots.stats[stat] = round(boots.stats[stat] * mult, 1);
        }
      }
    }
  }
}

class Squid extends Pet {
  get stats() {
    return {
      health: this.level * 0.5,
      intelligence: this.level * 0.5,
    };
  }

  get abilities() {
    const list = [this.first];
    if (this.rarity > 1) {
      list.push(this.second);
    }
    if (this.rarity > 3) {
      list.push(this.third);
    }
    return list;
  }

  get first() {
    const mult = this.rarity > 2 ? 1 : this.rarity > 0 ? 0.75 : 0.5;
    return {
      name: "§6More Ink",
      desc: [`§7Gain a §a${round(this.level * mult, 1)}% §7chance to get double drops from squids`],
    };
  }

  get second() {
    const mult_damage = this.rarity > 2 ? 0.4 : 0.3;
    const mult_strength = this.rarity > 2 ? 0.2 : 0.1;
    return {
      name: "§6Ink Specialty",
      desc: [
        `§7Buffs the Ink Wand by §a${round(this.level * mult_damage, 1)} §c${symbols.strength} Damage §7and §a${round(
          this.level * mult_strength,
          1
        )} §c${symbols.strength} Strength`,
      ],
    };
  }

  get third() {
    const mult = 0.3;
    return {
      name: "§6Fishing Exp Boost",
      desc: [`§7Boosts your Fishing exp by §a${round(this.level * mult, 1)}%`],
    };
  }
}

class Jellyfish extends Pet {
  get stats() {
    return {
      health: this.level * 2,
    };
  }

  get abilities() {
    const list = [this.first];
    if (this.rarity > 1) {
      list.push(this.second);
    }
    if (this.rarity > 3) {
      list.push(this.third);
    }
    return list;
  }

  get first() {
    const healthRegen = round(this.level, 1);
    const manaCost = round(this.level * 0.5, 1);
    return {
      name: "§6Radiant Regeneration",
      desc: [
        `§7While in dungeons, increase your base health regen by §a${healthRegen}% §7and reduces the mana cost of Power Orbs by §a${manaCost}%§7.`,
      ],
    };
  }

  get second() {
    const time = round(this.level * 0.01, 2);
    return {
      name: "§6Stored Energy",
      desc: [
        `§7While in dungeons, for every §c2,000 HP §7you heal teammates the cooldown of §aWish §7is reduced by §a${time}s§7, up to §a30s§7.`,
      ],
    };
  }

  get third() {
    const percent = round(this.level * 0.5, 1);
    return {
      name: "§6Powerful Potions",
      desc: [`§7While in dungeons, increase the effectiveness of Dungeon Potions by §a${percent}%`],
    };
  }
}

class Parrot extends Pet {
  get stats() {
    return {
      crit_damage: this.level * 0.1,
      intelligence: this.level * 1,
    };
  }

  get abilities() {
    const list = [this.first];
    if (this.rarity > 1) {
      list.push(this.second);
    }
    if (this.rarity > 3) {
      list.push(this.third);
      list.push(this.fourth);
    }
    return list;
  }

  get first() {
    const mult = this.rarity > 3 ? 0.2 : 0.15;
    return {
      name: "§6Flamboyant",
      desc: [`§7Adds §a${Math.max(round(this.level * mult, 0), 1)} §7levels to intimidation accessories`],
    };
  }

  get second() {
    const mult = 0.35;
    return {
      name: "§6Repeat",
      desc: [`§7Boosts potion duration by §a${round(5 + this.level * mult, 1)}%`],
    };
  }

  get third() {
    const mult = 0.25;
    return {
      name: "§6Bird Discourse",
      desc: [
        `§7Gives §c+${round(5 + this.level * mult, 1)} ${symbols.strength} Strength §7to players within §a20 §7blocks`,
        `§7Doesn't stack`,
      ],
    };
  }

  get fourth() {
    return {
      name: "§6Parrot Feather Infusion",
      desc: [
        `§7When summoned or in your pets menu, boost the duration of consumed §cGod Potions §7by §a${round(
          this.level * 0.2,
          1
        )}%`,
      ],
    };
  }
}

class Sheep extends Pet {
  get stats() {
    return {
      ability_damage: this.level * 0.2,
      intelligence: this.level * 1,
    };
  }

  get abilities() {
    const list = [this.first];
    if (this.rarity > 1) {
      list.push(this.second);
    }
    if (this.rarity > 3) {
      list.push(this.third);
    }
    return list;
  }

  get first() {
    const mult = this.rarity > 2 ? 0.2 : this.rarity > 1 ? 0.125 : 0.05;
    return {
      name: "§6Mana Saver",
      desc: [`§7Reduces the mana cost of abilities by §a${round(this.level * mult, 1)}%`],
    };
  }

  get second() {
    const mult = 0.1;
    return {
      name: "§6Overheal",
      desc: [`§7Gives a §a${round(this.level * mult, 1)}% §7shield after not taking damage for 10s`],
    };
  }

  get third() {
    const mult = 0.25;
    return {
      name: "§6Dungeon Wizard",
      desc: [`§7Increases your total mana by §a${round(this.level * mult, 1)}% §7while in dungeons`],
    };
  }
}

class Jerry extends Pet {
  get stats() {
    return {
      intelligence: this.level * -1,
    };
  }

  get abilities() {
    const list = [this.first, this.second];
    if (this.rarity > 3) {
      list.push(this.third);
    }
    if (this.rarity > 4) {
      list.push(this.fourth);
    }
    return list;
  }

  get first() {
    const mult = 50;
    return {
      name: "§6Jerry",
      desc: [`§7Gain §a${round(mult, 1)}% §7chance to deal your regular damage`],
    };
  }

  get second() {
    const mult = 100;
    return {
      name: "§6Jerry",
      desc: [`§7Gain §a${round(mult, 1)}% §7chance to receive a normal amount of drops from mobs`],
    };
  }

  get third() {
    const mult = this.level > 4 ? 0.5 : 0.1;
    return {
      name: "§6Jerry",
      desc: [`§7Actually adds §c${Math.floor(this.level * mult)} damage §7to the Aspect of the Jerry`],
    };
  }

  get fourth() {
    return {
      name: "§6Jerry",
      desc: [`§7Tiny chance to find Jerry Candies when killing mobs`],
    };
  }
}

class Bingo extends Pet {
  get stats() {
    const baseHealth = this.rarity > 1 ? 27.5 : 25;
    const baseStrength = this.rarity > 1 ? 5.5 : 5;
    const multHealth = this.rarity > 1 ? (140 - 27.5) / 100 : (100 - 25) / 100;
    const multStrength = this.rarity > 1 ? (25 - 5) / 100 : (35 - 5.5) / 100;
    return {
      health: floor(baseHealth + this.level * multHealth),
      strength: floor(baseStrength + this.level * multStrength),
    };
  }

  get abilities() {
    const list = [this.first];
    if (this.rarity > 0) {
      list.push(this.second);
    }
    if (this.rarity > 1) {
      list.push(this.third);
    }
    if (this.rarity > 2) {
      list.push(this.fourth);
    }
    return list;
  }

  get first() {
    const prc = floor(5 + this.level * 0.2, 1);
    return {
      name: "§6Lucky Looting",
      desc: [`§7Gain §c${prc}% §7more collection items from any source!`],
    };
  }

  get second() {
    const prc = floor(5 + this.level * 0.1, 1);
    return {
      name: "§6Fast Learner",
      desc: [`§7Gain §c${prc}% §7more Skill Experience and §9Slayer §7Experience.`],
    };
  }

  get third() {
    const prc = floor(10 + this.level * 0.3, 1);
    return {
      name: "§6Chimera",
      desc: [`§7Increases your base stats of your active pet by §c${prc}% §7per level.`],
    };
  }

  get fourth() {
    const coins = round(0.1 + this.level * 0.009, 1);
    return {
      name: "§6Scavenger",
      desc: [`§7Gain §c${coins} §7more §l§6Coins §r§7per monster level on kill.`],
    };
  }
}

class QuestionMark extends Pet {
  get stats() {
    return {};
  }

  get abilities() {
    const list = [this.first];
    if (this.rarity > 1) {
      list.push(this.second);
    }
    if (this.rarity > 3) {
      list.push(this.third);
    }
    return list;
  }

  get first() {
    return {
      name: "§6???",
      desc: [`§7???`],
    };
  }

  get second() {
    return {
      name: "§6???",
      desc: [`§7???`],
    };
  }

  get third() {
    return {
      name: "§6???",
      desc: [`§7???`],
    };
  }
}

export const petStats = {
  "???": QuestionMark,
  AMMONITE: Ammonite,
  ARMADILLO: Armadillo,
  BABY_YETI: BabyYeti,
  BAL: Bal,
  BAT: Bat,
  BEE: Bee,
  BINGO: Bingo,
  BLACK_CAT: BlackCat,
  BLAZE: Blaze,
  BLUE_WHALE: BlueWhale,
  CHICKEN: Chicken,
  DOLPHIN: Dolphin,
  ELEPHANT: Elephant,
  ENDER_DRAGON: EnderDragon,
  ENDERMAN: Enderman,
  ENDERMITE: Endermite,
  FLYING_FISH: FlyingFish,
  GHOUL: Ghoul,
  GIRAFFE: Giraffe,
  GOLDEN_DRAGON: GoldenDragon,
  GOLEM: Golem,
  GRANDMA_WOLF: GrandmaWolf,
  GRIFFIN: Griffin,
  GUARDIAN: Guardian,
  HORSE: Horse,
  HOUND: Hound,
  JELLYFISH: Jellyfish,
  JERRY: Jerry,
  LION: Lion,
  MAGMA_CUBE: MagmaCube,
  MEGALODON: Megalodon,
  MITHRIL_GOLEM: MithrilGolem,
  MONKEY: Monkey,
  OCELOT: Ocelot,
  PARROT: Parrot,
  PHOENIX: Phoenix,
  PIG: Pig,
  PIGMAN: Pigman,
  RABBIT: Rabbit,
  RAT: Rat,
  ROCK: Rock,
  SCATHA: Scatha,
  SHEEP: Sheep,
  SILVERFISH: Silverfish,
  SKELETON_HORSE: SkeletonHorse,
  SKELETON: Skeleton,
  SNOWMAN: Snowman,
  SPIDER: Spider,
  SPIRIT: Spirit,
  SQUID: Squid,
  TARANTULA: Tarantula,
  TIGER: Tiger,
  TURTLE: Turtle,
  WITHER_SKELETON: WitherSkeleton,
  WOLF: Wolf,
  ZOMBIE: Zombie,
};

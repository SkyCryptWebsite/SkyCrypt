import { SYMBOLS } from "../../common/constants.js";
import { round, floor, ceil, convertHMS, titleCase } from "../helper.js";

const UPGRADE_TYPES = {
  mithril_powder: {
    name: "Mithril Powder",
    color: "2",
  },
  gemstone_powder: {
    name: "Gemstone Powder",
    color: "d",
  },
  token_of_the_mountain: {
    name: "Token of the Mountain",
    color: "5",
  },
  free: {
    name: "FREE",
    color: "a",
  },
};

const rewards = {
  hotm: {
    1: {
      token_of_the_mountain: 1,
    },
    2: {
      token_of_the_mountain: 2,
      access_to_forge: 0,
      new_forgeable_items: 0,
    },
    3: {
      token_of_the_mountain: 2,
      forge_slot: 1,
      new_forgeable_items: 0,
      access_crystal_hollows: 0,
      emissary_braum_crystal_hollows: 0,
    },
    4: {
      token_of_the_mountain: 2,
      forge_slot: 1,
      new_forgeable_items: 0,
    },
    5: {
      token_of_the_mountain: 2,
      new_forgeable_items: 0,
    },
    6: {
      token_of_the_mountain: 2,
      new_forgeable_items: 0,
    },
    7: {
      token_of_the_mountain: 3,
      new_forgeable_items: 0,
    },
  },
  potm: {
    1: {
      pickaxe_ability_level: 1,
      token_of_the_mountain: 1,
      skyblock_experience: 25,
    },
    2: {
      forge_slot: 1,
      skyblock_experience: 35,
    },
    3: {
      commission_slot: 1,
      skyblock_experience: 50,
    },
    4: {
      mithril_powder_when_mining_mithril: 1,
      skyblock_experience: 65,
    },
    5: {
      token_of_the_mountain: 1,
      skyblock_experience: 75,
    },
    6: {
      gemstone_powder_when_mining_gemstones: 2,
      skyblock_experience: 100,
    },
    7: {
      token_of_the_mountain: 1,
      skyblock_experience: 125,
    },
  },
  rewards: {
    token_of_the_mountain: {
      formatted: "§5Token of the Mountain",
      qtyColor: "5",
    },
    access_to_forge: {
      formatted: "§eAccess to the Forge",
      qtyColor: "e",
    },
    new_forgeable_items: {
      formatted: "§eNew Forgeable Items",
      qtyColor: "e",
    },
    forge_slot: {
      formatted: "§aForge Slot",
      qtyColor: "a",
    },
    access_crystal_hollows: {
      formatted: "§dAccess to the §5Crystal Hollows",
      qtyColor: "d",
    },
    emissary_braum_crystal_hollows: {
      formatted: "§eEmissary Braum §f- §bCrystal Hollows",
      qtyColor: "e",
    },
    pickaxe_ability_level: {
      formatted: "§cPickaxe Ability Level",
      qtyColor: "c",
    },
    commission_slot: {
      formatted: "§aCommission Slot",
      qtyColor: "a",
    },
    mithril_powder_when_mining_mithril: {
      formatted: "§2Mithril Powder §7when mining §fMithril",
      qtyColor: "2",
    },
    gemstone_powder_when_mining_gemstones: {
      formatted: "§dGemstone Powder §7when mining §dGemstones",
      qtyColor: "d",
    },
    skyblock_experience: {
      formatted: "§bSkyblock XP",
      qtyColor: "b",
    },
  },
};

const nodeNames = {
  mining_speed_2: "Mining Speed II",
  powder_buff: "Powder Buff",
  mining_fortune_2: "Mining Fortune II",
  vein_seeker: "Vein Seeker",
  lonesome_miner: "Lonesome Miner",
  professional: "Professional",
  mole: "Mole",
  fortunate: "Fortunate",
  great_explorer: "Great Explorer",
  maniac_miner: "Maniac Miner",
  goblin_killer: "Goblin Killer",
  special_0: "Peak of the Mountain",
  star_powder: "Star Powder",
  daily_effect: "Sky Mall",
  mining_madness: "Mining Madness",
  mining_experience: "Seasoned Mineman",
  efficient_miner: "Efficient Miner",
  experience_orbs: "Orbiter",
  front_loaded: "Front Loaded",
  precision_mining: "Precision Mining",
  random_event: "Luck of the Cave",
  daily_powder: "Daily Powder",
  fallen_star_bonus: "Crystallized",
  mining_speed_boost: "Mining Speed Boost",
  titanium_insanium: "Titanium Insanium",
  mining_fortune: "Mining Fortune",
  forge_time: "Quick Forge",
  pickaxe_toss: "Pickobulus",
  mining_speed: "Mining Speed",
};

/*
.##.....##..#######..########.##.....##
.##.....##.##.....##....##....###...###
.##.....##.##.....##....##....####.####
.#########.##.....##....##....##.###.##
.##.....##.##.....##....##....##.....##
.##.....##.##.....##....##....##.....##
.##.....##..#######.....##....##.....##
*/

class HotM {
  constructor(tier, level) {
    this.tier = tier;
    this.level = level.level;
    this.progress = level.progress;
    this.levelWithProgress = level.levelWithProgress;
    this.xp = level.xp;
    this.xpCurrent = level.xpCurrent;
    this.xpForNext = level.xpForNext;
  }

  get lore() {
    const output = [];

    // name
    output.push(this.displayName, "");

    // main
    if (this.status === "unlocked") {
      output.push(
        "§7You have unlocked this tier. All perks and abilities on this tier are available for unlocking with §5Token of the Mountain§7.",
        ""
      );
    } else {
      output.push(
        "§7Progress through your Heart of the Mountain by gaining §5HotM Exp§7, which is earned through completing §aCommissions§7.",
        "",
        "§7Commissions are tasks given by the §e§lKing§r§7 in the §bRoyal Palace§7. Complete them to earn bountiful rewards!",
        ""
      );
    }

    // progress
    if (this.status === "next") {
      const progress = round(this.progress * 100);
      const greenBars = ceil(progress / 5);
      const whiteBars = 20 - greenBars;
      output.push(
        `§7Progress: §e${progress}%`,
        `${"§2-".repeat(greenBars)}${"§f-".repeat(
          whiteBars
        )} §e${this.xpCurrent.toLocaleString()} §6/ §e${this.xpForNext.toLocaleString()}`,
        ""
      );
    }

    // rewards
    output.push("§7Rewards");
    for (const [reward, qty] of Object.entries(rewards.hotm[this.tier])) {
      const quantity = qty > 0 ? `§${rewards.rewards[reward].qtyColor}${qty} ` : "";
      const name = rewards.rewards[reward].formatted;
      output.push(`§8+ ${quantity}${name}`);
    }
    output.push("");

    // status
    output.push(this.status === "unlocked" ? "§aUNLOCKED" : "§cLOCKED");

    return output;
  }

  get displayName() {
    const color = this.status === "unlocked" ? "a" : this.status === "next" ? "e" : "c";
    return `§${color}Tier ${this.tier}`;
  }

  get status() {
    if (this.tier <= this.level) {
      return "unlocked";
    }

    if (this.tier === ceil(this.levelWithProgress)) {
      return "next";
    }

    return "locked";
  }

  get itemData() {
    const data = {
      locked: "160:14",
      next: "160:4",
      unlocked: "160:5",
    };

    return {
      id: parseInt(data[this.status].split(":")[0], 10),
      Damage: parseInt(data[this.status].split(":")[1], 10),
      glowing: false,
    };
  }

  get position7x9() {
    return 9 * (HOTM.tiers - this.tier) + 1;
  }
}

/*
.##....##..#######..########..########..######.
.###...##.##.....##.##.....##.##.......##....##
.####..##.##.....##.##.....##.##.......##......
.##.##.##.##.....##.##.....##.######....######.
.##..####.##.....##.##.....##.##.............##
.##...###.##.....##.##.....##.##.......##....##
.##....##..#######..########..########..######.
*/

class Node {
  constructor(data) {
    this.nodeType = "normal";
    this.level = data.level;
    this.enabled = data.enabled;
    this.nodes = data.nodes;
    this.hotmTier = data.hotmLevelData.level;
    this.potmLevel = data.nodes.special_0;
    this.selectedPickaxeAbility = data.selectedPickaxeAbility;
  }

  get position7x9() {
    return this.position + 1 + (ceil(this.position / HOTM.tiers) - 1) * 2;
  }

  get itemData() {
    const data = {
      normal: {
        locked: "263:0",
        unlocked: "388:0",
        maxed: "264:0",
      },
      pickaxe_ability: {
        locked: "173:0",
        unlocked: "133:0",
        maxed: "133:0",
      },
      special: {
        locked: "7:0",
        unlocked: "152:0",
        maxed: "152:0",
      },
    };

    return {
      id: parseInt(data[this.nodeType][this.status].split(":")[0], 10),
      Damage: parseInt(data[this.nodeType][this.status].split(":")[1], 10),
      glowing: this.selectedPickaxeAbility === this.id,
    };
  }

  get lore() {
    const output = [];

    // Name
    output.push(this.displayName);

    // Level
    if (this.max_level > 1) {
      if (this.maxed) {
        output.push(`§7Level ${Math.max(1, this.level)}`);
      } else {
        output.push(`§7Level ${Math.max(1, this.level)}§8/${this.max_level}`);
      }
    }
    output.push("");

    // Perk
    output.push(...this.perk(Math.max(1, this.level)));

    // Upgradeable
    if (this.level > 0 && this.level < this.max_level) {
      // header
      output.push("", "§a=====[ §a§lUPGRADE §a] =====");

      // upgrade perk
      output.push(`§7Level ${this.level + 1}§8/${this.max_level}`, "", ...this.perk(this.level + 1));

      // upgrade cost
      output.push(
        "",
        "§7Cost",
        `§${UPGRADE_TYPES[this.upgrade_type].color}${this.upgradeCost.toLocaleString()} ${
          UPGRADE_TYPES[this.upgrade_type].name
        }`
      );
    }

    // Maxed perk
    if (this.maxed && this.nodeType !== "pickaxe_ability") {
      output.push("", "§aUNLOCKED");
    }

    // Unlock cost
    if (this.level === 0) {
      output.push("", "§7Cost");
      for (const [upgradeId, upgradeQty] of Object.entries(this.unlockCost)) {
        output.push(
          `§${UPGRADE_TYPES[upgradeId].color}${upgradeQty > 0 ? `${upgradeQty} ` : ""}${UPGRADE_TYPES[upgradeId].name}`
        );
      }
    }

    // Requirements
    if (this.level === 0) {
      if (this.requires.length > 0 && !this.requires.some((x) => Object.keys(this.nodes).includes(x))) {
        const reqs = this.requires.map((x) => nodeNames[x]);
        const reqsFriendly = reqs.length > 1 ? reqs.slice(0, -1).join(", ") + " or " + reqs.slice(-1) : reqs[0];
        output.push("", `§cRequires ${reqsFriendly}.`);
      }

      if (this.requiredHotmTier > this.hotmTier) {
        output.push("", `§cRequires HotM Tier ${this.requiredHotmTier}.`);
      }
    }

    // Status
    if (this.level > 0 && this.nodeType === "normal") {
      output.push("", this.enabled ? "§aENABLED" : "§cDISABLED");
    }

    // Selected Pickaxe Ability
    if (this.level > 0 && this.nodeType === "pickaxe_ability") {
      if (this.selectedPickaxeAbility === this.id) {
        output.push("", "§aSELECTED");
      } else {
        output.push("", "§eClick to select!");
      }
    }

    return output.map((x) => "§r" + x);
  }

  get pickaxeAbilityLevel() {
    // Blue Omelette gives +1 level, impossible to account for in here
    let level = 1;

    if (this.potmLevel >= 1) {
      level += 1;
    }

    return level;
  }

  get requiredHotmTier() {
    return Math.abs(ceil(this.position / 7) - 7) + 1;
  }

  get unlockCost() {
    return {
      token_of_the_mountain: 1,
    };
  }

  get displayName() {
    const nameColor = this.status === "maxed" ? "a" : this.status === "unlocked" ? "e" : "c";
    return `§${nameColor}§l${this.name}`;
  }

  get status() {
    if (this.level === this.max_level) {
      return "maxed";
    }

    if (this.level === 0) {
      return "locked";
    }

    return "unlocked";
  }

  get maxed() {
    return this.level === this.max_level;
  }

  get upgradeCost() {
    return -1;
  }

  perk(level) {
    return ["Missing perk description."];
  }

  get totalUpgradeCost() {
    let total = 0;
    const originalLevel = this.level;

    for (let level = 1; level < this.max_level; level++) {
      this.level = level;
      total += this.upgradeCost;
    }

    this.level = originalLevel;

    return total;
  }
}

class MiningSpeed2 extends Node {
  constructor(data) {
    super(data);
    this.id = "mining_speed_2";
    this.name = nodeNames[this.id];
    this.position = 2;
    this.max_level = 50;
    this.upgrade_type = "gemstone_powder";
    this.requires = ["lonesome_miner"];
  }

  get upgradeCost() {
    const nextLevel = this.level + 1;
    return floor(Math.pow(nextLevel + 1, 3.2));
  }

  perk(level) {
    const val = level * 40;
    return [`§7Grants §a+${val} §6${SYMBOLS.mining_speed} Mining Speed§7.`];
  }
}

class PowderBuff extends Node {
  constructor(data) {
    super(data);
    this.id = "powder_buff";
    this.name = nodeNames[this.id];
    this.position = 4;
    this.max_level = 50;
    this.upgrade_type = "gemstone_powder";
    this.requires = ["mole"];
  }

  get upgradeCost() {
    const nextLevel = this.level + 1;
    return floor(Math.pow(nextLevel + 1, 3.2));
  }

  perk(level) {
    const val = level * 1;
    return [`§7Gain §a${val}% §7more Mithril Powder and Gemstone Powder.`];
  }
}

class MiningFortune2 extends Node {
  constructor(data) {
    super(data);
    this.id = "mining_fortune_2";
    this.name = nodeNames[this.id];
    this.position = 6;
    this.max_level = 50;
    this.upgrade_type = "gemstone_powder";
    this.requires = ["great_explorer"];
  }

  get upgradeCost() {
    const nextLevel = this.level + 1;
    return floor(Math.pow(nextLevel + 1, 3.2));
  }

  perk(level) {
    const val = level * 5;
    return [`§7Grants §a+${val} §6${SYMBOLS.mining_fortune} Mining Fortune§7.`];
  }
}

class VeinSeeker extends Node {
  constructor(data) {
    super(data);
    this.id = "vein_seeker";
    this.name = nodeNames[this.id];
    this.position = 8;
    this.max_level = 1;
    this.upgrade_type = null;
    this.requires = ["lonesome_miner"];
    this.nodeType = "pickaxe_ability";
  }

  get upgradeCost() {
    return 0;
  }

  perk(level) {
    const spread = [2, 3, 4][this.pickaxeAbilityLevel - 1];
    const duration = [12, 14, 16][this.pickaxeAbilityLevel - 1];
    const cooldown = [60, 60, 60][this.pickaxeAbilityLevel - 1];
    return [
      "§6Pickaxe Ability: Vein Seeker",
      `§7Points in the direction of the nearest vein and grants §a+${spread} §6Mining Spread §7for §a${duration}s§7.`,
      `§8Cooldown: §a${cooldown}s`,
      "",
      "§8Pickaxe Abilities apply to all of your pickaxes. You can select a Pickaxe Ability from your Heart of the Mountain.",
      "",
      "§8Upgrade your Pickaxe Abilities by unlocking §cPeak of the Mountain §8in this menu!",
    ];
  }
}

class LonesomeMiner extends Node {
  constructor(data) {
    super(data);
    this.id = "lonesome_miner";
    this.name = nodeNames[this.id];
    this.position = 9;
    this.max_level = 45;
    this.upgrade_type = "gemstone_powder";
    this.requires = ["goblin_killer", "professional"];
  }

  get upgradeCost() {
    const nextLevel = this.level + 1;
    return floor(Math.pow(nextLevel + 1, 3.07));
  }

  perk(level) {
    const val = round(5 + (level - 1) * 0.5);
    return [
      `§7Increases §c${SYMBOLS.strength} Strength, §9${SYMBOLS.crit_chance} Crit Chance, §9${SYMBOLS.crit_damage} Crit Damage, §a${SYMBOLS.defense} Defense, and §c${SYMBOLS.health} Health §7statistics gain by §a${val}% §7while in the Crystal Hollows.`,
    ];
  }
}

class Professional extends Node {
  constructor(data) {
    super(data);
    this.id = "professional";
    this.name = nodeNames[this.id];
    this.position = 10;
    this.max_level = 140;
    this.upgrade_type = "gemstone_powder";
    this.requires = ["mole", "lonesome_miner"];
  }

  get upgradeCost() {
    const nextLevel = this.level + 1;
    return floor(Math.pow(nextLevel + 1, 2.3));
  }

  perk(level) {
    const val = 50 + level * 5;
    return [`§7Gain §a+${val}§7 §6${SYMBOLS.mining_speed} Mining Speed§7 when mining Gemstones.`];
  }
}

class Mole extends Node {
  constructor(data) {
    super(data);
    this.id = "mole";
    this.name = nodeNames[this.id];
    this.position = 11;
    this.max_level = 190;
    this.upgrade_type = "gemstone_powder";
    this.requires = ["efficient_miner", "professional", "fortunate"];
  }

  get upgradeCost() {
    const nextLevel = this.level + 1;
    return floor(Math.pow(nextLevel + 1, 2.2));
  }

  perk(level) {
    const chance = 50 + (level - 1) * 5;
    let blocks = 1 + floor(chance / 100);
    let percent = chance - floor(chance / 100) * 100;
    if (percent === 0) {
      blocks -= 1;
      percent = 100;
    }

    return [
      `§7When mining hard stone, you have a §a${percent}%§7 chance to mine §a${blocks}§7 adjacent hard stone block.`,
    ];
  }
}

class Fortunate extends Node {
  constructor(data) {
    super(data);
    this.id = "fortunate";
    this.name = nodeNames[this.id];
    this.position = 12;
    this.max_level = 20;
    this.upgrade_type = "mithril_powder";
    this.requires = ["mole", "great_explorer"];
  }

  get upgradeCost() {
    const nextLevel = this.level + 1;
    return floor(Math.pow(nextLevel + 1, 3.05));
  }

  perk(level) {
    const val = 20 + level * 4;
    return [`§7Grants §a+${val}§7 §6${SYMBOLS.mining_fortune} Mining Fortune§7 when mining Gemstone.`];
  }
}

class GreatExplorer extends Node {
  constructor(data) {
    super(data);
    this.id = "great_explorer";
    this.name = nodeNames[this.id];
    this.position = 13;
    this.max_level = 20;
    this.upgrade_type = "gemstone_powder";
    this.requires = ["star_powder", "fortunate"];
  }

  get upgradeCost() {
    const nextLevel = this.level + 1;
    return floor(Math.pow(nextLevel + 1, 4));
  }

  perk(level) {
    const perc = 20 + (level - 1) * 4;
    const val = 1 + Math.floor(level / 5);
    return [
      `§7Boosts the chance to find treasure chests while mining in the §5Crystal Hollows §7by §a${perc}% §7and reduces the amount of locks on the chest by §a${val}§7.`,
    ];
  }
}

class ManiacMiner extends Node {
  constructor(data) {
    super(data);
    this.id = "maniac_miner";
    this.name = nodeNames[this.id];
    this.position = 14;
    this.max_level = 1;
    this.upgrade_type = null;
    this.requires = ["great_explorer"];
    this.nodeType = "pickaxe_ability";
  }

  get upgradeCost() {
    return 0;
  }

  perk(level) {
    const speed = [1, 1, 1][this.pickaxeAbilityLevel - 1];
    const duration = [10, 15, 20][this.pickaxeAbilityLevel - 1];
    const cooldown = [60, 59, 59][this.pickaxeAbilityLevel - 1];
    return [
      "§6Pickaxe Ability: Maniac Miner",
      `§7Spends all your Mana and grants §a+${speed} §6${SYMBOLS.mining_speed} Mining Speed §7for every 10 Mana spent, for §a${duration}s§7.`,
      `§8Cooldown: §a${cooldown}s`,
      "",
      "§8Pickaxe Abilities apply to all of your pickaxes. You can select a Pickaxe Ability from your Heart of the Mountain.",
      "",
      "§8Upgrade your Pickaxe Abilities by unlocking §cPeak of the Mountain §8in this menu!",
    ];
  }
}

class GoblinKiller extends Node {
  constructor(data) {
    super(data);
    this.id = "goblin_killer";
    this.name = nodeNames[this.id];
    this.position = 16;
    this.max_level = 1;
    this.upgrade_type = null;
    this.requires = ["mining_madness", "lonesome_miner"];
  }

  get upgradeCost() {
    return 0;
  }

  perk(level) {
    return [
      `§7Killing a §6Golden Goblin §7or §bDiamond Goblin §7gives §2200 §7extra §2Mithril Powder§7, while killing other Goblins gives some based on their wits.`,
    ];
  }
}

class PeakOfTheMountain extends Node {
  constructor(data) {
    super(data);
    this.id = "special_0";
    this.name = nodeNames[this.id];
    this.position = 18;
    this.max_level = 7;
    this.upgrade_type = data.level >= 5 ? "gemstone_powder" : "mithril_powder";
    this.requires = ["efficient_miner"];
    this.nodeType = "special";
  }

  get upgradeCost() {
    const nextLevel = this.level + 1;
    return nextLevel <= 5 ? floor(25000 * nextLevel) : floor(500000 + 250000 * (nextLevel - 6));
  }

  perk(level) {
    const output = [];

    const baseTier = level > this.level ? level : 1;

    for (let tier = baseTier; tier <= level; tier++) {
      for (const [reward, qty] of Object.entries(rewards.potm[tier])) {
        const qtyColor = rewards.rewards[reward].qtyColor;
        const formatted = rewards.rewards[reward].formatted;
        output.push(`§8+ §${qtyColor}${qty} ${formatted}`);
      }
    }

    return output;
  }

  get unlockCost() {
    return {
      free: 0,
    };
  }
}

class StarPowder extends Node {
  constructor(data) {
    super(data);
    this.id = "star_powder";
    this.name = nodeNames[this.id];
    this.position = 20;
    this.max_level = 1;
    this.upgrade_type = null;
    this.requires = ["front_loaded", "great_explorer"];
  }

  get upgradeCost() {
    return 0;
  }

  perk(level) {
    return [`§7Mining Mithril Ore near §5Fallen Crystals §7gives §a3x §7Mithril Powder.`];
  }
}

class SkyMall extends Node {
  constructor(data) {
    super(data);
    this.id = "daily_effect";
    this.name = nodeNames[this.id];
    this.position = 22;
    this.max_level = 1;
    this.upgrade_type = null;
    this.requires = ["mining_madness"];
  }

  get upgradeCost() {
    return 0;
  }

  perk(level) {
    return [
      "§7Every SkyBlock day, you receive a random buff in the §2Dwarven Mines§7.",
      "",
      "§7Possible Buffs",
      `§8 ■ §7Gain §a+100 §6${SYMBOLS.mining_speed} Mining Speed§7.`,
      `§8 ■ §7Gain §a+50 §6${SYMBOLS.mining_fortune} Mining Fortune§7.`,
      "§8 ■ §7Gain §a+15% §7chance to gain extra Powder while mining.",
      "§8 ■ §7Reduce Pickaxe Ability cooldown by §a20%§7.",
      "§8 ■ §7§a10x §7chance to find Goblins while mining.",
      "§8 ■ §7Gain §a5x §9Titanium §7drops.",
    ];
  }
}

class MiningMadness extends Node {
  constructor(data) {
    super(data);
    this.id = "mining_madness";
    this.name = nodeNames[this.id];
    this.position = 23;
    this.max_level = 1;
    this.upgrade_type = null;
    this.requires = ["random_event", "mining_experience", "goblin_killer"];
  }

  get upgradeCost() {
    return 0;
  }

  perk(level) {
    return [
      `§7Grants §a+50 §6${SYMBOLS.mining_speed} Mining Speed §7and §6${SYMBOLS.mining_fortune} Mining Fortune§7.`,
    ];
  }
}

class SeasonedMineman extends Node {
  constructor(data) {
    super(data);
    this.id = "mining_experience";
    this.name = nodeNames[this.id];
    this.position = 24;
    this.max_level = 100;
    this.upgrade_type = "mithril_powder";
    this.requires = ["efficient_miner", "mining_madness"];
  }

  get upgradeCost() {
    const nextLevel = this.level + 1;
    return floor(Math.pow(nextLevel + 1, 2.3));
  }

  perk(level) {
    const val = round(5 + level * 0.1, 1);
    return [`§7Increases your Mining experience gain by §a${val}%§7.`];
  }
}

class EfficientMiner extends Node {
  constructor(data) {
    super(data);
    this.id = "efficient_miner";
    this.name = nodeNames[this.id];
    this.position = 25;
    this.max_level = 100;
    this.upgrade_type = "mithril_powder";
    this.requires = ["daily_powder", "mining_experience", "experience_orbs"];
  }

  get upgradeCost() {
    const nextLevel = this.level + 1;
    return floor(Math.pow(nextLevel + 1, 2.6));
  }

  perk(level) {
    const val1 = round(10 + level * 0.4, 1);
    const val2 = ceil((level + 1) / 20);
    return [`§7When mining ores, you have a §a${val1}%§7 chance to mine §a${val2} §7adjacent ores.`];
  }
}

class Orbiter extends Node {
  constructor(data) {
    super(data);
    this.id = "experience_orbs";
    this.name = nodeNames[this.id];
    this.position = 26;
    this.max_level = 80;
    this.upgrade_type = "mithril_powder";
    this.requires = ["efficient_miner", "front_loaded"];
  }

  get upgradeCost() {
    const nextLevel = this.level + 1;
    return floor(70 * nextLevel);
  }

  perk(level) {
    const val = round(0.2 + level * 0.01, 2);
    return [`§7When mining ores, you have a §a${val}%§7 chance to get a random amount of experience orbs.`];
  }
}

class FrontLoaded extends Node {
  constructor(data) {
    super(data);
    this.id = "front_loaded";
    this.name = nodeNames[this.id];
    this.position = 27;
    this.max_level = 1;
    this.upgrade_type = null;
    this.requires = ["fallen_star_bonus", "experience_orbs", "star_powder"];
  }

  get upgradeCost() {
    return 0;
  }

  perk(level) {
    return [
      `§7Grants §a+100 §6${SYMBOLS.mining_speed} Mining Speed §7and §6${SYMBOLS.mining_fortune} Mining Fortune §7as well as §a+2 base powder §7for the first §e2,500 §7ores you mine in a day.`,
    ];
  }
}

class PrecisionMining extends Node {
  constructor(data) {
    super(data);
    this.id = "precision_mining";
    this.name = nodeNames[this.id];
    this.position = 28;
    this.max_level = 1;
    this.upgrade_type = null;
    this.requires = ["front_loaded"];
  }

  get upgradeCost() {
    return 0;
  }

  perk(level) {
    return [
      `§7When mining ore, a particle target appears on the block that increases your §6${SYMBOLS.mining_speed} Mining Speed §7by §a30% §7when aiming at it.`,
    ];
  }
}

class LuckOfTheCave extends Node {
  constructor(data) {
    super(data);
    this.id = "random_event";
    this.name = nodeNames[this.id];
    this.position = 30;
    this.max_level = 45;
    this.upgrade_type = "mithril_powder";
    this.requires = ["mining_speed_boost", "mining_madness"];
  }

  get upgradeCost() {
    const nextLevel = this.level + 1;
    return floor(Math.pow(nextLevel + 1, 3.07));
  }

  perk(level) {
    const val = 5 + level * 1;
    return [
      `§7Increases the chance for you to trigger rare occurrences in §2Dwarven Mines §7by §a${val}%§7.`,
      ``,
      `§7Rare occurrences include:`,
      `§8§l· §6Golden Goblins`,
      `§8§l· §5Fallen Stars`,
      `§8§l· §6Powder Ghasts`,
    ];
  }
}

class DailyPowder extends Node {
  constructor(data) {
    super(data);
    this.id = "daily_powder";
    this.name = nodeNames[this.id];
    this.position = 32;
    this.max_level = 100;
    this.upgrade_type = "mithril_powder";
    this.requires = ["mining_fortune"];
  }

  get upgradeCost() {
    const nextLevel = this.level + 1;
    return floor(182 + 18 * nextLevel);
  }

  perk(level) {
    const val = 400 + (level - 1) * 36;
    return [`§7Gain §a${val} Powder §7from the first ore you mine every day. Works for all Powder types.`];
  }
}

class Crystallized extends Node {
  constructor(data) {
    super(data);
    this.id = "fallen_star_bonus";
    this.name = nodeNames[this.id];
    this.position = 34;
    this.max_level = 30;
    this.upgrade_type = "mithril_powder";
    this.requires = ["pickaxe_toss", "front_loaded"];
  }

  get upgradeCost() {
    const nextLevel = this.level + 1;
    return floor(Math.pow(nextLevel + 1, 3.4));
  }

  perk(level) {
    const speed = 20 + (level - 1) * 6;
    const fortune = 20 + (level - 1) * 5;
    return [
      `§7Increases §6${speed} ${SYMBOLS.mining_speed} Mining Speed §7and §6${fortune} ${SYMBOLS.mining_fortune} Mining Fortune §7near §5Fallen Stars§7.`,
    ];
  }
}

class MiningSpeedBoost extends Node {
  constructor(data) {
    super(data);
    this.id = "mining_speed_boost";
    this.name = nodeNames[this.id];
    this.position = 37;
    this.max_level = 1;
    this.upgrade_type = null;
    this.requires = ["titanium_insanium", "random_event"];
    this.nodeType = "pickaxe_ability";
  }

  get upgradeCost() {
    return 0;
  }

  perk(level) {
    const effect = [200, 300, 400][this.pickaxeAbilityLevel - 1];
    const duration = [15, 20, 25][this.pickaxeAbilityLevel - 1];
    const cooldown = [120, 120, 120][this.pickaxeAbilityLevel - 1];
    return [
      "§6Pickaxe Ability: Mining Speed Boost",
      `§7Grants §a+${effect}% §6${SYMBOLS.mining_speed} Mining Speed §7for §a${duration}s§7.`,
      `§8Cooldown: §a${cooldown}s`,
      "",
      "§8Pickaxe Abilities apply to all of your pickaxes. You can select a Pickaxe Ability from your Heart of the Mountain.",
      "",
      "§8Upgrade your Pickaxe Abilities by unlocking §cPeak of the Mountain §8in this menu!",
    ];
  }
}

class TitaniumInsanium extends Node {
  constructor(data) {
    super(data);
    this.id = "titanium_insanium";
    this.name = nodeNames[this.id];
    this.position = 38;
    this.max_level = 50;
    this.upgrade_type = "mithril_powder";
    this.requires = ["mining_fortune", "mining_speed_boost"];
  }

  get upgradeCost() {
    const nextLevel = this.level + 1;
    return floor(Math.pow(nextLevel + 1, 3.1));
  }

  perk(level) {
    const val = round(2 + level * 0.1, 1);
    return [`§7When mining Mithril Ore, you have a §a${val}%§7 chance to convert the block into Titanium Ore.`];
  }
}

class MiningFortune extends Node {
  constructor(data) {
    super(data);
    this.id = "mining_fortune";
    this.name = nodeNames[this.id];
    this.position = 39;
    this.max_level = 50;
    this.upgrade_type = "mithril_powder";
    this.requires = ["mining_speed"];
  }

  get upgradeCost() {
    const nextLevel = this.level + 1;
    return floor(Math.pow(nextLevel + 1, 3.05));
  }

  perk(level) {
    const val = level * 5;
    return [`§7Grants §a+${val} §6${SYMBOLS.mining_fortune} Mining Fortune§7.`];
  }
}

class QuickForge extends Node {
  constructor(data) {
    super(data);
    this.id = "forge_time";
    this.name = nodeNames[this.id];
    this.position = 40;
    this.max_level = 20;
    this.upgrade_type = "mithril_powder";
    this.requires = ["mining_fortune", "pickaxe_toss"];
  }

  get upgradeCost() {
    const nextLevel = this.level + 1;
    return floor(Math.pow(nextLevel + 1, 4));
  }

  perk(level) {
    let val = round(10 + 0.5 * level, 1);
    if (level === this.max_level) {
      val = 30;
    }
    return [`§7Decreases the time it takes to forge by §a${val}%§7.`];
  }
}

class Pickobulus extends Node {
  constructor(data) {
    super(data);
    this.id = "pickaxe_toss";
    this.name = nodeNames[this.id];
    this.position = 41;
    this.max_level = 1;
    this.upgrade_type = null;
    this.requires = ["forge_time", "fallen_star_bonus"];
    this.nodeType = "pickaxe_ability";
  }

  get upgradeCost() {
    return 0;
  }

  perk(level) {
    const radius = [2, 2, 3][this.pickaxeAbilityLevel - 1];
    const cooldown = [120, 110, 110][this.pickaxeAbilityLevel - 1];
    return [
      "§6Pickaxe Ability: Pickobulus",
      `§7Throw your pickaxe to create an explosion on impact, mining all ores within a §a${radius}§7 block radius.`,
      `§8Cooldown: §a${cooldown}s`,
      "",
      "§8Pickaxe Abilities apply to all of your pickaxes. You can select a Pickaxe Ability from your Heart of the Mountain.",
      "",
      "§8Upgrade your Pickaxe Abilities by unlocking §cPeak of the Mountain §8in this menu!",
    ];
  }
}

class MiningSpeed extends Node {
  constructor(data) {
    super(data);
    this.id = "mining_speed";
    this.name = nodeNames[this.id];
    this.position = 46;
    this.max_level = 50;
    this.upgrade_type = "mithril_powder";
    this.requires = [];
  }

  get upgradeCost() {
    const nextLevel = this.level + 1;
    return floor(Math.pow(nextLevel + 1, 3));
  }

  perk(level) {
    const val = level * 20;
    return [`§7Grants §a+${val} §6${SYMBOLS.mining_speed} Mining Speed§7.`];
  }
}

/*
.####.########.########.##.....##..######.
..##.....##....##.......###...###.##....##
..##.....##....##.......####.####.##......
..##.....##....######...##.###.##..######.
..##.....##....##.......##.....##.......##
..##.....##....##.......##.....##.##....##
.####....##....########.##.....##..######.
*/

class HotmItem {
  get position7x9() {
    return 9 * (HOTM.tiers - this.position) + 9;
  }
}

class HotmStats extends HotmItem {
  constructor(data) {
    super();
    this.displayName = "§5Heart of the Mountain";
    this.position = 1;
    this.itemData = {
      id: 397,
      Damage: 3,
      glowing: false,
      texture_path: "/head/86f06eaa3004aeed09b3d5b45d976de584e691c0e9cade133635de93d23b9edb",
    };
    this.resources = {
      token_of_the_mountain: data.resources.token_of_the_mountain.available || 0,
      mithril_powder: data.resources.mithril_powder.available || 0,
      gemstone_powder: data.resources.gemstone_powder.available || 0,
    };
  }

  get lore() {
    return [
      `§7Token of the Mountain: §5${this.resources.token_of_the_mountain.toLocaleString()}`,
      "",
      "§7§8Use §5Token of the Mountain §8to unlock perks and abilities above!",
      "",
      `§9${SYMBOLS.powder} Powder`,
      "§9Powders §8are dropped from mining ores in the §2Dwarven Mines §8and are used to upgrade the perks you've unlocked!",
      "",
      `§7Mithril Powder: §2${this.resources.mithril_powder.toLocaleString()}`,
      `§7Gemstone Powder: §d${this.resources.gemstone_powder.toLocaleString()}`,
      "",
      "§8Increase your chance to gain extra Powder by unlocking perks, equipping the §2Mithril Golem Pet§8, and more!",
    ];
  }
}

class CrystalHollowsCrystals extends HotmItem {
  constructor(data) {
    super();
    this.displayName = "§5Crystal Hollows Crystals";
    this.position = 2;
    this.itemData = {
      id: 397,
      Damage: 3,
      glowing: false,
      texture_path: "/head/ef7835fc9e6daf632160e9b7ff378788a408064cc75ebf9f5158e615bdd59603",
    };
    this.crystals = data.crystals;
  }

  get lore() {
    return [
      "§8Crystals are used to forge Gems into §dPerfect §8Gems. They can be found hidden within the §5Crystal Hollows§8.",
      "",
      "§8Find and place the full set of §55 §8Crystals in the §5Crystal Nucleus §8to unlock §6rare loot chests§8!",
      "",
      "§dYour §5Crystal Nucleus",
      `§8- §aJade ${this.formatCrystal("jade", this.crystals.jade_crystal?.state)}`,
      `§8- §6Amber ${this.formatCrystal("amber", this.crystals.amber_crystal?.state)}`,
      `§8- §5Amethyst ${this.formatCrystal("amethyst", this.crystals.amethyst_crystal?.state)}`,
      `§8- §bSapphire ${this.formatCrystal("sapphire", this.crystals.sapphire_crystal?.state)}`,
      `§8- §eTopaz ${this.formatCrystal("topaz", this.crystals.topaz_crystal?.state)}`,
      "",
      "§dYour Other Crystals",
      `§8- §dJasper ${this.formatCrystal("jasper", this.crystals.jasper_crystal?.state)}`,
      `§8- §cRuby ${this.formatCrystal("ruby", this.crystals.ruby_crystal?.state)}`,
    ];
  }

  formatCrystal(crystal, state) {
    if (!state) {
      state = "NOT_FOUND";
    }
    let formatted = state.split("_").join(" ").trim();
    formatted = titleCase(formatted);

    let color = "r";
    let symbol = "";
    switch (state) {
      case "NOT_FOUND":
        color = "c";
        symbol = "✖";
        break;
      case "FOUND":
        color = "e";
        symbol = "✖";
        break;
      case "PLACED":
        color = "a";
        symbol = "✔";
        break;
    }

    // Jasper and Ruby do not have a PLACED state
    if (["jasper", "ruby"].includes(crystal) && state === "FOUND") {
      color = "a";
      symbol = "✔";
    }

    return `§${color}${symbol} ${formatted}`;
  }
}

class HotmReset extends HotmItem {
  constructor(data) {
    super();
    this.displayName = "§cReset Heart of the Mountain";
    this.position = 3;
    this.itemData = {
      id: 397,
      Damage: 3,
      glowing: false,
      texture_path: "/head/6448e275313532f54c4ba21894809a23dce52af01ddd1e89fc7689481fab737e",
    };
    this.last_reset = data.last_reset;
    this.resources = {
      token_of_the_mountain: data.resources.token_of_the_mountain.spent || 0,
      mithril_powder: data.resources.mithril_powder.spent || 0,
      gemstone_powder: data.resources.gemstone_powder.spent || 0,
    };
  }

  get lore() {
    const output = [
      "§7Resets the Perks and Abilities of your §5Heart of the Mountain§7, locking them and resetting their levels.",
      "",
      "§7You will be reimbursed with:",
      `§8- §5${this.resources.token_of_the_mountain.toLocaleString()} Token of the Mountain`,
      `§8- §2${this.resources.mithril_powder.toLocaleString()} Mithril Powder`,
      `§8- §d${this.resources.gemstone_powder.toLocaleString()} Gemstone Powder`,
      "",
      "§7You will §akeep §7any Tiers and §cPeak of the Mountain §7that you have unlocked.",
    ];

    // cost
    output.push("", "§7Cost");
    if (this.last_reset === 0) {
      output.push("§aFREE §7for your first reset.");
    } else {
      output.push("§6100,000 Coins");
    }

    // cooldown or warning
    if (Date.now() - this.last_reset > 24 * 60 * 60 * 1000) {
      output.push(
        "",
        "§7§c§lWARNING: This is permanent.",
        "§c§lYou can not go back after resetting your Heart of the Mountain!"
      );
    } else {
      const timeLeft = Math.abs(Date.now() - (this.last_reset + 24 * 60 * 60 * 1000)); // ms
      output.push("", `§c§lYou can reset again in ${convertHMS(timeLeft / 1000, "friendlyhhmm")}`);
    }

    return output;
  }
}

/*
.########.##.....##.########...#######..########..########..######.
.##........##...##..##.....##.##.....##.##.....##....##....##....##
.##.........##.##...##.....##.##.....##.##.....##....##....##......
.######......###....########..##.....##.########.....##.....######.
.##.........##.##...##........##.....##.##...##......##..........##
.##........##...##..##........##.....##.##....##.....##....##....##
.########.##.....##.##.........#######..##.....##....##.....######.
*/

const nodeClasses = {
  mining_speed_2: MiningSpeed2,
  powder_buff: PowderBuff,
  mining_fortune_2: MiningFortune2,
  vein_seeker: VeinSeeker,
  lonesome_miner: LonesomeMiner,
  professional: Professional,
  mole: Mole,
  fortunate: Fortunate,
  great_explorer: GreatExplorer,
  maniac_miner: ManiacMiner,
  goblin_killer: GoblinKiller,
  special_0: PeakOfTheMountain,
  star_powder: StarPowder,
  daily_effect: SkyMall,
  mining_madness: MiningMadness,
  mining_experience: SeasonedMineman,
  efficient_miner: EfficientMiner,
  experience_orbs: Orbiter,
  front_loaded: FrontLoaded,
  precision_mining: PrecisionMining,
  random_event: LuckOfTheCave,
  daily_powder: DailyPowder,
  fallen_star_bonus: Crystallized,
  mining_speed_boost: MiningSpeedBoost,
  titanium_insanium: TitaniumInsanium,
  mining_fortune: MiningFortune,
  forge_time: QuickForge,
  pickaxe_toss: Pickobulus,
  mining_speed: MiningSpeed,
};

const powderForMaxNodes = {};
for (const nodeClass of Object.values(nodeClasses)) {
  const node = new nodeClass({
    level: 0,
    enabled: true,
    nodes: [],
    hotmLevelData: {
      level: Object.keys(rewards.hotm).length,
    },
  });

  if (node.nodeType === "normal" && node.upgrade_type !== null) {
    powderForMaxNodes[node.upgrade_type] ??= 0;
    powderForMaxNodes[node.upgrade_type] += node.totalUpgradeCost;
  }
}

export const HOTM = {
  tiers: Object.keys(rewards.hotm).length,
  rewards: rewards,
  names: nodeNames,
  hotm: HotM,
  nodes: nodeClasses,
  items: [HotmStats, CrystalHollowsCrystals, HotmReset],
  powder_for_max_nodes: powderForMaxNodes,
};

export const PRECURSOR_PARTS = {
  ELECTRON_TRANSMITTER: "Electron Transmitter",
  FTX_3070: "FTX 3070",
  ROBOTRON_REFLECTOR: "Robotron Reflector",
  SUPERLITE_MOTOR: "Superlite Motor",
  CONTROL_SWITCH: "Control Switch",
  SYNTHETIC_HEART: "Synthetic Heart",
};

export const COMMISSIONS_MILESTONE = 6;

export const MAX_PEAK_OF_THE_MOUNTAIN_LEVEL = 7;

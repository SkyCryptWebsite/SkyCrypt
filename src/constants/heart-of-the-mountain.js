import { stats_symbols as symbols } from "./stats.js";

const upgrade_types = {
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
};

class Node {
  constructor(level, enabled) {
    this.level = level;
    this.enabled = enabled;
  }

  get lore() {
    let output = [];

    // Name
    output.push(`§${this.level === this.max_level ? "a" : "e"}§l${this.name}`);

    // Level
    if (this.max_level > 1) {
      output.push(`§7Level ${this.level}§8/${this.max_level}`, "");
    }

    // Perk
    output.push(...this.perk(this.level));

    // Upgradeable
    if (this.level < this.max_level) {
      // header
      output.push("", "§a=====[ §a§lUPGRADE §a] =====");

      // upgrade perk
      output.push(`§7Level ${this.level + 1}§8/${this.max_level}`, "", ...this.perk(this.level + 1));

      // upgrade cost
      output.push(
        "",
        "§7Cost",
        `§${upgrade_types[this.upgrade_type].color}${this.upgradeCost} ${upgrade_types[this.upgrade_type].name}`
      );
    }

    // Status
    output.push("", this.enabled ? "§aENABLED" : "§cDISABLED");

    return output.map((x) => "§r" + x);
  }

  get upgradeCost() {
    return -1;
  }

  perk(level) {
    return ["Missing perk description."];
  }
}

class MiningSpeed2 extends Node {
  constructor(level, enabled) {
    super(level, enabled);
    this.id = "mining_speed_2";
    this.name = "Mining Speed II";
    this.position = 2;
    this.max_level = 50;
    this.upgrade_type = "gemstone_powder";
  }

  get upgradeCost() {
    const nextLevel = this.level + 1;
    return Math.floor(Math.pow(nextLevel + 1, 3.2));
  }

  perk(level) {
    return [`MISSING_DATA`];
  }
}

class PowderBuff extends Node {
  constructor(level, enabled) {
    super(level, enabled);
    this.id = "powder_buff";
    this.name = "Powder Buff";
    this.position = 4;
    this.max_level = 50;
    this.upgrade_type = "gemstone_powder";
  }

  get upgradeCost() {
    const nextLevel = this.level + 1;
    return Math.floor(Math.pow(nextLevel + 1, 3.2));
  }

  perk(level) {
    return [`MISSING_DATA`];
  }
}

class MiningFortune2 extends Node {
  constructor(level, enabled) {
    super(level, enabled);
    this.id = "mining_fortune_2";
    this.name = "Mining Fortune II";
    this.position = 6;
    this.max_level = 50;
    this.upgrade_type = "gemstone_powder";
  }

  get upgradeCost() {
    const nextLevel = this.level + 1;
    return Math.floor(Math.pow(nextLevel + 1, 3.2));
  }

  perk(level) {
    return [`MISSING_DATA`];
  }
}

class VeinSeeker extends Node {
  constructor(level, enabled) {
    super(level, enabled);
    this.id = "vein_seeker";
    this.name = "Vein Seeker";
    this.position = 8;
    this.max_level = 1;
    this.upgrade_type = null;
  }

  get upgradeCost() {
    return 0;
  }

  perk(level) {
    return [`MISSING_DATA`];
  }
}

class LonesomeMiner extends Node {
  constructor(level, enabled) {
    super(level, enabled);
    this.id = "lonesome_miner";
    this.name = "Lonesome Miner";
    this.position = 9;
    this.max_level = 45;
    this.upgrade_type = "gemstone_powder";
  }

  get upgradeCost() {
    const nextLevel = this.level + 1;
    return Math.floor(Math.pow(nextLevel + 1, 3.07));
  }

  perk(level) {
    return [`MISSING_DATA`];
  }
}

class Professional extends Node {
  constructor(level, enabled) {
    super(level, enabled);
    this.id = "professional";
    this.name = "Professional";
    this.position = 10;
    this.max_level = 140;
    this.upgrade_type = "gemstone_powder";
  }

  get upgradeCost() {
    const nextLevel = this.level + 1;
    return Math.floor(Math.pow(nextLevel + 1, 2.3));
  }

  perk(level) {
    return [`MISSING_DATA`];
  }
}

class Mole extends Node {
  constructor(level, enabled) {
    super(level, enabled);
    this.id = "mole";
    this.name = "Mole";
    this.position = 11;
    this.max_level = 190;
    this.upgrade_type = "gemstone_powder";
  }

  get upgradeCost() {
    const nextLevel = this.level + 1;
    return Math.floor(Math.pow(nextLevel + 1, 2.2));
  }

  perk(level) {
    return [`MISSING_DATA`];
  }
}

class Fortunate extends Node {
  constructor(level, enabled) {
    super(level, enabled);
    this.id = "fortunate";
    this.name = "Fortunate";
    this.position = 12;
    this.max_level = 20;
    this.upgrade_type = "mithril_powder";
  }

  get upgradeCost() {
    const nextLevel = this.level + 1;
    return Math.floor(Math.pow(nextLevel + 1, 3.05));
  }

  perk(level) {
    return [`MISSING_DATA`];
  }
}

class GreatExplorer extends Node {
  constructor(level, enabled) {
    super(level, enabled);
    this.id = "great_explorer";
    this.name = "Great Explorer";
    this.position = 13;
    this.max_level = 20;
    this.upgrade_type = "gemstone_powder";
  }

  get upgradeCost() {
    const nextLevel = this.level + 1;
    return Math.floor(Math.pow(nextLevel + 1, 4));
  }

  perk(level) {
    return [`MISSING_DATA`];
  }
}

class ManiacMiner extends Node {
  constructor(level, enabled) {
    super(level, enabled);
    this.id = "maniac_miner";
    this.name = "Maniac Miner";
    this.position = 14;
    this.max_level = 1;
    this.upgrade_type = null;
  }

  get upgradeCost() {
    return 0;
  }

  perk(level) {
    return [`MISSING_DATA`];
  }
}

class GoblinKiller extends Node {
  constructor(level, enabled) {
    super(level, enabled);
    this.id = "goblin_killer";
    this.name = "Goblin Killer";
    this.position = 16;
    this.max_level = 1;
    this.upgrade_type = null;
  }

  get upgradeCost() {
    return 0;
  }

  perk(level) {
    return [`MISSING_DATA`];
  }
}

class PeakOfTheMountain extends Node {
  constructor(level, enabled) {
    super(level, enabled);
    this.id = "special_0";
    this.name = "Peark of the Mountain";
    this.position = 18;
    this.max_level = 5;
    this.upgrade_type = "mithril_powder";
  }

  get upgradeCost() {
    const nextLevel = this.level + 1;
    return Math.floor(25000 * nextLevel);
  }

  perk(level) {
    return [`MISSING_DATA`];
  }
}

class StarPowder extends Node {
  constructor(level, enabled) {
    super(level, enabled);
    this.id = "star_powder";
    this.name = "Star Powder";
    this.position = 20;
    this.max_level = 1;
    this.upgrade_type = null;
  }

  get upgradeCost() {
    return 0;
  }

  perk(level) {
    return [`MISSING_DATA`];
  }
}

class SkyMall extends Node {
  constructor(level, enabled) {
    super(level, enabled);
    this.id = "sky_mall";
    this.name = "Sky Mall";
    this.position = 22;
    this.max_level = 1;
    this.upgrade_type = null;
  }

  get upgradeCost() {
    return 0;
  }

  perk(level) {
    return [`MISSING_DATA`];
  }
}

class MiningMadness extends Node {
  constructor(level, enabled) {
    super(level, enabled);
    this.id = "mining_madness";
    this.name = "Mining Madness";
    this.position = 23;
    this.max_level = 1;
    this.upgrade_type = null;
  }

  get upgradeCost() {
    return 0;
  }

  perk(level) {
    return [`MISSING_DATA`];
  }
}

class SeasonedMineman extends Node {
  constructor(level, enabled) {
    super(level, enabled);
    this.id = "mining_experience";
    this.name = "Seasoned Mineman";
    this.position = 24;
    this.max_level = 100;
    this.upgrade_type = "mithril_powder";
  }

  get upgradeCost() {
    const nextLevel = this.level + 1;
    return Math.floor(Math.pow(nextLevel + 1, 2.3));
  }

  perk(level) {
    return [`MISSING_DATA`];
  }
}

class EfficientMiner extends Node {
  constructor(level, enabled) {
    super(level, enabled);
    this.id = "efficient_miner";
    this.name = "Efficient Miner";
    this.position = 25;
    this.max_level = 100;
    this.upgrade_type = "mithril_powder";
  }

  get upgradeCost() {
    const nextLevel = this.level + 1;
    return Math.floor(Math.pow(nextLevel + 1, 2.6));
  }

  perk(level) {
    return [`MISSING_DATA`];
  }
}

class Orbiter extends Node {
  constructor(level, enabled) {
    super(level, enabled);
    this.id = "experience_orbs";
    this.name = "Orbiter";
    this.position = 26;
    this.max_level = 80;
    this.upgrade_type = "mithril_powder";
  }

  get upgradeCost() {
    const nextLevel = this.level + 1;
    return Math.floor(70 * nextLevel);
  }

  perk(level) {
    return [`MISSING_DATA`];
  }
}

class FrontLoaded extends Node {
  constructor(level, enabled) {
    super(level, enabled);
    this.id = "front_loaded";
    this.name = "Front Loaded";
    this.position = 27;
    this.max_level = 1;
    this.upgrade_type = null;
  }

  get upgradeCost() {
    return 0;
  }

  perk(level) {
    return [`MISSING_DATA`];
  }
}

class PrecisionMining extends Node {
  constructor(level, enabled) {
    super(level, enabled);
    this.id = "precision_mining";
    this.name = "Precision Mining";
    this.position = 28;
    this.max_level = 1;
    this.upgrade_type = null;
  }

  get upgradeCost() {
    return 0;
  }

  perk(level) {
    return [`MISSING_DATA`];
  }
}

class LuckOfTheCave extends Node {
  constructor(level, enabled) {
    super(level, enabled);
    this.id = "luck_of_the_cave";
    this.name = "Luck Of The Cave";
    this.position = 30;
    this.max_level = 45;
    this.upgrade_type = "mithril_powder";
  }

  get upgradeCost() {
    const nextLevel = this.level + 1;
    return Math.floor(Math.pow(nextLevel + 1, 3.07));
  }

  perk(level) {
    return [`MISSING_DATA`];
  }
}

class DailyPowder extends Node {
  constructor(level, enabled) {
    super(level, enabled);
    this.id = "daily_powder";
    this.name = "Daily Powder";
    this.position = 32;
    this.max_level = 100;
    this.upgrade_type = "mithril_powder";
  }

  get upgradeCost() {
    const nextLevel = this.level + 1;
    return Math.floor(182 + 18 * nextLevel);
  }

  perk(level) {
    return [`MISSING_DATA`];
  }
}

class Crystallized extends Node {
  constructor(level, enabled) {
    super(level, enabled);
    this.id = "fallen_star_bonus";
    this.name = "Crystallized";
    this.position = 34;
    this.max_level = 30;
    this.upgrade_type = "mithril_powder";
  }

  get upgradeCost() {
    const nextLevel = this.level + 1;
    return Math.floor(Math.pow(nextLevel + 1, 3.4));
  }

  perk(level) {
    return [`MISSING_DATA`];
  }
}

class MiningSpeedBoost extends Node {
  constructor(level, enabled) {
    super(level, enabled);
    this.id = "mining_speed_boost";
    this.name = "Mining Speed Boost";
    this.position = 37;
    this.max_level = 1;
    this.upgrade_type = null;
  }

  get upgradeCost() {
    return 0;
  }

  perk(level) {
    return [`MISSING_DATA`];
  }
}

class TitaniumInsanium extends Node {
  constructor(level, enabled) {
    super(level, enabled);
    this.id = "titanium_insanium";
    this.name = "Titanium Insanium";
    this.position = 38;
    this.max_level = 50;
    this.upgrade_type = "mithril_powder";
  }

  get upgradeCost() {
    const nextLevel = this.level + 1;
    return Math.floor(Math.pow(nextLevel + 1, 3.1));
  }

  perk(level) {
    return [`MISSING_DATA`];
  }
}

class MiningFortune extends Node {
  constructor(level, enabled) {
    super(level, enabled);
    this.id = "mining_fortune";
    this.name = "Mining Fortune";
    this.position = 39;
    this.max_level = 50;
    this.upgrade_type = "mithril_powder";
  }

  get upgradeCost() {
    const nextLevel = this.level + 1;
    return Math.floor(Math.pow(nextLevel + 1, 3.05));
  }

  perk(level) {
    return [`MISSING_DATA`];
  }
}

class QuickForge extends Node {
  constructor(level, enabled) {
    super(level, enabled);
    this.id = "forge_time";
    this.name = "Quick Forge";
    this.position = 40;
    this.max_level = 20;
    this.upgrade_type = "mithril_powder";
  }

  get upgradeCost() {
    const nextLevel = this.level + 1;
    return Math.floor(Math.pow(nextLevel + 1, 4));
  }

  perk(level) {
    return [`MISSING_DATA`];
  }
}

class Pickobulus extends Node {
  constructor(level, enabled) {
    super(level, enabled);
    this.id = "pickaxe_toss";
    this.name = "Pickobulus";
    this.position = 41;
    this.max_level = 1;
    this.upgrade_type = null;
  }

  get upgradeCost() {
    return 0;
  }

  perk(level) {
    return [`MISSING_DATA`];
  }
}

class MiningSpeed extends Node {
  constructor(level, enabled) {
    super(level, enabled);
    this.id = "mining_speed";
    this.name = "Mining Speed";
    this.position = 46;
    this.max_level = 50;
    this.upgrade_type = "mithril_powder";
  }

  get upgradeCost() {
    const nextLevel = this.level + 1;
    return Math.floor(Math.pow(nextLevel + 1, 3));
  }

  perk(level) {
    return [`§7Grants §a+${level * 20} §6${symbols.mining_speed} Mining Speed§7.`];
  }
}

export const hotm = {
  tree_size: {
    columns: 7,
    rows: 7,
  },
  nodes: {
    mining_speed_2: MiningSpeed2,
    powder_buff: PowderBuff,
    mining_fortune_2: MiningFortune2,
    vein_seeker: VeinSeeker, // FIX! to be confirmed!
    lonesome_miner: LonesomeMiner,
    professional: Professional,
    mole: Mole,
    fortunate: Fortunate,
    great_explorer: GreatExplorer,
    maniac_miner: ManiacMiner,
    goblin_killer: GoblinKiller, // FIX! to be confirmed!
    special_0: PeakOfTheMountain,
    star_powder: StarPowder,
    sky_mall: SkyMall, // FIX! to be confirmed!
    mining_madness: MiningMadness,
    mining_experience: SeasonedMineman,
    efficient_miner: EfficientMiner,
    experience_orbs: Orbiter,
    front_loaded: FrontLoaded,
    precision_mining: PrecisionMining,
    luck_of_the_cave: LuckOfTheCave, // FIX! to be confirmed! (upgrade type too)
    daily_powder: DailyPowder,
    fallen_star_bonus: Crystallized,
    mining_speed_boost: MiningSpeedBoost,
    titanium_insanium: TitaniumInsanium,
    mining_fortune: MiningFortune,
    forge_time: QuickForge,
    pickaxe_toss: Pickobulus,
    mining_speed: MiningSpeed,
  },
};

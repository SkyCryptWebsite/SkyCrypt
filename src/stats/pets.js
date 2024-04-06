import { getItemNetworth } from "skyhelper-networth";
import * as constants from "../constants.js";
import * as helper from "../helper.js";
import _ from "lodash";

function getPetLevel(petExp, offsetRarity, maxLevel) {
  const rarityOffset = constants.PET_RARITY_OFFSET[offsetRarity];
  const levels = constants.PET_LEVELS.slice(rarityOffset, rarityOffset + maxLevel - 1);

  const xpMaxLevel = levels.reduce((a, b) => a + b, 0);
  let xpTotal = 0;
  let level = 1;

  let xpForNext = Infinity;

  for (let i = 0; i < maxLevel; i++) {
    xpTotal += levels[i];

    if (xpTotal > petExp) {
      xpTotal -= levels[i];
      break;
    } else {
      level++;
    }
  }

  let xpCurrent = Math.floor(petExp - xpTotal);
  let progress;

  if (level < maxLevel) {
    xpForNext = Math.ceil(levels[level - 1]);
    progress = Math.max(0, Math.min(xpCurrent / xpForNext, 1));
  } else {
    level = maxLevel;
    xpCurrent = petExp - levels[maxLevel - 1];
    xpForNext = 0;
    progress = 1;
  }

  return {
    level,
    xpCurrent,
    xpForNext,
    progress,
    xpMaxLevel,
  };
}

function getPetRarity(pet, petData) {
  if (!(pet.heldItem == "PET_ITEM_TIER_BOOST" && !pet.ignoresTierBoost)) {
    return pet.rarity;
  }

  return constants.RARITIES[
    Math.min(constants.RARITIES.indexOf(petData.maxTier), constants.RARITIES.indexOf(pet.rarity) + 1)
  ];
}

function getPetName(pet, petData) {
  if (petData.hatching?.level > pet.level.level) {
    // Golden Dragon Pet hatching name
    return petData.hatching.name;
  } else if (petData.name) {
    // Normal pet name
    return petData.name[pet.rarity] ?? petData.name.default;
  } else {
    // Unknown pet name
    return helper.titleCase(pet.type.replaceAll("_", " "));
  }
}

function getProfilePets(pets, calculated) {
  let output = [];

  if (pets === undefined) {
    return output;
  }

  // debug pets
  // pets = helper.generateDebugPets("OWL");

  for (const pet of pets) {
    if ("tier" in pet === false) {
      continue;
    }

    const petData = constants.PET_DATA[pet.type] ?? {
      head: "/head/bc8ea1f51f253ff5142ca11ae45193a4ad8c3ab5e9c6eec8ba7a4fcb7bac40",
      type: "???",
      maxTier: "legendary",
      maxLevel: 100,
      emoji: "❓",
    };

    petData.typeGroup = petData.typeGroup ?? pet.type;

    pet.rarity = pet.tier.toLowerCase();
    pet.stats = {};
    pet.ignoresTierBoost = petData.ignoresTierBoost;
    /** @type {string[]} */
    const lore = [];

    pet.rarity = getPetRarity(pet, petData);

    pet.level = getPetLevel(pet.exp, petData.customLevelExpRarityOffset ?? pet.rarity, petData.maxLevel);

    // Get texture
    if (typeof petData.head === "object") {
      pet.texture_path = petData.head[pet.rarity] ?? petData.head.default;
    } else {
      pet.texture_path = petData.head;
    }

    // Golden Dragon Pet hatching texture
    if (petData.hatching?.level > pet.level.level) {
      pet.texture_path = petData.hatching.head;
    }

    if (pet.rarity in (petData.upgrades ?? {})) {
      pet.texture_path = petData.upgrades[pet.rarity]?.head || pet.texture_path;
    }

    let petSkin = null;
    if (pet.skin && constants.PET_SKINS[`PET_SKIN_${pet.skin}`] !== undefined) {
      pet.texture_path = constants.PET_SKINS[`PET_SKIN_${pet.skin}`].texture;
      petSkin = constants.PET_SKINS[`PET_SKIN_${pet.skin}`].name;
    }

    // Get first row of lore
    const loreFirstRow = ["§8"];
    if (petData.type === "all") {
      loreFirstRow.push("All Skills");
    } else {
      loreFirstRow.push(helper.capitalizeFirstLetter(petData.type), " ", petData.category ?? "Pet");

      if (petData.obtainsExp === "feed") {
        loreFirstRow.push(", feed to gain XP");
      }

      if (petSkin) {
        loreFirstRow.push(`, ${petSkin} Skin`);
      }
    }

    lore.push(loreFirstRow.join(""), "");

    // Get name
    const petName = getPetName(pet, petData);

    const rarity = constants.RARITIES.indexOf(pet.rarity);

    const searchName = pet.type in constants.PET_STATS ? pet.type : "???";

    const petInstance = new constants.PET_STATS[searchName](rarity, pet.level.level, pet.extra, calculated);

    pet.stats = Object.assign({}, petInstance.stats);
    pet.ref = petInstance;

    if (pet.heldItem) {
      const { heldItem } = pet;

      if (heldItem in constants.PET_ITEMS) {
        for (const stat in constants.PET_ITEMS[heldItem]?.stats) {
          pet.stats[stat] ??= 0;

          pet.stats[stat] += constants.PET_ITEMS[heldItem].stats[stat];
        }

        for (const stat in constants.PET_ITEMS[heldItem]?.statsPerLevel) {
          pet.stats[stat] ??= 0;

          pet.stats[stat] += constants.PET_ITEMS[heldItem].statsPerLevel[stat] * pet.level.level;
        }

        for (const stat in constants.PET_ITEMS[heldItem]?.multStats) {
          pet.stats[stat] ??= 0;
          pet.stats[stat] *= constants.PET_ITEMS[heldItem].multStats[stat];
        }

        if ("multAllStats" in constants.PET_ITEMS[heldItem]) {
          for (const stat in pet.stats) {
            pet.stats[stat] *= constants.PET_ITEMS[heldItem].multAllStats;
          }
        }
      }

      // push specific pet lore before stats added (mostly cosmetic)
      if (constants.PET_DATA[pet.type]?.subLore !== undefined) {
        lore.push(constants.PET_DATA[pet.type].subLore, " ");
      }

      // push pet lore after held item stats added
      const stats = pet.ref.lore(pet.stats);
      for (const line of stats) {
        lore.push(line);
      }

      // then the ability lore
      const abilities = pet.ref.abilities;
      for (const ability of abilities) {
        lore.push(" ", ability.name);

        for (const description of ability.desc) {
          lore.push(description);
        }
      }

      // now we push the lore of the held items
      const heldItemObj = constants.PET_ITEMS[heldItem] ?? constants.PET_ITEMS["???"];
      if (heldItem in constants.PET_ITEMS) {
        lore.push("", `§6Held Item: §${constants.RARITY_COLORS[heldItemObj.tier.toLowerCase()]}${heldItemObj.name}`);
        lore.push(constants.PET_ITEMS[heldItem].description);
      } else {
        lore.push("", `§6Held Item: §c${helper.titleCase(heldItem.replaceAll("_", " "))}`);
        lore.push("§cThis item is not in our database yet. Please report it on our Discord server.");
      }

      // extra line
      lore.push(" ");
    } else {
      // no held items so push the new stats
      const stats = pet.ref.lore();
      for (const line of stats) {
        lore.push(line);
      }

      const abilities = pet.ref.abilities;
      for (const ability of abilities) {
        lore.push(" ", ability.name);

        for (const description of ability.desc) {
          lore.push(description);
        }
      }

      // extra line
      lore.push(" ");
    }

    // passive perks text
    if (petData.passivePerks) {
      lore.push("§8This pet's perks are active even when the pet is not summoned!", "");
    }

    // always gains exp text
    if (petData.alwaysGainsExp) {
      lore.push("§8This pet gains XP even when not summoned!", "");

      if (typeof petData.alwaysGainsExp === "string") {
        lore.push(`§8This pet only gains XP on the ${petData.alwaysGainsExp}§8!`, "");
      }
    }

    if (pet.level.level < petData.maxLevel) {
      lore.push(`§7Progress to Level ${pet.level.level + 1}: §e${(pet.level.progress * 100).toFixed(1)}%`);

      const progress = Math.ceil(pet.level.progress * 20);
      const numerator = pet.level.xpCurrent.toLocaleString();
      const denominator = helper.formatNumber(pet.level.xpForNext, false);

      lore.push(`§2${"-".repeat(progress)}§f${"-".repeat(20 - progress)} §e${numerator} §6/ §e${denominator}`);
    } else {
      lore.push("§bMAX LEVEL");
    }

    let progress = Math.floor((pet.exp / pet.level.xpMaxLevel) * 100);
    if (isNaN(progress)) {
      progress = 0;
    }

    lore.push(
      "",
      `§7Total XP: §e${helper.formatNumber(pet.exp, true, 1)} §6/ §e${helper.formatNumber(
        pet.level.xpMaxLevel,
        true,
        1,
      )} §6(${progress.toLocaleString()}%)`,
    );

    if (petData.obtainsExp !== "feed") {
      lore.push(`§7Candy Used: §e${pet.candyUsed || 0} §6/ §e10`);
    }

    if (pet.price > 0) {
      lore.push(
        "",
        `§7Item Value: §6${Math.round(pet.price).toLocaleString()} Coins §7(§6${helper.formatNumber(pet.price)}§7)`,
      );
    }

    pet.tag ??= {};
    pet.tag.display ??= {};
    pet.tag.display.Lore ??= [];
    for (const line of lore) {
      pet.tag.display.Lore.push(line);
    }

    pet.display_name = `${petName}${petSkin ? " ✦" : ""}`;
    pet.emoji = petData.emoji;
    pet.ref.profile = null;

    output.push(pet);
  }

  // I have no idea what's going on here so I'm just going to leave it as is
  output = output.sort((a, b) => {
    if (a.active === b.active) {
      if (a.rarity == b.rarity) {
        if (a.type == b.type) {
          return a.level.level > b.level.level ? -1 : 1;
        } else {
          let maxPetA = output
            .filter((x) => x.type == a.type && x.rarity == a.rarity)
            .sort((x, y) => y.level.level - x.level.level);

          maxPetA = maxPetA.length > 0 ? maxPetA[0].level.level : null;

          let maxPetB = output
            .filter((x) => x.type == b.type && x.rarity == b.rarity)
            .sort((x, y) => y.level.level - x.level.level);

          maxPetB = maxPetB.length > 0 ? maxPetB[0].level.level : null;

          if (maxPetA && maxPetB && maxPetA == maxPetB) {
            return a.type < b.type ? -1 : 1;
          } else {
            return maxPetA > maxPetB ? -1 : 1;
          }
        }
      } else {
        return constants.RARITIES.indexOf(a.rarity) < constants.RARITIES.indexOf(b.rarity) ? 1 : -1;
      }
    }

    return a.active ? -1 : 1;
  });

  return output;
}

function getMissingPets(pets, gameMode, userProfile) {
  const profile = {
    pets: [],
  };

  const missingPets = [];

  const ownedPetTypes = pets.map((pet) => constants.PET_DATA[pet.type]?.typeGroup || pet.type);

  for (const [petType, petData] of Object.entries(constants.PET_DATA)) {
    if (
      ownedPetTypes.includes(petData.typeGroup ?? petType) ||
      (petData.bingoExclusive === true && gameMode !== "bingo")
    ) {
      continue;
    }

    const key = petData.typeGroup ?? petType;

    missingPets[key] ??= [];
    missingPets[key].push({
      type: petType,
      active: false,
      exp: helper.getPetExp(constants.PET_DATA[petType].maxTier, constants.PET_DATA[petType].maxLevel),
      tier: constants.PET_DATA[petType].maxTier,
      candyUsed: 0,
      heldItem: null,
      skin: null,
      uuid: helper.generateUUID(),
    });
  }

  for (const pets of Object.values(missingPets)) {
    if (pets.length > 1) {
      // using exp to find the highest tier
      profile.pets.push(pets.sort((a, b) => b.exp - a.exp)[0]);
      continue;
    }

    profile.pets.push(pets[0]);
  }

  return getProfilePets(profile.pets, userProfile);
}

function getPetScore(pets) {
  const highestRarity = {};
  const highestLevel = {};

  for (const pet of pets) {
    if (constants.PET_DATA[pet.type]?.ignoredInPetScoreCalculation === true) {
      continue;
    }

    if (!(pet.type in highestRarity) || constants.PET_VALUE[pet.rarity] > highestRarity[pet.type]) {
      highestRarity[pet.type] = constants.PET_VALUE[pet.rarity];
    }

    if (!(pet.type in highestLevel) || pet.level.level > highestLevel[pet.type]) {
      if (constants.PET_DATA[pet.type] && pet.level.level < constants.PET_DATA[pet.type].maxLevel) {
        continue;
      }

      highestLevel[pet.type] = 1;
    }
  }

  const total =
    Object.values(highestRarity).reduce((a, b) => a + b, 0) + Object.values(highestLevel).reduce((a, b) => a + b, 0);

  let bonus = {};
  for (const score of Object.keys(constants.PET_REWARDS).reverse()) {
    if (parseInt(score) > total) {
      continue;
    }

    bonus = Object.assign({}, constants.PET_REWARDS[score]);

    break;
  }

  return {
    total: total,
    amount: bonus.magic_find,
    bonus: bonus,
  };
}

export async function getPets(userProfile, calculated, profile) {
  const output = {};

  // Get pets from profile
  const pets = userProfile.pets_data?.pets ?? [];

  // Adds pets from inventories
  if (calculated.items?.pets !== undefined) {
    pets.push(...calculated.items.pets);
  }

  // Add Montezume pet from the Rift
  if (userProfile.rift?.dead_cats?.montezuma !== undefined) {
    pets.push(userProfile.rift.dead_cats.montezuma);
    pets.at(-1).active = false;
  }

  if (pets.length === 0) {
    return;
  }

  for (const pet of pets) {
    await getItemNetworth(pet, { cache: true, returnItemData: false });
  }

  output.pets = getProfilePets(pets, calculated);
  output.missing = getMissingPets(output.pets, profile.game_mode, calculated);
  output.pet_score = getPetScore(output.pets);
  Object.assign(output, getMiscPetData(calculated, output.pets));

  return output;
}

function getMiscPetData(calculated, pets) {
  const output = {
    amount_pets: _.uniqBy(pets, "type").length,
    total_pets: _.uniqBy(
      Object.keys(constants.PET_DATA)
        .filter((pet) =>
          calculated.profile.game_mode === "bingo" ? constants.PET_DATA[pet] : !constants.PET_DATA[pet].bingoExclusive,
        )
        .map((pet) => constants.PET_DATA[pet].typeGroup),
    ).length,
    total_pet_skins: Object.keys(constants.PET_SKINS).length,
    amount_pet_skins: _.uniqBy(pets, "skin").length,

    total_candy_used: pets.reduce((a, b) => a + b.candyUsed, 0),
    total_pet_xp: pets.reduce((a, b) => a + b.exp, 0),
  };

  return output;
}

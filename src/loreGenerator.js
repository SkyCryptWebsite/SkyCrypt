module.exports = {
  makeLore: function (item) {
    const lore_raw = item?.tag?.display?.Lore;

    if (lore_raw == undefined) {
      return;
    }

    for (let i = 0; i < lore_raw.length; ++i) {
      if (!lore_raw[i].includes(":")) {
        continue;
      }

      let split = lore_raw[i].split(":")[1].split(" ");

      if (split.length < 2) {
        continue;
      }

      const statType = lore_raw[i].split(":")[0];

      switch (statType.substring(2)) {
        case "Damage":
          lore_raw[i] = statType + ": " + split[1].substring(0, 3) + item.stats.damage + " " + split.slice(2).join(" ");
          break;
        case "Health":
          if (item.equipmentType == "armor" && item.extra?.hpbs > 0) {
            const hpbString = ` HP §e(+${item.extra?.hpbs * 4} HP) `;
            lore_raw[i] =
              statType + ": " + split[1].substring(0, 3) + item.stats.health + hpbString + split.slice(5).join(" ");
          } else {
            lore_raw[i] =
              statType + ": " + split[1].substring(0, 3) + item.stats.health + " " + split.slice(2).join(" ");
          }
          break;
        case "Defense":
          if (item.equipmentType == "armor" && item.extra?.hpbs > 0) {
            const hpbString = ` §e(+${item.extra?.hpbs * 2}) `;
            lore_raw[i] =
              statType + ": " + split[1].substring(0, 3) + item.stats.defense + hpbString + split.slice(3).join(" ");
          } else {
            lore_raw[i] =
              statType + ": " + split[1].substring(0, 3) + item.stats.defense + " " + split.slice(2).join(" ");
          }
          break;
        case "Strength":
        case "Drunkenness":
          lore_raw[i] =
            statType + ": " + split[1].substring(0, 3) + item.stats.strength + " " + split.slice(2).join(" ");
          break;
        case "Speed":
        case "Pegleg Boost":
          lore_raw[i] = statType + ": " + split[1].substring(0, 3) + item.stats.speed + " " + split.slice(2).join(" ");
          break;
        case "Crit Chance":
          lore_raw[i] =
            statType + ": " + split[1].substring(0, 3) + item.stats.crit_chance + " " + split.slice(2).join(" ");
          break;
        case "Crit Damage":
          lore_raw[i] =
            statType + ": " + split[1].substring(0, 3) + item.stats.crit_damage + " " + split.slice(2).join(" ");
          break;
        case "Bonus Attack Speed":
          lore_raw[i] =
            statType + ": " + split[1].substring(0, 3) + item.stats.bonus_attack_speed + " " + split.slice(2).join(" ");
          break;
        case "Intelligence":
          lore_raw[i] =
            statType + ": " + split[1].substring(0, 3) + item.stats.intelligence + " " + split.slice(2).join(" ");
          break;
        case "Sea Creature Chance":
          lore_raw[i] =
            statType +
            ": " +
            split[1].substring(0, 3) +
            item.stats.sea_creature_chance +
            " " +
            split.slice(2).join(" ");
          break;
        case "Magic Find":
          lore_raw[i] =
            statType + ": " + split[1].substring(0, 3) + item.stats.magic_find + " " + split.slice(2).join(" ");
          break;
        case "Pet Luck":
          lore_raw[i] =
            statType + ": " + split[1].substring(0, 3) + item.stats.pet_luck + " " + split.slice(2).join(" ");
          break;
        case "Ferocity":
          lore_raw[i] =
            statType + ": " + split[1].substring(0, 3) + item.stats.ferocity + " " + split.slice(2).join(" ");
          break;
        case "Ability Damage":
          lore_raw[i] =
            statType + ": " + split[1].substring(0, 3) + item.stats.ability_damage + " " + split.slice(2).join(" ");
          break;
      }
    }
  },
};

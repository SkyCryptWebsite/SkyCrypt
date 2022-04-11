import * as helper from "../../../common/helper.js";
import * as constants from "../../../common/constants.js";

const stats: PlayerStats = {};

// Active armor stats
for (const piece of items.armor) {
  const pieceStats: ItemStats = helper.getStatsFromItem(piece as Item);

  for (const [name, value] of Object.entries(pieceStats)) {
    stats[name] ??= {};
    stats[name].armor ??= 0;
    stats[name].armor += value;
  }
}

// Active pet stats
const activePet = calculated.pets.find((pet) => pet.active);

if (activePet) {
  for (const [name, value] of Object.entries(activePet.stats)) {
    stats[name] ??= {};
    stats[name].pet ??= 0;
    stats[name].pet += value;
  }
}

// Held item stats
// todo: ...

// Active accessories stats
// todo: ...

// Skill bonus stats
// todo: ...

// Slayer bonus stats
// todo: ...

console.log(stats);

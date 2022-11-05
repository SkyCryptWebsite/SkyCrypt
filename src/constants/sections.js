export const SECTIONS = [
  {
    id: "islands",
    dependants: ["islands.crimson_isle"],
  },
  {
    id: "islands.crimson_isle",
    conditions: [`profile.visited_zones.includes("crimson_isle")`],
  },
  {
    id: "islands.crimson_isle.factions",
    conditions: [`Object.keys(profile.crimson_isle.factions).length > 0`],
  },
  {
    id: "islands.crimson_isle.kuudra",
    conditions: [`Object.keys(profile.crimson_isle.kuudra_completed_tiers).length > 0`],
  },
  {
    id: "islands.crimson_isle.dojo",
    conditions: [`Object.keys(profile.crimson_isle.dojo).length > 0`],
  },
];

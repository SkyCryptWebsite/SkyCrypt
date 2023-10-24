import fs from "fs-extra";
import { db } from "../mongo.js";
import * as helper from "../helper.js";

const FEATURED_PROFILES = [
  {
    // metalcupcake5
    uuid: "b44d2d5272dc49c28185b2d6a158d80a",
    type: "MAINTAINER",
    message: "nyaaaa~ :3",
  },
  {
    // MartinNemi03
    uuid: "f5667ad6b4b3434ba58f2ed2396f62f2",
    type: "MAINTAINER",
    message: '"lazy dev" &nbsp; <b>(ﾉ´･ω･)ﾉ ﾐ ┸━┸</b>',
  },
  {
    // jjww2
    uuid: "20d6334b7f9541ebbf7f860205ebf846",
    type: "MAINTAINER",
    message: "bob",
  },
  {
    // FantasmicGalaxy
    uuid: "aad581b2f90048a785a7573d31d7b862",
    type: "MAINTAINER",
    message: "ember armor no longer on top :((",
  },
  {
    // Shiiyu
    uuid: "d705483c5157460dad39712e4d74dfe1",
    type: "HOST",
    message: '<span class="stat-name">Last online: </span><span class="stat-value">January 1st, 1970</span>',
  },
  {
    // WarpWing
    uuid: "7d7b04b49c24433cacc60a3da66eba01",
    type: "MAINTAINER",
    message: "Grandmaster of Unit Testing",
  },
  {
    // DuckySoLucky
    uuid: "dec987bbfa734d63bb9d566139232f81",
    type: "CONTRIBUTOR",
    message: "Best Ratter EU",
  },
  {
    // LeaPhant
    uuid: "1915444928b64d8b8973df8044f8cdb7",
    type: "CONTRIBUTOR",
    message: "lea plant",
  },
  {
    // Cookie_Wookie_7
    uuid: "8a3fa60d87aa4240bcdc624b90632529",
    type: "CONTRIBUTOR",
    message: "Nate: CSS Wizard",
  },
  {
    // dukioooo
    uuid: "5435b597612f4554a3c651fd1c3ee96a",
    type: "CONTRIBUTOR",
    message: "/visit dukioooo",
  },
  {
    // Technoblade
    uuid: "b876ec32e396476ba1158438d83c67d4",
    type: "TECHNOBLADE",
    message: "<i>Long live the Potato King!</i>",
  },
];

{
  await Promise.all(
    FEATURED_PROFILES.map(async (featuredProfile, index) => {
      const profile = await helper.resolveUsernameOrUuid(featuredProfile.uuid, db);

      FEATURED_PROFILES[index].username = profile.display_name;
      FEATURED_PROFILES[index].emoji = profile?.emoji;
    })
  );

  const cachePath = helper.getCacheFolderPath(helper.getFolderPath());
  await fs.writeJson(helper.getCacheFilePath(cachePath, "json", "featured-profiles", "json"), FEATURED_PROFILES);

  // console.log("Featured profiles updated!");
}

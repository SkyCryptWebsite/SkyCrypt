import { db } from "../mongo.js";

const featuredProfiles = [
  {
    // username: "metalcupcake5",
    uuid: "b44d2d5272dc49c28185b2d6a158d80a",
    position: 1,
    type: "MAINTAINER",
    message: "a dev or something idk",
  },
  {
    // username: "MartinNemi03",
    uuid: "f5667ad6b4b3434ba58f2ed2396f62f2",
    position: 2,
    type: "MAINTAINER",
    message: '"lazy dev" &nbsp; <b>(ﾉ´･ω･)ﾉ ﾐ ┸━┸</b>',
  },
  {
    // username: "jjww2",
    uuid: "20d6334b7f9541ebbf7f860205ebf846",
    position: 3,
    type: "MAINTAINER",
    message: "bob",
  },
  {
    // username: "FantasmicGalaxy",
    uuid: "aad581b2f90048a785a7573d31d7b862",
    position: 4,
    type: "MAINTAINER",
    message: "ember armor no longer on top :((",
  },
  {
    // username: "Shiiyu",
    uuid: "d705483c5157460dad39712e4d74dfe1",
    position: 5,
    type: "HOST",
    message: '<span class="stat-name">Last online: </span><span class="stat-value">January 1st, 1970</span>',
  },
  {
    // username: "LeaPhant",
    uuid: "1915444928b64d8b8973df8044f8cdb7",
    position: 6,
    type: "CONTRIBUTOR",
    message: "lea plant",
  },
  {
    // username: "Cookie_Wookie_7",
    uuid: "8a3fa60d87aa4240bcdc624b90632529",
    position: 7,
    type: "CONTRIBUTOR",
    message: "Nate: CSS Wizard",
  },
  {
    // username: "dukioooo",
    uuid: "5435b597612f4554a3c651fd1c3ee96a",
    position: 8,
    type: "CONTRIBUTOR",
    message: "¯\\_(ツ)_/¯",
  },
];

{
  await db.collection("featuredProfiles").deleteMany({});

  await Promise.all(
    featuredProfiles.map(async (featuredProfile) => {
      const userDocument = await db.collection("usernames").findOne({ uuid: featuredProfile.uuid });

      if (userDocument) {
        for (const data in featuredProfile) {
          userDocument[data] = featuredProfile[data];
        }

        await db
          .collection("featuredProfiles")
          .updateOne({ _id: userDocument._id }, { $set: userDocument }, { upsert: true });
      }
    })
  );

  console.log("Featured profiles updated!");
}

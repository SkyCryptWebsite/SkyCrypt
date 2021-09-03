import { db } from "../mongo.js";

const featuredProfiles = [
  {
    username: "metalcupcake5",
    position: 1,
    type: "MAINTAINER",
    message: "a dev or something idk",
  },
  {
    username: "MartinNemi03",
    position: 2,
    type: "MAINTAINER",
    message: '"lazy dev" &nbsp; <b>(ﾉ´･ω･)ﾉ ﾐ ┸━┸</b>',
  },
  {
    username: "jjww2",
    position: 3,
    type: "MAINTAINER",
    message: "bob",
  },
  {
    username: "FantasmicGalaxy",
    position: 4,
    type: "MAINTAINER",
    message: "ember armor no longer on top :((",
  },
  {
    username: "Shiiyu",
    position: 5,
    type: "HOST",
    message: '<span class="stat-name">Last online: </span><span class="stat-value">January 1st, 1970</span>',
  },
  {
    username: "LeaPhant",
    position: 6,
    type: "CONTRIBUTOR",
    message: "lea plant",
  },
  {
    username: "Cookie_Wookie_7",
    position: 7,
    type: "CONTRIBUTOR",
    message: "Nate: CSS Wizard",
  },
  {
    username: "dukioooo",
    position: 8,
    type: "CONTRIBUTOR",
    message: "¯\\_(ツ)_/¯",
  },
];

await db.collection("topViews").deleteMany({});

await Promise.all(
  featuredProfiles.map(async (featuredProfile) => {
    const userDocument = await db.collection("usernames").findOne({ username: featuredProfile.username });

    if (userDocument) {
      for (let data in featuredProfile) {
        userDocument[data] = featuredProfile[data];
      }

      await db.collection("topViews").updateOne({ _id: userDocument._id }, { $set: userDocument }, { upsert: true });
    }
  })
);

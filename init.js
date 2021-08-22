import * as fsExtra from "fs-extra";
import * as constants from "./src/constants.cjs";
import { MongoClient } from "mongodb";
import credentials from "./src/credentials.js";

fsExtra.ensureDirSync("cache");

async function main() {
  const mongo = new MongoClient(credentials.dbUrl, { useUnifiedTopology: true });
  await mongo.connect();

  const db = mongo.db(credentials.dbName);

  await db.collection("apiKeys").createIndex({ key: 1 }, { unique: true });

  await db.collection("profileStore").createIndex({ uuid: 1 }, { unique: true });

  await db.collection("profileStore").createIndex({ apis: 1 }, { partialFilterExpression: { apis: true } });

  await db.collection("usernames").createIndex({ username: "text" });

  await db.collection("usernames").createIndex({ uuid: 1 }, { unique: true });

  await db.collection("favoriteCache").createIndex({ uuid: 1 }, { unique: true });

  await db.collection("members").createIndex({ uuid: 1, profile_id: 1 }, { unique: true });

  await db.collection("guilds").createIndex({ gid: 1 }, { unique: true });

  await db.collection("guildMembers").createIndex({ uuid: 1 }, { unique: true });

  await db.collection("guildMembers").createIndex({ gid: 1 });

  await db.collection("items").createIndex({ id: 1 }, { unique: true });

  await db.collection("items").createIndex({ name: "text", tag: "text" });

  for (const id in constants.item_tags) {
    await db.collection("items").updateOne({ id }, { $set: { tag: constants.item_tags[id] } });
  }

  await db.collection("bazaar").createIndex({ productId: 1 }, { unique: true });

  await db.collection("hypixelPlayers").createIndex({ uuid: 1 }, { unique: true });

  await db.collection("profileCache").createIndex({ profile_id: 1 }, { unique: true });

  await db.collection("topViews").createIndex({ total: -1 });

  await db.collection("topViews").deleteMany({});

  mongo.close();
  process.exit(0);
}

main();

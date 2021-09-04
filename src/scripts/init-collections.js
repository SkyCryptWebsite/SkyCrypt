import { db } from "../mongo.js";
import { item_tags } from "../constants.js";

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

await Promise.all(
  Object.entries(item_tags).map(([id, item]) => db.collection("items").updateOne({ id }, { $set: { tag: item } }))
);

await db.collection("bazaar").createIndex({ productId: 1 }, { unique: true });

await db.collection("hypixelPlayers").createIndex({ uuid: 1 }, { unique: true });

await db.collection("profileCache").createIndex({ profile_id: 1 }, { unique: true });

await db.collection("featuredProfiles").createIndex({ total: -1 });

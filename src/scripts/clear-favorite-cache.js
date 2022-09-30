import { db } from "../mongo.js";

async function clearFavoriteCache() {
  // Clear cache for favorite
  await db.collection("favoriteCache").deleteMany({});

  setTimeout(clearFavoriteCache, 15 * 60 * 1000);
}

clearFavoriteCache();

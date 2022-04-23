import { db } from "../mongo.js";
import axios from "axios";
import "axios-debug-log";

const Hypixel = axios.create({
  baseURL: "https://api.hypixel.net/",
});

async function updateAchievements() {
  try {
    const response = await Hypixel.get("resources/achievements" /*, { params: { key: credentials.hypixel_api_key }}*/);

    const achievements = [];
    const { one_time, tiered } = response.data.achievements.skyblock;

    for (const achId in one_time) {
      achievements.push({
        id: achId,
        one_time: true,
        achievement: one_time[achId],
      });
    }

    for (const achId in tiered) {
      achievements.push({
        id: achId,
        tiered: true,
        achievement: tiered[achId],
      });
    }

    achievements.forEach(async (item) => {
      await db.collection("achievements").updateOne({ id: item.id }, { $set: item }, { upsert: true });
    });
  } catch (e) {
    console.error(e);
  }

  setTimeout(updateAchievements, 1000 * 60 * 60 * 6);
}

updateAchievements();

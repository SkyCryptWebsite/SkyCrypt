import credentials from "../credentials.js";
import lilyWeight from "lilyweight";
const lily = lilyWeight(credentials.hypixel_api_key);


export async function calculateLilyWeight(uuid) {
  const weight = await lily.getWeight(uuid);
  return weight;
}

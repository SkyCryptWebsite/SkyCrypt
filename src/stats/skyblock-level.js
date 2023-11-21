import { getLeaderboardPosition } from "../helper/leaderboards.js";
import { getLevelByXp } from "./skills/leveling.js";

export async function getSkyBlockLevel(userProfile) {
  const skyblockExperience = userProfile.leveling?.experience ?? 0;

  const output = getLevelByXp(skyblockExperience, {
    skill: "skyblock_level",
    type: "skyblock_level",
    infinite: true,
    ignoreCap: true,
  });

  output.rank = await getLeaderboardPosition("skyblock_level_xp", skyblockExperience);

  return output;
}

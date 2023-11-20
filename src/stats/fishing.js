export function getFishing(userProfile) {
  if (userProfile.player_stats === undefined) {
    return;
  }

  return {
    total: userProfile.player_stats.items_fished?.total ?? 0,
    treasure: userProfile.player_stats.items_fished?.treasure ?? 0,
    treasure_large: userProfile.player_stats.items_fished?.large_treasure ?? 0,
    shredder_fished: userProfile.player_stats.shredder_rod?.fished ?? 0,
    shredder_bait: userProfile.player_stats.shredder_rod?.bait ?? 0,
    trophy_fish: userProfile.player_stats.items_fished?.trophy_fish ?? 0,
  };
}

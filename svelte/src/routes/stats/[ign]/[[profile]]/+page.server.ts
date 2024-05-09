import type { PageServerLoad } from "./$types";
import type { Profile, calculated } from "$lib/types/globals";
const baseAPI = "https://sky.shiiyu.moe/api/v2/";

export const load = (async ({ params, fetch }) => {
  const { ign, profile } = params;

  type profiles = {
    profiles: {
      [key: string]: Profile & {
        profile_id: string;
        cute_name: string;
        game_mode: string;
        current: boolean;
        raw: any;
        data: typeof calculated;
      };
    };
  };
  const data = fetch(`${baseAPI}profile/${ign}`)
    .then((res) => res.json())
    .then((data: profiles) => {
      const profiles = Object.values(data.profiles);
      if (profile) {
        // return the correct profile based off cute_name
        return {
          profile: profiles.find((p) => p.cute_name === profile),
          profiles: profiles.filter((p) => p.cute_name !== profile)
        };
      }
      // return the current profile
      return {
        profile: profiles.find((p) => p.current),
        profiles: profiles.filter((p) => !p.current)
      };
    })
    .catch((err) => {
      console.error(err);
      return null;
    });

  return {
    user: data
  };
}) satisfies PageServerLoad;

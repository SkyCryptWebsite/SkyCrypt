import type { Profiles } from "$lib/types/globals";
import type { PageServerLoad } from "./$types";

const baseAPI = "https://sky.shiiyu.moe/api/v2/";

export const load = (async ({ params, fetch }) => {
  const { ign, profile } = params;

  const data = fetch(`${baseAPI}profile/${ign}`)
    .then((res) => res.json())
    .then((data: Profiles) => {
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

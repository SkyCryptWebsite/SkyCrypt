<script lang="ts">
  import AdditionalStats from "$lib/layouts/stats/AdditionalStats.svelte";
  import PlayerProfile from "$lib/layouts/stats/PlayerProfile.svelte";
  import Skills from "$lib/layouts/stats/Skills.svelte";
  import Stats from "$lib/layouts/stats/Stats.svelte";
  import type { FullProfile } from "$lib/types/globals";
  import { setContext } from "svelte";

  export let profile;
  export let profiles;

  setContext<FullProfile>("profile", profile);
  setContext<FullProfile[]>("profiles", profiles);
</script>

<main class="mx-auto space-y-5 p-8">
  <PlayerProfile />
  <Skills />
  <Stats />
  <AdditionalStats />
</main>

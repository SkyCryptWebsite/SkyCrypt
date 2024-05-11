<script lang="ts">
  import AdditionalStats from "$lib/layouts/stats/AdditionalStats.svelte";
  import PlayerProfile from "$lib/layouts/stats/PlayerProfile.svelte";
  import Skills from "$lib/layouts/stats/Skills.svelte";
  import Stats from "$lib/layouts/stats/Stats.svelte";
  import Armor from "$lib/sections/stats/Armor.svelte";
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
  <Armor />
</main>

<svg xmlns="http://www.w3.org/2000/svg" height="0" width="0" style="position: fixed;">
  <filter id="enchanted-glint">
    <feImage href="/img/enchanted-glint.png" />
    <feComposite in2="SourceGraphic" operator="in" />
    <feBlend in="SourceGraphic" mode="screen" />
  </filter>
</svg>

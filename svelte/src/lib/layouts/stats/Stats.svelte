<script lang="ts">
  import Stat from "$lib/components/Stat.svelte";
  import type { FullProfile } from "$lib/types/globals";
  import { getContext } from "svelte";

  const profile = getContext<FullProfile>("profile");
</script>

<div class="stats flex max-h-44 flex-col sm:flex-wrap">
  {#each Object.entries(profile.data.stats) as [statName, statData]}
    <Stat stat={statName} {statData} />
  {/each}
</div>

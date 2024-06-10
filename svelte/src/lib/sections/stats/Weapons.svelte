<script lang="ts">
  import AdditionStat from "$lib/components/AdditionStat.svelte";
  import Item from "$lib/components/Item.svelte";
  import Items from "$lib/layouts/stats/Items.svelte";
  import type { FullProfile, Item as ItemType } from "$lib/types/globals";
  import { getContext } from "svelte";

  const profile = getContext<FullProfile>("profile");

  // @ts-ignore We're gonna need to fix these type errors later by redoing the types
  const weapons = profile.data.items.weapons;
</script>

<Items title="Weapons">
  <div slot="text">
    <!-- add colors later -->
    <AdditionStat text="Active Weapon" data={weapons.highest_priority_weapon.tag.display.Name} />
  </div>
  {#each weapons.weapons as weapon}
    <Item piece={weapon} />
  {/each}
</Items>

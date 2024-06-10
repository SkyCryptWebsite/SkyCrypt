<script lang="ts">
  import Item from "$lib/components/Item.svelte";
  import Wardrobe from "$lib/components/Wardrobe.svelte";
  import Items from "$lib/layouts/stats/Items.svelte";
  import { getRarityClass } from "$lib/tools";
  import type { FullProfile, Item as ItemType } from "$lib/types/globals";
  import { cn } from "$lib/utils";
  import { getContext } from "svelte";

  const profile = getContext<FullProfile>("profile");

  // @ts-ignore We're gonna need to fix these type errors later by redoing the types
  const armor = profile.data.items.armor;
  // @ts-ignore We're gonna need to fix these type errors later by redoing the types
  const equipment = profile.data.items.equipment;
  // @ts-ignore We're gonna need to fix these type errors later by redoing the types
  const wardrobe = profile.data.items.wardrobe as ItemType[][];

  // Get the first non-null item from each wardrobe array and discard the rest
  const firstWardrobeItems = wardrobe.map((wardrobeItems) => wardrobeItems.find((piece) => piece));
</script>

<Items title="Armor">
  <p slot="text" class="space-x-0.5 font-bold capitalize leading-6 text-text/60">
    <span>Set:</span>
    <span class={cn(getRarityClass(armor.set_rarity, "text"))}>{armor.set_name}</span>
  </p>

  {#each armor.armor as piece}
    <Item {piece} />
  {/each}

  <p slot="info" class="space-x-0.5 font-bold capitalize leading-6 text-text/60">
    <span>Bonus:</span>
    <!-- TODO: Add bonus -->
    <span class={cn(getRarityClass(armor.set_rarity, "text"))}>TODO: Add bonus</span>
  </p>
</Items>

<Items subtitle="Equipment">
  {#each equipment.equipment as piece}
    <Item {piece} />
  {/each}

  <p slot="info" class="space-x-0.5 capitalize text-text/60">
    <span>Bonus:</span>
    <!-- TODO: Add bonus -->
    <span class={cn(getRarityClass(armor.set_rarity, "text"))}>TODO: Add bonus</span>
  </p>
</Items>

<Items subtitle="Wardrobe">
  {#each firstWardrobeItems as firstWardrobeItem, i}
    <Wardrobe {firstWardrobeItem} wardrobeItems={wardrobe[i]} />
  {/each}
</Items>

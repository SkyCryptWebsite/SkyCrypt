<script lang="ts">
  import Item from "$lib/components/Item.svelte";
  import type { Item as ItemType } from "$lib/types/globals";
  import { Collapsible } from "bits-ui";
  import { writable } from "svelte/store";
  import { slide } from "svelte/transition";

  export let firstWardrobeItem: ItemType | undefined;
  export let wardrobeItems: ItemType[];

  const expanded = writable<boolean>(false);
</script>

<Collapsible.Root bind:open={$expanded}>
  <Collapsible.Trigger>
    {#if firstWardrobeItem}
      <Item piece={firstWardrobeItem} />
    {/if}
  </Collapsible.Trigger>
  <Collapsible.Content transition={slide} class="mt-2 flex flex-col gap-2">
    {#each wardrobeItems as piece}
      {#if piece}
        {#if piece !== firstWardrobeItem}
          <Item {piece} />
        {/if}
      {:else}
        <!-- TODO: Add placeholders -->
        <div class="flex size-24 items-center justify-center rounded-lg bg-background-lore">
          <p class="text-text/60">TODO: <br /> Add placeholders</p>
        </div>
      {/if}
    {/each}
  </Collapsible.Content>
</Collapsible.Root>

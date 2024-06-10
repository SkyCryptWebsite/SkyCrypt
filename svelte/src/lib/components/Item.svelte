<script lang="ts">
  import { getRarityClass, isEnchanted, removeFormatting, renderLore } from "$lib/tools";
  import type { Item } from "$lib/types/globals";
  import { cn, flyAndScale } from "$lib/utils";
  import { Avatar, Tooltip } from "bits-ui";
  import Image from "lucide-svelte/icons/image";

  export let piece: Item;

  const itemNameHtml = renderLore(piece.tag.display.Name ?? piece.display_name ?? "???");
  const isMulticolor = (itemNameHtml.match(/<\/span>/g) || []).length > 1;
  const bgColor = getRarityClass(piece.rarity as string, "bg");
  const enchanted = isEnchanted(piece);
</script>

<div class="contents">
  <Tooltip.Root group="armor" openDelay={0} closeDelay={0}>
    <Tooltip.Trigger class={cn(`flex items-center justify-center rounded-lg p-4`, bgColor)}>
      <Avatar.Root>
        <Avatar.Image src={`https://sky.shiiyu.moe${piece.texture_path ? piece.texture_path : `/`}`} alt={piece.display_name} class="data-[enchanted=true]:enchanted h-auto w-16 select-none" data-enchanted={enchanted} />
        <Avatar.Fallback>
          <Image class="size-16" />
        </Avatar.Fallback>
      </Avatar.Root>
    </Tooltip.Trigger>
    <Tooltip.Content class="pointer-events-none z-50 w-max min-w-96 max-w-[calc(100vw-2.5rem)] select-text overflow-hidden rounded-lg bg-background-lore font-icomoon" transition={flyAndScale} transitionConfig={{ x: -8, duration: 150 }} sideOffset={8} side="right" align="center">
      <div class={cn(`flex flex-nowrap items-center justify-center gap-4 p-5`, bgColor)}>
        <Avatar.Root>
          <Avatar.Image src={`https://sky.shiiyu.moe${piece.texture_path ? piece.texture_path : `/`}`} alt={piece.display_name} class="data-[enchanted=true]:enchanted h-auto w-8 flex-none overflow-hidden" data-enchanted={enchanted} />
          <Avatar.Fallback>
            <Image class="size-8" />
          </Avatar.Fallback>
        </Avatar.Root>

        <p class="relative flex-1 text-center text-lg font-semibold uppercase data-[multicolor=true]:rounded-full data-[multicolor=true]:bg-background-lore data-[multicolor=true]:px-2 data-[multicolor=true]:py-1 data-[multicolor=false]:text-text" data-multicolor={isMulticolor}>
          {@html isMulticolor ? itemNameHtml : removeFormatting(itemNameHtml)}
        </p>
      </div>
      <div class="p-6 font-semibold leading-snug">
        {#each piece.tag.display.Lore as lore}
          {@html renderLore(lore)}
        {/each}
      </div>
    </Tooltip.Content>
  </Tooltip.Root>
</div>

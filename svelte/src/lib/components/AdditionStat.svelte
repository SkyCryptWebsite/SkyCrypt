<script lang="ts">
  import { cn, flyAndScale } from "$lib/utils";
  import { Tooltip } from "bits-ui";
  export let text: string;
  export let data: string;
  export let asterisk: boolean = false;

  let className: string | null | undefined = undefined;
  export { className as class };
</script>

<Tooltip.Root group="additional-stats" openDelay={0} closeDelay={0}>
  <Tooltip.Trigger class={cn(`my-0 flex items-center gap-1 text-sm font-bold text-text/60 data-[is-tooltip=false]:cursor-default`, className)} data-is-tooltip={asterisk}>
    <div class="capitalize">{text}:</div>
    <span class="-mr-0.5 text-text">{data}</span>
    {#if asterisk}
      *
    {/if}
  </Tooltip.Trigger>
  {#if asterisk}
    <Tooltip.Content class="z-50 rounded-lg bg-background-grey p-4" transition={flyAndScale} transitionConfig={{ y: 8, duration: 150 }} sideOffset={6} side="top" align="center">
      <slot />
      <Tooltip.Arrow />
    </Tooltip.Content>
  {/if}
</Tooltip.Root>

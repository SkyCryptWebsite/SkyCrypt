<script lang="ts">
  import { formatNumber } from "$lib/tools";
  import type { Level } from "$lib/types/globals";
  import { cn, flyAndScale } from "$lib/utils";
  import { Avatar, Progress, Tooltip } from "bits-ui";
  import BarChartHorizontal from "lucide-svelte/icons/bar-chart-horizontal";
  import { format } from "numerable";
  import { createHover } from "svelte-interactions";

  export let skill: string;
  export let skillData: Level;

  let className: string | null | undefined = undefined;
  export { className as class };

  const { hoverAction, isHovered } = createHover();

  const isMaxed = skillData.level === skillData.maxLevel;
</script>

<div class={cn("group relative flex flex-grow basis-full flex-col sm:basis-1/3 sm:last:grow-0 sm:last:basis-1/2", className)} data-hover={$isHovered} data-maxed={isMaxed} use:hoverAction>
  <Tooltip.Root group="skills" openDelay={0} closeDelay={0}>
    <Tooltip.Trigger class="group-data-[maxed=true]:shine absolute bottom-0 left-0 z-20 flex size-9 items-center justify-center rounded-full p-1 drop-shadow group-data-[maxed=false]:bg-icon group-data-[maxed=true]:bg-maxed">
      <Avatar.Root class="select-none">
        <!-- TODO: Add minecraft icons -->
        <Avatar.Image class="pointer-events-none" />
        <Avatar.Fallback>
          <BarChartHorizontal class="pointer-events-none size-6" />
        </Avatar.Fallback>
      </Avatar.Root>
    </Tooltip.Trigger>
    <Tooltip.Content class="z-50 rounded-lg bg-background-grey p-4" transition={flyAndScale} transitionConfig={{ y: 8, duration: 150 }} sideOffset={6} side="top" align="center">
      <Tooltip.Arrow />
      <div class="text-lg font-semibold text-text">
        <span class="text-text/80">Rank:</span>
        {`#${skillData.rank}`}
      </div>
    </Tooltip.Content>
  </Tooltip.Root>

  <div class="relative ml-10 text-sm font-semibold capitalize">
    {skill}
    <span class="text-text/80">
      {skillData.level}
    </span>
  </div>
  <Progress.Root value={skillData.xpCurrent} max={isMaxed ? skillData.xpCurrent : skillData.xpForNext} class="relative ml-2 h-4 w-full overflow-hidden rounded-full bg-text/30">
    <div class="absolute z-10 flex h-full w-full justify-center">
      <div class="text-xs font-semibold shadow-background/50 text-shadow">
        {#if $isHovered && !isMaxed}
          {format(skillData.xpCurrent)} / {format(skillData.xpForNext)}
        {:else if !isMaxed}
          {formatNumber(skillData.xpCurrent)} / {formatNumber(skillData.xpForNext)}
        {/if}

        {#if $isHovered && isMaxed}
          {format(skillData.xpCurrent)}
        {:else if isMaxed}
          {formatNumber(skillData.xpCurrent)}
        {/if}
        XP
      </div>
    </div>
    <div class="h-full w-full flex-1 rounded-full transition-all duration-1000 ease-in-out group-data-[maxed=false]:bg-skillbar group-data-[maxed=true]:bg-maxedbar" style={`transform: translateX(-${100 - (skillData.xpCurrent / (isMaxed ? skillData.xpCurrent : skillData.xpForNext)) * 100}%)`} />
  </Progress.Root>
</div>

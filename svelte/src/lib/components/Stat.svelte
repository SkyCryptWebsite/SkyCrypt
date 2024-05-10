<script lang="ts">
  import type { StatName } from "$lib/types/globals";
  import { cn, flyAndScale } from "$lib/utils";
  import { format } from "numerable";
  import { Tooltip } from "bits-ui";
  export let stat: string;
  export let statData: number;

  let className: string | null | undefined = undefined;
  export { className as class };

  const statIcons: Record<StatName, { icon: string; percent: boolean; color: string }> = {
    health: {
      icon: "❤",
      percent: false,
      color: "text-minecraft-c"
    },
    defense: {
      icon: "❈",
      percent: false,
      color: "text-minecraft-a"
    },
    strength: {
      icon: "❁",
      percent: false,
      color: "text-minecraft-c"
    },
    speed: {
      icon: "✦",
      percent: false,
      color: "text-minecraft-f"
    },
    crit_chance: {
      icon: "☣",
      percent: true,
      color: "text-minecraft-9"
    },
    crit_damage: {
      icon: "☠",
      percent: true,
      color: "text-minecraft-9"
    },
    intelligence: {
      icon: "✎",
      percent: false,
      color: "text-minecraft-b"
    },
    bonus_attack_speed: {
      icon: "⚔",
      percent: true,
      color: "text-minecraft-e"
    },
    sea_creature_chance: {
      icon: "α",
      percent: true,
      color: "text-minecraft-3"
    },
    magic_find: {
      icon: "✯",
      percent: false,
      color: "text-minecraft-b"
    },
    pet_luck: {
      icon: "♣",
      percent: false,
      color: "text-minecraft-d"
    },
    true_defense: {
      icon: "❂",
      percent: false,
      color: "text-minecraft-f"
    },
    ferocity: {
      icon: "⫽",
      percent: false,
      color: "text-minecraft-c"
    },
    ability_damage: {
      icon: "๑",
      percent: true,
      color: "text-minecraft-c"
    },
    mining_speed: {
      icon: "⸕",
      percent: false,
      color: "text-minecraft-6"
    },
    mining_fortune: {
      icon: "☘",
      percent: false,
      color: "text-minecraft-6"
    },
    farming_fortune: {
      icon: "☘",
      percent: false,
      color: "text-minecraft-6"
    },
    foraging_fortune: {
      icon: "☘",
      percent: false,
      color: "text-minecraft-6"
    },
    pristine: {
      icon: "✧",
      percent: false,
      color: "text-minecraft-5"
    },
    fishing_speed: {
      icon: "☂",
      percent: false,
      color: "text-minecraft-b"
    },
    health_regen: {
      icon: "❣",
      percent: false,
      color: "text-minecraft-c"
    },
    vitality: {
      icon: "♨",
      percent: false,
      color: "text-minecraft-4"
    },
    mending: {
      icon: "☄",
      percent: false,
      color: "text-minecraft-a"
    },
    combat_wisdom: {
      icon: "☯",
      percent: false,
      color: "text-minecraft-3"
    },
    mining_wisdom: {
      icon: "☯",
      percent: false,
      color: "text-minecraft-3"
    },
    farming_wisdom: {
      icon: "☯",
      percent: false,
      color: "text-minecraft-3"
    },
    foraging_wisdom: {
      icon: "☯",
      percent: false,
      color: "text-minecraft-3"
    },
    fishing_wisdom: {
      icon: "☯",
      percent: false,
      color: "text-minecraft-3"
    },
    enchanting_wisdom: {
      icon: "☯",
      percent: false,
      color: "text-minecraft-3"
    },
    alchemy_wisdom: {
      icon: "☯",
      percent: false,
      color: "text-minecraft-3"
    },
    carpentry_wisdom: {
      icon: "☯",
      percent: false,
      color: "text-minecraft-3"
    },
    runecrafting_wisdom: {
      icon: "☯",
      percent: false,
      color: "text-minecraft-3"
    },
    social_wisdom: {
      icon: "☯",
      percent: false,
      color: "text-minecraft-3"
    },
    effective_health: {
      icon: "❤",
      percent: false,
      color: "text-minecraft-c"
    },
    damage: {
      icon: "⚔",
      percent: false,
      color: "text-minecraft-c"
    },
    damage_increase: {
      icon: "⚔",
      percent: true,
      color: "text-minecraft-c"
    }
  };
</script>

<div>
  <Tooltip.Root group="stats" openDelay={0} closeDelay={0}>
    <Tooltip.Trigger class={cn(`my-0 flex items-center gap-1 text-sm font-bold ${statIcons[stat].color}`, className)}>
      <div class="font-icomoon inline-block text-base">{statIcons[stat].icon}</div>
      <span class="capitalize">{stat.replace(/_/g, " ")}</span>
      <span class="text-text">
        {format(statData)}{#if statIcons[stat].percent}%{/if}
      </span>
    </Tooltip.Trigger>
    <Tooltip.Content class="z-50 rounded-lg bg-background-grey p-4" transition={flyAndScale} transitionConfig={{ y: 8, duration: 150 }} sideOffset={6} side="top" align="center">
      <!-- TODO: Add general info about the stat -->
      General information about the stat.
      <Tooltip.Arrow />
    </Tooltip.Content>
  </Tooltip.Root>
</div>

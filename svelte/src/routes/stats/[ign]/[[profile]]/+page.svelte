<script lang="ts">
  import AdditionStat from "$lib/components/AdditionStat.svelte";
  import Skillbar from "$lib/components/Skillbar.svelte";
  import Stat from "$lib/components/Stat.svelte";
  import { flyAndScale, formatNumber } from "$lib/utils";
  import { Button, DropdownMenu } from "bits-ui";
  import { format as dateFormat, formatDistanceToNowStrict } from "date-fns";
  import ChevronRight from "lucide-svelte/icons/chevron-right";
  import ExternalLink from "lucide-svelte/icons/external-link";
  import Star from "lucide-svelte/icons/star";
  import { format as numberFormat } from "numerable";
  import type { PageData } from "./$types";

  const defaultPatternDecimal: string = "0,0.##";
  const defaultPattern: string = "0,0";

  export let data: PageData;

  (async () => {
    console.log((await data.user)?.profile);
  })();
</script>

{#await data.user then user}
  {#if user}
    {@const profile = user.profile}
    {#if profile}
      <main class="mx-auto space-y-5 p-8">
        <div class="mt-12 flex flex-wrap items-center gap-x-2 gap-y-3 text-4xl">
          Stats for
          <div class="inline-flex items-center gap-2 rounded-full bg-[#7f7f7f33] px-4 py-2 align-middle text-3xl font-semibold">
            <div class="nice-colors-dark light dark relative flex items-center justify-center overflow-hidden rounded-full bg-minecraft-b px-2 py-1 text-xl">
              <div class="relative z-20 inline-flex justify-between gap-3">
                <span>MVP</span>
                <span>+</span>
              </div>
              <div class="absolute -right-3 bottom-0 top-0 z-10 h-14 w-1/2 bg-minecraft-6" style="transform: skew(-20deg);"></div>
            </div>
            {profile.data.display_name}
          </div>
          on
          <DropdownMenu.Root>
            <DropdownMenu.Trigger class="inline-flex items-center rounded-full bg-[#7f7f7f33] px-4 py-2 align-middle text-3xl font-semibold">
              {profile.cute_name}
            </DropdownMenu.Trigger>

            <DropdownMenu.Content class="z-[99999]  min-w-64 overflow-hidden rounded-lg bg-background-grey/95 text-3xl font-semibold" align="start" side="bottom" transition={flyAndScale} transitionConfig={{ y: -8, duration: 150 }}>
              {#each user.profiles as otherProfile}
                <DropdownMenu.Item href={`/stats/${profile.data.display_name}/${otherProfile.cute_name}`} class="flex items-center px-4 py-2 hover:bg-text/20" data-sveltekit-preload-code="viewport">
                  {otherProfile.cute_name}
                </DropdownMenu.Item>
              {/each}
            </DropdownMenu.Content>
          </DropdownMenu.Root>
        </div>
        <div class="flex flex-wrap items-center gap-x-4 gap-y-2">
          <Button.Root class="rounded-full bg-icon/90 p-1 transition-opacity duration-150 hover:bg-icon">
            <Star class="size-5" />
          </Button.Root>

          <Button.Root class="rounded-full bg-icon/90 px-2 py-1 font-semibold transition-opacity duration-150 hover:bg-icon">Load Guild</Button.Root>

          <Button.Root href={`https://plancke.io/hypixel/player/stats/${profile.data.display_name}`} class="flex items-center justify-center gap-1.5 rounded-full bg-icon/90 px-2 py-1 font-semibold transition-opacity duration-150 hover:bg-icon">
            Planke <ExternalLink class="size-4" />
          </Button.Root>

          <Button.Root class="rounded-full bg-icon/90 p-1 transition-opacity duration-150 hover:bg-icon">
            <ChevronRight class="size-5" />
          </Button.Root>
        </div>

        <div class="skills space-y-2">
          <Skillbar class="sm:w-full" skill="Level" skillData={profile.data.skyblock_level} />

          <div class="flex flex-col flex-wrap gap-x-4 gap-y-2 sm:flex-row">
            {#each Object.entries(profile.data.skills.skills) as [skillName, skillData]}
              <Skillbar skill={skillName} {skillData} />
            {/each}
          </div>
        </div>

        <div class="stats flex max-h-44 flex-col sm:flex-wrap">
          {#each Object.entries(profile.data.stats) as [statName, statData]}
            <Stat stat={statName} {statData} />
          {/each}
        </div>
        <div class="additional-stats flex flex-col gap-2 sm:flex-row sm:flex-wrap">
          <AdditionStat text="Last Area" data={profile.data.user_data.current_area.current_area} />
          <AdditionStat text="Joined" data={formatDistanceToNowStrict(profile.data.user_data.first_join.unix, { addSuffix: true })} asterisk={true}>
            Joined on {dateFormat(profile.data.user_data.first_join.unix, "dd MMMM yyyy 'at' HH:mm")}
          </AdditionStat>
          <AdditionStat text="Purse" data={`${formatNumber(profile.data.currencies.purse)} Coins`} />
          <AdditionStat text="Bank Account" data={`${formatNumber(profile.data.currencies.bank)} Coins`} />
          <AdditionStat text="Average Skill Level" data={profile.data.skills.averageSkillLevel.toFixed(2)} asterisk={true}>
            <div class="max-w-xs space-y-2">
              <div>
                <h3 class="font-bold text-text/85">
                  Total Skill XP:
                  <span class="text-text">
                    {numberFormat(profile.data.skills.totalSkillXp, defaultPattern)}
                  </span>
                </h3>
                <p class="font-medium text-text/80">Total XP gained in all skills except Social and Runecrafting.</p>
              </div>
              <div>
                <h3 class="font-bold text-text/85">
                  Average Level:
                  <span class="text-text">
                    {profile.data.skills.averageSkillLevel.toFixed(2)}
                  </span>
                </h3>
                <p class="font-medium text-text/80">Average skill level over all skills except Social and Runecrafting, includes progress to next level.</p>
              </div>
              <div>
                <h3 class="font-bold text-text/85">
                  Average Level without progress:
                  <span class="text-text">
                    {numberFormat(profile.data.skills.averageSkillLevelWithoutProgress, defaultPatternDecimal)}
                  </span>
                </h3>
                <p class="font-medium text-text/80">Average skill level without including partial level progress.</p>
              </div>
            </div>
          </AdditionStat>
          <AdditionStat text="Fairy Souls" data={`${profile.data.fairy_souls.collected} / ${profile.data.fairy_souls.total}`} asterisk={true}>
            {profile.data.fairy_souls.progress}% of fairy souls found.
          </AdditionStat>
          <AdditionStat text="Senither Weight" data={numberFormat(profile.data.weight.senither.overall, defaultPattern)} asterisk={true}>
            <div class="max-w-xs space-y-2 font-bold">
              <div>
                <h3 class="text-text/85">Senither Weight</h3>
                <p class="font-medium italic text-text/80">Weight calculations by Senither.</p>
              </div>
              <div>
                <ul class="font-bold [&_li]:text-text/85 [&_li_span]:text-text">
                  <li>
                    Skill:
                    <span>
                      {numberFormat(profile.data.weight.senither.skill.total, defaultPattern)}
                    </span>
                  </li>
                  <li>
                    Slayer:
                    <span>
                      {numberFormat(profile.data.weight.senither.slayer.total, defaultPattern)}
                    </span>
                  </li>
                  <li>
                    Dungeon:
                    <span>
                      {numberFormat(profile.data.weight.senither.dungeon.total, defaultPattern)}
                    </span>
                  </li>
                </ul>
              </div>
              <p class="text-text/85">
                Total:
                <span class="text-text">
                  {numberFormat(profile.data.weight.senither.overall, defaultPatternDecimal)}
                </span>
              </p>
            </div>
          </AdditionStat>
          <AdditionStat text="Lily Weight" data={numberFormat(profile.data.weight.lily.total, defaultPattern)} asterisk={true}>
            <div class="max-w-xs space-y-2 font-bold">
              <div>
                <h3 class="text-text/85">Lily Weight</h3>
                <p class="font-medium italic text-text/80">Weight calculations by LappySheep.</p>
              </div>
              <div>
                <ul class="font-bold [&_li]:text-text/85 [&_li_span]:text-text">
                  <li>
                    Skill:
                    <span>
                      {numberFormat(profile.data.weight.lily.skill.base, defaultPatternDecimal)}
                    </span>
                  </li>
                  <li>
                    Slayer:
                    <span>
                      {numberFormat(profile.data.weight.lily.slayer, defaultPatternDecimal)}
                    </span>
                  </li>
                  <li>
                    Dungeon:
                    <span>
                      {numberFormat(profile.data.weight.lily.catacombs.completion.base + profile.data.weight.lily.catacombs.experience, defaultPatternDecimal)}
                    </span>
                  </li>
                </ul>
              </div>
              <p class="text-text/85">
                Total:
                <span class="text-text">
                  {numberFormat(profile.data.weight.lily.total, defaultPattern)}
                </span>
              </p>
            </div>
          </AdditionStat>
          <AdditionStat text="Networth" data={formatNumber(profile.data.networth.networth)} asterisk={true}>
            <div class="max-w-xs space-y-2 font-bold">
              <div>
                <h3 class="text-text/85">Networth</h3>
                <p class="font-medium italic text-text/80">Networth calculations by SkyHelper.</p>
              </div>
              <div>
                <ul class="font-bold [&_li]:capitalize [&_li]:text-text/85 [&_li_span]:normal-case [&_li_span]:text-text">
                  {#each Object.entries(profile.data.networth.types) as [key, value]}
                    <li>
                      {key.replace(/_/g, " ")}:
                      <span>
                        {formatNumber(value.total)}
                      </span>
                    </li>
                  {/each}
                </ul>
              </div>
              <p class="text-text/85">
                Unsoulbound Networth:
                <span class="text-text">
                  {formatNumber(profile.data.networth.unsoulboundNetworth)}
                </span>
                <br />
                Total Networth:
                <span class="text-text">
                  {numberFormat(profile.data.networth.networth, defaultPattern)} ({formatNumber(profile.data.networth.networth)})
                </span>
              </p>
            </div>
          </AdditionStat>
        </div>
      </main>
    {/if}
  {/if}
{/await}

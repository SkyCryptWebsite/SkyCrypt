<script lang="ts">
  import Skillbar from "$lib/components/Skillbar.svelte";
  import { flyAndScale } from "$lib/utils";
  import { Button, DropdownMenu } from "bits-ui";
  import Star from "lucide-svelte/icons/star";
  import type { PageData } from "./$types";
  import ExternalLink from "lucide-svelte/icons/external-link";
  import ChevronRight from "lucide-svelte/icons/chevron-right";

  export let data: PageData;

  // (async () => {
  //   console.log((await data.user)?.profile);
  // })();
</script>

{#await data.user then user}
  {#if user}
    {@const profile = user.profile}
    {#if profile}
      <main class=" mx-auto p-8">
        <div class="mb-5 mt-12 flex flex-wrap items-center gap-x-2 gap-y-3 text-4xl">
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
        <div class="mb-5 flex flex-wrap items-center gap-x-4 gap-y-2">
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
      </main>
    {/if}
  {/if}
{/await}

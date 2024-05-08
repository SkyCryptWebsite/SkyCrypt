<script lang="ts">
  import Header from "$lib/components/Header.svelte";
  import { Button } from "bits-ui";
</script>

<Header />

<main class="mx-auto flex h-full max-w-[68rem] flex-col justify-center gap-6 pb-[max(1.25rem+env(safe-area-inset-bottom))] pl-[max(1.25rem+env(safe-area-inset-left))] pr-[max(1.25rem+env(safe-area-inset-right))] pt-5">
  <form class="flex w-full flex-col justify-center gap-6 rounded-lg py-6 text-3xl backdrop-blur-lg backdrop-brightness-50">
    <h2 class="m-1 w-full text-center font-semibold">Show SkyBlock stats for</h2>
    <input type="search" name="ign" enterkeyhint="go" required placeholder="Enter username" class="relative h-16 flex-grow bg-text/10 text-center font-normal text-text focus-visible:outline-none" />
    <Button.Root type="submit" class="mx-auto flex w-full max-w-fit items-center justify-center rounded-3xl bg-icon px-6 py-3 text-base font-bold uppercase transition-all duration-150 [text-shadow:0_0_3px_rgba(0,0,0,.5)] hover:scale-[1.015]">Show me</Button.Root>
  </form>
  <Button.Root href="https://discord.gg/cNgADv2kEQ" target="_blank" rel="noreferrer" class="block rounded-lg p-4 backdrop-blur-lg backdrop-brightness-50 transition-all duration-150 hover:scale-[1.015]">
    <div class="font-semibold">
      <span class="text-text/70">SkyCrypt's</span>
      <span class="text-link">Discord</span>
    </div>
    <div class="font-medium text-text/90 opacity-85">Announcements, Community, Bug Reports, Feature Requests, Support</div>
  </Button.Root>
  <div class="grid grid-cols-3 gap-5">
    {#each Array(3 * 4) as _, i}
      <div class="flex min-w-0 items-center gap-2 rounded-lg p-5 backdrop-blur-lg backdrop-brightness-50">
        <div class="size-16 rounded-lg bg-text/10"></div>
        <div class="flex flex-col gap-1">
          <div class="text-lg font-semibold">{i}</div>
          <div class="text-sm">Lorem ipsum</div>
        </div>
      </div>
    {/each}
  </div>
</main>

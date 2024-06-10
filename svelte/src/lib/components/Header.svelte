<script lang="ts">
  import { flyAndScale } from "$lib/utils";
  import { Button, Popover } from "bits-ui";
  import PackageOpen from "lucide-svelte/icons/package-open";
  import PaintBucket from "lucide-svelte/icons/paint-bucket";
</script>

<header class="fixed left-0 top-0 z-[1000] flex h-12 w-full justify-between overflow-clip bg-header px-2.5 pl-[max(0.625rem,env(safe-area-inset-left))] pr-[max(0.625rem,env(safe-area-inset-right))] pt-[env(safe-area-inset-top,0)] leading-[3rem]">
  <div class="flex gap-2">
    <Button.Root href="/" class="flex items-center justify-center gap-2 font-bold">
      <img src="/img/app-icons/svg.svg" alt="SkyCrypt" class="pointer-events-none h-6 select-none" />
      SkyCrypt
    </Button.Root>
    <Popover.Root>
      <Popover.Trigger class="relative my-3 flex shrink items-center justify-center rounded-full bg-text/70 p-1 px-2.5 text-sm font-semibold uppercase text-background/80 transition-all duration-100 hover:bg-text/80 hover:text-background">About</Popover.Trigger>
      <Popover.Content transition={flyAndScale} transitionConfig={{ duration: 300, y: -8 }} side="bottom" sideOffset={8} align="center" collisionPadding={8} class="z-[9999]">
        <div class="max-w-[32rem] rounded-lg bg-background-grey/95 px-8 py-4">
          <p class="my-4">SkyCrypt is a free open-source stats viewer for Hypixel SkyBlock.</p>
          <p class="my-4">
            You can report bugs, suggest features, or contribute to the code on <Button.Root class="font-semibold text-link" href="https://github.com/SkyCryptWebsite/SkyCrypt" target="_blank" rel="noreferrer">GitHub</Button.Root>. It would be much appreciated!
          </p>
          <p class="my-4">
            Join our community on <Button.Root class="font-semibold text-link" href="https://discord.gg/cNgADv2kEQ" target="_blank" rel="noreferrer">Discord!</Button.Root>
          </p>
          <p class="my-4">
            Help keep SkyCrypt ad free by donating on <Button.Root class="font-semibold text-link" href="https://www.patreon.com/shiiyu" target="_blank" rel="noreferrer">Patreon!</Button.Root>
          </p>
          <p class="my-4">
            The original project, <Button.Root class="font-semibold text-link" href="https://sky.lea.moe">sky.lea.moe</Button.Root>, was orginally created by
            <Button.Root class="font-semibold text-link" href="https://twitter.com/LeaPhant" target="_blank" rel="noreferrer">LeaPhant</Button.Root>. Thanks for all of what you've done Lea!
          </p>
          <h4 class="mb-4 mt-5 font-bold">Used Resources:</h4>
          <ul class="list-inside list-disc [&_ul]:mb-2 [&_ul]:list-inside [&_ul]:list-[revert] [&_ul]:pl-5">
            <li>
              Custom Textures:
              <ul>
                <li>
                  <Button.Root class="font-semibold text-link" rel="noreferrer" href="https://hypixel.net/threads/4101579" target="_blank">FurfSky Reborn</Button.Root>
                  by <span class="text-text/70">The Reborn Team</span>
                </li>
                <li>
                  <Button.Root class="font-semibold text-link" rel="noreferrer" href="https://hypixel.net/threads/3470904" target="_blank">RNBW+</Button.Root>
                  by <span class="text-text/70">rainbowcraft2</span>
                </li>
                <li>
                  <Button.Root class="font-semibold text-link" rel="noreferrer" href="https://hypixel.net/threads/2103515" target="_blank">Hypixel Skyblock Pack</Button.Root>
                  by <span class="text-text/70">Packs HQ</span>
                </li>
                <li>
                  <Button.Root class="font-semibold text-link" rel="noreferrer" href="https://hypixel.net/threads/4174260" target="_blank">Hypixel Plus</Button.Root>
                  by <span class="text-text/70">ic22487</span>
                </li>
                <li>
                  <Button.Root class="font-semibold text-link" rel="noreferrer" href="https://hypixel.net/threads/2147652" target="_blank">Vanilla+</Button.Root>
                  by <span class="text-text/70">TBlazeWarriorT</span>
                </li>
                <li>
                  <Button.Root class="font-semibold text-link" rel="noreferrer" href="https://hypixel.net/threads/3597207" target="_blank">Worlds and Beyond</Button.Root>
                  by <span class="text-text/70">Skeletony_</span>
                </li>
                <li>
                  <Button.Root class="font-semibold text-link" rel="noreferrer" href="https://www.minecraft.net/" target="_blank">Default Minecraft Textures</Button.Root>
                  by <span class="text-text/70">Mojang</span>
                </li>
              </ul>
            </li>
            <li>
              Background Image:
              <ul>
                <li>
                  Resource Pack: <Button.Root class="font-semibold text-link" rel="noreferrer" href="https://www.planetminecraft.com/texture_pack/16x132-dandelion-cute-and-swirly/" target="_blank">Dandelion</Button.Root>
                  by <span class="text-text/70">Steelfeathers</span>
                </li>
                <li>
                  Shaders: <Button.Root class="font-semibold text-link" rel="noreferrer" href="https://sildurs-shaders.github.io/" target="_blank">Sildur's Vibrant Shaders</Button.Root>
                  by <span class="text-text/70">Sildur</span>
                </li>
                <li>
                  April Fools 2024: <Button.Root class="font-semibold text-link" rel="noreferrer" href="https://wall.alphacoders.com/big.php?i=684569" target="_blank">Wallpaper</Button.Root>
                  by <span class="text-text/70">Tinkerbell</span>
                </li>
              </ul>
            </li>
            <li>
              Libraries:
              <ul>
                <li>
                  <Button.Root class="font-semibold text-link" rel="noreferrer" href="https://twemoji.twitter.com/" target="_blank">Twemoji</Button.Root>
                  by
                  <span class="text-text/70">Twitter</span>
                </li>
                <li>
                  <Button.Root class="font-semibold text-link" rel="noreferrer" href="https://github.com/bs-community/skinview3d/" target="_blank">skinview3d</Button.Root>
                  by <span class="text-text/70">Blessing Skin</span>
                </li>
              </ul>
            </li>
            <li>
              Weight Calculations:
              <ul>
                <li>
                  <Button.Root class="font-semibold text-link" rel="noreferrer" href="https://github.com/Senither/hypixel-skyblock-facade" target="_blank">Hypixel SkyBlock Facade</Button.Root>
                  by <span class="text-text/70">Senither</span>
                </li>
                <li>
                  <Button.Root class="font-semibold text-link" rel="noreferrer" href="https://github.com/Antonio32A/lilyweight" target="_blank">lilyweight</Button.Root>
                  by <span class="text-text/70">LappySheep</span> and <span class="text-text/70">Antonio32A</span>
                </li>
                <li>
                  <Button.Root class="font-semibold text-link" rel="noreferrer" href="https://elitebot.dev/" target="_blank">Farming Weight</Button.Root>
                  by
                  <span class="text-text/70">Elite</span>
                </li>
              </ul>
            </li>
            <li>
              Networth: <Button.Root class="font-semibold text-link" rel="noreferrer" href="https://www.npmjs.com/package/skyhelper-networth" target="_blank">SkyHelper Networth</Button.Root>
              by <span class="text-text/70">SkyHelper</span>
            </li>
            <li>
              Player Heads: <Button.Root class="font-semibold text-link" rel="noreferrer" href="https://hypixel.net/forums/skyblock.157/" target="_blank">SkyBlock</Button.Root>
              by <span class="text-text/70">Hypixel</span>
            </li>
            <li>
              Data: <Button.Root class="font-semibold text-link" rel="noreferrer" href="https://api.hypixel.net/" target="_blank">Hypixel API</Button.Root>
              by <span class="text-text/70">Hypixel</span>
            </li>
          </ul>
        </div>
      </Popover.Content>
    </Popover.Root>
    <Button.Root href="/api" class="relative my-3 flex shrink items-center justify-center rounded-full bg-text/70 p-1 px-2.5 text-sm font-semibold uppercase text-background/80 transition-all duration-100 hover:bg-text/80 hover:text-background">API</Button.Root>
  </div>

  <!-- TODO: Implement player lookup
  <form class="lookup-player hidden">
    <input text-text/70="ign" type="search" enterkeyhint="go" placeholder="Enter usertext-text/70" aria-label="usertext-text/70" required />
    <button type="submit">
      <svg style="width:24px;height:24px" viewBox="0 0 24 24">
        <title>search</title>
        <path fill="currentColor" d="M9.5,3A6.5,6.5 0 0,1 16,9.5C16,11.11 15.41,12.59 14.44,13.73L14.71,14H15.5L20.5,19L19,20.5L14,15.5V14.71L13.73,14.44C12.59,15.41 11.11,16 9.5,16A6.5,6.5 0 0,1 3,9.5A6.5,6.5 0 0,1 9.5,3M9.5,5C7,5 5,7 5,9.5C5,12 7,14 9.5,14C12,14 14,12 14,9.5C14,7 12,5 9.5,5Z" />
      </svg>
    </button>
  </form> -->

  <div class="flex gap-2">
    <Button.Root class="relative my-1.5 flex shrink items-center justify-center gap-1 rounded-full bg-background/20 px-2.5 text-sm font-semibold text-text transition-all duration-100">
      <PaintBucket class="size-5" />
      Themes
    </Button.Root>
    <Button.Root class="relative my-1.5 flex shrink items-center justify-center gap-1 rounded-full bg-background/20 px-2.5 text-sm font-semibold text-text transition-all duration-100">
      <PackageOpen class="size-5" />
      Packs
    </Button.Root>
  </div>
</header>

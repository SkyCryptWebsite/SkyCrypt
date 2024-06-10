<script lang="ts">
  export let title: string | undefined = undefined;
  export let subtitle: string | undefined = undefined;
</script>

<div class="space-y-4">
  {#if title}
    <h3 class="text-2xl capitalize">{title}</h3>
  {/if}
  {#if subtitle}
    <h4 class="text-xl capitalize text-text">{subtitle}</h4>
  {/if}
  <slot name="text" />

  <div class="flex flex-wrap gap-4">
    <slot />
  </div>

  <p class="space-x-0.5 font-bold capitalize leading-6 text-text/60">
    <slot name="info" />
  </p>
</div>

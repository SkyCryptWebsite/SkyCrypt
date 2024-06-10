<script lang="ts">
  import AdditionStat from "$lib/components/AdditionStat.svelte";
  import { formatNumber } from "$lib/tools";
  import type { FullProfile } from "$lib/types/globals";
  import { format as dateFormat, formatDistanceToNowStrict } from "date-fns";
  import { format as numberFormat } from "numerable";
  import { getContext } from "svelte";

  const profile = getContext<FullProfile>("profile");

  const defaultPatternDecimal: string = "0,0.##";
  const defaultPattern: string = "0,0";
</script>

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

import { html, LitElement, TemplateResult } from "lit";
import { customElement, property } from "lit/decorators.js";
import { ifDefined } from "lit/directives/if-defined.js";

import { formatNumber } from "../stats-defer";

@customElement("skill-component")
export class SkillComponent extends LitElement {
  @property({ attribute: "skill" })
  skill?: string;

  @property({ attribute: "type" })
  type?: "skill" | "dungeon" | "dungeon_class";

  @property({ attribute: "icon" })
  icon = "icon-166_0";

  @property({ attribute: "maxed", type: Boolean, reflect: true })
  maxed!: boolean;

  protected render(): TemplateResult | undefined {
    if (this.skill == null || this.type == null) {
      return;
    }

    const skillName = this.skill[0].toUpperCase() + this.skill.substring(1);

    let level: Levels;
    switch (this.type) {
      case "skill":
        level = calculated.levels[this.skill];
        break;

      case "dungeon":
        level = calculated.dungeons.catacombs.level;
        break;

      case "dungeon_class":
        level = calculated.dungeons.classes[this.skill].experience;
        break;

      default:
        return;
    }

    this.maxed = level.level == level.maxLevel;

    return html`
      ${skillIconTemplate(this.skill, level, this.icon)}
      <div class="skill-name">
        ${skillName} <span class="skill-level">${level.level >= 0 ? level.level : "?"}</span>
      </div>
      <div class="skill-bar" data-skill="${skillName}">
        <div class="skill-progress-bar" style="--progress: ${level.level == level.levelCap ? 1 : level.progress}"></div>
        ${skillProgressTemplate(this.skill, level)}
      </div>
    `;
  }

  // disable shadow root
  protected createRenderRoot(): Element | ShadowRoot {
    return this;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "skill-component": SkillComponent;
  }
}

function skillIconTemplate(skill: string, level: Levels, icon: string) {
  return html`<div
    class="skill-icon"
    data-tippy-content="${ifDefined(
      level.rank && level.rank < 50000
        ? `<span class='stat-name'>Rank: </span><span class='stat-value'>#${level.rank}</span>`
        : undefined
    )}"
  >
    ${icon.startsWith("head-")
      ? html`<div class="item-icon custom-icon" style="background-image:url(/head/${icon.substring(5)})"></div>`
      : html`<div class="item-icon ${icon}"></div>`}
    ${level.level == level.maxLevel ? html`<div class="piece-shine"></div>` : undefined}
  </div>`;
}

function skillProgressTemplate(skill: string, level: Levels) {
  if (!("runecrafting" in calculated.levels)) {
    return html``;
  }

  let hoverText = level.xpCurrent.toLocaleString();
  if (level.xpForNext && level.xpForNext != Infinity) {
    hoverText += ` / ${level.xpForNext.toLocaleString()}`;
  }
  hoverText += " XP";

  let mainText = formatNumber(level.xpCurrent, true);
  if (level.xpForNext && level.xpForNext != Infinity) {
    mainText += ` / ${formatNumber(level.xpForNext, true)}`;
  }
  mainText += " XP";

  return html`<div
    class="skill-progress-text"
    @mouseover="${(e: MouseEvent) => {
      (e.target as HTMLElement).textContent = hoverText;
    }}"
    @mouseleave="${(e: MouseEvent) => {
      (e.target as HTMLElement).textContent = mainText;
    }}"
  >
    ${mainText}
  </div>`;
}

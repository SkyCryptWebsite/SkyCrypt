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

  @property({ type: String })
  progressText = "Loading...";

  constructor() {
    super();
    this.addEventListener("mouseover", () => {
      const hoverText = this.getProgressTexts()[1];
      this._updateProgressText(hoverText);
    });
    this.addEventListener("mouseleave", () => {
      const mainText = this.getProgressTexts()[0];
      this._updateProgressText(mainText);
    });
  }

  protected render(): TemplateResult | undefined {
    const level = this.getLevel();
    if (this.skill == undefined || this.type == undefined || level == undefined) {
      return;
    }

    const skillName = this.skill[0].toUpperCase() + this.skill.substring(1);
    this.maxed = level.level === level.maxLevel;

    return html`
      <div
        class="skill-icon"
        data-tippy-content="${ifDefined(
          level.rank && level.rank < 50000
            ? `<span class='stat-name'>Rank: </span><span class='stat-value'>#${level.rank}</span>`
            : undefined
        )}"
      >
        ${this.icon.startsWith("head-")
          ? html`<div
              class="item-icon custom-icon"
              style="background-image:url(/head/${this.icon.substring(5)})"
            ></div>`
          : html`<div class="item-icon ${this.icon}"></div>`}
        ${level.level == level.maxLevel ? html`<div class="piece-shine"></div>` : undefined}
      </div>
      <div class="skill-name">
        ${skillName} <span class="skill-level">${level.level >= 0 ? level.level : "?"}</span>
      </div>
      <div class="skill-bar" data-skill="${skillName}">
        <div class="skill-progress-bar" style="--progress: ${level.level == level.levelCap ? 1 : level.progress}"></div>
        ${"runecrafting" in calculated.levels
          ? html`<div class="skill-progress-text">
              ${this.progressText === "Loading..." ? this.getProgressTexts()[0] : this.progressText}
            </div>`
          : undefined}
      </div>
    `;
  }

  private _updateProgressText(string: string) {
    this.progressText = string;
  }

  private getLevel() {
    if (this.skill == undefined) {
      return undefined;
    }

    let level: Level | undefined;
    switch (this.type) {
      case "skill":
        level = calculated.levels[this.skill];
        break;

      case "dungeon":
        if (this.skill === "catacombs") {
          level = calculated.dungeons[this.skill].level;
        }
        break;

      case "dungeon_class":
        level = calculated.dungeons.classes[this.skill].experience;
        break;
    }

    return level;
  }

  private getProgressTexts(): [string, string] {
    let mainText = "";
    let hoverText = "";

    const level = this.getLevel();

    if (level == undefined) {
      return [mainText, hoverText];
    }

    hoverText = level.xpCurrent.toLocaleString();
    if (level.xpForNext && level.xpForNext != Infinity) {
      hoverText += ` / ${level.xpForNext.toLocaleString()}`;
    }
    hoverText += " XP";

    mainText = formatNumber(level.xpCurrent, true);
    if (level.xpForNext && level.xpForNext != Infinity) {
      mainText += ` / ${formatNumber(level.xpForNext, true)}`;
    }
    mainText += " XP";

    return [mainText, hoverText];
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
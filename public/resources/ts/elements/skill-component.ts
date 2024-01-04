import { html, LitElement, TemplateResult } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import { ifDefined } from "lit/directives/if-defined.js";

import { formatNumber } from "../stats-defer";

@customElement("skill-component")
export class SkillComponent extends LitElement {
  @property({ attribute: "skill" })
  skill?: string;

  @property({ attribute: "type" })
  type?: "skill" | "dungeon" | "dungeon_class" | "skyblock_level";

  @property({ attribute: "icon" })
  icon = "icon-166_0";

  @property({ attribute: "maxed", type: Boolean, reflect: true })
  maxed!: boolean;

  @state()
  private hovering = false;

  constructor() {
    super();
    this.addEventListener("mouseover", () => {
      this.hovering = true;
    });
    this.addEventListener("mouseleave", () => {
      this.hovering = false;
    });
  }

  protected render(): TemplateResult | undefined {
    const level = this.getLevel();
    if (this.skill == undefined || this.type == undefined || level == undefined) {
      return;
    }

    const skillName = this.skill[0].toUpperCase() + this.skill.substring(1);
    this.maxed = level.maxExperience ? level.xpCurrent === level.maxExperience : level.level === level.maxLevel;

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
        <div class="skill-progress-bar" style="--progress: ${this.getProgress(level)}"></div>
        ${this.isAPIEnabled()
          ? html`<div class="skill-progress-text">
              ${this.hovering ? this.getHoverText(level) : this.getMainText(level)}
            </div>`
          : undefined}
      </div>
    `;
  }

  private getLevel(): Level | undefined {
    if (this.skill == undefined) {
      return undefined;
    }

    switch (this.type) {
      case "skill":
        return calculated.skills.skills[this.skill];

      case "dungeon":
        if (this.skill === "catacombs") {
          return calculated.dungeons[this.skill].level;
        } else {
          return undefined;
        }

      case "dungeon_class":
        return calculated.dungeons.classes.classes[this.skill].level;

      case "skyblock_level":
        return calculated.skyblock_level;

      default:
        return undefined;
    }
  }

  /**
   * @returns the text to be displayed when the user is not hovering
   */
  private getMainText(level: Level): string {
    let mainText = formatNumber(level.xpCurrent, true);
    if (
      level.xpForNext &&
      level.xpForNext != Infinity &&
      (level.level == level.levelCap && level.xpCurrent === level.maxExperience) === false
    ) {
      mainText += ` / ${formatNumber(level.xpForNext, true)}`;
    }
    mainText += " XP";

    return mainText;
  }

  /**
   * @returns the text to be displayed when the user is hovering
   */
  private getHoverText(level: Level): string {
    let hoverText = level.xpCurrent.toLocaleString();
    if (
      level.xpForNext &&
      level.xpForNext != Infinity &&
      (level.level == level.levelCap && level.xpCurrent === level.maxExperience) === false
    ) {
      hoverText += ` / ${level.xpForNext.toLocaleString()}`;
    }
    hoverText += " XP";

    return hoverText;
  }

  /**
   * @returns whether the API is enabled for the current skill
   */
  private isAPIEnabled(): boolean {
    if (this.type === "skill" && "runecrafting" in calculated.skills.skills === false) {
      return false;
    }

    if (this.type === "dungeon" && "catacombs" in calculated.dungeons === false) {
      return false;
    }

    if (this.type === "dungeon_class" && "mage" in calculated.dungeons.classes.classes === false) {
      return false;
    }

    if (this.type === "skyblock_level" && "skyblock_level" in calculated === false) {
      return false;
    }

    return true;
  }

  /*
   * @returns the progress of the skill as a number between 0 and 1
   */
  private getProgress(level: Level): number {
    if (this.type === "skyblock_level" && level.level == level.levelCap && level.maxExperience) {
      return level.xpCurrent / level.maxExperience;
    }

    return level.level == level.levelCap ? 1 : level.progress;
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

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
        ${"runecrafting" in calculated.levels ||
        ("catacombs" in calculated.dungeons && ["dungeon_class", "dungeon"].includes(this.type)) ||
        this.type === "skyblock_level"
          ? html`<div class="skill-progress-text">
              ${this.hovering ? this.getHoverText(level, this.type) : this.getMainText(level, this.type)}
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
        return calculated.levels[this.skill];

      case "dungeon":
        if (this.skill === "catacombs") {
          return calculated.dungeons[this.skill].level;
        } else {
          return undefined;
        }

      case "dungeon_class":
        return calculated.dungeons.classes[this.skill].experience;

      case "skyblock_level":
        return calculated.skyblock_level;

      default:
        return undefined;
    }
  }

  /**
   * @returns the text to be displayed when the user is not hovering
   */
  private getMainText(level: Level, type: string): string {
    let mainText = formatNumber(level.xpCurrent, true);
    if (type === "skyblock_level") {
      level.progress = level.level / level.maxLevel;
      const skillBar = document.querySelector(`.skill-bar[data-skill="Skyblock Level"]`);
      if (skillBar) {
        (skillBar.querySelector(".skill-progress-bar") as HTMLElement).style.setProperty(
          "--progress",
          level.progress.toString()
        );
      }
    }

    if (level.xpForNext && level.xpForNext != Infinity) {
      mainText += ` / ${formatNumber(level.xpForNext, true)}`;
      mainText += " XP";
    }

    return mainText;
  }

  /**
   * @returns the text to be displayed when the user is hovering
   */
  private getHoverText(level: Level, type: string): string {
    let hoverText = level.xpCurrent.toLocaleString();
    if (type === "skyblock_level") {
      hoverText = `${level.level} / ${level.maxLevel} Level`;
      level.progress = level.xpCurrent / level.xpForNext;
      const skillBar = document.querySelector(`.skill-bar[data-skill="Skyblock Level"]`) as HTMLElement;
      if (skillBar) {
        (skillBar.querySelector(".skill-progress-bar") as HTMLElement).style.setProperty(
          "--progress",
          level.progress.toString()
        );
      }
    } else if (level.xpForNext && level.xpForNext != Infinity) {
      hoverText += ` / ${level.xpForNext.toLocaleString()}`;
      hoverText += " XP";
    }

    return hoverText;
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

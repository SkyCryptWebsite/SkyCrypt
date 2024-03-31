import { html, LitElement, TemplateResult } from "lit";
import { customElement, property } from "lit/decorators.js";
import * as helper from "../../../../common/helper.js";
import { STATS_DATA, HIDDEN_STATS } from "../../../../common/constants.js";
import { owoifyMessage } from "../../../../src/constants/owo/index.js";

@customElement("player-stat")
export class PlayerStat extends LitElement {
  @property({ attribute: "stat" })
  stat?: StatName;

  @property({ attribute: "value" })
  value?: string;

  @property({ attribute: false })
  data = {};

  @property({ attribute: false })
  special = {};

  protected render(): TemplateResult | undefined {
    if (!this.stat || !this.value) {
      return;
    }

    const value = Math.round(+this.value);
    const icon = STATS_DATA[this.stat].symbol;
    const name = STATS_DATA[this.stat].nameShort;
    const suffix = STATS_DATA[this.stat].suffix;

    const tooltip = this.getTooltip(this.data, name, suffix, value, this.special);

    if (HIDDEN_STATS.includes(this.stat) && value === 0) {
      return undefined;
    }

    return html`
      <div data-stat="${this.stat}" class="basic-stat stat-${this.stat.replaceAll("_", "-")}">
        <div data-tippy-content="${tooltip.join("")}">
          <span class="stat-icon">${icon}</span>
          <span class="stat-name">${owoifyMessage(name)}</span>
          <span class="stat-value">${value.toLocaleString()}${suffix}</span>
        </div>
      </div>
    `;
  }

  private getTooltip(
    data: { [key: string]: number },
    name: string | undefined,
    suffix: string,
    value: number,
    special: { [key: string]: number } | undefined,
  ): string[] {
    const tooltip: string[] = [];
    const tooltipBonus: string[] = [];

    if (!name) {
      return tooltip;
    }

    tooltip.push(
      `<span class="stat-name">Base ${name}: </span>`,
      `<span class="stat-value">${helper.round(data.base, 1).toLocaleString()}${suffix}</span>`,
      "<br/>",
      "<span class='tippy-explanation'>Base value every player has at the beginning of their SkyBlock adventure!</span>",
    );

    if (value - data.base > 0) {
      for (const [key, val] of Object.entries(data)) {
        if (key === "base" || typeof val !== "number") {
          continue;
        }

        tooltipBonus.push(
          `- ${this.getPrettyDataName(key)} ${val < 0 ? "" : "+"}${helper.round(val, 1).toLocaleString()}${suffix}`,
        );
      }

      tooltip.push(
        "<br/>",
        "<br/>",
        `<span class="stat-name">Bonus ${name}: </span>`,
        `<span class="stat-value">${helper.round(value - data.base, 1).toLocaleString()}${suffix}</span>`,
        "<br/>",
        `<span class='tippy-explanation'>Bonus value obtain from: <br>${tooltipBonus.join("<br>")}</span>`,
      );
    }

    if (special && Object.keys(special).length > 0) {
      tooltip.push("<br/>");
      for (const [key, val] of Object.entries(special)) {
        tooltip.push("<br/>", `<span class="stat-name">${key}: </span>`, `<span class="stat-value">${val}</span>`);
      }
    }

    return tooltip;
  }

  private getPrettyDataName(key: string): string {
    let name = key.replaceAll("_", " ");

    switch (name) {
      case "pet":
        name = "Active pet";
        break;
      case "held item":
        name = "Held item";
        break;
    }

    return helper.titleCase(name);
  }

  // disable shadow root
  protected createRenderRoot(): HTMLElement | ShadowRoot {
    return this;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "player-stat": PlayerStat;
  }
}

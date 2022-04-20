import { html, LitElement, TemplateResult } from "lit";
import { customElement, property } from "lit/decorators.js";
import * as helper from "../../../../common/helper.js";
import * as constants from "../../../../common/constants.js";

@customElement("player-stat")
export class PlayerStat extends LitElement {
  @property({ attribute: "stat" })
  stat?: StatName2;

  @property({ attribute: "value" })
  value?: string;

  @property({ attribute: "data" })
  data?: string;

  protected render(): TemplateResult | undefined {
    if (!this.stat || !this.value || !this.data) {
      return;
    }

    const value = Math.round(+this.value);
    const icon = constants.statsData[this.stat].symbol;
    const name = constants.statsData[this.stat].nameShort;
    const suffix = constants.statsData[this.stat].suffix;
    const data = JSON.parse(atob(this.data));

    const tooltip = this.getTooltip(data, name, suffix, value);

    return html`
      <div data-stat="${this.stat}" class="basic-stat stat-${this.stat.replaceAll("_", "-")}">
        <div data-tippy-content="${tooltip.join("")}">
          <span class="stat-icon">${icon}</span>
          <span class="stat-name">${name}</span>
          <span class="stat-value">${value.toLocaleString()}${suffix}</span>
        </div>
      </div>
    `;
  }

  private getTooltip(
    data: { [key: string]: number },
    name: string | undefined,
    suffix: string,
    value: number
  ): string[] {
    const tooltip: string[] = [];
    const tooltip_bonus: string[] = [];

    if (!name) {
      return tooltip;
    }

    for (const [key, val] of Object.entries(data)) {
      if (key === "base") {
        continue;
      }

      tooltip_bonus.push(
        `- ${this.getPrettyDataName(key)} ${(val as number) < 0 ? "" : "+"}${(val as number).toLocaleString()}${suffix}`
      );
    }

    tooltip.push(
      `<span class="stat-name">Base ${name}: </span>`,
      `<span class="stat-value">${data.base.toLocaleString()}${suffix}</span>`,
      "<br/>",
      "<span class='tippy-explanation'>Base value every player has at the beginning of their SkyBlock adventure!</span>"
    );

    if (value - data.base > 0) {
      tooltip.push(
        "<br/>",
        "<br/>",
        `<span class="stat-name">Bonus ${name}: </span>`,
        `<span class="stat-value">${(value - data.base).toLocaleString()}${suffix}</span>`,
        "<br/>",
        `<span class='tippy-explanation'>Bonus value obtain from: <br>${tooltip_bonus.join("<br>")}</span>`
      );
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
  protected createRenderRoot(): Element | ShadowRoot {
    return this;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "player-stat": PlayerStat;
  }
}

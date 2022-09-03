import { html, LitElement, TemplateResult } from "lit";
import { customElement, property } from "lit/decorators.js";
import { unsafeHTML } from "lit/directives/unsafe-html.js";
import * as helper from "../../../../common/helper.js";
import { STATS_DATA } from "../../../../common/constants.js";

@customElement("bonus-stats")
export class BonusStats extends LitElement {
  @property({ attribute: false })
  data = {};

  protected render(): TemplateResult | undefined {
    const stats = this.getStats(this.data);

    return html`
      <p>
        <span class="stat-name">Bonus: </span>
        ${unsafeHTML(stats.join('<span class="bonus-divider" role="separator">//</span>'))}
      </p>
    `;
  }

  private getStats(data: ItemStats): string[] {
    const result: string[] = [];

    for (const [stat, value] of Object.entries(data)) {
      result.push(/* html */ `
        <span class="bonus-stat stat-name color-${stat.replaceAll("_", "-")}">
          ${helper.round(value, 1).toLocaleString()}${STATS_DATA[stat as StatName].suffix}
          <abbr title="${STATS_DATA[stat as StatName].name}">
            ${STATS_DATA[stat as StatName].nameTiny}
          </abbr>
        </span>
      `);
    }

    return result;
  }

  // disable shadow root
  protected createRenderRoot(): Element | ShadowRoot {
    return this;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "bonus-stats": BonusStats;
  }
}

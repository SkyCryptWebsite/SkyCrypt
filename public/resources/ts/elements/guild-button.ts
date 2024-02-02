import { html, LitElement, TemplateResult } from "lit";
import { customElement } from "lit/decorators.js";
import tippy from "tippy.js";

@customElement("guild-button")
export class GuildButton extends LitElement {
  public message = "Load Guild";

  public guild: Guild | null = null;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private tooltip: any = null;

  firstUpdated() {
    this.tooltip = tippy(this, {
      content: "Click to load information about player's Guild",
    });
  }

  render(): TemplateResult {
    return html` <a @click="${this.loadGuildData}"> ${this.message} </a> `;
  }

  async loadGuildData(): Promise<void> {
    this.message = "Loading Guild...";
    this.requestUpdate();

    try {
      const response = await fetch(`/api/v2/guild/${calculated.uuid}`);
      const guild = (await response.json()) as Guild;
      if (guild === null) {
        this.message = "Guild not found.";
        return;
      }

      this.message = `Guild: ${guild.name}`;

      let tooltipContent = "";
      if (guild.player.rank !== undefined) {
        tooltipContent += `<span class='stat-name'>Rank: </span><span class='stat-value'>${guild.player.rank}</span><br><br>`;
      }

      if (guild.guildMaster.username !== undefined && guild.guildMaster.uuid !== undefined) {
        tooltipContent += `<span class='stat-name'>Guild Master: </span><a href='/stats/${guild.guildMaster.uuid}' class='no-underline stat-value'>${guild.guildMaster.username}</a><br>`;
      }

      tooltipContent += `<span class='stat-name'>Tag: </span><span class='stat-value'>${guild.tag}</span><br>`;

      tooltipContent += `<span class='stat-name'>Members: </span><span class='stat-value'>${guild.members}</span><br>`;

      tooltipContent += `<span class='stat-name'>Level: </span><span class='stat-value'>${guild.level}</span><br>`;

      this.tooltip.destroy();
      this.tooltip = tippy(this, {
        content: tooltipContent,
      });
    } catch (error) {
      console.error("Failed to load guild data:", error);
      this.message = "Error loading guild data";
    }

    this.requestUpdate();
  }
}

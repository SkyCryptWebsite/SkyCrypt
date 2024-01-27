import { html, LitElement, TemplateResult } from "lit";
import { customElement, property } from "lit/decorators.js";
import { until } from "lit/directives/until.js";
import { loadTheme, getTheme } from "../themes";

const themeURLs = [
  "default",
  "light",
  "skylea",
  "nightblue",
  "sunrise",
  "draconic",
  "burning-cinnabar",
  "candycane",
].map((name) => `/resources/themes/${name}.json`);

themeURLs.push(...JSON.parse(localStorage.getItem("customThemeUrls") ?? "[]"));

@customElement("theme-list")
export class ThemeList extends LitElement {
  @property()
  public selected: string = localStorage.getItem("currentThemeUrl") ?? themeURLs[0];

  select(url: string): void {
    this.selected = url;
    loadTheme(url);
  }

  private async getListItem(url: string): Promise<TemplateResult> {
    try {
      const theme = await getTheme(url);
      const icon =
        "/resources/img/logo_square.svg" +
        (theme.colors?.logo?.replace("#", "?color=") ?? "") +
        (theme.light ? "&invert" : "");
      return html`
        <label class="list-item" @change="${() => this.select(url)}">
          <img class="icon" src="${icon}" alt="" />
          <span class="name">${theme.name}</span>
          <div class="author">by <span>${theme.author}</span></div>
          <input type="radio" name="theme" value="${url}" ?checked="${this.selected == url}" />
        </label>
      `;
    } catch (error) {
      console.error(error);
      return html`<label class="list-item">
        <img class="icon" src="/resources/img/logo_square.svg?color=888888" alt="" />
        <span class="name">Error!</span>
        <div class="author">${error}</div>
        <input type="radio" name="theme" disabled />
      </label>`;
    }
  }

  protected render(): unknown[] {
    return themeURLs.map((url) => {
      return until(
        this.getListItem(url),
        html`<label class="list-item">
          <img class="icon" src="/resources/img/logo_square.svg?color=888888" alt="" />
          <span class="name">Loading...</span>
          <div class="author">by <span>Loading...</span></div>
          <input type="radio" name="theme" class="loading" disabled />
        </label>`,
      );
    });
  }

  // disable shadow root
  protected createRenderRoot(): Element | ShadowRoot {
    return this;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "theme-list": ThemeList;
  }
}

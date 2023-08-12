import { html, LitElement, TemplateResult } from "lit";
import { customElement, property } from "lit/decorators.js";

import { getCookie, setCookie, eraseCookie } from "../common-defer";
import { owoifyMessage } from "../../../../src/constants/owo";

@customElement("pack-list")
export class PackList extends LitElement {
  @property()
  public availablePacks: string[] = extra.packs.map((pack) => pack.id);

  @property()
  public selectedPacks: string[] = this.getCookiePackIds();

  @property()
  public needsReload = false;

  select(packId: string): void {
    if (this.selectedPacks.includes(packId)) {
      this.selectedPacks = this.selectedPacks.filter((id) => id != packId);
    } else {
      this.selectedPacks = this.availablePacks.filter((id) => id == packId || this.selectedPacks.includes(id));
    }

    let packCookie: string | undefined = undefined;

    if (this.selectedPacks.length != this.availablePacks.length) {
      packCookie = this.selectedPacks.join(",");
    }

    if (packCookie) {
      setCookie("pack", packCookie, 365);
    } else {
      eraseCookie("pack");
    }

    this.needsReload = true;
  }

  private getCookiePackIds(): string[] {
    const packIds = getCookie("pack")?.split(",") ?? extra.packs.map((pack) => pack.id);
    return extra.packs.filter((pack) => packIds.includes(pack.id) || pack.default).map((pack) => pack.id);
  }

  constructor() {
    super();
    this.selectedPacks = this.getCookiePackIds();
  }

  protected render(): TemplateResult {
    return html`
      ${extra.packs.map(
        (pack) => html`
          ${pack.default ? html`<hr />` : undefined}
          <label class="list-item ${pack.default ? "default-item" : undefined}" @change="${() => this.select(pack.id)}">
            <img class="icon pack-icon" src="${pack.base_path}/pack.png" alt="" loading="lazy" />
            <a class="name" href="${pack.url}" target="_blank" rel="noreferrer"
              >${owoifyMessage(pack.name)} ${pack.version ? html`<small>${pack.version}</small>` : undefined}</a
            ><br />
            <div class="author">by <span>${owoifyMessage(pack.author)}</span></div>
            <input
              type="checkbox"
              name="pack"
              value="${pack.id}"
              ?checked="${this.selectedPacks.includes(pack.id) || pack.default}"
              ?disabled="${pack.default}"
            />
          </label>
        `
      )}
      ${this.needsReload
        ? html`<button class="list-button" @click="${() => window.location.reload()}">Reload to apply changes</button>`
        : undefined}
    `;
  }

  // disable shadow root
  protected createRenderRoot(): Element | ShadowRoot {
    return this;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "pack-list": PackList;
  }
}

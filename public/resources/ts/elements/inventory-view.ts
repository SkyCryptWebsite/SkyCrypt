import { html, LitElement, TemplateResult } from "lit";
import { customElement, property } from "lit/decorators.js";
import { ALL_ITEMS, isSlotItem, isBackpack, isItem, showBackpack } from "../stats-defer";
import("./rich-item");

@customElement("inventory-view")
export class InventoryView extends LitElement {
  @property({ attribute: "inventory-type" })
  inventoryType = "inventory";

  @property({ attribute: "backpack-id" })
  backpackID: string | undefined = undefined;

  @property({ attribute: "preview", type: Boolean })
  preview = false;

  protected render(): TemplateResult[] {
    let inventory = items[this.inventoryType] ?? [];

    let pagesize = 5 * 9;

    const itemTemplateResults: TemplateResult[] = [];

    if (this.inventoryType === "inventory") {
      inventory = inventory.slice(9, 36).concat(inventory.slice(0, 9));
      pagesize = 3 * 9;
    } else if (this.inventoryType === "backpack") {
      if (!this.backpackID) {
        throw new Error("backpack id is required when inventory type is backpack");
      }
      const backpack = ALL_ITEMS.get(this.backpackID);
      if (!backpack || !isItem(backpack) || !isBackpack(backpack)) {
        throw new Error("backpack id must be the id of a backpack");
      }
      inventory = backpack.containsItems;
      pagesize = 6 * 9;

      if (this.preview) {
        itemTemplateResults.push(
          html`<div class="view-backpack" @click="${() => showBackpack(backpack)}">
            <span>View Backpack</span>
            <small>(Right click backpack to immediately open)</small>
          </div>`
        );
      }
    } else if (this.inventoryType === "hotm") {
      pagesize = 7 * 9;
    } else if (this.inventoryType === "bingo_card") {
      pagesize = 6 * 9;
    }

    inventory.forEach((item, index) => {
      if (index % pagesize === 0 && index !== 0) {
        itemTemplateResults.push(html`<hr />`);
      }

      if (isSlotItem(item)) {
        itemTemplateResults.push(
          html`<rich-item tabindex="0" class="inventory-slot rich-item" data-item-id="${item.itemId}"></rich-item>`
        );
      } else {
        itemTemplateResults.push(html`<div class="inventory-slot"></div>`);
      }
    });

    return itemTemplateResults;
  }

  // disable shadow root
  protected createRenderRoot(): Element | ShadowRoot {
    return this;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "inventory-view": InventoryView;
  }
}

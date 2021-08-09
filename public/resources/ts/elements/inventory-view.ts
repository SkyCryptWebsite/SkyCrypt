import { html, LitElement, TemplateResult } from "lit";
import { customElement, property } from "lit/decorators.js";
import { allItems, inventorySlotTemplate, isBackpack, isItem } from "../stats-defer";

@customElement("inventory-view")
export class InventoryView extends LitElement {
  @property({ attribute: "inventory-type" })
  inventoryType = "inventory";

  @property({ attribute: "backpack-id" })
  backpackID: string | undefined = undefined;

  render(): TemplateResult[] {
    let inventory = items[this.inventoryType] ?? [];

    let pagesize = 5 * 9;

    if (this.inventoryType === "inventory") {
      inventory = inventory.slice(9, 36).concat(inventory.slice(0, 9));
      pagesize = 3 * 9;
    } else if (this.inventoryType === "backpack") {
      if (!this.backpackID) {
        throw new Error("backpack id is required when inventory type is backpack");
      }
      const backpack = allItems.get(this.backpackID);
      if (!backpack || !isItem(backpack) || !isBackpack(backpack)) {
        throw new Error("backpack id must be the id of a backpack");
      }
      inventory = backpack.containsItems;
      pagesize = 6 * 9;
    }

    const itemTemplateResults: TemplateResult[] = [];

    inventory.forEach((item, index) => {
      if (index % pagesize === 0 && index !== 0) {
        itemTemplateResults.push(html`<hr />`);
      }

      itemTemplateResults.push(inventorySlotTemplate(item));
    });

    return itemTemplateResults;
  }

  // disable shadow root
  createRenderRoot(): Element | ShadowRoot {
    return this;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "inventory-view": InventoryView;
  }
}

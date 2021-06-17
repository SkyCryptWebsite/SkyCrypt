export class LocalTimeElement extends HTMLElement {
  timeElement: HTMLTimeElement;

  constructor() {
    super();
    this.attachShadow({ mode: "open" });
    this.timeElement = document.createElement("time");
    this.shadowRoot?.appendChild(this.timeElement);
  }

  static get observedAttributes(): string[] {
    return ["timestamp"];
  }

  attributeChangedCallback(name: string, oldValue: unknown, newValue: unknown): void {
    if (name === "timestamp") {
      if (typeof newValue === "string") {
        const number = parseInt(newValue);
        if (!isNaN(number)) {
          newValue = number;
        }
      }
      if (typeof newValue === "number" || typeof newValue === "string") {
        const date = new Date(newValue);
        this.timeElement.setAttribute("datetime", date.toISOString());
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore because typescript doesn't support dateStyle and timeStyle yet https://github.com/microsoft/TypeScript/issues/44632
        this.timeElement.innerHTML = date.toLocaleString(undefined, { dateStyle: "long", timeStyle: "short" });
      } else {
        console.error("local-time must have a timestamp");
      }
    }
  }
}

window.customElements.define("local-time", LocalTimeElement);

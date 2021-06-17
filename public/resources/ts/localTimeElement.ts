export class LocalTimeElement extends HTMLElement {
  timeElement: HTMLTimeElement;

  constructor() {
    super();
    this.attachShadow({ mode: "open" });
    this.timeElement = document.createElement("time");
    this.shadowRoot?.appendChild(this.timeElement);
  }

  static get observedAttributes() {
    return ["timestamp"];
  }

  attributeChangedCallback(name: string, oldValue: any, newValue: any) {
    if (name === "timestamp") {
      if (newValue != undefined) {
        if (!isNaN(newValue)) {
          newValue = parseInt(newValue);
        }
        const date = new Date(newValue);
        this.timeElement.setAttribute("datetime", date.toISOString());
        // @ts-ignore because typescript doesn't suport dateStyle and timeStyle yet https://github.com/microsoft/TypeScript/issues/44632
        this.timeElement.innerHTML = date.toLocaleString(undefined, { dateStyle: "long", timeStyle: "short" });
      } else {
        console.error("local-time must have a timestamp");
      }
    }
  }
}

window.customElements.define("local-time", LocalTimeElement);

export class LocalTimeElement extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
    this.timeElement = document.createElement("time");
    this.shadowRoot.appendChild(this.timeElement);
  }

  static get observedAttributes() {
    return ["timestamp"];
  }

  attributeChangedCallback(name, oldValue, newValue) {
    if (name === "timestamp") {
      if (newValue != undefined) {
        if (!isNaN(newValue)) {
          newValue = parseInt(newValue);
        }
        const date = new Date(newValue);
        this.timeElement.setAttribute("datetime", date.toISOString());
        this.timeElement.innerHTML = date.toLocaleString(undefined, { dateStyle: "long", timeStyle: "short" });
      } else {
        console.error("local-time must have a timestamp");
      }
    }
  }
}

window.customElements.define("local-time", LocalTimeElement);

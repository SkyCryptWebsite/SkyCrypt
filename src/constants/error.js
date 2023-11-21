export class SkyCryptError extends Error {
  constructor(message, source) {
    super(message);

    this.name = "SkyCryptError";

    if (source) {
      this.source = source;
    }
  }
}

/**
 * converts a hex color to it's rgb components
 * @param code a hex color string
 * @example
 * // "returns 256, 0, 256"
 * convertHex("#FF00FF");
 */
function convertHex(code: string) {
  const hex = code.substring(1, 7);
  return `${parseInt(hex.substring(0, 2), 16)}, ${parseInt(hex.substring(2, 4), 16)}, ${parseInt(
    hex.substring(4, 6),
    16
  )}`;
}

export function loadTheme(currentTheme: string): void {
  if (!extra.themes[currentTheme]) {
    return console.error(`${currentTheme} isn't a valid theme.`);
  }

  const theme = extra.themes[currentTheme];

  const processedTheme: ProcessedTheme = {
    light: !!theme.light,
    styles: {},
    logoURL: "/resources/img/logo_square.svg" + (theme.colors?.logo?.replace("#", "?color=") ?? ""),
    enchantedGlint: theme.enchanted_glint ?? "/resources/img/enchanted-glint.png",
  };

  for (const color in theme.colors) {
    const value = theme.colors[color];

    processedTheme.styles[`--${color}-hex`] = value;

    if (["icon", "link", "text", "background", "header", "grey_background"].includes(color)) {
      processedTheme.styles[`--${color}-rgb`] = convertHex(value);
    }
  }

  for (const img in theme.images) {
    processedTheme.styles[`--${img}`] = `url(${theme.images[img]})`;
  }

  for (const key in theme.backgrounds) {
    const background = theme.backgrounds[key];
    let value;
    switch (background.type) {
      case "color":
        value = background.color;
        break;
      case "stripes":
        value = `repeating-linear-gradient( ${background.angle}, ${background.colors
          .flatMap((color, i) => {
            return [`${color} ${i * background.width}px`, `${color} ${(i + 1) * background.width}px`];
          })
          .join(", ")})`;
        break;
    }
    processedTheme.styles[`--${key}`] = value;
  }

  processedTheme.styles[`--logo`] = `url(${processedTheme.logoURL})`;

  applyProcessedTheme(processedTheme);

  localStorage.setItem("processedTheme", JSON.stringify(processedTheme));
}

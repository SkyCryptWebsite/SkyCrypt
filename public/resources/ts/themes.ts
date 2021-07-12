{
  const currentTheme = localStorage.getItem("currentTheme");
  if (!currentTheme || !extra.themes[currentTheme]) {
    localStorage.setItem("currentTheme", "default");
  }
}

{
  const currentTheme = localStorage.getItem("currentTheme");
  if (currentTheme && currentTheme !== "default") loadTheme(currentTheme);
}

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

  const element = document.documentElement;

  element.classList.toggle("light", !!theme.light);

  (document.querySelector('meta[name="theme-color"]') as HTMLMetaElement).content = theme.light ? "#dbdbdb" : "#282828";

  element.setAttribute("style", "");

  for (const color in theme.colors) {
    const value = theme.colors[color];

    element.style.setProperty(`--${color}-hex`, value);

    if (["icon", "link", "text", "background", "header", "grey_background"].includes(color)) {
      element.style.setProperty(`--${color}-rgb`, convertHex(value));
    }
  }

  for (const img in theme.images) {
    element.style.setProperty(`--${img}`, `url(${theme.images[img]})`);
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
    element.style.setProperty(`--${key}`, value);
  }

  const logoURL = "/resources/img/logo_square.svg" + (theme.colors?.logo?.replace("#", "?color=") ?? "");
  element.style.setProperty(`--logo`, `url(${logoURL})`);
  document.querySelectorAll<HTMLLinkElement>('link[rel="icon"]').forEach((favicon) => {
    if (favicon.href.match("logo_square")) {
      favicon.href = logoURL;
    }
  });

  document
    .querySelector("#enchanted-glint feImage")
    ?.setAttribute("href", theme.enchanted_glint ?? "/resources/img/enchanted-glint.png");

  console.log(`Loaded theme: ${currentTheme}`);
}

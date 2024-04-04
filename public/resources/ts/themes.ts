export const THEMES = new Map<string, Promise<Theme>>();

/**
 * converts a hex color to it's rgb components
 * @param code a hex color string
 * @example
 * convertHex("#FF00FF"); // returns "256, 0, 256"
 */
function convertHex(code: string) {
  const hex = code.substring(1, 7);
  return `${parseInt(hex.substring(0, 2), 16)}, ${parseInt(hex.substring(2, 4), 16)}, ${parseInt(
    hex.substring(4, 6),
    16,
  )}`;
}

function isObject(x: unknown): x is { [key: string]: unknown } {
  return x !== null && typeof x === "object";
}

function isColor(x: unknown): x is string {
  return typeof x === "string" && /^#[0-9A-F]{6}$/i.test(x);
}

async function fetchTheme(urlString: string): Promise<Theme> {
  const url = new URL(urlString, document.location.href);
  if (url.protocol === "http:" || url.protocol === "https:") {
    url.searchParams.append("schema", "2");
  }
  const response = await fetch(url.href);
  const theme: unknown = await response.json();
  return sanitizeTheme(theme);
}

export function getTheme(urlString: string): Promise<Theme> {
  const themeFromMap = THEMES.get(urlString);
  if (themeFromMap !== undefined) {
    return themeFromMap;
  } else {
    const themeFromFetch = fetchTheme(urlString);
    THEMES.set(urlString, themeFromFetch);
    return themeFromFetch;
  }
}

/**
 * validates a theme
 *
 * @param theme a theme from an external source
 * @returns the theme if it is valid
 * @throws an error if the theme is invalid
 */
export function sanitizeTheme(theme: unknown): Theme {
  if (!isObject(theme)) {
    throw new Error("Invalid theme: Theme must be an object");
  }

  switch (theme.schema) {
    case 2:
      if (!("name" in theme) || typeof theme.name !== "string") {
        throw new Error("Invalid theme: name must be a string");
      }

      if (!("author" in theme) || typeof theme.author !== "string") {
        throw new Error("Invalid theme: author must be a string");
      }

      if ("light" in theme && typeof theme.light !== "boolean") {
        throw new Error("Invalid theme: light must be a boolean");
      }

      if ("enchanted_glint" in theme && typeof theme.enchanted_glint !== "string") {
        throw new Error("Invalid theme: enchanted_glint must be a string");
      }

      if ("images" in theme) {
        if (!isObject(theme.images)) {
          throw new Error("Invalid theme: images must be an object");
        }

        for (const image of Object.values(theme.images)) {
          if (typeof image != "string") {
            throw new Error("Invalid theme: images must be an object of strings");
          }
        }
      }

      if ("backgrounds" in theme) {
        if (!isObject(theme.backgrounds)) {
          throw new Error("Invalid theme: backgrounds must be an object");
        }

        for (const background of Object.values(theme.backgrounds)) {
          if (!isObject(background)) {
            throw new Error("Invalid theme: backgrounds must be an object of objects");
          }

          if (!("type" in background)) {
            throw new Error("Invalid theme: backgrounds must be an object of objects with a type property");
          } else if (background.type === "color") {
            if (!("color" in background) || !isColor(background.color)) {
              throw new Error("Invalid theme: backgrounds of type color must have a valid color property");
            }
          } else if (background.type === "stripes") {
            if (!("angle" in background) || typeof background.angle !== "string") {
              throw new Error("Invalid theme: backgrounds of type stripes must have an angle property of type string");
            }

            if (!("colors" in background) || !Array.isArray(background.colors)) {
              throw new Error("Invalid theme: backgrounds of type stripes must have a colors property of type array");
            }

            if (background.colors.length < 2) {
              throw new Error("Invalid theme: backgrounds of type stripes must have at least 2 colors");
            }

            for (const color of background.colors) {
              if (!isColor(color)) {
                throw new Error("Invalid theme: stripe colors must be valid");
              }
            }

            if (!("width" in background) || typeof background.width !== "number") {
              throw new Error("Invalid theme: backgrounds of type stripes must have a width property of type number");
            }
          } else {
            throw new Error(
              "Invalid theme: backgrounds must be an object of objects with a type property of either color or stripes",
            );
          }
        }
      }

      if ("colors" in theme) {
        if (!isObject(theme.colors)) {
          throw new Error("Invalid theme: colors must be an object");
        }

        for (const color of Object.values(theme.colors)) {
          if (!isColor(color)) {
            throw new Error("Invalid theme: colors must be an object of color strings");
          }
        }
      }
      break;

    default:
      throw new Error(`Unsupported theme schema: ${theme.schema}`);
  }

  return theme as unknown as Theme;
}

function processTheme(theme: Theme): ProcessedTheme {
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

  return processedTheme;
}

export async function loadTheme(themeUrl: string): Promise<void> {
  const theme = await getTheme(themeUrl);

  const processedTheme = processTheme(theme);

  applyProcessedTheme(processedTheme);

  if (typeof redocInit == "function") {
    redocInit(theme.colors?.icon);
  }

  localStorage.setItem("currentThemeUrl", themeUrl);
  localStorage.setItem("processedTheme", JSON.stringify(processedTheme));
}

window.addEventListener("storage", (event) => {
  if (event.key === "currentThemeUrl" && event.newValue != null) {
    for (const element of document.querySelectorAll("theme-list")) {
      element.selected = event.newValue;
    }
  } else if (event.key === "processedTheme" && event.newValue != null) {
    applyProcessedTheme(JSON.parse(event.newValue));
  }
});

const trustedOrigins: string[] = JSON.parse(localStorage.getItem("trustedOrigins") ?? "[]");

window.addEventListener(
  "message",
  (event) => {
    if (isObject(event.data) && event.data.type === "setTheme") {
      if (!trustedOrigins.includes(event.origin)) {
        // TODO replace "confirm" with a modal
        if (confirm(`would you like to allow ${event.origin} to temporarily change your theme?`)) {
          trustedOrigins.push(event.origin);
          if (confirm("always this origin?")) {
            const fromLocalhost = JSON.parse(localStorage.getItem("trustedOrigins") ?? "[]");
            fromLocalhost.push(event.origin);
            localStorage.setItem("trustedOrigins", JSON.stringify(fromLocalhost));
          }
        } else {
          return;
        }
      }

      const source = event.source as WindowProxy;

      try {
        applyProcessedTheme(processTheme(sanitizeTheme(event.data.theme)));
        source.postMessage({ success: true }, event.origin);
      } catch (error) {
        source.postMessage({ success: false, error: String(error) }, event.origin);
      }
    }
  },
  { capture: false, passive: true },
);

let themeUrl = localStorage.getItem("currentThemeUrl");

// workaround for potential cached april fools theme
if (themeUrl != null && themeUrl.includes("?") && themeUrl.includes("default")) {
  localStorage.setItem("currentThemeUrl", `/resources/themes/default.json`);
}

// Load the theme from localStorage if it exists
{
  // TODO remove this once users are migrated to currentThemeUrl
  const oldTheme = localStorage.getItem("currentTheme");
  if (oldTheme) {
    localStorage.setItem("currentThemeUrl", `/resources/themes/${oldTheme}.json`);
    localStorage.removeItem("currentTheme");
  }

  themeUrl = localStorage.getItem("currentThemeUrl");
  if (themeUrl != null) {
    loadTheme(themeUrl);
  }
}

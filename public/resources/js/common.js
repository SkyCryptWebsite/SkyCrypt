/* global extra:readonly */

if (!localStorage.getItem("currentTheme") || !extra.themes[localStorage.getItem("currentTheme")]) {
  localStorage.setItem("currentTheme", "default");
}

if (localStorage.getItem("currentTheme") != "default") loadTheme(localStorage.getItem("currentTheme"));

function convertHex(code) {
  const hex = code.substring(1, 7);
  return `${parseInt(hex.substring(0, 2), 16)}, ${parseInt(hex.substring(2, 4), 16)}, ${parseInt(
    hex.substring(4, 6),
    16
  )}`;
}

function loadTheme(currentTheme) {
  if (!extra.themes[currentTheme]) {
    return console.error(`${currentTheme} isn't a valid theme.`);
  }

  const theme = extra.themes[currentTheme];

  const element = document.documentElement;

  element.classList.toggle("light", !!theme.light);

  document.querySelector('meta[name="theme-color"]').content = theme.light ? "#dbdbdb" : "#282828";

  element.style = "";

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
  document.querySelectorAll('link[rel="icon"]').forEach((favicon) => {
    if (favicon.href.match("logo_square")) {
      favicon.href = logoURL;
    }
  });

  console.log(`Loaded theme: ${currentTheme}`);
}

/**
 * checks if the scrollbar has a width and sets the style-scrollbar class accordingly
 */
function checkScrollbarStyle() {
  let outerDiv = document.createElement("div");
  outerDiv.style.position = "fixed";
  let innerDiv = document.createElement("div");
  innerDiv.style.overflowY = "scroll";
  outerDiv.appendChild(innerDiv);
  document.body.appendChild(outerDiv);
  if (outerDiv.clientWidth > 0) {
    // desktop style scrollbars
    document.documentElement.classList.add("style-scrollbar");
  } else {
    // mobile style scrollbars
    document.documentElement.classList.remove("style-scrollbar");
  }
}

window.setTimeout(checkScrollbarStyle);

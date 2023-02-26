import { MAX_ENCHANTS } from "./constants.js";

/**
 * @typedef {"0"|"1"|"2"|"3"|"4"|"5"|"6"|"7"|"8"|"9"|"a"|"b"|"c"|"d"|"e"|"f"} ColorCode
 * @typedef {"k"|"l"|"m"|"n"|"o"} FormatCode
 */

/**
 * checks if char is a color code
 * @param {string} code
 * @returns {code is ColorCode}
 */
function isColorCode(code) {
  return /[0-9a-f]/.test(code);
}

/**
 * checks if char is a format code
 * @param {string} code
 * @returns {code is FormatCode}
 */
function isFormatCode(code) {
  return /[k-o]/.test(code);
}

/**
 * Convert Minecraft lore to HTML
 * @param {string} text minecraft lore with color and formatting codes
 * @returns {string} HTML
 */
export function renderLore(text) {
  let output = "";

  /** @type {ColorCode|null} */
  let color = null;
  /** @type {Set<FormatCode>} */
  const formats = new Set();

  // @ts-ignore - this regex always matches so we don't need to check for null
  for (let part of text.match(/(§[0-9A-Fa-fk-or])*[^§]*/g)) {
    while (part.charAt(0) === "§") {
      const code = part.charAt(1).toLowerCase();

      if (isColorCode(code)) {
        color = code;
      } else if (isFormatCode(code)) {
        formats.add(code);
      } else if (code === "r") {
        color = null;
        formats.clear();
      }

      part = part.substring(2);
    }

    if (part.length === 0) continue;

    output += "<span";

    if (color !== null) {
      if (color == "9" && MAX_ENCHANTS.has(part)) {
        output += ` style='color: var(--§6)'`;
      } else {
        output += ` style='color: var(--§${color});'`;
      }
    }

    if (formats.size > 0) {
      output += ` class='${Array.from(formats, (x) => "§" + x).join(" ")}'`;
    }

    output += `>${part}</span>`;
  }

  return output;
}

/**
 * @param {number} number the number to be formatted
 * @param {boolean} floor rounds down if true, up if false
 * @param {number} rounding power of ten of the number of digits you want after the decimal point
 *
 * @returns {string} formatted number
 *
 * @example formatNumber(123456798, true, 10) = "123.4M"
 * @example formatNumber(123456798, true, 100) = "123.45M"
 */
export function formatNumber(number, floor, rounding = 10) {
  if (number < 1000) {
    return String(Math.floor(number));
  } else if (number < 10000) {
    if (floor) {
      return (Math.floor((number / 1000) * rounding) / rounding).toFixed(rounding.toString().length - 1) + "K";
    } else {
      return (Math.ceil((number / 1000) * rounding) / rounding).toFixed(rounding.toString().length - 1) + "K";
    }
  } else if (number < 1000000) {
    if (floor) {
      return Math.floor(number / 1000) + "K";
    } else {
      return Math.ceil(number / 1000) + "K";
    }
  } else if (number < 1000000000) {
    if (floor) {
      return (Math.floor((number / 1000 / 1000) * rounding) / rounding).toFixed(rounding.toString().length - 1) + "M";
    } else {
      return (Math.ceil((number / 1000 / 1000) * rounding) / rounding).toFixed(rounding.toString().length - 1) + "M";
    }
  } else if (floor) {
    return (
      (Math.floor((number / 1000 / 1000 / 1000) * rounding * 10) / (rounding * 10)).toFixed(
        rounding.toString().length
      ) + "B"
    );
  } else {
    return (
      (Math.ceil((number / 1000 / 1000 / 1000) * rounding * 10) / (rounding * 10)).toFixed(rounding.toString().length) +
      "B"
    );
  }
}

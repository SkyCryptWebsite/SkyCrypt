import { MAX_ENCHANTS } from "$lib/constants";
import type { ColorCode, FormatCode } from "$lib/types/globals";
import { format as timeFormat } from "numerable";
/**
 * @param {number|string} number the number to be formatted
 *
 * @returns {string} formatted number
 *
 * @example formatNumber(123456798) = "123.4M"
 */
export const formatNumber = (num: number | string): string => {
  // if the number is a string, parse it to a number
  if (typeof num === "string") {
    num = parseFloat(num);
  }
  // get the second digit
  const secondDigit = num.toString().charAt(1);
  // get the third digit
  const thirdDigit = num.toString().charAt(2);
  let formatPattern: string;
  if (secondDigit === "0" && thirdDigit === "0") {
    formatPattern = "0a";
  } else if (secondDigit !== "0" && thirdDigit === "0") {
    formatPattern = "0.0a";
  } else {
    formatPattern = "0.00a";
  }
  // if number is in trillions, billions, millions, thousands, format it to 1 decimal place if the decimal is 0, otherwise format it to 0 decimal places
  if (num >= 1000000) {
    return timeFormat(num, formatPattern);
  } else {
    return timeFormat(num, "0a");
  }
};

/**
 * Checks if a character is a color code
 * @param {string} code
 * @returns {code is ColorCode}
 */
function isColorCode(code: string): code is ColorCode {
  return /[0-9a-f]/.test(code);
}

/**
 * Checks if a character is a format code
 * @param {string} code
 * @returns {code is FormatCode}
 */
function isFormatCode(code: string): code is FormatCode {
  return /[k-o]/.test(code);
}

/**
 * Convert Minecraft lore to HTML
 * @param {string} text minecraft lore with color and formatting codes
 * @returns {string} HTML
 */
export function renderLore(text: string): string {
  let output = "";

  let color: ColorCode | null = null;
  const formats: Set<FormatCode> = new Set();

  const matches = text.match(/(§[0-9A-Fa-fk-orL])*[^§]*/g);
  if (matches === null) return output;
  for (let part of matches) {
    formats.clear();
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

    if (part.length === 0) {
      output += "<br>";
      continue;
    }

    const timeRegex = /<local-time timestamp="(\d+)"><\/local-time>/;
    const timeMatch = part.match(timeRegex);
    // Delete the timestamp from the lore
    if (timeMatch) {
      // part = part.replace(timeRegex, dateFormat(fromUnixTime(obtained), "dd MMMM yyyy 'at' HH:mm"));
      // TODO: Add the timestamp to the lore
      part = "TODO: ADD LATER";
    }

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

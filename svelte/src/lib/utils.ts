import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { cubicOut } from "svelte/easing";
import type { TransitionConfig } from "svelte/transition";
import { format } from "numerable";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

type FlyAndScaleParams = {
  y?: number;
  x?: number;
  start?: number;
  duration?: number;
};

export const flyAndScale = (node: Element, params: FlyAndScaleParams = { y: -8, x: 0, start: 0.95, duration: 150 }): TransitionConfig => {
  const style = getComputedStyle(node);
  const transform = style.transform === "none" ? "" : style.transform;

  const scaleConversion = (valueA: number, scaleA: [number, number], scaleB: [number, number]) => {
    const [minA, maxA] = scaleA;
    const [minB, maxB] = scaleB;

    const percentage = (valueA - minA) / (maxA - minA);
    const valueB = percentage * (maxB - minB) + minB;

    return valueB;
  };

  const styleToString = (style: Record<string, number | string | undefined>): string => {
    return Object.keys(style).reduce((str, key) => {
      if (style[key] === undefined) return str;
      return str + key + ":" + style[key] + ";";
    }, "");
  };

  return {
    duration: params.duration ?? 200,
    delay: 0,
    css: (t) => {
      const y = scaleConversion(t, [0, 1], [params.y ?? 5, 0]);
      const x = scaleConversion(t, [0, 1], [params.x ?? 0, 0]);
      const scale = scaleConversion(t, [0, 1], [params.start ?? 0.95, 1]);

      return styleToString({
        transform: transform + "translate3d(" + x + "px, " + y + "px, 0) scale(" + scale + ")",
        opacity: t
      });
    },
    easing: cubicOut
  };
};

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
    return format(num, formatPattern);
  } else {
    return format(num, "0a");
  }
};
import { UWU_MAPPING_ARRAY } from "./formatting.js";
import { Word } from "./word.js";

function interleaveArrays(a, b) {
  const arr = [];
  while (a.length && b.length) {
    arr.push(a.shift(), b.shift());
  }
  return [...arr, ...a, ...b];
}

export function owoifyMessage(v) {
  const words = v.split(/\s+/g).map((x) => UWU_MAPPING_ARRAY.reduce((w, f) => f(w), new Word(x)));

  return interleaveArrays(v.split(/\S+/g), words).join("");
}

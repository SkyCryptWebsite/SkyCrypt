"use strict";
import { writeFile } from "fs/promises";
/**
 * @param {string} outputFile
 * @returns {import('rollup').Plugin}
 */
export default function nameMap(outputFile) {
  return {
    name: "name-map",
    async writeBundle(options, bundle) {
      /**
       * @type {{[key:string]:string}}
       */
      const nameMap = {};
      for (const key in bundle) {
        nameMap[bundle[key].name] = bundle[key].fileName;
      }
      writeFile(outputFile, JSON.stringify(nameMap));
    },
  };
}

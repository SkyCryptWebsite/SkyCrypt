import typescript from "@rollup/plugin-typescript";
import resolve from "@rollup/plugin-node-resolve";
import commonjs from "@rollup/plugin-commonjs";
import { terser } from "rollup-plugin-terser";

// `npm run start` -> `production` is true
// `npm run dev` -> `production` is false
const production = !process.env.ROLLUP_WATCH;

/**
 * @type {import('rollup').RollupOptions}
 */
const config = {
  input: [
    "public/resources/ts/common-defer.ts",
    "public/resources/ts/common.ts",
    "public/resources/ts/localTimeElement.ts",
    "public/resources/ts/stats-defer.ts",
    "public/resources/ts/themes.ts",
  ],
  output: {
    dir: "public/resources/js",
    format: "es",
    sourcemap: true,
  },
  plugins: [
    typescript({ tsconfig: "public/resources/ts/tsconfig.json" }), // converts TypeScript modules to JavaScript
    resolve(), // tells Rollup how to stuff in node_modules
    commonjs(), // converts Node modules to ES modules
    production && terser(), // minify, but only in production
  ],
};

export default config;

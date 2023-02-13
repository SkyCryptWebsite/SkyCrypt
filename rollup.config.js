import typescript from "@rollup/plugin-typescript";
import resolve from "@rollup/plugin-node-resolve";
import commonjs from "@rollup/plugin-commonjs";
import terser from "@rollup/plugin-terser";
import minifyHTML from "rollup-plugin-minify-html-literals";
import nameMap from "./lib/rollup-plugin-name-map.js";
import del from "rollup-plugin-delete";
import replace from "@rollup/plugin-replace";

// `pnpm start` -> `production` is true
// `pnpm dev` -> `production` is false
const production = !process.env.ROLLUP_WATCH;

/**
 * @type {import('rollup').RollupOptions}
 */
const CONFIG = {
  input: [
    "public/resources/ts/browser-compat-check.ts",
    "public/resources/ts/common-defer.ts",
    "public/resources/ts/common.ts",
    "public/resources/ts/stats-defer.ts",
    "public/resources/ts/development-defer.ts",
    "public/resources/ts/themes.ts",
    "public/resources/ts/elements/local-time.ts",
    "public/resources/ts/elements/rich-item.ts",
    "public/resources/ts/elements/skill-component.ts",
    "public/resources/ts/elements/player-stat.ts",
    "public/resources/ts/elements/bonus-stats.ts",
  ],
  output: {
    dir: "public/resources/js",
    format: "es",
    sourcemap: true,
    entryFileNames: "[name].[hash].js",
    chunkFileNames: "[name].[hash].js",
  },
  plugins: [
    del({ targets: "public/resources/js/*" }),
    replace({ "process.env.NODE_ENV": JSON.stringify(production ? "production" : "development") }), // makes process.env.NODE_ENV work on client side
    typescript({ tsconfig: "public/resources/ts/tsconfig.json" }), // converts TypeScript modules to JavaScript
    resolve(), // tells Rollup how to stuff in node_modules
    commonjs(), // converts Node modules to ES modules
    production && terser(), // minify, but only in production
    production && // minify html strings inside javascript (aka lit-html)
      minifyHTML.default({
        options: {
          minifyOptions: {
            conservativeCollapse: true,
          },
        },
      }),
    nameMap("public/resources/js/file-name-map.json"),
  ],
};

export default CONFIG;

import * as fs from "fs";
import * as path from "path";
import { fileURLToPath } from "url";
import { randomBytes } from "crypto";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const credentialsFilePath = path.resolve(__dirname, "../credentials.json");

/**
 * @typedef {{ hypixel_api_key:string, dbUrl:string, dbName:string }} Credentials
 */

/** @type {Credentials} */
const defaultCredentials = {
  hypixel_api_key: "",
  dbUrl: "mongodb://localhost:27017",
  dbName: "sbstats",
  redisUrl: "",
  get session_secret() {
    return randomBytes(32).toString("hex");
  },
};

/**
 * @returns {Credentials | undefined}
 */
function readFile() {
  if (fs.existsSync(credentialsFilePath)) {
    return JSON.parse(fs.readFileSync(credentialsFilePath));
  } else {
    return undefined;
  }
}

/**
 * @param {Credentials} newValue
 */
function writeFile(newValue) {
  fs.writeFileSync(credentialsFilePath, JSON.stringify(newValue, null, 2) + "\n");
}

/** whether credentials has bean modified from it's original state */
let hasBeenModified = false;

/** @type {Credentials} */
const credentials = readFile() ?? {};

for (const key in defaultCredentials) {
  if (credentials[key] == undefined) {
    credentials[key] = defaultCredentials[key];
    hasBeenModified = true;
  }
}

if (hasBeenModified) {
  writeFile(credentials);
}

export default credentials;

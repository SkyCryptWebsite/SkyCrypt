import * as fs from "fs";
import * as path from "path";
import { fileURLToPath } from "url";
import { randomBytes } from "crypto";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const credentialsFilePath = path.resolve(__dirname, "../credentials.json");

/**
 * @typedef {{ hypixel_api_key:string, dbUrl:string, dbName:string, redisUrl:string, session_secret:string }} Credentials
 */

/** @type {Credentials} */
const defaultCredentials = {
  hypixel_api_key: "",
  dbUrl: "mongodb://localhost:27017",
  dbName: "sbstats",
  redisUrl: {
    port: 6379,
    host: "redis://localhost:6379",
    username: "default",
    password: "password"
  }
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
const CREDENTIALS = readFile() ?? {};

for (const key in defaultCredentials) {
  if (CREDENTIALS[key] == undefined) {
    CREDENTIALS[key] = defaultCredentials[key];
    hasBeenModified = true;
  }
}

if (hasBeenModified) {
  writeFile(CREDENTIALS);
}

if (process.env.HYPIXEL_API_KEY) {
  CREDENTIALS.hypixel_api_key = process.env.HYPIXEL_API_KEY;
}

if (process.env.MONGO_CONNECTION_STRING) {
  CREDENTIALS.dbUrl = process.env.MONGO_CONNECTION_STRING;
}

if (process.env.REDIS_CONNECTION_STRING) {
  CREDENTIALS.redisUrl = process.env.REDIS_CONNECTION_STRING;
}

if (process.env.DISCORD_WEBHOOK) {
  CREDENTIALS.discord_webhook = process.env.DISCORD_WEBHOOK;
}

export default CREDENTIALS;

import * as fsExtra from "fs-extra";
import "./src/credentials.js";

fsExtra.ensureDirSync("cache");

process.exit(0);

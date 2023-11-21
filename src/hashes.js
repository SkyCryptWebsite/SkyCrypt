import { createHash } from "crypto";
import * as fs from "fs";
import * as path from "path";
import { fileURLToPath } from "url";
import { promisify } from "util";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export const HASHED_DIRECTORIES = ["css"];

export function getFileHash(filename) {
  return new Promise((resolve, reject) => {
    const md5sum = createHash("md5");

    const s = fs.createReadStream(filename);

    s.on("data", function (data) {
      md5sum.update(data);
    });

    s.on("end", function () {
      const hash = md5sum.digest("hex");
      resolve(hash);
    });
  });
}

export function getFileHashes() {
  const directoryPromises = HASHED_DIRECTORIES.map(async (directory) => {
    const readdirPromise = promisify(fs.readdir);

    const fileNames = await readdirPromise(path.join(__dirname, "../public/resources", directory));

    const filePromises = fileNames.map((filename) =>
      getFileHash(path.join(__dirname, "../public/resources", directory, filename))
    );

    const fileHashes = await Promise.all(filePromises);

    const hashesObject = {};

    for (let i = 0; i < fileNames.length; i++) {
      hashesObject[fileNames[i]] = fileHashes[i];
    }

    return hashesObject;
  });

  return Promise.all(directoryPromises).then((directories) => {
    const directoriesObject = {};

    for (let i = 0; i < HASHED_DIRECTORIES.length; i++) {
      directoriesObject[HASHED_DIRECTORIES[i]] = directories[i];
    }

    return directoriesObject;
  });
}

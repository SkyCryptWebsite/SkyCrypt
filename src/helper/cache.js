import path from "path";
import fs from "fs-extra";
import { fileURLToPath } from "url";

export function getFolderPath() {
  return path.dirname(fileURLToPath(import.meta.url));
}

export function getCacheFolderPath() {
  return path.resolve(getFolderPath(), "../cache");
}

export function getCacheFilePath(dirPath, type, name, format = "png") {
  const subdirs = [type];

  // for texture and head type, we get the first 2 characters to split them further
  if (type == "texture" || type == "head") {
    subdirs.push(name.slice(0, 2));
  }

  // for potion and leather type, we get what variant they are to split them further
  if (type == "leather" || type == "potion") {
    subdirs.push(name.split("_")[0]);
  }

  // check if the entire folder path is available
  if (!fs.pathExistsSync(path.resolve(dirPath, subdirs.join("/")))) {
    // check if every subdirectory is available
    for (let i = 1; i <= subdirs.length; i++) {
      const checkDirs = subdirs.slice(0, i);
      const checkPath = path.resolve(dirPath, checkDirs.join("/"));

      if (!fs.pathExistsSync(checkPath)) {
        fs.mkdirSync(checkPath);
      }
    }
  }

  return path.resolve(dirPath, `${subdirs.join("/")}/${type}_${name}.${format}`);
}

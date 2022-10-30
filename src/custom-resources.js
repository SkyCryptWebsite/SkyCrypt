import fs from "fs-extra";
import path from "path";
import { getClusterId, getFolderPath, getCacheFolderPath, getCacheFilePath, hasPath, getPath } from "./helper.js";
import mm from "micromatch";
import util from "util";
import apng2gif from "apng2gif-bin";
import _ from "lodash";
import sharp from "sharp";
import canvasModule from "canvas";
const { createCanvas, loadImage } = canvasModule;
import minecraftData from "minecraft-data";
const mcData = minecraftData("1.8.9");
import UPNG from "upng-js";
import RJSON from "relaxed-json";

import child_process from "child_process";
import { getFileHash } from "./hashes.js";
const execFile = util.promisify(child_process.execFile);

const NORMALIZED_SIZE = 128;
const RESOURCE_CACHING = true;

const folderPath = getFolderPath();
const RESOURCE_PACK_FOLDER = path.resolve(getFolderPath(), "..", "public", "resourcepacks");

const cacheFolderPath = getCacheFolderPath(folderPath);
const PACK_HASH_CACHE_FILE = getCacheFilePath(cacheFolderPath, "json", "pack_hashes", "json");
const RESOURCES_CACHE_FILE = getCacheFilePath(cacheFolderPath, "json", "custom_resources", "json");

let resourcesReady = false;
const readyPromise = new Promise((resolve) => {
  setInterval(() => {
    if (resourcesReady) {
      resolve();
    }
  }, 1000);
});

const removeFormatting = new RegExp("§[0-9a-z]{1}", "g");

async function getFiles(dir, fileList) {
  const files = await fs.readdir(dir);

  fileList = fileList || [];

  for (const file of files) {
    const fileStat = await fs.stat(path.resolve(dir, file));

    if (await fileStat.isDirectory()) {
      fileList = await getFiles(path.resolve(dir, file), fileList);
    } else {
      fileList.push(path.resolve(dir, file));
    }
  }

  return fileList;
}

function getFrame(src, frame) {
  const dst = createCanvas(NORMALIZED_SIZE, NORMALIZED_SIZE);
  const ctx = dst.getContext("2d");

  ctx.drawImage(src, 0, frame * NORMALIZED_SIZE * -1);

  return dst;
}

let resourcePacks = [];
let packConfigHashes = {};

const outputPacks = [];

export async function init() {
  console.log(`Custom Resources loading started on ${getClusterId(true)}.`);
  console.time(`custom_resources_${getClusterId()}`);

  await loadPackConfigs();
  let resourcesUpToDate = false;

  try {
    packConfigHashes = JSON.parse(fs.readFileSync(PACK_HASH_CACHE_FILE));

    resourcePacks.forEach((pack) => {
      if (packConfigHashes[pack.config.id] !== pack.config.hash) {
        throw new Error("Config hashes were not matching!");
      }
    });

    resourcesUpToDate = true;
  } catch (e) {
    resourcePacks.forEach((pack) => {
      packConfigHashes[pack.config.id] = pack.config.hash;
    });

    fs.writeFileSync(PACK_HASH_CACHE_FILE, JSON.stringify(packConfigHashes));
  }

  try {
    if (!RESOURCE_CACHING) {
      throw new Error("Resource caching has been disabled!");
    }

    if (resourcesUpToDate) {
      resourcePacks = JSON.parse(fs.readFileSync(RESOURCES_CACHE_FILE));
    } else {
      throw new Error("Resources need to be loaded!");
    }
  } catch (e) {
    await loadResourcePacks();

    fs.writeFileSync(RESOURCES_CACHE_FILE, JSON.stringify(resourcePacks));
  }

  resourcePacks.forEach((pack) => {
    outputPacks.push(
      Object.assign(
        {
          basePath: "/" + path.relative(path.resolve(folderPath, "..", "public"), pack.basePath),
        },
        pack.config
      )
    );
  });

  resourcesReady = true;

  console.log(`Custom Resources loading done. (${getClusterId(true)})`);
  console.timeEnd(`custom_resources_${getClusterId()}`);
}

async function loadPackConfigs() {
  for (const packOrFile of await fs.readdir(RESOURCE_PACK_FOLDER, { withFileTypes: true })) {
    if (!packOrFile.isDirectory()) {
      continue;
    }

    const pack = packOrFile.name;
    const basePath = path.resolve(RESOURCE_PACK_FOLDER, pack);

    try {
      const configPath = path.resolve(basePath, "config.json");

      const config = JSON.parse(fs.readFileSync(configPath));
      config.hash = await getFileHash(configPath);

      resourcePacks.push({
        basePath,
        config,
      });
    } catch (e) {
      console.log("Couldn't find config for resource pack", pack);
    }
  }
}

async function loadResourcePacks() {
  resourcePacks = resourcePacks.sort((a, b) => a.config.priority - b.config.priority);

  for (const pack of resourcePacks) {
    pack.files = await getFiles(path.resolve(pack.basePath, "assets", "minecraft", "mcpatcher", "cit"));
    pack.textures = [];

    for (const file of pack.files) {
      if (path.extname(file) != ".properties") {
        continue;
      }

      const lines = fs.readFileSync(file, "utf8").split(/\r?\n/);
      const properties = {};

      if (!lines.some((line) => line.startsWith("nbt.ExtraAttributes.id"))) continue;

      for (const line of lines) {
        // Skipping comments
        if (line.startsWith("#")) {
          continue;
        }

        const split = line.split("=");

        if (split.length < 2) {
          continue;
        }

        properties[split[0]] = split.slice(1).join("=");
      }

      // Empty properties, probably whole file contaiend only comments
      if (Object.keys(properties).length === 0) {
        continue;
      }

      // Ignoring when type is set and is not "item"
      if ("type" in properties && properties.type !== "item") {
        continue;
      }

      const texture = {
        weight: 0,
        animated: false,
        file: path.basename(file),
        match: [],
      };

      let textureFile =
        "texture" in properties
          ? path.resolve(path.dirname(file), properties.texture)
          : path.resolve(path.dirname(file), path.basename(file, ".properties"));

      if ("texture.bow_standby" in properties) {
        textureFile = path.resolve(path.dirname(file), properties["texture.bow_standby"]);
      }

      if ("model" in properties) {
        const modelFile = path.resolve(path.dirname(file), properties["model"]);

        try {
          const model = RJSON.parse(await fs.readFile(modelFile, "utf8"));

          if (model.parent == "builtin/generated") {
            const layers = Object.keys(model.textures).sort((a, b) => a - b);
            const topLayer = layers.pop();

            if (topLayer.startsWith("layer")) {
              const layerPath = path.resolve(pack.basePath, "assets", "minecraft", model.textures[topLayer] + ".png");
              await fs.access(layerPath, fs.F_OK);

              textureFile = layerPath;
            }
          }
        } catch (e) {
          //
        }
      }

      if (Object.keys(properties).filter((a) => a.includes("texture.leather_")).length == 2) {
        try {
          const leatherProperties = Object.keys(properties).filter((a) => a.includes("texture.leather_"));

          let leatherBase = properties[leatherProperties.find((a) => !a.includes("_overlay"))];
          let leatherOverlay = properties[leatherProperties.find((a) => a.includes("_overlay"))];

          if (!leatherBase.endsWith(".png")) {
            leatherBase += ".png";
          }

          if (!leatherOverlay.endsWith(".png")) {
            leatherOverlay += ".png";
          }

          const leather = {
            base: path.resolve(path.dirname(file), leatherBase),
            overlay: path.resolve(path.dirname(file), leatherOverlay),
          };

          for (const part in leather) {
            await fs.access(leather[part], fs.F_OK);

            const leatherImage = sharp(leather[part]);
            const leatherMetadata = await leatherImage.metadata();

            if (leatherMetadata.width != NORMALIZED_SIZE) {
              await fs.writeFile(
                leather[part],
                await leatherImage
                  .resize(NORMALIZED_SIZE, leatherMetadata.height * (NORMALIZED_SIZE / leatherMetadata.width), {
                    kernel: sharp.kernel.nearest,
                  })
                  .toBuffer()
              );
            }
          }

          texture.leather = leather;
        } catch (e) {
          //
        }
      } else if (
        Object.keys(properties).filter((a) => a.includes("texture.leather_") && a.includes("_overlay")).length == 1
      ) {
        const leatherProperties = Object.keys(properties).find(
          (a) => a.includes("texture.leather_") && a.includes("_overlay")
        );

        textureFile = path.resolve(path.dirname(file), properties[leatherProperties]);
      }

      if (!textureFile.endsWith(".png")) {
        textureFile += ".png";
      }

      try {
        await fs.access(textureFile, fs.F_OK);
      } catch (e) {
        continue;
      }

      texture.path = textureFile;

      const textureImage = sharp(textureFile);
      const textureMetadata = await textureImage.metadata();

      if (textureMetadata.width != NORMALIZED_SIZE) {
        await fs.writeFile(
          textureFile,
          await textureImage
            .resize(NORMALIZED_SIZE, textureMetadata.height * (NORMALIZED_SIZE / textureMetadata.width), {
              kernel: sharp.kernel.nearest,
            })
            .toBuffer()
        );
      }

      if (UPNG.decode(await fs.readFile(textureFile)).frames.length > 0) {
        texture.animated = true;
      }

      for (const property in properties) {
        if (property == "weight") {
          texture.weight = parseInt(properties[property]);
        }

        if (property == "items" || property == "matchItems") {
          const item = mcData.itemsByName[properties[property].replace("minecraft:", "")];

          if (item) {
            texture.id = item.id;
          }
        }

        if (property == "damage") {
          texture.damage = parseInt(properties[property]);
        }

        if (!property.startsWith("nbt.")) {
          continue;
        }

        let regex = properties[property];

        if (regex.startsWith("ipattern:")) {
          regex = mm.makeRe(regex.substring(9), { nocase: true });
        } else if (regex.startsWith("pattern:")) {
          regex = mm.makeRe(regex.substring(9));
        } else if (regex.startsWith("iregex:")) {
          regex = new RegExp(regex.substring(7), "i");
        } else if (regex.startsWith("regex:")) {
          regex = new RegExp(regex.substring(6));
        } else {
          regex = new RegExp(`^${_.escapeRegExp(regex)}$`);
        }

        texture.match.push({
          value: property.substring(4),
          regex: regex.toString(),
        });
      }

      let mcMeta;

      try {
        mcMeta = await fs.readFile(textureFile + ".mcmeta", "utf8");
      } catch (e) {
        mcMeta = false;
      }

      let metaProperties = {};

      if (mcMeta) {
        try {
          metaProperties = RJSON.parse(mcMeta);
        } catch (e) {
          // ...
        }
      }

      if ("animation" in metaProperties && textureMetadata.width != textureMetadata.height) {
        texture.animated = true;

        const { animation } = metaProperties;
        const canvas = createCanvas(NORMALIZED_SIZE, NORMALIZED_SIZE);
        const ctx = canvas.getContext("2d");

        const image = await loadImage(textureFile);

        const pngFrames = [];
        const pngDelays = [];

        if (!("frames" in animation)) {
          animation.frames = [];

          for (let i = 0; i < image.height / NORMALIZED_SIZE; i++) {
            animation.frames.push(i);
          }
        }

        let currentTime = 0;

        for (const [index, frame] of animation.frames.entries()) {
          if (typeof frame == "number") {
            animation.frames[index] = {
              index: frame,
              time: animation.frametime,
            };
          }

          animation.frames[index].time = (animation.frames[index].time / 20) * 1000;
          animation.frames[index].totalTime = currentTime;
          currentTime += animation.frames[index].time;
        }

        animation.frametime = (animation.frametime / 20) * 1000;

        if ("frames" in animation) {
          if (animation.interpolate) {
            let totalLength = 0;

            for (const frame of animation.frames) {
              totalLength += frame.time;
            }

            const frameTimeInterpolated = (2 / 20) * 1000;

            const frameCountInterpolated = totalLength / frameTimeInterpolated;

            for (let i = 0; i < frameCountInterpolated; i++) {
              let frameCur, frameNext;
              const currentTime = (i / frameCountInterpolated) * totalLength;

              for (const [index, frame] of animation.frames.entries()) {
                if (frame.totalTime + frame.time > currentTime) {
                  frameCur = frame;

                  if (index >= animation.frames.length - 1) {
                    frameNext = animation.frames[0];
                  } else {
                    frameNext = animation.frames[index + 1];
                  }

                  break;
                }
              }

              const opacity = (currentTime - frameCur.totalTime) / frameCur.time;

              ctx.clearRect(0, 0, canvas.width, canvas.height);

              ctx.globalCompositeOperation = "source-over";

              ctx.globalAlpha = 1;
              ctx.drawImage(getFrame(image, frameCur.index), 0, 0);

              ctx.globalCompositeOperation = "source-atop";

              ctx.globalAlpha = opacity;
              ctx.drawImage(getFrame(image, frameNext.index), 0, 0);

              const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height).data.buffer;

              pngFrames.push(imageData);
              pngDelays.push(frameTimeInterpolated);
            }
          } else {
            for (const frame of animation.frames) {
              ctx.clearRect(0, 0, canvas.width, canvas.height);
              ctx.drawImage(getFrame(image, frame.index), 0, 0);

              pngDelays.push(frame.time);

              const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height).data.buffer;

              pngFrames.push(imageData);
            }
          }
        }

        if (pngFrames.length > 0) {
          const apng = UPNG.encode(pngFrames, NORMALIZED_SIZE, NORMALIZED_SIZE, 0, pngDelays);

          await fs.writeFile(textureFile, Buffer.from(apng));
          await execFile(apng2gif, [textureFile, textureFile.replace(".png", ".gif")]);
        }
      }

      pack.textures.push(texture);
    }
  }
}

export function getPacks() {
  return outputPacks.sort((a, b) => b.priority - a.priority);
}

export function getCompletePacks() {
  return resourcePacks;
}

export async function getTexture(item, options = { ignore_id: false, pack_ids: [], debug: false }) {
  if (!resourcesReady) {
    await readyPromise;
  }

  const timeStarted = Date.now();
  const debugStats = {
    processed_packs: 0,
    processed_textures: 0,
    found_matches: 0,
  };

  let outputTexture = { weight: -9999 };

  let tempPacks = resourcePacks;

  options.pack_ids = options.pack_ids !== undefined ? options.pack_ids.split(",") : [];

  if (options.pack_ids.length > 0) {
    tempPacks = tempPacks.filter((a) => options.pack_ids.includes(a.config.id));
  }

  tempPacks = tempPacks.sort((a, b) => options.pack_ids.indexOf(a) - options.pack_ids.indexOf(b));

  for (const pack of tempPacks) {
    for (const texture of pack.textures) {
      if (options.ignore_id === false && texture.id != item.id) {
        continue;
      }

      if (options.ignore_id === false && "damage" in texture && texture.damage != item.Damage) {
        continue;
      }

      let matches = 0;

      for (const match of texture.match) {
        let { value, regex } = match;

        if (value.endsWith(".*")) {
          value = value.substring(0, value.length - 2);
        }

        if (!hasPath(item, "tag", ...value.split("."))) {
          continue;
        }

        let matchValues = getPath(item, "tag", ...value.split("."));

        if (!Array.isArray(matchValues)) {
          matchValues = [matchValues];
        }

        const slash = regex.lastIndexOf("/");
        regex = new RegExp(regex.slice(1, slash), regex.slice(slash + 1));

        if (
          matchValues.some((matchValue) => {
            return regex.test(matchValue.toString().replace(removeFormatting, ""));
          })
        ) {
          matches++;
        }
      }

      debugStats.found_matches += matches;
      debugStats.processed_textures++;

      if (matches == texture.match.length) {
        if (texture.weight < outputTexture.weight) {
          continue;
        }

        if (texture.weight == outputTexture.weight && texture.file < outputTexture.file) {
          continue;
        }

        outputTexture = Object.assign({ pack: { basePath: pack.basePath, config: pack.config } }, texture);
      }
    }

    debugStats.processed_packs++;
  }

  if (!("path" in outputTexture)) {
    return null;
  }

  outputTexture.path = path
    .relative(path.resolve(folderPath, "..", "public"), outputTexture.path)
    .replaceAll("\\", "/");

  debugStats.time_spent_ms = Date.now() - timeStarted;
  outputTexture.debug = debugStats;

  process.send({ type: "used_pack", id: outputTexture?.pack.config.id });

  return outputTexture;
}

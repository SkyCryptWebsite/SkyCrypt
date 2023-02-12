/*
Minecraft Head Rendering base provided by Crafatar: https://github.com/crafatar/crafatar
Hat layers, transparency and shading added by @LeaPhant
*/

import canvasModule from "canvas";
const { createCanvas, loadImage } = canvasModule;
import css from "css";
import path from "path";
import { fileURLToPath } from "url";
import * as customResources from "./custom-resources.js";
import sanitize from "mongo-sanitize";
import fs from "fs-extra";

import * as app from "./app.js";
import * as helper from "./helper.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const skew_a = 26 / 45;
const skew_b = skew_a * 2;

function hasTransparency(canvas) {
  const ctx = canvas.getContext("2d");
  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height).data;

  for (let i = 3; i < imageData.length; i += 4) {
    if (imageData[i] < 255) {
      return true;
    }
  }

  return false;
}

function resize(src, scale) {
  const dst = createCanvas(scale * src.width, scale * src.height);
  const ctx = dst.getContext("2d");

  // don't blur on resize
  ctx.patternQuality = "fast";

  ctx.drawImage(src, 0, 0, src.width * scale, src.height * scale);
  return dst;
}

function getPart(src, x, y, width, height, scale) {
  const dst = createCanvas(scale * width, scale * height);
  const ctx = dst.getContext("2d");

  // don't blur on resize
  ctx.patternQuality = "fast";

  ctx.drawImage(src, x, y, width, height, 0, 0, width * scale, height * scale);
  return dst;
}

function flipX(src) {
  const dst = createCanvas(src.width, src.height);
  const ctx = dst.getContext("2d");

  ctx.translate(src.width, 0);
  ctx.scale(-1, 1);

  ctx.drawImage(src, 0, 0);
  return dst;
}

function darken(src, factor) {
  const dst = createCanvas(src.width, src.height);
  const ctx = dst.getContext("2d");

  ctx.drawImage(src, 0, 0);

  ctx.globalCompositeOperation = "source-atop";

  ctx.fillStyle = `rgba(0, 0, 0, ${factor})`;
  ctx.fillRect(0, 0, src.width, src.height);

  return dst;
}

const ACCESSORIES = [
  "5c577e7d31e5e04c2ce71e13e3962192d80bd54b55efaacaaea12966fe27bf9",
  "eaa44b170d749ce4099aa78d98945d193651484089efb87ba88892c6fed2af31",
  "651eb16f22dd7505be5dae06671803633a5abf8b2beeb5c60548670df0e59214",
  "317b51e086f201448a4b45b0b91e97faf4d1739071480be6d5cab0a054512164",
];

let itemsSheet, itemsCss;

const textureDir = path.resolve(__dirname, "..", "public", "resources", "img", "textures", "item");

async function renderColoredItem(color, baseImage, overlayImage) {
  const canvas = createCanvas(16, 16);
  const ctx = canvas.getContext("2d");

  ctx.imageSmoothingEnabled = false;

  ctx.fillStyle = color;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.globalCompositeOperation = "multiply";

  ctx.drawImage(baseImage, 0, 0);

  ctx.globalCompositeOperation = "destination-in";

  ctx.drawImage(baseImage, 0, 0);

  ctx.globalCompositeOperation = "source-over";

  ctx.drawImage(overlayImage, 0, 0);

  return await canvas.toBuffer("image/png");
}

/**
 * Gets either the cached texture or attempts to render and saves it
 * @param {string} textureId
 * @param {number} scale
 * @returns Image of a rendered head
 */
export async function getHead(textureId, scale = 6.4) {
  const filePath = helper.getCacheFilePath(app.CACHE_PATH, "head", textureId);
  let file;

  try {
    file = await fs.readFile(filePath);
  } catch (e) {
    file = await renderHead(textureId, scale);

    fs.writeFile(filePath, file, (err) => {
      if (err) {
        console.error(err);
      }
    });
  }

  return file;
}

async function renderHead(textureId, scale) {
  const hat_factor = 0.94;

  const canvas = createCanvas(scale * 20, scale * 18.5);
  const hat_canvas = createCanvas(scale * 20, scale * 18.5);
  const hat_bg_canvas = createCanvas(scale * 20, scale * 18.5);
  const head_canvas = createCanvas(scale * 20 * hat_factor, scale * 18.5);

  const ctx = canvas.getContext("2d");
  const hat = hat_canvas.getContext("2d");
  const hat_bg = hat_bg_canvas.getContext("2d");
  const head = head_canvas.getContext("2d");

  const skin = await loadImage(`https://textures.minecraft.net/texture/${textureId}`);

  let head_bottom = resize(getPart(skin, 16, 0, 8, 8, 1), scale * (hat_factor + 0.01));
  const head_top = resize(getPart(skin, 8, 0, 8, 8, 1), scale * (hat_factor + 0.01));
  let head_back = flipX(resize(getPart(skin, 24, 8, 8, 8, 1), scale * (hat_factor + 0.01)));
  let head_front = resize(getPart(skin, 8, 8, 8, 8, 1), scale * (hat_factor + 0.01));
  const head_left = flipX(resize(getPart(skin, 16, 8, 8, 8, 1), scale * (hat_factor + 0.01)));
  let head_right = resize(getPart(skin, 0, 8, 8, 8, 1), scale * (hat_factor + 0.01));

  head_right = darken(head_right, 0.15);
  head_front = darken(head_front, 0.25);
  head_bottom = darken(head_bottom, 0.3);
  head_back = darken(head_back, 0.3);

  let head_top_overlay,
    head_front_overlay,
    head_right_overlay,
    head_back_overlay,
    head_bottom_overlay,
    head_left_overlay;

  if (hasTransparency(getPart(skin, 32, 0, 32, 32, 1))) {
    // render head overlay
    head_top_overlay = resize(getPart(skin, 40, 0, 8, 8, 1), scale);
    head_front_overlay = resize(getPart(skin, 40, 8, 8, 8, 1), scale);
    head_right_overlay = resize(getPart(skin, 32, 8, 8, 8, 1), scale);
    head_back_overlay = flipX(resize(getPart(skin, 56, 8, 8, 8, 1), scale));
    head_bottom_overlay = resize(getPart(skin, 48, 0, 8, 8, 1), scale);
    head_left_overlay = flipX(resize(getPart(skin, 48, 8, 8, 8, 1), scale));

    head_right_overlay = darken(head_right_overlay, 0.15);
    head_front_overlay = darken(head_front_overlay, 0.25);
    head_bottom_overlay = darken(head_bottom_overlay, 0.3);
    head_back_overlay = darken(head_back_overlay, 0.3);
  }

  let x = 0;
  let y = 0;
  let z = 0;

  const z_offset = scale * 3;
  const x_offset = scale * 2;

  if (head_top_overlay) {
    // hat left
    x = x_offset + 8 * scale;
    y = 0;
    z = z_offset - 8 * scale;
    hat_bg.setTransform(1, skew_a, 0, skew_b, 0, 0);
    hat_bg.drawImage(head_left_overlay, x + y, z - y, head_left_overlay.width, head_left_overlay.height);

    if (!ACCESSORIES.includes(textureId)) {
      // hat back
      x = x_offset;
      y = 0;
      z = z_offset - 0.5;
      hat_bg.setTransform(1, -skew_a, 0, skew_b, 0, skew_a);
      hat_bg.drawImage(head_back_overlay, y + x, x + z, head_back_overlay.width, head_back_overlay.height);
    }

    // hat bottom
    x = x_offset;
    y = 0;
    z = z_offset + 8 * scale;
    hat_bg.setTransform(1, -skew_a, 1, skew_a, 0, 0);
    hat_bg.drawImage(head_bottom_overlay, y - z, x + z, head_bottom_overlay.width, head_bottom_overlay.height);

    // hat top
    x = x_offset;
    y = 0;
    z = z_offset;
    hat.setTransform(1, -skew_a, 1, skew_a, 0, 0);
    hat.drawImage(head_top_overlay, y - z, x + z, head_top_overlay.width, head_top_overlay.height + 1);

    // hat front
    x = x_offset + 8 * scale;
    y = 0;
    z = z_offset - 0.5;
    hat.setTransform(1, -skew_a, 0, skew_b, 0, skew_a);
    hat.drawImage(head_front_overlay, y + x, x + z, head_front_overlay.width, head_front_overlay.height);

    // hat right
    x = x_offset;
    y = 0;
    z = z_offset;
    hat.setTransform(1, skew_a, 0, skew_b, 0, 0);
    hat.drawImage(head_right_overlay, x + y, z - y, head_right_overlay.width, head_right_overlay.height);
  }

  scale *= hat_factor;

  // head bottom
  x = x_offset;
  y = 0;
  z = z_offset + 8 * scale;
  head.setTransform(1, -skew_a, 1, skew_a, 0, 0);
  head.drawImage(head_bottom, y - z, x + z, head_bottom.width, head_bottom.height);

  // head left
  x = x_offset + 8 * scale;
  y = 0;
  z = z_offset - 8 * scale;
  head.setTransform(1, skew_a, 0, skew_b, 0, 0);
  head.drawImage(head_left, x + y, z - y, head_left.width, head_left.height);

  // head back
  x = x_offset;
  y = 0;
  z = z_offset;
  head.setTransform(1, -skew_a, 0, skew_b, 0, skew_a);
  head.drawImage(head_back, y + x, x + z, head_back.width, head_back.height);

  // head top
  x = x_offset;
  y = 0;
  z = z_offset;
  head.setTransform(1, -skew_a, 1, skew_a, 0, 0);
  head.drawImage(head_top, y - z, x + z, head_top.width, head_top.height);

  // head front
  x = x_offset + 8 * scale;
  y = 0;
  z = z_offset;
  head.setTransform(1, -skew_a, 0, skew_b, 0, skew_a);
  head.drawImage(head_front, y + x, x + z, head_front.width, head_front.height);

  // head right
  x = x_offset;
  y = 0;
  z = z_offset;
  head.setTransform(1, skew_a, 0, skew_b, 0, 0);
  head.drawImage(head_right, x + y, z - y, head_right.width, head_right.height);

  ctx.drawImage(hat_bg_canvas, 0, 0);
  ctx.drawImage(
    head_canvas,
    (scale * 20 - scale * 20 * hat_factor) / 2,
    (scale * 18.5 - scale * 18.5 * hat_factor) / 2
  );
  ctx.drawImage(hat_canvas, 0, 0);

  return await canvas.toBuffer("image/png");
}

/**
 * Gets either the cached texture or attempts to render and saves it
 * @param {string} type
 * @param {string} color
 * @returns Image of a rendered armor piece
 */
export async function getArmor(type, color) {
  const filePath = helper.getCacheFilePath(app.CACHE_PATH, `leather`, `${type}_${color}`);
  let file;

  try {
    file = await fs.readFile(filePath);
  } catch (e) {
    file = await renderArmor(type, color);

    fs.writeFile(filePath, file, (err) => {
      if (err) {
        console.error(err);
      }
    });
  }

  return file;
}

async function renderArmor(type, color) {
  const armorBase = await loadImage(path.resolve(textureDir, `leather_${type}.png`));
  const armorOverlay = await loadImage(path.resolve(textureDir, `leather_${type}_overlay.png`));

  return await renderColoredItem("#" + color, armorBase, armorOverlay);
}

/**
 * Gets either the cached texture or attempts to render and saves it
 * @param {string} type
 * @param {string} color
 * @returns Image of a rendered potion
 */
export async function getPotion(type, color) {
  const filePath = helper.getCacheFilePath(app.CACHE_PATH, `potion`, `${type}_${color}`);
  let file;

  try {
    file = await fs.readFile(filePath);
  } catch (e) {
    file = await renderPotion(type, color);

    fs.writeFile(filePath, file, (err) => {
      if (err) {
        console.error(err);
      }
    });
  }

  return file;
}

async function renderPotion(type, color) {
  const potionLiquid = await loadImage(path.resolve(textureDir, "potion_overlay.png"));
  const potionBottlle = await loadImage(
    path.resolve(textureDir, type === "splash" ? "splash_potion.png" : "potion.png")
  );

  return await renderColoredItem("#" + color, potionLiquid, potionBottlle);
}

/**
 * Gets a texture of an item, either from stylesheet or from resource packs
 * @param {string} skyblockId
 * @param {*} query
 * @param {*} db
 * @returns Image of an item
 */
export async function renderItem(skyblockId, query, db) {
  query = sanitize(query);

  const item = { id: -1, Damage: 0, Count: 1, tag: { ExtraAttributes: {} } };
  let dbItem = {};

  /**
   * Look for DB items if possible with Skyblock ID or query name
   */
  if (skyblockId) {
    skyblockId = sanitize(skyblockId);

    if (skyblockId.includes(":")) {
      const split = skyblockId.split(":");

      skyblockId = split[0];
      query.damage = new Number(split[1]);
    }

    dbItem = await db.collection("items").findOne({ id: skyblockId });
  }

  if (query.name) {
    const results = await db
      .collection("items")
      .find({ $text: { $search: query.name } })
      .toArray();

    const filteredResults = results.filter((a) => a.name.toLowerCase() == query.name.toLowerCase());

    if (filteredResults.length > 0) {
      dbItem = filteredResults[0];
    }
  }

  if (query.id) {
    item.id = query.id;
  }

  if (query.damage) {
    item.Damage = query.damage;
  }

  if (query.name) {
    item.tag.display = { Name: query.name };
  }

  if ("item_id" in dbItem) {
    item.id = dbItem.item_id;
  }

  if ("damage" in dbItem) {
    item.Damage = dbItem.damage;
  }

  if ("name" in dbItem) {
    item.tag.display = { Name: dbItem.name };
  }

  if ("id" in dbItem) {
    item.tag.ExtraAttributes.id = dbItem.id;
  }

  const outputTexture = { mime: "image/png" };

  for (const rule of itemsCss.stylesheet.rules) {
    if (!rule.selectors?.includes(`.icon-${item.id}_${item.Damage}`)) {
      continue;
    }

    const coords = rule.declarations[0].value.split(" ").map((a) => Math.abs(parseInt(a)));

    outputTexture.image = await getPart(itemsSheet, ...coords, 128, 128, 1).toBuffer("image/png");
  }

  if ("texture" in dbItem) {
    outputTexture.image = await getHead(item.texture);
  }

  const customTexture = await customResources.getTexture(item, {
    ignore_id: "name" in query,
    invert_order: "invert" in query,
    pack_ids: query.pack,
  });

  if (customTexture) {
    if (customTexture.animated) {
      customTexture.path = customTexture.path.replace(".png", ".gif");
      outputTexture.mime = "image/gif";
    }

    outputTexture.path = customTexture.path;
    outputTexture.debug = customTexture.debug;
    outputTexture.image = await fs.readFile(path.resolve(__dirname, "..", "public", customTexture.path));
  }

  if (!("image" in outputTexture)) {
    outputTexture.error = "item not found";
  }

  return outputTexture;
}

export async function init() {
  itemsSheet = await loadImage(path.resolve(__dirname, "..", "public", "resources", "img", "inventory", `items.png`));
  itemsCss = css.parse(
    await fs.readFile(path.resolve(__dirname, "..", "public", "resources", "css", `inventory.css`), "utf8")
  );
}

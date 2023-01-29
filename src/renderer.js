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

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const skew_a = 26 / 45;
const skew_b = skew_a * 2;

/**
 * Check if a canvas image has transparency
 * @param {HTMLCanvasElement} canvas - The canvas to check for transparency
 * @returns {Boolean} - Returns true if the canvas has any transparent pixels, false otherwise
 */
function hasTransparency(canvas) {
  // Get 2D context of canvas
  const ctx = canvas.getContext("2d");

  // Get image data of canvas
  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height).data;

  // Loop through all the pixels in the image data
  for (let i = 3; i < imageData.length; i += 4) {
    // Check the alpha channel (the 4th value) of each pixel
    if (imageData[i] < 255) {
      // Return true if any alpha value is less than 255 (not fully opaque)
      return true;
    }
  }

  // Return false if all alpha values are 255 (fully opaque)
  return false;
}

/**
 * Resizes an image using canvas
 * @param {HTMLCanvasElement | HTMLImageElement | HTMLVideoElement} src - The source image to resize
 * @param {Number} scale - The scale factor to resize the image by
 * @returns {HTMLCanvasElement} - A canvas element with the resized image
 */
function resize(src, scale) {
  // Create a new canvas with resized dimensions
  const dst = createCanvas(scale * src.width, scale * src.height);
  // Get 2D context of the new canvas
  const ctx = dst.getContext("2d");

  // Set the pattern quality to "fast" to avoid blurring on resize
  ctx.patternQuality = "fast";

  // Draw the source image onto the new canvas with resized dimensions
  ctx.drawImage(src, 0, 0, src.width * scale, src.height * scale);

  // Return the resized canvas
  return dst;
}

/**
 * Crops and resizes an image using canvas
 * @param {HTMLCanvasElement | HTMLImageElement | HTMLVideoElement} src - The source image to crop and resize
 * @param {Number} x - The x coordinate of the top left corner of the crop area
 * @param {Number} y - The y coordinate of the top left corner of the crop area
 * @param {Number} width - The width of the crop area
 * @param {Number} height - The height of the crop area
 * @param {Number} scale - The scale factor to resize the cropped image by
 * @returns {HTMLCanvasElement} - A canvas element with the cropped and resized image
 */
function getPart(src, x, y, width, height, scale) {
  // Create a new canvas with resized dimensions
  const dst = createCanvas(scale * width, scale * height);
  // Get 2D context of the new canvas
  const ctx = dst.getContext("2d");

  // Set the pattern quality to "fast" to avoid blurring on resize
  ctx.patternQuality = "fast";

  // Draw the cropped area of the source image onto the new canvas with resized dimensions
  ctx.drawImage(src, x, y, width, height, 0, 0, width * scale, height * scale);

  // Return the cropped and resized canvas
  return dst;
}

/**
 * Flips an image horizontally using canvas
 * @param {HTMLCanvasElement | HTMLImageElement | HTMLVideoElement} src - The source image to flip
 * @returns {HTMLCanvasElement} - A canvas element with the flipped image
 */
function flipX(src) {
  // Create a new canvas with the same dimensions as the source image
  const dst = createCanvas(src.width, src.height);
  // Get 2D context of the new canvas
  const ctx = dst.getContext("2d");

  // Translate the context to the center of the canvas
  ctx.translate(src.width, 0);
  // Flip the context horizontally
  ctx.scale(-1, 1);

  // Draw the source image onto the new canvas
  ctx.drawImage(src, 0, 0);

  // Return the flipped canvas
  return dst;
}

/**
 * Darkens an image using canvas
 * @param {HTMLCanvasElement | HTMLImageElement | HTMLVideoElement} src - The source image to darken
 * @param {Number} factor - A value between 0 and 1 representing the degree of darkness to apply
 * @returns {HTMLCanvasElement} - A canvas element with the darkened image
 */
function darken(src, factor) {
  // Create a new canvas with the same dimensions as the source image
  const dst = createCanvas(src.width, src.height);
  // Get 2D context of the new canvas
  const ctx = dst.getContext("2d");

  // Draw the source image onto the new canvas
  ctx.drawImage(src, 0, 0);

  // Set the composite operation to "source-atop"
  ctx.globalCompositeOperation = "source-atop";

  // Fill the canvas with a black rectangle with the specified opacity
  ctx.fillStyle = `rgba(0, 0, 0, ${factor})`;
  ctx.fillRect(0, 0, src.width, src.height);

  // Return the darkened canvas
  return dst;
}

const ACCESSORIES = [
  "http://textures.minecraft.net/texture/5c577e7d31e5e04c2ce71e13e3962192d80bd54b55efaacaaea12966fe27bf9",
  "http://textures.minecraft.net/texture/eaa44b170d749ce4099aa78d98945d193651484089efb87ba88892c6fed2af31",
  "http://textures.minecraft.net/texture/651eb16f22dd7505be5dae06671803633a5abf8b2beeb5c60548670df0e59214",
  "http://textures.minecraft.net/texture/317b51e086f201448a4b45b0b91e97faf4d1739071480be6d5cab0a054512164",
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

export async function renderHead(url, scale) {
  const hat_factor = 0.94;

  const canvas = createCanvas(scale * 20, scale * 18.5);
  const hat_canvas = createCanvas(scale * 20, scale * 18.5);
  const hat_bg_canvas = createCanvas(scale * 20, scale * 18.5);
  const head_canvas = createCanvas(scale * 20 * hat_factor, scale * 18.5);

  const ctx = canvas.getContext("2d");
  const hat = hat_canvas.getContext("2d");
  const hat_bg = hat_bg_canvas.getContext("2d");
  const head = head_canvas.getContext("2d");

  const skin = await loadImage(url);

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

    if (!ACCESSORIES.includes(url)) {
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
 * Loads and renders an armor with the specified type and color.
 *
 * @async
 * @param {string} type - The type of the armor to be rendered.
 * @param {string} color - The color of the armor to be rendered.
 * @returns {Promise<Image>} The rendered armor image.
 */
export async function renderArmor(type, color) {
  // Load the base image and overlay image of the armor
  const armorBase = await loadImage(path.resolve(textureDir, `leather_${type}.png`));
  const armorOverlay = await loadImage(path.resolve(textureDir, `leather_${type}_overlay.png`));

  // Return the rendered colored item
  return await renderColoredItem("#" + color, armorBase, armorOverlay);
}

/**
 * Loads and renders a potion with the specified type and color.
 *
 * @async
 * @param {string} type - The type of the potion to be rendered.
 * @param {string} color - The color of the potion to be rendered.
 * @returns {Promise<Image>} The rendered potion image.
 */
export async function renderPotion(type, color) {
  // Load the liquid image and bottle image of the potion
  const potionLiquid = await loadImage(path.resolve(textureDir, "potion_overlay.png"));
  const potionBottle = await loadImage(
    path.resolve(textureDir, type === "splash" ? "splash_potion.png" : "potion.png")
  );

  // Return the rendered colored item
  return await renderColoredItem("#" + color, potionLiquid, potionBottle);
}

export async function renderItem(skyblockId, query, db) {
  let item = { Damage: 0, id: -1 };
  query = sanitize(query);

  if (skyblockId) {
    skyblockId = skyblockId.replace(".gif", "");
    skyblockId = sanitize(skyblockId);

    if (skyblockId.includes(":")) {
      const split = skyblockId.split(":");

      skyblockId = split[0];
      query.damage = new Number(split[1]);
    }

    item = Object.assign(item, await db.collection("items").findOne({ id: skyblockId }));
  }

  if (query.name) {
    const results = await db
      .collection("items")
      .find({ $text: { $search: query.name } })
      .toArray();

    const filteredResults = results.filter((a) => a.name.toLowerCase() == query.name.toLowerCase());

    if (filteredResults.length > 0) {
      item = Object.assign(item, filteredResults[0]);
    }
  }

  if (query.id) {
    item.id = query.id;
  }

  if (query.damage) {
    item.damage = query.damage;
  }

  if (query.name) {
    item.name = query.name;
  }

  if ("damage" in item) {
    item.Damage = item.damage;
    delete item.damage;
  }

  if ("item_id" in item) {
    item.id = item.item_id;
  }

  if ("name" in item) {
    item.tag = { display: { Name: item.name } };
  }

  if ("texture" in item) {
    return {
      mime: "image/png",
      image: await renderHead(`http://textures.minecraft.net/texture/${item.texture}`, 6.4),
    };
  }

  const outputTexture = { mime: "image/png" };

  for (const rule of itemsCss.stylesheet.rules) {
    if (!rule.selectors?.includes(`.icon-${item.id}_${item.Damage}`)) {
      continue;
    }

    const coords = rule.declarations[0].value.split(" ").map((a) => Math.abs(parseInt(a)));

    outputTexture.image = await getPart(itemsSheet, ...coords, 128, 128, 1).toBuffer("image/png");
  }

  const customTexture = await customResources.getTexture(item, {
    ignore_id: "name" in query,
    pack_ids: query.pack,
  });

  if (customTexture) {
    if (customTexture.animated) {
      customTexture.path = customTexture.path.replace(".png", ".gif");
      outputTexture.mime = "image/gif";
    }

    outputTexture.path = customTexture.path;
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

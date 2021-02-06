/*
Minecraft Head Rendering base provided by Crafatar: https://github.com/crafatar/crafatar
Hat layers, transparency and shading added by me
*/

const { createCanvas, loadImage } = require('canvas');
const css = require('css');
const helper = require('./helper');
const path = require('path');
const customResources = require('./custom-resources');
const fs = require('fs-extra');

const skew_a = 26 / 45;
const skew_b = skew_a * 2;

function hasTransparency(canvas) {
    let ctx = canvas.getContext("2d");
    let imageData = ctx.getImageData(0, 0, canvas.width, canvas.height).data;

    for(let i = 3; i < imageData.length; i += 4)
        if(imageData[i] < 255)
            return true;

    return false;
}

function resize(src, scale){
    let dst = createCanvas(scale * src.width, scale * src.height);
    let ctx = dst.getContext("2d");

    // don't blur on resize
    ctx.patternQuality = "fast";

    ctx.drawImage(src, 0, 0, src.width * scale, src.height * scale);
    return dst;
}

function getPart(src, x, y, width, height, scale){
    let dst = createCanvas(scale * width, scale * height);
    let ctx = dst.getContext("2d");

    // don't blur on resize
    ctx.patternQuality = "fast";

    ctx.drawImage(src, x, y, width, height, 0, 0, width * scale, height * scale);
    return dst;
}

function flipX(src){
    let dst = createCanvas(src.width, src.height);
    let ctx = dst.getContext("2d");

    ctx.translate(src.width, 0);
    ctx.scale(-1, 1);

    ctx.drawImage(src, 0, 0);
    return dst;
}

function darken(src, factor){
    let dst = createCanvas(src.width, src.height);
    let ctx = dst.getContext("2d");

    ctx.drawImage(src, 0, 0);

    ctx.globalCompositeOperation = 'source-atop';

    ctx.fillStyle = `rgba(0, 0, 0, ${factor})`;
    ctx.fillRect(0, 0, src.width, src.height);

    return dst;
}

const TALISMANS = [
    "http://textures.minecraft.net/texture/5c577e7d31e5e04c2ce71e13e3962192d80bd54b55efaacaaea12966fe27bf9",
    "http://textures.minecraft.net/texture/eaa44b170d749ce4099aa78d98945d193651484089efb87ba88892c6fed2af31",
    "http://textures.minecraft.net/texture/651eb16f22dd7505be5dae06671803633a5abf8b2beeb5c60548670df0e59214",
    "http://textures.minecraft.net/texture/317b51e086f201448a4b45b0b91e97faf4d1739071480be6d5cab0a054512164"
];

let itemsSheet, itemsCss;

module.exports = {
    renderHead: async (url, scale) => {
        let hat_factor = 0.94;

        let canvas = createCanvas(scale * 20, scale * 18.5);
        let hat_canvas = createCanvas(scale * 20, scale * 18.5);
        let hat_bg_canvas = createCanvas(scale * 20, scale * 18.5);
        let head_canvas = createCanvas(scale * 20 * hat_factor, scale * 18.5);

        let ctx = canvas.getContext('2d');
        let hat = hat_canvas.getContext('2d');
        let hat_bg = hat_bg_canvas.getContext('2d');
        let head = head_canvas.getContext('2d');

        let skin = await loadImage(url);

        let head_bottom = resize(getPart(skin, 16, 0, 8, 8, 1), scale * (hat_factor + 0.01));
        let head_top = resize(getPart(skin, 8, 0, 8, 8, 1), scale * (hat_factor + 0.01));
        let head_back = flipX(resize(getPart(skin, 24, 8, 8, 8, 1), scale * (hat_factor + 0.01)));
        let head_front = resize(getPart(skin, 8, 8, 8, 8, 1), scale * (hat_factor + 0.01));
        let head_left = flipX(resize(getPart(skin, 16, 8, 8, 8, 1), scale * (hat_factor + 0.01)));
        let head_right = resize(getPart(skin, 0, 8, 8, 8, 1), scale * (hat_factor + 0.01));

        head_right = darken(head_right, 0.15);
        head_front = darken(head_front, 0.25);
        head_bottom = darken(head_bottom, 0.3);
        head_back = darken(head_back, 0.3);

        let head_top_overlay, head_front_overlay, head_right_overlay, head_back_overlay, head_bottom_overlay, head_left_overlay;

        if(hasTransparency(getPart(skin, 32, 0, 32, 32, 1))){
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

        let z_offset = scale * 3;
        let x_offset = scale * 2;

        if(head_top_overlay){
            // hat left
            x = x_offset + 8 * scale;
            y = 0;
            z = z_offset - 8 * scale;
            hat_bg.setTransform(1, skew_a, 0, skew_b, 0, 0);
            hat_bg.drawImage(head_left_overlay, x + y, z - y, head_left_overlay.width, head_left_overlay.height);

            if(!TALISMANS.includes(url)){
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
        ctx.drawImage(head_canvas, (scale * 20 - scale * 20 * hat_factor) / 2, (scale * 18.5 - scale * 18.5 * hat_factor) / 2);
        ctx.drawImage(hat_canvas, 0, 0);

        return await canvas.toBuffer('image/png');
    },

    renderArmor: async (type, color) => {
        let canvas = createCanvas(128, 128);
        let ctx = canvas.getContext('2d');

        ctx.imageSmoothingEnabled = false;

        const armorBase = await loadImage(path.resolve(__dirname, '..', 'public', 'resources', 'img', 'textures', 'item', `leather_${type}.png`));
        const armorOverlay = await loadImage(path.resolve(__dirname, '..', 'public', 'resources', 'img', 'textures', 'item', `leather_${type}_overlay.png`));

        ctx.drawImage(armorBase, 0, 0, 16, 16, 0, 0, canvas.width, canvas.height);

        let imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);

        for(let i = 0; i < imageData.data.length; i += 4){
            let r = imageData.data[i];
            let alpha = r / 255;

            imageData.data[i] = color[0] * alpha;
            imageData.data[i + 1] = color[1] * alpha;
            imageData.data[i + 2] = color[2] * alpha;
        }

        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.putImageData(imageData, 0, 0);

        ctx.drawImage(armorOverlay, 0, 0, 16, 16, 0, 0, canvas.width, canvas.height);

        return await canvas.toBuffer('image/png');
    },

    renderItem: async (skyblockId, query, db) => {
        let item = { Damage: 0, id: -1 };

        if(skyblockId){
            skyblockId = skyblockId.replace(".gif", "");

            if(skyblockId.includes(':')){
                const split = skyblockId.split(":");

                skyblockId = split[0];
                query.damage = new Number(split[1]);
            }
    
            item = Object.assign(item, await db
                .collection('items')
                .findOne({ id: skyblockId }));
        }

        if(query.name){
            const results =  await db
            .collection('items')
            .find({ $text: { $search: query.name }})
            .toArray();

            const filteredResults = results.filter(a => a.name.toLowerCase() == query.name.toLowerCase());

            if(filteredResults.length > 0)
                item = Object.assign(item, filteredResults[0]);
        }

        if(query.id)
            item.id = query.id;

        if(query.damage)
            item.damage = query.damage;

        if(query.name)
            item.name = query.name;

        if('damage' in item){
            item.Damage = item.damage;
            delete item.damage;
        }

        if('item_id' in item)
            item.id = item.item_id;

        if('name' in item){
            item.tag = {};

            helper.setPath(item, item.name, 'tag', 'display', 'Name');
        }

        if('texture' in item)
            return { mime: 'image/png', image: await module.exports.renderHead(`http://textures.minecraft.net/texture/${item.texture}`, 6.4) };

        const outputTexture = { mime: 'image/png' };

        for(const rule of itemsCss.stylesheet.rules){
            if(!rule.selectors?.includes(`.icon-${item.id}_${item.Damage}`))
                continue;

            const coords = rule.declarations[0].value.split(" ").map(a => Math.abs(parseInt(a)));

            outputTexture.image = await getPart(itemsSheet, ...coords, 128, 128, 1).toBuffer('image/png');
        }

        const customTexture = await customResources.getTexture(item, 'name' in query, query.pack);

        if(customTexture){
            if(customTexture.animated){
                customTexture.path = customTexture.path.replace('.png', '.gif');
                outputTexture.mime = 'image/gif';
            }

            outputTexture.image = await fs.readFile(path.resolve(__dirname, '..', 'public', customTexture.path));
        }

        if(!('image' in outputTexture))
            outputTexture.error = 'item not found';

        return outputTexture;
    },

    init: async () => {
        itemsSheet = await loadImage(path.resolve(__dirname, '..', 'public', 'resources', 'img', 'inventory', `items.png`));
        itemsCss = css.parse(await fs.readFile(path.resolve(__dirname, '..', 'public', 'resources', 'css', `inventory.css`), 'utf8'));
    }
}

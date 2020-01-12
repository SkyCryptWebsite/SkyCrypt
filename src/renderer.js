/*
Minecraft Head Rendering provided by Crafatar: https://github.com/crafatar/crafatar
*/

const { createCanvas, loadImage } = require('canvas');
const path = require('path');

const skew_a = 26 / 45;
const skew_b = skew_a * 2;

function removeTransparency(canvas){
    let ctx = canvas.getContext("2d");
    let imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    let data = imageData.data;

    for(let i = 0; i < data.length; i += 4)
        data[i + 3] = 255;

    ctx.putImageData(imageData, 0, 0);

    return canvas;
}

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

module.exports = {
    renderHead: async (url, scale) => {
        let hat_factor = 0.94;

        let canvas = createCanvas(scale * 20, scale * 18.5);
        let hat_canvas = createCanvas(scale * 20, scale * 18.5);
        let hat_bg_canvas = createCanvas(scale * 20, scale * 18.5);
        let head_canvas = createCanvas(scale * 20 * hat_factor, scale * 18.5 * hat_factor);

        let ctx = canvas.getContext('2d');
        let hat = hat_canvas.getContext('2d');
        let hat_bg = hat_bg_canvas.getContext('2d');
        let head = head_canvas.getContext('2d');

        let skin = await loadImage(url);

        let head_top = resize(removeTransparency(getPart(skin, 8, 0, 8, 8, 1)), scale * (hat_factor + 0.01));
        let head_front = resize(removeTransparency(getPart(skin, 8, 8, 8, 8, 1)), scale * (hat_factor + 0.01));
        let head_right = resize(removeTransparency(getPart(skin, 0, 8, 8, 8, 1)), scale * (hat_factor + 0.01));

        let head_top_overlay, head_front_overlay, head_right_overlay, head_back_overlay, head_bottom_overlay, head_left_overlay;

        if(hasTransparency(getPart(skin, 32, 0, 32, 32, 1))){
            // render head overlay
            head_top_overlay = resize(getPart(skin, 40, 0, 8, 8, 1), scale);
            head_front_overlay = resize(getPart(skin, 40, 8, 8, 8, 1), scale);
            head_right_overlay = resize(getPart(skin, 32, 8, 8, 8, 1), scale);
            head_back_overlay = resize(getPart(skin, 56, 8, 8, 8, 1), scale);
            head_bottom_overlay = resize(getPart(skin, 48, 0, 8, 8, 1), scale);
            head_left_overlay = resize(getPart(skin, 48, 8, 8, 8, 1), scale);
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
            hat_bg.drawImage(head_left_overlay, x + y, z - y - 0.5, head_left_overlay.width, head_left_overlay.height + 1);

            // hat back
            x = x_offset;
            y = 0;
            z = z_offset - 0.5;
            hat_bg.setTransform(1, -skew_a, 0, skew_b, 0, skew_a);
            hat_bg.drawImage(head_back_overlay, y + x, x + z, head_back_overlay.width, head_back_overlay.height);

            // hat bottom
            x = x_offset;
            y = 0;
            z = z_offset + 8 * scale;
            hat_bg.setTransform(1, -skew_a, 1, skew_a, 0, 0);
            hat_bg.drawImage(head_bottom_overlay, y - z, x + z, head_bottom_overlay.width, head_bottom_overlay.height + 1);

            // hat top
            x = x_offset;
            y = -0.5;
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
            hat.drawImage(head_right_overlay, x + y, z - y - 0.5, head_right_overlay.width, head_right_overlay.height + 1);
        }

        scale *= hat_factor;

        // head top
        x = x_offset;
        y = -0.5;
        z = z_offset;
        head.setTransform(1, -skew_a, 1, skew_a, 0, 0);
        head.drawImage(head_top, y - z, x + z, head_top.width, head_top.height + 1);

        // head front
        x = x_offset + 8 * scale;
        y = 0;
        z = z_offset - 0.5;
        head.setTransform(1, -skew_a, 0, skew_b, 0, skew_a);
        head.drawImage(head_front, y + x, x + z, head_front.width, head_front.height);

        // head right
        x = x_offset;
        y = 0;
        z = z_offset;
        head.setTransform(1, skew_a, 0, skew_b, 0, 0);
        head.drawImage(head_right, x + y, z - y - 0.5, head_right.width, head_right.height + 1);


        ctx.drawImage(hat_bg_canvas, 0, 0);
        ctx.drawImage(head_canvas, (scale * 20 - scale * 20 * hat_factor) / 2, (scale * 18.5 - scale * 18.5 * hat_factor) / 2);
        ctx.drawImage(hat_canvas, 0, 0);

        return await canvas.toBuffer('image/png');
    },

    renderArmor: async (type, color) => {
        let canvas = createCanvas(128, 128);
        let ctx = canvas.getContext('2d');

        ctx.imageSmoothingEnabled = false;

        let armor_base = await loadImage(path.resolve(__dirname, 'public', 'resources', 'img', 'textures', 'item', `leather_${type}.png`));
        let armor_overlay = await loadImage(path.resolve(__dirname, 'public', 'resources', 'img', 'textures', 'item', `leather_${type}_overlay.png`));

        ctx.drawImage(armor_base, 0, 0, 16, 16, 0, 0, canvas.width, canvas.height);

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

        ctx.drawImage(armor_overlay, 0, 0, 16, 16, 0, 0, canvas.width, canvas.height);

        return await canvas.toBuffer('image/png');
    }
}

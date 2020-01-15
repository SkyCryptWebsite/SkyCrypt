const fs = require('fs-extra');
const path = require('path');
const mm = require('micromatch');
const objectPath = require('object-path');
const escapeRegExp = require('lodash.escaperegexp');

let removeFormatting = new RegExp('§[0-9a-z]{1}', 'g');

function getFiles(dir, fileList){
    const files = fs.readdirSync(dir);

    fileList = fileList || [];

    for(const file of files){
        if(fs.statSync(path.resolve(dir, file)).isDirectory())
            fileList = getFiles(path.resolve(dir, file), fileList);
        else
            fileList.push(path.resolve(dir, file));
    }

    return fileList;
}

let resourcePacks = [];

 for(const pack of fs.readdirSync('../resourcepacks')){
    let basePath = path.resolve('../resourcepacks', pack);
    let config = require(path.resolve(basePath, 'config.json'));

    resourcePacks.push({
        basePath,
        config
    });
}

resourcePacks = resourcePacks.sort((a, b) => a.config.priority - b.config.priority);

for(let pack of resourcePacks){
    pack.files = getFiles(path.resolve(pack.basePath, 'assets', 'minecraft', 'mcpatcher', 'cit'));
    pack.textures = [];

    for(const file of pack.files){
        if(path.extname(file) != '.properties')
            continue;

        let lines = fs.readFileSync(file, 'utf8').split("\r\n");
        let properties = {};

        for(let line of lines){
            let split = line.split("=");

            if(split.length < 2)
                continue;

            properties[split[0]] = split.slice(1).join("=");
        }

        if(!('type' in properties))
            continue;

        if(!properties.type == 'item')
            continue;

        let texture = {weight: 0, match: []};

        let textureFile = 'texture' in properties
        ? path.resolve(path.dirname(file), properties.texture)
        : path.resolve(path.dirname(file), path.basename(file, '.properties') + '.png');

        texture.path = textureFile;

        for(let property in properties){
            if(property == 'weight')
                texture.weight = parseInt(properties[property]);

            if(!property.startsWith('nbt.'))
                continue;

            let regex = properties[property];

            if(regex.startsWith('ipattern:')){
                regex = mm.makeRe(regex.substring(9), { nocase: true });
            }else if(regex.startsWith('pattern:')){
                regex = mm.makeRe(regex.substring(9));
            }else if(regex.startsWith('iregex:')){
                regex = new RegExp(regex.substring(7), 'i');
            }else if(regex.startsWith('regex:')){
                regex = new RegExp(regex.substring(6));
            }else{
                regex = new RegExp(escapeRegExp(regex));
            }

            texture.match.push({
                value: property.substring(4),
                regex
            });
        }

        let mcMeta = fs.existsSync(textureFile + '.mcmeta') ? fs.readFileSync(textureFile + '.mcmeta', 'utf8') : false;
        let metaProperties = {};

        if(mcMeta){
            try{
                metaProperties = JSON.parse(mcMeta);
            }catch(e){

            }
        }

        if('animation' in metaProperties){

        }

        pack.textures.push(texture);
    }
}

module.exports = {
    getTexture: nbt => {
        let outputTexture = { weight: -9999 };

        for(const pack of resourcePacks){
            if('weight' in outputTexture)
                outputTexture.weight = -9999;

            for(const texture of pack.textures){
                let matches = 0;

                for(const match of texture.match){
                    let {value, regex} = match;

                    if(value.endsWith('.*'))
                        value = value.substring(0, value.length - 2);

                    if(!objectPath.has(nbt, 'tag.' + value))
                        continue;

                    let matchValues = objectPath.get(nbt, 'tag.' + value);

                    if(!Array.isArray(matchValues))
                        matchValues = [matchValues];

                    for(const matchValue of matchValues){
                        if(!regex.test(matchValue.replace(removeFormatting, '')))
                            continue;

                        matches++;
                    }
                }

                if(matches == texture.match.length){
                    if(texture.weight <= outputTexture.weight)
                        continue;

                    outputTexture = Object.assign({}, texture);
                }
            }
        }

        if(!('path' in outputTexture))
            return null;

        return outputTexture;
    }
}

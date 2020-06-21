const fs = require('fs');
const path = require('path');

const constants = {};

for(const file of fs.readdirSync(path.resolve(__dirname, 'constants'))){
    if(path.extname(file) != '.js')
        continue;

    const module = require(path.resolve(__dirname, 'constants', file));
    
    for(const key in module)
        constants[key] = module[key];
}

module.exports = constants;

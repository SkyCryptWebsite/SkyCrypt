import { readdirSync } from 'fs';
import { resolve, extname } from 'path';

const constants = {};

for(const file of readdirSync(resolve(__dirname, 'constants'))){
    if(extname(file) != '.js')
        continue;

    const module = require(resolve(__dirname, 'constants', file));

    Object.assign(constants, module);
}

export default constants;

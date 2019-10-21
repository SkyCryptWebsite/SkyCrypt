const fs = require('fs-extra');

const credentials = {
    hypixel_api_key: ""
};

if(!fs.existsSync('credentials.json'))
    fs.writeFileSync('credentials.json', JSON.stringify(credentials, null, 4));

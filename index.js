require('./src/app');
require('./src/donations/patreon');
require('./src/scripts/cap-leaderboards');
require('./src/scripts/clear-favorite-cache');
require('./src/scripts/update-bazaar');
require('./src/scripts/update-items');
require('./src/scripts/update-top-profiles');

const cluster = require('cluster');

if(cluster.isMaster && process.env.API_REQUESTS == "1"){
    let requests = [];

    require('axios-debug-log')({
        request: (debug, config) => {
            if(config.baseURL == 'https://api.hypixel.net/')
                requests.push(+new Date());
        }
    });

    setInterval(() => {
        requests = requests.filter(a => a > +new Date() - 60 * 1000);

        console.log('requests:', requests.length + ' / minute');
    }, 1000);
}

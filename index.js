require('./src/app');
require('./src/donations/patreon');
require('./src/scripts/cap-leaderboards');
require('./src/scripts/clear-favorite-cache');
require('./src/scripts/update-bazaar');
require('./src/scripts/update-items');
require('./src/scripts/update-top-profiles');

const cluster = require('cluster');
// const io = require('@pm2/io');

let requests = [];

require('axios-debug-log')({
    request: (debug, config) => {
        let requestURL = config.baseURL ? config.baseURL + config.url : config.url;
        if(process.env?.NODE_ENV == 'development')
            console.log(`Sent request to ${requestURL} on ${cluster.isWorker ? "worker" + cluster.worker.id : "master"}.`);
        if(requestURL.startsWith('https://api.hypixel.net/') && config?.params?.key){
            if(cluster.isMaster)
                requests.push(getTime());
            else
                process.send({type: "api_request", time: getTime()});
        }
    }
});

function getTime() {
    return `${Math.floor((Math.random() * 10000) + 1000).toString().substring(0, 4)}/${+new Date()}`;
}

async function init() {
    setInterval(() => {
        requests = requests.filter(a => a.substring(5) > (+new Date() - 60 * 1000));

        // console.log(`\nCurrent API requests: ${requests.length} / min`);
    }, 1000);
}

if(cluster.isMaster){
    /* const apiRequests = io.metric({
        name: 'API Requests',
        unit: 'reqs/min',
        value: () => {
            return requests.length;
        }
    });
    
    console.log(apiRequests); */

    for (const id in cluster.workers) {
        cluster.workers[id].on("message", (msg) => {
            if(msg?.type != 'api_request' || !msg?.time)
                return;

            requests.push(msg.time);
        });
    }

    init();
}



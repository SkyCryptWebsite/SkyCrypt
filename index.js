require("./src/app");
require("./src/donations/patreon");
require("./src/scripts/cap-leaderboards");
require("./src/scripts/clear-favorite-cache");
require("./src/scripts/update-bazaar");
require("./src/scripts/update-items");
require("./src/scripts/update-top-profiles");

const cluster = require("cluster");
let requests = [];

require("axios-debug-log")({
  request: (debug, config) => {
    let requestURL = config.baseURL ? config.baseURL + config.url : config.url;
    // console.log(`Sent request to ${requestURL} on ${cluster.isWorker ? "worker" + cluster.worker.id : "master"}.`);
    if (requestURL.startsWith("https://api.hypixel.net/") && config?.params?.key) {
      if (cluster.isMaster) {
        requests.push(+new Date());
      } else {
        process.send({ type: "api_request", time: +new Date() });
      }
    }
  },
});

async function init() {
  setInterval(() => {
    if (new Date().getSeconds() / 60 !== 0) return;
    requests = requests.filter((a) => a > +new Date() - 60 * 1000);

    // console.log(`Current API requests: ${requests.length} / min (out of 360)`);
  }, 1000);
}

if (cluster.isMaster) {
  for (const id in cluster.workers) {
    cluster.workers[id].on("message", (msg) => {
      if (msg?.type != "api_request" || !msg?.time) {
        return;
      }
      requests.push(msg.time);
    });
  }

  init();
}

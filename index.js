import cluster from "cluster";
import fs from "fs";
import path from "path";

import { getFolderPath } from "./src/helper/cache.js";
import * as metrics from "./src/helper/metrics.js";

import axiosDebugLog from "axios-debug-log";

const developEnv = process.env?.NODE_ENV == "development";
const metricsEnv = process.env?.METRICS_JSON == "acceptable";

const metricsPath = path.resolve(getFolderPath(), "../public/metrics.json");
const metricsInterval = process.env?.METRICS_INTERVAL ?? 60_000;
let metricLog = [];

async function init() {
  saveMetrics(metrics.processMetricLog([]));

  setInterval(() => {
    const clonedLog = structuredClone(metricLog);
    metricLog = [];

    saveMetrics(metrics.processMetricLog(clonedLog));
    console.log(`Metrics from the past ${metricsInterval}ms were saved.`);
  }, metricsInterval);
}

function saveMetrics(data) {
  fs.writeFileSync(metricsPath, JSON.stringify(data));
}

if (cluster.isPrimary && metricsEnv) {
  cluster.on("fork", (worker) => {
    console.log(`Metrics now being collected from worker ${worker.id}`);
    worker.on("message", (message) => {
      if (message?.type == null) return;

      if (message.type.startsWith("metric.")) {
        const logObject = { timestamp: Date.now(), worker: worker.id };

        const metricName = message.type.split(".").slice(1);
        logObject.name = metricName.join(".");

        if (message?.data !== undefined) {
          logObject.data = message.data;
        }

        metricLog.push(logObject);
      }
    });
  });

  init();
} else {
  saveMetrics(metrics.processMetricLog([]));
}

axiosDebugLog({
  request: (debug, config) => {
    const requestURL = config.baseURL ? config.baseURL + config.url : config.url;
    if (developEnv) {
      console.log(`Sent request to ${requestURL} on ${cluster.isWorker ? "worker" + cluster.worker.id : "master"}.`);
    }

    if (requestURL.startsWith("https://api.hypixel.net/")) {
      metrics.sendMetric("hypixel_api_request");
    }

    if (requestURL.startsWith("https://api.ashcon.app/")) {
      metrics.sendMetric("ashcon_api_request");
    }
  },
});

import("./src/main.js");

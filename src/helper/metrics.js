import cluster from "cluster";

export function sendMetric(name = "unknown", data = undefined) {
  if (cluster.isPrimary) return;

  const message = {
    type: `metric.${name}`,
    worker: cluster.worker.id,
  };

  if (data !== undefined) {
    message.data = data;
  }

  process.send(message);
}

function sortObject(object) {
  return Object.keys(object)
    .sort()
    .reduce((result, key) => ((result[key] = object[key]), result), {});
}

export function processMetricLog(log) {
  const result = {
    overall: {},
    worker: {},

    server: {
      current_workers: Object.keys(cluster?.workers ?? {}),
    },
    process: {
      timestamp: Date.now(),
      log_length: log.length,
    },
  };

  for (const entry of log) {
    const { name, worker, data } = entry;

    if (result.worker[worker] === undefined) {
      result.worker[worker] = {};
    }

    switch (name) {
      default:
        if (data === undefined) {
          result.overall[name] = (result.overall[name] ?? 0) + 1;
          result.worker[worker][name] = (result.worker[worker][name] ?? 0) + 1;
        } else {
          result.worker[worker][name] = Object.assign(result.worker[worker][name] ?? {}, data);
        }
    }
  }

  result.overall = sortObject(result.overall);
  for (const workerId in result.worker) {
    result.worker[workerId] = sortObject(result.worker[workerId]);
  }

  return result;
}

import cluster from "cluster";
import os from "os";

const initCluster = async () => {
  if (cluster.isPrimary) {
    await import("./master.js");

    const totalCpus = os.cpus().length;
    const cpus = Math.min(process.env?.NODE_ENV === "development" ? 2 : 8, totalCpus);

    for (let i = 0; i < cpus; i++) {
      cluster.fork();
    }

    cluster.on("exit", (worker, code, signal) => {
      console.log(
        `Worker ${worker.id} died with code ${code} ${signal ? `and signal ${signal}` : ""} (pid:${worker.process.pid})`
      );

      const fw = cluster.fork();
      console.log(`Worker respawned with id ${fw.id} (pid:${fw.process.pid})`);
    });

    console.log(`Running SkyBlock Stats on ${cpus} cores`);
  } else {
    await import("./app.js");
  }
};

initCluster();

import cluster from "cluster";

const initCluster = async () => {
  if (!cluster.isPrimary) {
    return import("./app.js");
  }

  await import("./master.js");
  const os = await import("os");

  const totalCpus = os.cpus().length;
  const cpus = Math.min(process.env?.NODE_ENV === "development" ? 2 : 8, totalCpus);

  for (let i = 0; i < cpus; i += 1) {
    cluster.fork();
  }

  cluster.on("exit", (w, c, s) => {
    console.log(
      `${Date.now()}: Worker ${w.id} died with code ${c} ${s ? `and signal ${s}` : ""} (pid:${w.process.pid})`
    );

    const fw = cluster.fork();
    console.log(`${Date.now()}: Worker respawned with id ${fw.id} (pid:${fw.process.pid})`);
  });

  console.log(`Running SkyBlock Stats on ${cpus} cores`);
};

initCluster();

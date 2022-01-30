import cluster from "cluster";

if (cluster.isPrimary) {
  await import("./master.js");

  const os = await import("os");

  const totalCpus = os.cpus().length;
  const cpus = Math.min(process.env?.NODE_ENV != "development" ? 8 : 2, totalCpus);

  for (let i = 0; i < cpus; i += 1) {
    cluster.fork();
  }

  cluster.on("exit", (w, c, s) => {
    let ts = new Date().getTime();
    console.log(`${ts}: Worker ${w.id} died with code ${c} ${s ? `and signal ${s}` : ""} (pid:${w.process.pid})`);

    let fw = cluster.fork();
    console.log(`${ts}: Worker respawned with id ${fw.id} (pid:${fw.process.pid})`);
  });

  console.log(`Running SkyBlock Stats on ${cpus} cores`);
} else {
  import("./app.js");
}

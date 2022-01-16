import cluster from "cluster";

if (cluster.isPrimary) {
  await import("./master.js");

  const os = await import("os");

  const totalCpus = os.cpus().length;
  const cpus = Math.min(process.env?.NODE_ENV != "development" ? 8 : 2, totalCpus);

  for (let i = 0; i < cpus; i += 1) {
    cluster.fork();
  }

  console.log(`Running SkyBlock Stats on ${cpus} cores`);
} else {
  import("./app.js");
}

import cluster from "cluster";

const timeNow = Date.now();

if (cluster.isPrimary) {
  import("./master.js");

  const os = await import("os");
  const totalCpus = os.cpus().length;
  const cpus = Math.min(process.env?.NODE_ENV === "development" ? 2 : 8, totalCpus);

  for (let i = 0; i < cpus; i += 1) {
    cluster.fork();
  }

  cluster.on("exit", () => {
    console.log(`Worker died.`);
    cluster.fork();
  });

  console.log(`Running SkyBlock Stats on ${cpus} cores`);
  console.log("Started in " + (Date.now() - timeNow) + "ms");
} else {
  import("./app.js");
}

module.exports = {
    apps: [
        {
            name: "SkyCryptFleet",
            script: "npm start",
            instances: "max",
            exec_mode: "cluster",
        },
    ],
};

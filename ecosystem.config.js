module.exports = {
  apps : [{
    script    : "npm start",
    instances : "max",
    exec_mode : "cluster"
  }]
}

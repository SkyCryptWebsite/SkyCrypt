const { MongoClient } = require("mongodb");
const path = require("path");
const credentials = require(path.resolve(__dirname, "../credentials.json"));

async function main() {
  const mongo = new MongoClient(credentials.dbUrl, { useUnifiedTopology: true });
  await mongo.connect();
  const db = mongo.db(credentials.dbName);
  return { mongo, db };
}
module.exports = main();

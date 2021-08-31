import { MongoClient } from "mongodb";
import credentials from "./credentials.js";

export const mongo = new MongoClient(credentials.dbUrl, { useUnifiedTopology: true });
await mongo.connect();
export const db = mongo.db(credentials.dbName);

import axios from "axios";

import credentials from "../credentials.js";

import { db } from "../mongo.js";

async function updatePatreon() {
  const patreonEntry = await db.collection("donations").find({ type: "patreon" }).next();

  if (patreonEntry == null) {
    return;
  }

  const response = await axios.get("https://www.patreon.com/api/oauth2/api/current_user/campaigns", {
    headers: {
      authorization: `Bearer ${credentials.patreon_key}`,
    },
  });

  const { data } = response;

  await db
    .collection("donations")
    .replaceOne(
      { type: "patreon" },
      { type: "patreon", amount: data.data[0].attributes.patron_count },
      { upsert: true }
    );
}

if ("patreon_key" in credentials) {
  updatePatreon();
  setInterval(updatePatreon, 60 * 1000);
}

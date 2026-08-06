#!/usr/bin/env node
// Refreshes src/data/fx-rate.json from real historical USD/GBP rates via
// the Frankfurter API (ECB reference rates, free, no API key). Replaces
// hand-researched/compiled figures with real computed stats.
//
// Usage: npm run update-fx

import { writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";

const API_BASE = "https://api.frankfurter.dev/v1";
const OUT_PATH = fileURLToPath(new URL("../src/data/fx-rate.json", import.meta.url));

function isoDaysAgo(days) {
  const d = new Date();
  d.setUTCDate(d.getUTCDate() - days);
  return d.toISOString().slice(0, 10);
}

async function fetchJson(url) {
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`${url} -> HTTP ${res.status}`);
  }
  return res.json();
}

function stats(rates) {
  const values = Object.values(rates).map((r) => r.GBP);
  const latest = values[values.length - 1];
  const low = Math.min(...values);
  const high = Math.max(...values);
  const average = values.reduce((a, b) => a + b, 0) / values.length;
  return {
    latest: Number(latest.toFixed(5)),
    low: Number(low.toFixed(5)),
    high: Number(high.toFixed(5)),
    average: Number(average.toFixed(5)),
  };
}

async function main() {
  const today = isoDaysAgo(0);
  const latestData = await fetchJson(`${API_BASE}/latest?base=USD&symbols=GBP`);

  const last7 = await fetchJson(
    `${API_BASE}/${isoDaysAgo(7)}..${today}?base=USD&symbols=GBP`,
  );
  const last30 = await fetchJson(
    `${API_BASE}/${isoDaysAgo(30)}..${today}?base=USD&symbols=GBP`,
  );

  const out = {
    source: "https://api.frankfurter.dev/v1 (ECB reference rates, real historical data)",
    fetchedAt: today,
    note: "Refreshed programmatically via scripts/update-fx-rate.mjs (npm run update-fx) - real daily historical rates, not compiled estimates.",
    usdToGbp: latestData.rates.GBP,
    last7Days: stats(last7.rates),
    last30Days: stats(last30.rates),
  };

  await writeFile(OUT_PATH, JSON.stringify(out, null, 2) + "\n");
  console.log(`Wrote ${OUT_PATH}`);
  console.log(out);
}

main().catch((err) => {
  console.error("Failed to update FX rate:", err.message);
  process.exit(1);
});

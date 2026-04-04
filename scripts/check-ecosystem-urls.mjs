/**
 * Validates that all ecosystem app URLs are reachable.
 * Exits with code 1 if any URL is broken.
 */

import { readFileSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const dataPath = resolve(__dirname, "../data/ecosystem.json");
const apps = JSON.parse(readFileSync(dataPath, "utf-8"));

const TIMEOUT_MS = 15_000;
const MAX_RETRIES = 2;

async function checkUrl(url, retries = 0) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);

  try {
    const res = await fetch(url, {
      method: "HEAD",
      signal: controller.signal,
      redirect: "follow",
      headers: { "User-Agent": "Livepeer-Ecosystem-Checker/1.0" },
    });
    clearTimeout(timer);

    // Some sites block HEAD — retry with GET
    if (res.status === 405 && retries < MAX_RETRIES) {
      const getRes = await fetch(url, {
        method: "GET",
        signal: AbortSignal.timeout(TIMEOUT_MS),
        redirect: "follow",
        headers: { "User-Agent": "Livepeer-Ecosystem-Checker/1.0" },
      });
      return { url, status: getRes.status, ok: getRes.ok };
    }

    return { url, status: res.status, ok: res.ok };
  } catch (err) {
    clearTimeout(timer);
    if (retries < MAX_RETRIES) {
      await new Promise((r) => setTimeout(r, 1000 * (retries + 1)));
      return checkUrl(url, retries + 1);
    }
    return { url, status: 0, ok: false, error: err.message };
  }
}

const results = await Promise.allSettled(
  apps.map((app) => checkUrl(app.url).then((r) => ({ ...r, name: app.name })))
);

const failures = [];

for (const result of results) {
  const r =
    result.status === "fulfilled"
      ? result.value
      : { name: "?", url: "?", ok: false, error: result.reason };

  if (r.ok) {
    console.log(`  ✓ ${r.name} — ${r.url} (${r.status})`);
  } else {
    console.log(
      `  ✗ ${r.name} — ${r.url} (${r.status}${r.error ? `, ${r.error}` : ""})`
    );
    failures.push(r);
  }
}

console.log(`\n${apps.length} URLs checked, ${failures.length} failed.`);

if (failures.length > 0) {
  process.exit(1);
}

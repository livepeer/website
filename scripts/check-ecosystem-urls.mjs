/**
 * Validates that all ecosystem app URLs are reachable.
 * Exits with code 1 if any URL is broken.
 */

import { readFileSync, readdirSync } from "node:fs";
import { resolve, dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import matter from "gray-matter";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ecosystemDir = resolve(__dirname, "../content/ecosystem");

/**
 * Entries that live on this site are skipped, not checked.
 *
 * This guards against third-party project links rotting — an ecosystem project
 * going offline is invisible until someone clicks. A first-party page ships
 * from this repo, so it is already guarded by the build, and checking it here
 * would fail for a page that is merely not deployed yet: a PR that adds
 * /agent and an entry pointing at it cannot see that page on production.
 */
const SELF_HOSTS = new Set(["livepeer.org", "www.livepeer.org"]);

const isSelf = (url) => {
  try {
    return SELF_HOSTS.has(new URL(url).hostname);
  } catch {
    return false;
  }
};

const entries = readdirSync(ecosystemDir)
  .filter((f) => f.endsWith(".md"))
  .map((f) => matter(readFileSync(join(ecosystemDir, f), "utf-8")).data)
  .filter((app) => app.url);

const skipped = entries.filter((app) => isSelf(app.url));
const apps = entries.filter((app) => !isSelf(app.url));

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

for (const app of skipped) {
  console.log(`  – ${app.name} — ${app.url} (skipped: on this site)`);
}

console.log(
  `\n${apps.length} URLs checked, ${failures.length} failed` +
    (skipped.length ? `, ${skipped.length} skipped.` : ".")
);

if (failures.length > 0) {
  process.exit(1);
}

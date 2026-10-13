/**
 * Validates that all ecosystem app URLs are reachable.
 * Exits with code 1 if any URL is broken.
 */

import { readFileSync, readdirSync } from "node:fs";
import { resolve, dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { lookup } from "node:dns/promises";
import { isIP } from "node:net";
import matter from "gray-matter";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, "..");
const ecosystemDir = join(root, "content/ecosystem");

/**
 * Only a web address is a link. The frontmatter is contributor-written and the
 * site renders `url` as an anchor, so a `javascript:` or `data:` value is a
 * broken link before anything is fetched — and it must not be able to reach
 * the first-party rule below by spelling itself `javascript://livepeer.org`.
 */
function parseWebUrl(url) {
  try {
    const parsed = new URL(url);
    return parsed.protocol === "http:" || parsed.protocol === "https:"
      ? parsed
      : null;
  } catch {
    return null;
  }
}

/**
 * Entries that live on this site are checked against this repo, not fetched.
 *
 * This guards against third-party project links rotting — an ecosystem project
 * going offline is invisible until someone clicks. A first-party page ships
 * from this repo, so fetching it would fail for a page that is merely not
 * deployed yet: a PR that adds /agent and an entry pointing at it cannot see
 * that page on production. But a typo still has to be caught, so the path is
 * looked up in the routes this checkout defines — every page and route
 * handler under app/, plus the redirects in next.config.ts (a redirect that
 * only fires for another host is not a page on this one).
 */
const SELF_HOSTS = new Set(["livepeer.org", "www.livepeer.org"]);

function localRoutes() {
  const patterns = [];
  const walk = (dir, segments) => {
    for (const entry of readdirSync(dir, { withFileTypes: true })) {
      if (entry.isDirectory()) {
        const name = entry.name;
        // A parallel slot (@modal) is not an address of its own, and a route
        // group's parentheses are not in the URL.
        if (name.startsWith("@")) continue;
        if (name.startsWith("(") && name.endsWith(")")) {
          walk(join(dir, name), segments);
          continue;
        }
        walk(join(dir, name), [...segments, name]);
      } else if (/^(page|route)\.(tsx?|jsx?)$/.test(entry.name)) {
        patterns.push(segments);
      }
    }
  };
  walk(join(root, "app"), []);

  const config = readFileSync(join(root, "next.config.ts"), "utf-8");
  for (const [block] of config.matchAll(/\{[^{}]*source:\s*"[^"]+"[^{}]*\}/g)) {
    if (/\bhas:/.test(block)) continue;
    const source = block.match(/source:\s*"([^"]+)"/)[1];
    patterns.push(
      source
        .split("/")
        .filter(Boolean)
        .map((s) =>
          s.startsWith(":") ? (s.endsWith("*") ? "[...rest]" : "[param]") : s
        )
    );
  }
  return patterns;
}

function routeMatches(pattern, segments) {
  for (let i = 0; i < pattern.length; i++) {
    const p = pattern[i];
    if (p.startsWith("[[...")) return true;
    if (p.startsWith("[...")) return segments.length > i;
    if (i >= segments.length) return false;
    if (p.startsWith("[")) continue;
    if (p !== segments[i]) return false;
  }
  return pattern.length === segments.length;
}

const ROUTES = localRoutes();

function existsHere(pathname) {
  const segments = pathname.split("/").filter(Boolean);
  return ROUTES.some((pattern) => routeMatches(pattern, segments));
}

/**
 * Never probe the runner's own network.
 *
 * This runs on pull-request-controlled data, so an entry can point anywhere
 * — at the runner's loopback, at a cloud metadata address, at a hostname that
 * resolves inside the runner's network. None of those is an ecosystem
 * project, and a checker that fetched them would be a probe anyone can aim by
 * opening a PR. Hostnames are resolved first so a public name pointing at a
 * private address is caught too, and every redirect hop is checked the same
 * way, since a public site can redirect anywhere.
 */
function isPrivateAddress(ip) {
  const version = isIP(ip);
  if (version === 4) {
    const [a, b] = ip.split(".").map(Number);
    return (
      a === 0 ||
      a === 10 ||
      a === 127 ||
      (a === 100 && b >= 64 && b <= 127) ||
      (a === 169 && b === 254) ||
      (a === 172 && b >= 16 && b <= 31) ||
      (a === 192 && b === 168) ||
      a >= 224
    );
  }
  if (version === 6) {
    const s = ip.toLowerCase();
    const mapped = s.match(/^::ffff:(\d+\.\d+\.\d+\.\d+)$/);
    if (mapped) return isPrivateAddress(mapped[1]);
    return (
      s === "::" ||
      s === "::1" ||
      /^f[cd]/.test(s) || // fc00::/7, unique local
      /^fe[89ab]/.test(s) // fe80::/10, link local
    );
  }
  return true;
}

async function isPrivateHost(hostname) {
  const host = hostname.replace(/^\[|\]$/g, "").toLowerCase();
  if (
    host === "localhost" ||
    host.endsWith(".localhost") ||
    host.endsWith(".local") ||
    host.endsWith(".internal")
  ) {
    return true;
  }
  if (isIP(host)) return isPrivateAddress(host);
  try {
    const addresses = await lookup(host, { all: true });
    return addresses.some(({ address }) => isPrivateAddress(address));
  } catch {
    // Unresolvable: let the fetch report that in its own words.
    return false;
  }
}

const entries = readdirSync(ecosystemDir)
  .filter((f) => f.endsWith(".md"))
  .map((f) => matter(readFileSync(join(ecosystemDir, f), "utf-8")).data)
  .filter((app) => app.url);

const TIMEOUT_MS = 15_000;
const MAX_RETRIES = 2;
const MAX_REDIRECTS = 10;
const HEADERS = { "User-Agent": "Livepeer-Ecosystem-Checker/1.0" };

/** One request, redirects followed by hand so each hop can be checked. */
async function request(url, method) {
  let current = url;
  for (let hop = 0; hop <= MAX_REDIRECTS; hop++) {
    const parsed = parseWebUrl(current);
    if (!parsed) throw new Error(`redirected to a non-web address: ${current}`);
    if (await isPrivateHost(parsed.hostname)) {
      throw new Error(`refusing to probe a private address: ${parsed.host}`);
    }
    const res = await fetch(parsed, {
      method,
      signal: AbortSignal.timeout(TIMEOUT_MS),
      redirect: "manual",
      headers: HEADERS,
    });
    const location = res.headers.get("location");
    if (res.status >= 300 && res.status < 400 && location) {
      current = new URL(location, parsed).toString();
      continue;
    }
    return res;
  }
  throw new Error(`more than ${MAX_REDIRECTS} redirects`);
}

async function checkUrl(url, retries = 0) {
  try {
    let res = await request(url, "HEAD");
    // Some sites block HEAD — retry with GET
    if (res.status === 405 && retries < MAX_RETRIES) {
      res = await request(url, "GET");
    }
    return { url, status: res.status, ok: res.ok };
  } catch (err) {
    if (retries < MAX_RETRIES && !/refusing|non-web/.test(err.message)) {
      await new Promise((r) => setTimeout(r, 1000 * (retries + 1)));
      return checkUrl(url, retries + 1);
    }
    return { url, status: 0, ok: false, error: err.message };
  }
}

/** Decides for one entry without touching the network, where it can. */
function classify(app) {
  const parsed = parseWebUrl(app.url);
  if (!parsed) {
    return { url: app.url, status: 0, ok: false, error: "not a web address" };
  }
  if (SELF_HOSTS.has(parsed.hostname)) {
    return existsHere(parsed.pathname)
      ? { url: app.url, ok: true, local: "page in this repo" }
      : {
          url: app.url,
          status: 0,
          ok: false,
          error: "no such page in this repo",
        };
  }
  return null;
}

const results = await Promise.allSettled(
  entries.map(async (app) => {
    const decided = classify(app);
    const r = decided ?? (await checkUrl(app.url));
    return { ...r, name: app.name };
  })
);

const failures = [];

for (const result of results) {
  const r =
    result.status === "fulfilled"
      ? result.value
      : { name: "?", url: "?", ok: false, error: result.reason };

  if (r.ok) {
    console.log(`  ✓ ${r.name} — ${r.url} (${r.local ?? r.status})`);
  } else {
    console.log(
      `  ✗ ${r.name} — ${r.url} (${r.status}${r.error ? `, ${r.error}` : ""})`
    );
    failures.push(r);
  }
}

console.log(`\n${entries.length} URLs checked, ${failures.length} failed.`);

if (failures.length > 0) {
  process.exit(1);
}

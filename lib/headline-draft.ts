import Anthropic from "@anthropic-ai/sdk";

import { monthTitle, type Roundup } from "./changelog";
import { HEALTH_LABEL } from "./health";

/**
 * A headline for one changelog entry, written by a model from the entry's
 * facts and stored in Notion — never generated at render time, so it is
 * written once, can be rewritten by anyone, and never changes under a
 * reader. Called by the /changelog/headline route when a period closes.
 *
 * Deliberately a model rather than a rule: a rule can name what shipped
 * but cannot say what mattered, which is what a title is for. The prompt
 * hands over the facts and nothing else, and forbids anything not in
 * them, so the title can be checked against the entry beneath it.
 */
export const HEADLINE_MODEL = "claude-opus-5";

const SYSTEM = `You write the title of one entry on livepeer.org/changelog, a public monthly record of what the Livepeer roadmap delivered and how the work under way is going. You are given the month's facts and nothing else.

Write one title of at most nine words that says what mattered most that month, the way the headline of a release note does: lead with what shipped and what it means for people building on or running the network, in plain words. When nothing shipped, say the most important thing about the work under way. Name the work as the facts name it.

Use only the facts given. No numbers, names or claims that are not in them. No adjectives the facts do not support, no exclamation marks, no colon, no quotation marks, no trailing period. Sentence case. Return the title alone.`;

/** The entry as a page of plain facts for the model. */
export function factsOf(r: Roundup): string {
  const lines: string[] = [`Month: ${monthTitle(r.month)}`];
  if (r.shipped.length > 0) {
    lines.push("", "Shipped this month:");
    for (const { commitment: c, retro, update } of r.shipped) {
      const said = retro?.summary ?? update?.summary;
      lines.push(
        `- ${c.title} (${c.owner}). ${c.outcome}${said ? ` The lead's last word: "${said}"` : ""}`
      );
    }
  }
  if (r.reported.length > 0) {
    lines.push("", "Under way, with the lead's own health and update:");
    for (const { commitment: c, update } of r.reported) {
      lines.push(
        `- ${c.title} (${c.owner}): ${HEALTH_LABEL[update.health]}. "${update.summary}"`
      );
    }
  }
  if (r.quiet.length > 0) {
    lines.push("", "Under way, with nothing posted this month:");
    for (const c of r.quiet) lines.push(`- ${c.title} (${c.owner})`);
  }
  return lines.join("\n");
}

export async function draftHeadline(r: Roundup): Promise<string> {
  const client = new Anthropic();
  const response = await client.beta.messages.create({
    model: HEADLINE_MODEL,
    max_tokens: 256,
    system: SYSTEM,
    output_config: { effort: "low" },
    // A refusal on a roadmap summary is unlikely; if the classifiers do
    // decline, the request re-runs on the default fallback model rather
    // than leaving the entry untitled.
    betas: ["server-side-fallback-2026-07-01"],
    fallbacks: "default",
    messages: [{ role: "user", content: factsOf(r) }],
  });

  if (response.stop_reason === "refusal") {
    throw new Error(
      `The model declined to write a headline for ${r.month}` +
        (response.stop_details?.explanation
          ? `: ${response.stop_details.explanation}`
          : ".")
    );
  }
  const text = response.content
    .filter((block) => block.type === "text")
    .map((block) => block.text)
    .join("")
    .trim()
    .replace(/^["'“”]+|["'“”.]+$/g, "")
    .trim();
  if (!text) throw new Error(`The model returned no headline for ${r.month}.`);
  return text;
}

const API = "https://api.notion.com/v1";
const NOTION_VERSION = "2022-06-28";
const ENTRIES_DB =
  process.env.NOTION_CHANGELOG_DB ?? "5691c5dfc92b41ee88139ae81510f7d9";

/**
 * Store a headline as a row in _Changelog entries_. Needs a token that can
 * write — the site's own NOTION_TOKEN is read-only on purpose, so this is
 * the one place a second token, NOTION_WRITE_TOKEN, is used.
 */
export async function writeHeadline(
  period: string,
  headline: string,
  model: string
): Promise<void> {
  const token = process.env.NOTION_WRITE_TOKEN;
  if (!token) {
    throw new Error(
      "NOTION_WRITE_TOKEN is not set. Writing a headline needs an " +
        "integration token that can edit Changelog entries."
    );
  }
  const res = await fetch(`${API}/pages`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Notion-Version": NOTION_VERSION,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      parent: { database_id: ENTRIES_DB },
      properties: {
        Period: { title: [{ text: { content: period } }] },
        Headline: { rich_text: [{ text: { content: headline } }] },
        "Generated on": {
          date: { start: new Date().toISOString().slice(0, 10) },
        },
        Model: { rich_text: [{ text: { content: model } }] },
      },
    }),
    signal: AbortSignal.timeout(15_000),
  });
  if (!res.ok) {
    const body = (await res.json().catch(() => ({}))) as { message?: string };
    throw new Error(
      `Notion ${res.status} writing the headline: ${body.message ?? res.statusText}`
    );
  }
}

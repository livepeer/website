import { roundups, type Roundup } from "@/lib/changelog";
import {
  getEntries,
  getEntryBody,
  getRegister,
  getUpdates,
} from "@/lib/register";
import { HEALTH_LABEL, postHref, type PostSummary } from "@/lib/updates";

/**
 * The changelog as an Atom feed: one entry per month.
 *
 * The one page on the site worth subscribing to. Built from the same
 * register and updates the page reads, so the feed and the page cannot
 * disagree, and revalidated on the same minute. A month is published when
 * it ends, so a subscriber gets one entry a month and never a draft.
 */
export const revalidate = 60;

const SITE = "https://livepeer.org";

function escape(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

/** A day as an Atom timestamp. */
function stamp(isoDate: string): string {
  return `${isoDate}T00:00:00Z`;
}

/**
 * One row: the commitment linked to its record, and what was said linked
 * to the post it was said in, where there was one.
 */
function item(
  slug: string,
  title: string,
  note?: string,
  post?: PostSummary
): string {
  const link = `<a href="${SITE}/roadmap/${slug}">${escape(title)}</a>`;
  if (!note) return `<li>${link}</li>`;
  const said = post
    ? `<a href="${SITE}${postHref(post)}">${escape(note)}</a>`
    : escape(note);
  return `<li>${link} — ${said}</li>`;
}

/** The roundup as HTML for a reader, which is what an Atom content is. */
function content(r: Roundup, intro?: string): string {
  const parts: string[] = r.headline ? [`<p>${escape(r.headline)}</p>`] : [];
  if (intro) parts.push(intro);
  if (r.shipped.length > 0) {
    parts.push(
      `<h3>Shipped</h3><ul>${r.shipped
        .map(({ commitment: c, retro, update }) => {
          const post = retro ?? update;
          return item(c.slug, c.title, post?.summary ?? c.owner, post);
        })
        .join("")}</ul>`
    );
  }
  if (r.reported.length > 0) {
    parts.push(
      `<h3>In progress</h3><ul>${r.reported
        .map(({ commitment, update }) =>
          item(
            commitment.slug,
            commitment.title,
            `${HEALTH_LABEL[update.health]}. ${update.summary}`,
            update
          )
        )
        .join("")}</ul>`
    );
  }
  if (r.quiet.length > 0) {
    parts.push(
      `<h3>No update</h3><ul>${r.quiet
        .map((c) => item(c.slug, c.title, c.owner))
        .join("")}</ul>`
    );
  }
  return parts.join("");
}

export async function GET() {
  const [entries, commitments, updates] = await Promise.all([
    getEntries(),
    getRegister(),
    getUpdates(),
  ]);
  const months = roundups(entries, commitments, updates, new Date());
  const intros = await Promise.all(months.map((r) => getEntryBody(r.key)));

  const items = months
    .map((r, i) => {
      const url = `${SITE}/changelog/${r.key}`;
      // Dated to its last day, the earliest it could have been published.
      const updated = stamp(r.end);
      return [
        "  <entry>",
        `    <title>${escape(r.label)}</title>`,
        `    <link href="${url}"/>`,
        `    <id>${url}</id>`,
        `    <updated>${updated}</updated>`,
        `    <published>${stamp(r.start)}</published>`,
        `    <content type="html">${escape(content(r, intros[i]))}</content>`,
        "  </entry>",
      ].join("\n");
    })
    .join("\n");

  const feed = `<?xml version="1.0" encoding="utf-8"?>
<feed xmlns="http://www.w3.org/2005/Atom">
  <title>Livepeer Changelog</title>
  <subtitle>Month by month: what shipped on the Livepeer roadmap, how the work under way is going, and who has not reported.</subtitle>
  <link href="${SITE}/changelog/feed.xml" rel="self"/>
  <link href="${SITE}/changelog"/>
  <id>${SITE}/changelog</id>
  <updated>${months[0] ? stamp(months[0].end) : new Date().toISOString()}</updated>
${items}
</feed>
`;

  return new Response(feed, {
    headers: {
      "Content-Type": "application/atom+xml; charset=utf-8",
      "Cache-Control": "public, max-age=60",
    },
  });
}

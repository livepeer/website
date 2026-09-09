import { roundups, type Roundup } from "@/lib/changelog";
import { getRegister, getUpdates } from "@/lib/register";
import { HEALTH_LABEL } from "@/lib/updates";

/**
 * The changelog as an Atom feed: one entry per month.
 *
 * The one page on the site worth subscribing to. Built from the same
 * register and updates the page reads, so the feed and the page cannot
 * disagree, and revalidated on the same minute. The month under way is
 * republished as it fills in — a reader sees it change, which is the point.
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

function item(slug: string, title: string, note?: string): string {
  const link = `<a href="${SITE}/roadmap/${slug}">${escape(title)}</a>`;
  return `<li>${link}${note ? ` — ${escape(note)}` : ""}</li>`;
}

/** The roundup as HTML for a reader, which is what an Atom content is. */
function content(r: Roundup): string {
  const parts: string[] = [];
  if (r.shipped.length > 0) {
    parts.push(
      `<h3>Shipped</h3><ul>${r.shipped.map((c) => item(c.slug, c.title, c.owner)).join("")}</ul>`
    );
  }
  if (r.reported.length > 0) {
    parts.push(
      `<h3>In progress</h3><ul>${r.reported
        .map(({ commitment, update }) =>
          item(
            commitment.slug,
            commitment.title,
            `${HEALTH_LABEL[update.health]}. ${update.summary}`
          )
        )
        .join("")}</ul>`
    );
  }
  if (r.quiet.length > 0) {
    parts.push(
      `<h3>${r.current ? "No update yet" : "No update"}</h3><ul>${r.quiet
        .map((c) => item(c.slug, c.title, c.owner))
        .join("")}</ul>`
    );
  }
  return parts.join("");
}

export async function GET() {
  const [commitments, updates] = await Promise.all([
    getRegister(),
    getUpdates(),
  ]);
  const now = new Date();
  const months = roundups(commitments, updates, now);

  const items = months
    .map((r) => {
      const url = `${SITE}/changelog/${r.month}`;
      // A finished month is dated to its last day; the one under way to now,
      // since it is still being written.
      const updated = r.current
        ? now.toISOString()
        : `${r.month}-${new Date(Date.UTC(Number(r.month.slice(0, 4)), Number(r.month.slice(5)), 0)).getUTCDate()}T00:00:00Z`;
      return [
        "  <entry>",
        `    <title>${escape(r.title)}</title>`,
        `    <link href="${url}"/>`,
        `    <id>${url}</id>`,
        `    <updated>${updated}</updated>`,
        `    <published>${r.month}-01T00:00:00Z</published>`,
        `    <content type="html">${escape(content(r))}</content>`,
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
  <updated>${now.toISOString()}</updated>
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

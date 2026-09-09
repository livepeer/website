import { getChangelog } from "@/lib/register";

/**
 * The changelog as an Atom feed.
 *
 * The one page on the site worth subscribing to: a reader who wants to know
 * when something shipped should not have to keep visiting. Built from the
 * same register the page reads, so the feed and the page cannot disagree,
 * and revalidated on the same minute.
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

export async function GET() {
  const entries = await getChangelog();
  const updated = entries[0]
    ? `${entries[0].date}T00:00:00Z`
    : new Date().toISOString();

  const items = entries
    .map((entry) => {
      const url = `${SITE}/changelog/${entry.slug}`;
      const authors = entry.authors
        .map(
          (a) =>
            `    <author><name>${escape(a.name)}</name><uri>${SITE}/people/${a.slug}</uri></author>`
        )
        .join("\n");
      return [
        "  <entry>",
        `    <title>${escape(entry.title)}</title>`,
        `    <link href="${url}"/>`,
        `    <id>${url}</id>`,
        `    <updated>${entry.date}T00:00:00Z</updated>`,
        `    <published>${entry.date}T00:00:00Z</published>`,
        entry.summary ? `    <summary>${escape(entry.summary)}</summary>` : "",
        authors,
        "  </entry>",
      ]
        .filter(Boolean)
        .join("\n");
    })
    .join("\n");

  const feed = `<?xml version="1.0" encoding="utf-8"?>
<feed xmlns="http://www.w3.org/2005/Atom">
  <title>Livepeer Changelog</title>
  <subtitle>What shipped on the network, the Agent, the protocol and livepeer.org, by day.</subtitle>
  <link href="${SITE}/changelog/feed.xml" rel="self"/>
  <link href="${SITE}/changelog"/>
  <id>${SITE}/changelog</id>
  <updated>${updated}</updated>
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

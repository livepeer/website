import { getBlogRegister } from "@/lib/register";

/**
 * The blog as an Atom feed, the twin of the changelog's: built from the same
 * register the index reads, so the feed and the page cannot disagree, and
 * revalidated on the same minute. Drafts are already filtered by the
 * register, so a feed reader never sees one.
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
  const posts = await getBlogRegister();
  const updated = posts[0]
    ? `${posts[0].date}T00:00:00Z`
    : new Date().toISOString();

  const items = posts
    .map((post) => {
      const url = `${SITE}/blog/${post.slug}`;
      return [
        "  <entry>",
        `    <title>${escape(post.title)}</title>`,
        `    <link href="${url}"/>`,
        `    <id>${url}</id>`,
        `    <updated>${post.date}T00:00:00Z</updated>`,
        `    <published>${post.date}T00:00:00Z</published>`,
        `    <category term="${escape(post.category)}"/>`,
        post.description
          ? `    <summary>${escape(post.description)}</summary>`
          : "",
        post.author
          ? `    <author><name>${escape(post.author.name)}</name>${post.author.slug ? `<uri>${SITE}/people/${post.author.slug}</uri>` : ""}</author>`
          : "",
        "  </entry>",
      ]
        .filter(Boolean)
        .join("\n");
    })
    .join("\n");

  const feed = `<?xml version="1.0" encoding="utf-8"?>
<feed xmlns="http://www.w3.org/2005/Atom">
  <title>Livepeer Blog</title>
  <subtitle>News, insights, and updates from across the Livepeer ecosystem.</subtitle>
  <link href="${SITE}/blog/feed.xml" rel="self"/>
  <link href="${SITE}/blog"/>
  <id>${SITE}/blog</id>
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

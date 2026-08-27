/**
 * Notion's page body, as HTML.
 *
 * Notion does not store markdown. A page body is a tree of typed blocks —
 * `paragraph`, `heading_2`, `bulleted_list_item` — each holding `rich_text`
 * runs that carry their own annotations and hrefs. The markdown you see when
 * reading a page through an MCP client is that client converting for display;
 * the REST API this site uses hands over the blocks themselves.
 *
 * So this is the converter. It exists because the register's bodies are
 * becoming long-form: the reader it replaced kept `paragraph` blocks and took
 * their plain text, which silently dropped every heading, list and link, and
 * printed a bold word as if it had never been emphasised.
 *
 * Deliberately not `notion-to-md`: that is a dependency to walk a tree we
 * already fetch, and the site keeps Notion at plain `fetch` on purpose.
 *
 * Images are not supported. A Notion-hosted image is a signed URL that expires
 * within the hour, which is the same reason portraits are committed to the
 * repo — a page built at noon would show broken images by one.
 */

type Json = Record<string, unknown>;

type RichText = {
  plain_text?: string;
  href?: string | null;
  annotations?: {
    bold?: boolean;
    italic?: boolean;
    strikethrough?: boolean;
    code?: boolean;
  };
};

/**
 * Escaped before anything else touches it.
 *
 * Every string here originates in Notion, which anyone with edit access can
 * write into — so it is untrusted the same way a pull request is, and this
 * output goes through `dangerouslySetInnerHTML`.
 */
function escape(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

/** Only http(s) and site-relative hrefs, so a link cannot carry javascript:. */
function safeHref(href: string): string | null {
  if (href.startsWith("/")) return href;
  try {
    const url = new URL(href);
    return url.protocol === "https:" || url.protocol === "http:" ? href : null;
  } catch {
    return null;
  }
}

/** One run's annotations, innermost first so the markup nests sensibly. */
function inline(runs: RichText[]): string {
  return runs
    .map((run) => {
      const a = run.annotations ?? {};
      let html = escape(run.plain_text ?? "");
      if (!html) return "";
      if (a.code) html = `<code>${html}</code>`;
      if (a.bold) html = `<strong>${html}</strong>`;
      if (a.italic) html = `<em>${html}</em>`;
      if (a.strikethrough) html = `<del>${html}</del>`;
      const href = run.href ? safeHref(run.href) : null;
      if (href) {
        const external = !href.startsWith("/");
        const rel = external ? ' target="_blank" rel="noreferrer"' : "";
        html = `<a href="${escape(href)}"${rel}>${html}</a>`;
      }
      return html;
    })
    .join("");
}

function runsOf(block: Json, type: string): RichText[] {
  const body = block[type] as { rich_text?: RichText[] } | undefined;
  return body?.rich_text ?? [];
}

export type BlockChildren = (block: Json) => Promise<Json[]>;

/**
 * Blocks to HTML, following nesting through `children`.
 *
 * List items arrive as a flat sequence of sibling blocks rather than wrapped
 * in a list, so consecutive ones are gathered here — otherwise every bullet
 * becomes its own single-item `<ul>`, which reads correctly and spaces
 * terribly.
 */
export async function blocksToHtml(
  blocks: Json[],
  children: BlockChildren
): Promise<string> {
  const html: string[] = [];
  let i = 0;

  while (i < blocks.length) {
    const block = blocks[i]!;
    const type = block.type as string;

    if (type === "bulleted_list_item" || type === "numbered_list_item") {
      const tag = type === "bulleted_list_item" ? "ul" : "ol";
      const items: string[] = [];
      while (i < blocks.length && blocks[i]!.type === type) {
        const item = blocks[i]!;
        let inner = inline(runsOf(item, type));
        // A nested list is the item's own children, not a sibling.
        if (item.has_children) {
          inner += await blocksToHtml(await children(item), children);
        }
        items.push(`<li>${inner}</li>`);
        i += 1;
      }
      html.push(`<${tag}>${items.join("")}</${tag}>`);
      continue;
    }

    i += 1;

    switch (type) {
      case "paragraph": {
        const body = inline(runsOf(block, type));
        // Notion uses empty paragraphs as spacing; they are not content.
        if (body) html.push(`<p>${body}</p>`);
        break;
      }
      // h1 renders as h2: the page's own title is the h1, and a body that
      // introduces a second one breaks the document outline.
      case "heading_1":
        html.push(`<h2>${inline(runsOf(block, type))}</h2>`);
        break;
      case "heading_2":
        html.push(`<h2>${inline(runsOf(block, type))}</h2>`);
        break;
      case "heading_3":
        html.push(`<h3>${inline(runsOf(block, type))}</h3>`);
        break;
      case "quote":
        html.push(`<blockquote>${inline(runsOf(block, type))}</blockquote>`);
        break;
      case "code": {
        const language = (block.code as { language?: string })?.language;
        const cls = language ? ` class="language-${escape(language)}"` : "";
        html.push(
          `<pre><code${cls}>${inline(runsOf(block, type))}</code></pre>`
        );
        break;
      }
      case "divider":
        html.push("<hr />");
        break;
      case "callout":
        // Rendered as a quote: the register has no callout styling, and the
        // text matters more than the icon Notion hangs beside it.
        html.push(`<blockquote>${inline(runsOf(block, type))}</blockquote>`);
        break;
      case "to_do": {
        const done = (block.to_do as { checked?: boolean })?.checked;
        html.push(`<p>${done ? "☑" : "☐"} ${inline(runsOf(block, type))}</p>`);
        break;
      }
      default:
        // Unknown or unsupported — an image, a database view, an embed.
        // Skipped rather than half-rendered: a broken figure on a published
        // page is worse than an absent one, and the body is prose by design.
        break;
    }
  }

  return html.join("");
}

# The changelog — fallback copy

**The changelog lives in Notion**, in **Changelog** under _Livepeer.org content_.
That is what `/changelog` renders, and where an entry is written or published.
The entry's write-up is the Notion page body; the properties around it are what
the list, the entry page and the share card read. Each property carries a
description explaining what belongs in it, and _Publishing a changelog entry_
beside the database explains the rest.

Authors relate to **Livepeer people**, the same table the roadmap and the blog
credit from, so a person is described once.

Every file beside this one is the changelog as it stood when the page was built.
`lib/register.ts` reads them **only when `NOTION_TOKEN` is absent**, so a clone
with no workspace credential still builds and `pnpm dev` renders real entries to
develop the list against. **Editing them does not change the deployed site.**

Frontmatter: `title`, `summary`, `date` (yyyy-mm-dd), optional `authors` (a list
of `{ name, slug, avatar }`, where `avatar` is a file in `public/people`), and
optional `commitment` (the slug of a shipped record in `content/roadmap`), and
optional `draft`. The body is the write-up, and may be empty.

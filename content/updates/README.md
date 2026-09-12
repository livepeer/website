# Updates — fallback copy

**Updates live in Notion**, in **Roadmap updates** under _Livepeer.org content_, one row
per update posted on a roadmap commitment. That is what the roadmap reads a
commitment's health from, and what `/changelog` rolls up month by month.
_Posting an update_ beside the database explains how.

Every file beside this one is a handful of updates as they stood when the site
was built. `lib/register.ts` reads them **only when `NOTION_TOKEN` is absent**,
so a clone with no workspace credential still shows a health on its cards and a
trail on a record. **Editing them does not change the deployed site.**

Frontmatter: `commitment` (the filename of a record in `content/roadmap`),
`date` (yyyy-mm-dd), `summary` (the post in one line), optional `kind`
(`update`, the default, or `retrospective` — the one closing post on a shipped
commitment, which carries no health), `health` (`on track`, `at risk` or
`off track`, required on an update), optional `author` (`{ name, avatar }`,
where `avatar` is a file in `public/people`), and optional `draft`. The body
is the write-up, and may be empty. The filename is not read; date it so the
folder sorts.

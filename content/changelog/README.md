# Changelog headlines

The no-token fallback for the _Changelog entries_ Notion database: one file
per published entry, named for its period (`2026-08.md`), with the headline in
its frontmatter:

```yaml
---
headline: Delegators get a clear view of their rewards
---
```

The headline is written by a model when the period closes — see
`lib/headline-draft.ts` and the `/changelog/headline` route — and stored in
Notion, where anyone can rewrite it. Nothing else lives here: the entry itself
is composed from the roadmap register and the updates posted on it.

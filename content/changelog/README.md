# Changelog headlines

The no-token fallback for the _Changelog entries_ Notion database: one file
per published entry, named for its period (`2026-08.md`), with the headline in
its frontmatter:

```yaml
---
headline: Delegators get a clear view of their rewards
---
```

A person writes the headline once the month has closed — with whatever model
they like, from the month's facts at `/changelog/roundup.json?month=yyyy-mm` —
and puts it in Notion, where the site reads it. _Posting an update_, the skill
page beside the database, has the recipe. Nothing else lives here: the entry
itself is composed from the roadmap register and the updates posted on it.

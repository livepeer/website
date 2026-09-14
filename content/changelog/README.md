# Changelog entries

The no-token fallback for the _Changelog entries_ Notion database: one file
per published entry, named for its period, which is also its address on the
site — `2026-08.md` for a month, `2026-Q3.md` for a quarter, `2026-W36.md`
for an ISO week, `2026.md` for a year. A file is the act of publishing: the
site composes the entry from the roadmap register and the updates inside that
period. The frontmatter is optional:

```yaml
---
headline: Delegators get a clear view of their rewards
draft: false
---
```

A person writes the headline once the period has closed — with whatever model
they like, from the period's facts at `/changelog/roundup.json?period=<key>` —
and the recipe is on _Posting an update_, the skill page beside the database.
Nothing else lives here.

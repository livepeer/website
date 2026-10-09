# Guides — fallback copy

**Guides live in Notion**, one page each under _Livepeer.org content_. The
site shows a guide the way it shows a record's write-up: the page cover, the
title, the body. Editing the page changes the site within a minute.

`reporting.md` is the copy of _Reporting on a commitment_ as it stood when the
site was built. `lib/register.ts` reads it **only when `NOTION_TOKEN` is
absent**, so a clone with no workspace credential still renders the page.
**Editing it does not change the deployed site.** Frontmatter: `title`, and an
optional `cover` on `cdn.sanity.io`.

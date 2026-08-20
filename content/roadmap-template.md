---
# A commitment: a dated, owned undertaking to deliver a named outcome to the
# Livepeer network, with a source anyone can check. Ideas and suggestions
# do not belong here — they live in the Suggestions Pipeline until they become
# owned and dated.

# Required
title: Name of the outcome
# The promise: one sentence, max ~140 chars, what lands in plain terms. Sits
# under the title on the closed card. Not the same as the body at the bottom of
# this file, which the expanded card shows as "Context".
outcome: One sentence, max ~140 chars — what lands, in plain terms.
workstream: Network            # Protocol | Network | Agent
state: building                # building | next | shipped
# The accountable party — the team, company or foundation on the hook. Shown on
# the closed card as "Owner" ("Owners" when there is more than one).
owners:
  - Name or team
# The individuals doing the work. Their faces sit beside the team name in the
# same "Owner" line, so this is one credit, not two. `github` is a BARE
# username — the card builds the link. Never guess one: a plausible handle
# resolves to a real stranger's profile, and the obvious fakes are all taken
# (johnsmith, meitanaka and friends are live accounts). If you do not know it,
# leave the field off — the face still renders, it just does not link. For
# placeholder records, invent one and check it 404s first:
#   curl -sL -o /dev/null -w "%{http_code}\n" https://github.com/HANDLE
# Names are not printed beside the faces; each face carries its own.
#
# NOTE: most records still carry INVENTED people with generated portraits, so
# the page could be reviewed with rosters in place. Replace them with real
# names before launch. `avatar` is a bare
# filename in public/roadmap/people, never a path or a URL; leave it off and the
# page falls back to a monogram, which is the right treatment for anyone who
# would rather not supply a photograph.
people:
  - name: Full name or handle
    avatar: their-file.jpg
target: Q4 2026                # month | quarter | half | year — the real precision, no more

# Required once state is shipped
# shippedAt: 2026-07-30

# The item on roadmap.livepeer.org this record came from — the board is where a
# commitment is proposed and where its state is kept, so this is its source of
# truth. Rendered as the first row of the expanded card, "Source".
#
# Optional, and honestly so: not every commitment reaches the register through
# the board. Leave it off rather than pointing at a page that does not describe
# this record — a Source row that leads somewhere else is the one wrong link
# this page cannot afford. Must be on roadmap.livepeer.org; the build rejects
# any other host, and rejects board URLs in `related`, which is for the venues
# the work actually happens in.
# source: https://roadmap.livepeer.org/...
#
# A person's `profile` is the bare id from a roadmap.livepeer.org/u/... URL,
# and it must be QUOTED. An all-digit id is a number to YAML, which silently
# strips its leading zeros — "000000000000000000000004" arrives as 4 and the
# build rejects it.

# Where the money comes from — the board's "Funding Mechanism" (or "Funding
# path"), verbatim rather than paraphrased. The requirements doc defines a
# commitment as "a dated, owned undertaking to deliver a named outcome to the
# network, with its funding source identified", so this is part of the
# definition, not decoration. Optional only because some records predate the
# board; it should be required once every record carries one.
# funding: "Network Engineering SPE, Priority 2"

# The board's "Opportunity Issued" — when the commitment was made, as opposed
# to `target` (when it lands) or `lastVerified` (when the record was checked).
# A target that has moved is only legible as a slip against this.
# issued: 2026-04-17

# Where this can be checked, and where the work lives — the forum thread, the
# LIP, the repo, the product page, the write-up. At least one, so no claim on
# this page is unverifiable. One entry per destination: a second label on a URL
# already listed fails the build, because the card would print the same place
# twice.
related:
  - label: Forum
    href: https://forum.livepeer.org/...
  - label: Livepeer Explorer
    href: https://explorer.livepeer.org

# When a human or agent last confirmed this record against those links.
lastVerified: 2026-08-12
---

Optional body, shown on the expanded record as "Context". Two or three
sentences of background — how the work is funded, what has landed so far, what
it is downstream of. Not a longer version of `outcome`: that field already
states what lands, and repeating it is what makes opening a card feel like it
revealed nothing. Omit rather than pad.

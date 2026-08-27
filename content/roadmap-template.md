---
# A commitment: a dated, owned undertaking to deliver a named outcome to the
# Livepeer network, with a source anyone can check. Ideas and suggestions
# do not belong here — they are proposed and discussed on the forum, and
# appear here once they are owned and dated.

# Required
title: Name of the outcome
# The promise: one sentence, max ~140 chars, what lands in plain terms. Sits
# under the title on the closed card. Not the same as the body at the bottom of
# this file, which the expanded card shows as "Context".
outcome: One sentence, max ~140 chars — what lands, in plain terms.
workstream: Network            # Protocol | Network | Agent
state: building                # building | next | shipped
# The one party answerable for delivering this, shown on the closed card as
# "by". Exactly one: accountability that is shared is accountability nobody
# holds, and a reader whose question is "who do I ask about that date" needs a
# single answer. Contributors go under people; joint funding goes in funding.
owner: Name or team
# The individual to ask about this — shown on the expanded card as "Contact".
# Optional, and one person: "who do I ask" has one answer or none. Distinct
# from owner, which is the organisation answerable for delivering. Same shape
# as a contributor.
# accountable:
#   name: Full name or handle
#   avatar: their-file.jpg

# The individuals doing the work — Contributors in Notion. Their faces sit beside the team name in the
# same "Owner" line, so this is one credit, not two. Names are not printed
# beside the faces; each face carries its own.
#
# `profile` is the BARE forum handle from a forum.livepeer.org/u/... URL,
# never the URL itself — the card builds the link. Optional, and never guess
# one: a plausible handle resolves to a real stranger. Confirm it first —
#   curl -s -o /dev/null -w "%{http_code}\n" https://forum.livepeer.org/u/HANDLE.json
# Leave it off and the face renders unlinked, which is the honest treatment
# for the pseudonymous contributors this register credits.
#
# `avatar` is a bare filename in public/people, never a path or a URL.
# Leave it off and the face falls back to a monogram, which is right for anyone
# who would rather not supply a photograph.
#
# NOTE: most records here carry INVENTED people with generated portraits and
# fabricated profile ids, so the page could be reviewed with its rosters in
# place. These files are the no-credential fallback, not the register — see
# content/roadmap/README.md.
contributors:
  - name: Full name or handle
    avatar: their-file.jpg
target: Q4 2026                # month | quarter | half | year — the real precision, no more

# The banner at the top of the record, from Peace Node's stock library:
#   https://livepeer.peaceno.de/marketing/stock-images
# Must be on cdn.sanity.io — next/image is configured for that host and
# nothing else, and a URL anywhere else fails the build rather than rendering
# broken. In Notion this is the page cover, set as an external image: an
# uploaded one comes back as a signed URL that expires within the hour.
# cover: https://cdn.sanity.io/images/l36s876e/production/....png

# Required once state is shipped
# shippedAt: 2026-07-30

# Where the money comes from — the board's "Funding Mechanism" (or "Funding
# path"), verbatim rather than paraphrased. The requirements doc defines a
# commitment as "a dated, owned undertaking to deliver a named outcome to the
# network, with its funding source identified", so this is part of the
# definition, not decoration. Optional only because some records predate the
# board; it should be required once every record carries one.
# funding: "Network Engineering SPE, Priority 2"

# The board's "Opportunity Issued" — when the commitment was made, as opposed
# to `target` (when it lands) or `lastUpdated` (when the record last changed).
# A target that has moved is only legible as a slip against this.
# issued: 2026-04-17

# Where this can be checked, and where the work lives — the board item, the
# forum thread, the
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
lastUpdated: 2026-08-12
---

Optional body, shown on the expanded record as "Context". Two or three
sentences of background — how the work is funded, what has landed so far, what
it is downstream of. Not a longer version of `outcome`: that field already
states what lands, and repeating it is what makes opening a card feel like it
revealed nothing. Omit rather than pad.

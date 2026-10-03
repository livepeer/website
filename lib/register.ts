import {
  getMarkdownPost,
  getMarkdownPosts,
  isPublished,
  type BlogPost,
  type BlogSummary,
} from "./blog";
import { getMarkdownFundingPaths, type FundingPath } from "./contribute";
import {
  getMarkdownEntries,
  getMarkdownEntryBody,
  type Entry,
} from "./entries";
import { getMarkdownGuide, type Guide, type GuideName } from "./guides";
import {
  getNotionCommitmentUpdates,
  getNotionCommitments,
  getNotionFundingPaths,
  getNotionEntries,
  getNotionEntryBody,
  getNotionGuide,
  getNotionOrganizations,
  getNotionPeople,
  getNotionPost,
  getNotionPosts,
  getNotionUpdates,
  hasNotionCredentials,
} from "./notion";
import { getOrganizations, type Organization } from "./organizations";
import { getPeople, type PersonRecord } from "./people";
import { getCommitments, type Commitment } from "./roadmap";
import {
  getMarkdownCommitmentUpdates,
  getMarkdownUpdates,
  type Post,
  type PostSummary,
} from "./updates";

/**
 * Which copy of the register the page reads.
 *
 * Notion when there is a token, the markdown in content/roadmap when there is
 * not. The markdown is not a cache and not a mirror — it is the register as it
 * stood when Notion took over, kept so that `pnpm dev` works for someone who
 * has cloned the repo and has no reason to hold a workspace credential. What
 * they see is a page of real shape with slightly old content, which is the
 * right thing to develop a layout against.
 *
 * The choice is made on the token alone. A Notion failure with a token present
 * throws: a build that silently served month-old markdown because the CMS was
 * unreachable would publish a roadmap that looks current and is not, and
 * nothing about the page would admit it. Failing the build is louder and
 * therefore kinder.
 */
export async function getRegister(): Promise<Commitment[]> {
  return hasNotionCredentials() ? getNotionCommitments() : getCommitments();
}

/**
 * The organisations, from whichever source the register came from.
 *
 * Chosen on the same token, deliberately: a page that read commitments from
 * Notion and their owners from markdown could credit a body the register has
 * never heard of, and the owner link would 404 against a page built from the
 * other half.
 */
export async function getOrganizationRegister(): Promise<Organization[]> {
  return hasNotionCredentials() ? getNotionOrganizations() : getOrganizations();
}

/** The people, from the same source the register came from. */
export async function getPeopleRegister(): Promise<PersonRecord[]> {
  return hasNotionCredentials() ? getNotionPeople() : getPeople();
}

/**
 * The blog, from whichever source the rest of the site came from.
 *
 * The same token decides it, for the same reason: content/blog is the archive
 * as it stood when Notion took over, kept so a clone with no workspace
 * credential still has twelve real posts to develop a layout against.
 *
 * Drafts are filtered here rather than at each route. There are four places a
 * post is read — the index, the page, the share image, the sitemap — and a
 * draft is only unpublished if every one of them agrees. One seam is a rule;
 * four call sites are four chances to forget.
 */
export async function getBlogRegister(): Promise<BlogSummary[]> {
  const posts = hasNotionCredentials()
    ? await getNotionPosts()
    : getMarkdownPosts();
  return posts.filter(isPublished);
}

/** One post with its body, or null — a bad slug and a hidden draft both 404. */
export async function getBlogPost(slug: string): Promise<BlogPost | null> {
  const post = hasNotionCredentials()
    ? await getNotionPost(slug)
    : await getMarkdownPost(slug);
  return post && isPublished(post) ? post : null;
}

/**
 * The funding ladder on /contribute, from the same source as everything else.
 *
 * The one surface whose editor is not a developer at all: the Foundation
 * maintains which programmes exist and what they pay, and a cap that changed
 * last week should not wait on a pull request to be true on the site.
 */
export async function getFundingPaths(): Promise<FundingPath[]> {
  return hasNotionCredentials()
    ? getNotionFundingPaths()
    : getMarkdownFundingPaths();
}

/**
 * The updates posted on commitments, from the same source as the register.
 *
 * Chosen on the same token, for the reason the organisations are: an update
 * names its commitment by slug, and a set of updates read from Notion against
 * a register read from markdown would report on records the page has never
 * heard of. Drafts are filtered here, as posts are, and by the same rule.
 */
export async function getUpdates(): Promise<PostSummary[]> {
  const [updates, commitments] = await Promise.all([
    hasNotionCredentials() ? getNotionUpdates() : getMarkdownUpdates(),
    getRegister(),
  ]);
  assertRetrosOnShipped(updates, commitments);
  return updates.filter(isPublished);
}

/** One commitment's updates with their write-ups, newest first. */
export async function getCommitmentUpdates(slug: string): Promise<Post[]> {
  const [updates, commitments] = await Promise.all([
    hasNotionCredentials()
      ? getNotionCommitmentUpdates(slug)
      : getMarkdownCommitmentUpdates(slug),
    getRegister(),
  ]);
  assertRetrosOnShipped(updates, commitments);
  return updates.filter(isPublished);
}

/**
 * A published retrospective closes a shipped commitment, so one on a
 * commitment that is not shipped is two claims that cannot both be true —
 * the record says the work is under way, the post says it is finished and
 * judged. The build fails rather than showing both, the way it fails when
 * Shipped and its date disagree. Drafts are exempt: a retrospective kept
 * as a draft while a commitment is moved back to In progress is the
 * honest state, and what to do with it is the team's call, not the
 * build's.
 */
function assertRetrosOnShipped(
  posts: PostSummary[],
  commitments: Commitment[]
): void {
  const state = new Map(commitments.map((c) => [c.slug, c]));
  for (const post of posts) {
    if (post.kind !== "retro" || post.draft) continue;
    const c = state.get(post.commitment);
    if (!c || c.state === "shipped") continue;
    throw new Error(
      `Roadmap updates → ${JSON.stringify(post.summary)}: a published ` +
        `retrospective on "${c.title}", which is ${STATE_WORD[c.state]}. A ` +
        `retrospective closes a shipped commitment. Either mark the ` +
        `commitment Shipped, with the date it shipped, or set the ` +
        `retrospective to Draft or delete it.`
    );
  }
}

const STATE_WORD: Record<Commitment["state"], string> = {
  next: "Planned",
  building: "In progress",
  shipped: "Shipped",
};

/**
 * The changelog's published entries; see lib/entries.ts. Drafts are
 * filtered here, as posts are, and by the same rule.
 */
export async function getEntries(): Promise<Entry[]> {
  const entries = hasNotionCredentials()
    ? await getNotionEntries()
    : getMarkdownEntries();
  return entries.filter(isPublished);
}

/**
 * One entry's intro, rendered; see lib/entries.ts. Only for a period whose
 * entry is being shown in full — the caller has already found it among
 * the published entries, so no draft rule applies here.
 */
export async function getEntryBody(
  period: string
): Promise<string | undefined> {
  return hasNotionCredentials()
    ? getNotionEntryBody(period)
    : getMarkdownEntryBody(period);
}

/** A guide page by name; see lib/guides.ts. The reporting rules are one. */
export async function getGuide(name: GuideName): Promise<Guide> {
  return hasNotionCredentials() ? getNotionGuide(name) : getMarkdownGuide(name);
}

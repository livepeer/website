import {
  getMarkdownPost,
  getMarkdownPosts,
  isPublished,
  type BlogPost,
  type BlogSummary,
} from "./blog";
import {
  getNotionCommitments,
  getNotionOrganizations,
  getNotionPeople,
  getNotionPost,
  getNotionPosts,
  hasNotionCredentials,
} from "./notion";
import { getOrganizations, type Organization } from "./organizations";
import { getPeople, type PersonRecord } from "./people";
import { getCommitments, type Commitment } from "./roadmap";

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

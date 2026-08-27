import {
  getNotionCommitments,
  getNotionOrganizations,
  hasNotionCredentials,
} from "./notion";
import { getOrganizations, type Organization } from "./organizations";
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

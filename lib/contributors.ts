/**
 * Livepeer's open-source contributors on GitHub, for the strip under the
 * contribute hero: the year's most active faces and a count of everyone.
 *
 * Read live from spotlight.livepeer.dev, which ranks every contributor to the
 * core repositories, and revalidated daily — a count baked in at build time
 * was 262 when it was written and 257 by the time it was lifted here, and a
 * number that is wrong is worse than none. The snapshot below is the fallback
 * for when the endpoint is down or a build has no network: the same shape,
 * dated, so the strip degrades to a slightly old truth rather than an empty
 * hero. A failure is logged, not thrown — this is proof, not content, and a
 * decorative strip is not worth failing a build over.
 */

export type Contributor = {
  /** GitHub login. */
  login: string;
  /** Display name, when set on the profile; the login otherwise. */
  name: string;
  /** Avatar URL; append `&s=` for a sized variant. */
  avatar: string;
  /** Contributions in the last twelve months. */
  yearly: number;
  /** All-time contributions. */
  total: number;
};

export type ContributorSet = {
  /** Everyone who has ever contributed to the core repositories. */
  count: number;
  /** The most active over the last twelve months, most active first. */
  spotlight: Contributor[];
};

const ENDPOINT = "https://spotlight.livepeer.dev/api/contributors";
/** Faces shown. Twelve, as the strip always had. */
const SPOTLIGHT = 12;
/** Once a day: the count moves by ones, and nobody is watching it. */
const REVALIDATE = 86_400;

type Raw = {
  login: string;
  name: string | null;
  avatar_url: string;
  contributions: number;
  yearly_contributions: number;
};

/** Snapshot of 2026-09-04, taken from the endpoint above. */
const SNAPSHOT: ContributorSet = {
  count: 257,
  spotlight: [
    { login: "rickstaa", name: "Rick Staa", avatar: "https://avatars.githubusercontent.com/u/17570430?v=4", yearly: 322, total: 843 },
    { login: "j0sh", name: "Josh Allmann", avatar: "https://avatars.githubusercontent.com/u/292510?v=4", yearly: 210, total: 983 },
    { login: "adamsoffer", name: "Adam Soffer", avatar: "https://avatars.githubusercontent.com/u/555740?v=4", yearly: 189, total: 1188 },
    { login: "victorges", name: "Victor Elias", avatar: "https://avatars.githubusercontent.com/u/1613383?v=4", yearly: 134, total: 1298 },
    { login: "ad-astra-video", name: "Brad | ad-astra", avatar: "https://avatars.githubusercontent.com/u/99882368?v=4", yearly: 111, total: 179 },
    { login: "eliteprox", name: "John | Elite Encoder", avatar: "https://avatars.githubusercontent.com/u/16746274?v=4", yearly: 58, total: 157 },
    { login: "corey-livepeer", name: "Corey", avatar: "https://avatars.githubusercontent.com/u/241818749?v=4", yearly: 58, total: 58 },
    { login: "seanhanca", name: "seanhanca", avatar: "https://avatars.githubusercontent.com/u/103605970?v=4", yearly: 57, total: 57 },
    { login: "mehrdadmms", name: "Mehrdad Sadeghi", avatar: "https://avatars.githubusercontent.com/u/35366864?v=4", yearly: 48, total: 48 },
    { login: "ECWireless", name: "ECWireless", avatar: "https://avatars.githubusercontent.com/u/40322776?v=4", yearly: 47, total: 47 },
    { login: "ecmulli", name: "Evan Mullins", avatar: "https://avatars.githubusercontent.com/u/28575504?v=4", yearly: 31, total: 52 },
    { login: "hjpotter92", name: "-", avatar: "https://avatars.githubusercontent.com/u/3393533?v=4", yearly: 21, total: 634 },
  ],
};

function displayName(raw: Raw): string {
  return raw.name && raw.name !== "-" ? raw.name : raw.login;
}

export async function getContributors(): Promise<ContributorSet> {
  try {
    const res = await fetch(ENDPOINT, { next: { revalidate: REVALIDATE } });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const raw = (await res.json()) as Raw[];
    if (!Array.isArray(raw) || raw.length === 0) {
      throw new Error("empty response");
    }
    const all = raw
      .map((c) => ({
        login: c.login,
        name: displayName(c),
        avatar: c.avatar_url,
        yearly: c.yearly_contributions,
        total: c.contributions,
      }))
      .sort((a, b) => b.yearly - a.yearly || b.total - a.total);
    return { count: all.length, spotlight: all.slice(0, SPOTLIGHT) };
  } catch (error) {
    console.warn(
      `contributors: ${ENDPOINT} failed (${String(error)}); serving the snapshot of 2026-09-04.`
    );
    return SNAPSHOT;
  }
}

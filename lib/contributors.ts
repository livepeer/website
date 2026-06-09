/**
 * Static snapshot of Livepeer's open-source GitHub contributors, ranked by
 * contributions to core repositories over the last 12 months.
 *
 * Source: https://spotlight.livepeer.dev/api/contributors (snapshot 2026-06-02).
 * Kept as static data on purpose — the site has no CMS and avoids runtime
 * fetching beyond the protocol subgraph. Refresh by re-pulling the endpoint
 * and updating the array + aggregate counts below.
 */

export type Contributor = {
  /** GitHub login / handle */
  login: string;
  /** Display name, when set on the GitHub profile */
  name: string | null;
  /** Avatar image base URL (append `&s=` for a sized variant) */
  avatar: string;
  /** Contributions in the last 12 months */
  yearly: number;
  /** All-time contributions */
  total: number;
  /** Member of the Livepeer GitHub org (core) */
  core: boolean;
};

/** Aggregate counts across all contributors in the snapshot. */
export const CONTRIBUTOR_STATS = {
  contributors: 262,
  yearlyContributions: 1578,
  allTimeContributions: 22207,
} as const;

/** Top contributors over the last 12 months. */
export const CONTRIBUTORS: Contributor[] = [
  { login: "j0sh", name: "Josh Allmann", avatar: "https://avatars.githubusercontent.com/u/292510?v=4", yearly: 208, total: 948, core: false },
  { login: "victorges", name: "Victor Elias", avatar: "https://avatars.githubusercontent.com/u/1613383?v=4", yearly: 192, total: 1302, core: false },
  { login: "rickstaa", name: "Rick Staa", avatar: "https://avatars.githubusercontent.com/u/17570430?v=4", yearly: 187, total: 750, core: true },
  { login: "adamsoffer", name: "Adam Soffer", avatar: "https://avatars.githubusercontent.com/u/555740?v=4", yearly: 164, total: 1181, core: false },
  { login: "seanhanca", name: null, avatar: "https://avatars.githubusercontent.com/u/103605970?v=4", yearly: 138, total: 150, core: false },
  { login: "ad-astra-video", name: "Brad", avatar: "https://avatars.githubusercontent.com/u/99882368?v=4", yearly: 129, total: 183, core: false },
  { login: "eliteprox", name: "John", avatar: "https://avatars.githubusercontent.com/u/16746274?v=4", yearly: 94, total: 179, core: false },
  { login: "hjpotter92", name: null, avatar: "https://avatars.githubusercontent.com/u/3393533?v=4", yearly: 60, total: 636, core: true },
  { login: "corey-livepeer", name: "Corey", avatar: "https://avatars.githubusercontent.com/u/241818749?v=4", yearly: 60, total: 60, core: false },
  { login: "mjh1", name: "Max Holland", avatar: "https://avatars.githubusercontent.com/u/3630965?v=4", yearly: 47, total: 531, core: true },
  { login: "ECWireless", name: "ECWireless", avatar: "https://avatars.githubusercontent.com/u/40322776?v=4", yearly: 44, total: 44, core: false },
  { login: "mehrdadmms", name: "Mehrdad Sadeghi", avatar: "https://avatars.githubusercontent.com/u/35366864?v=4", yearly: 43, total: 43, core: false },
  { login: "leszko", name: "Rafał Leszko", avatar: "https://avatars.githubusercontent.com/u/2834997?v=4", yearly: 31, total: 634, core: false },
  { login: "ecmulli", name: "Evan Mullins", avatar: "https://avatars.githubusercontent.com/u/28575504?v=4", yearly: 31, total: 53, core: true },
  { login: "SidestreamCrunchyCarrot", name: null, avatar: "https://avatars.githubusercontent.com/u/205754970?v=4", yearly: 16, total: 16, core: false },
  { login: "Jipperism", name: "Jip Stavenuiter", avatar: "https://avatars.githubusercontent.com/u/6384370?v=4", yearly: 15, total: 15, core: false },
  { login: "JJassonn69", name: "Jason", avatar: "https://avatars.githubusercontent.com/u/83615043?v=4", yearly: 14, total: 31, core: false },
  { login: "varshith15", name: "Varshith Bathini", avatar: "https://avatars.githubusercontent.com/u/25592511?v=4", yearly: 9, total: 34, core: true },
  { login: "dob", name: "Doug Petkanics", avatar: "https://avatars.githubusercontent.com/u/10389?v=4", yearly: 8, total: 271, core: true },
  { login: "salinsug", name: "Steph Alinsug", avatar: "https://avatars.githubusercontent.com/u/259901822?v=4", yearly: 8, total: 8, core: false },
  { login: "pwilczynskiclearcode", name: "Paweł Wilczyński", avatar: "https://avatars.githubusercontent.com/u/3940860?v=4", yearly: 6, total: 165, core: false },
];

import fs from "fs";
import path from "path";
import type { Metadata } from "next";

import { EcosystemSubmit } from "@/components/livepeer-ui/ecosystem-submit";
import { getEcosystemCategories } from "@/lib/ecosystem";

const TEMPLATE_PATH = path.join(process.cwd(), "content/ecosystem-template.md");
const REPO = "livepeer/website";
const DEFAULT_BRANCH = "main";
const TEMPLATE_FILENAME = "your-project.md";

/**
 * GitHub's "new file" screen, prefilled with the live template. Reading the
 * template from disk rather than duplicating it here means the button can
 * never hand out a stale copy of the schema.
 */
function buildNewFileUrl(templateContents: string): string {
  const url = new URL(
    `https://github.com/${REPO}/new/${DEFAULT_BRANCH}/content/ecosystem`
  );
  url.searchParams.set("filename", TEMPLATE_FILENAME);
  url.searchParams.set("value", templateContents);
  return url.toString();
}

const DESCRIPTION =
  "Add your project to the Livepeer ecosystem catalogue — open a pull request with a markdown file and a logo.";

  // openGraph and twitter are declared, not inferred. Next does not fill
  // og:title from `title` or og:description from `description`, so a page
  // setting only those two inherits the root layout's openGraph object whole —
  // and served "Livepeer — The open inference network" with the home page's
  // description to every timeline it was shared into.
export const metadata: Metadata = {
  title: "Submit your project",
  description: DESCRIPTION,
  openGraph: {
    title: "Submit your project | Livepeer",
    description: DESCRIPTION,
  },
  twitter: {
    card: "summary_large_image",
    title: "Submit your project | Livepeer",
    description: DESCRIPTION,
  },
};

export default function SubmitAppPage() {
  const templateUrl = buildNewFileUrl(
    fs.readFileSync(TEMPLATE_PATH, "utf8")
  );

  // "All" is the listing's unfiltered pseudo-category, not a real one — a
  // contributor must never write it into their frontmatter.
  const categories = getEcosystemCategories().filter((name) => name !== "All");

  return <EcosystemSubmit templateUrl={templateUrl} categories={categories} />;
}

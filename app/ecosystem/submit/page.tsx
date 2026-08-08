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

export const metadata: Metadata = {
  title: "Submit your project",
  description:
    "Add your project to the Livepeer ecosystem catalogue — open a pull request with a markdown file and a logo.",
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

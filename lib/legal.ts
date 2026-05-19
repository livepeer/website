import fs from "fs";
import path from "path";
import { renderMarkdown } from "@/lib/blog";

const LEGAL_DIR = path.join(process.cwd(), "content/legal");

export async function getLegalDocument(slug: string): Promise<string> {
  const filePath = path.join(LEGAL_DIR, `${slug}.md`);
  const content = fs.readFileSync(filePath, "utf8");
  return renderMarkdown(content);
}

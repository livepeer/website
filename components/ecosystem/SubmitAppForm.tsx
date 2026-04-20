import fs from "fs";
import path from "path";
import Link from "next/link";
import { ArrowUpRight, ArrowLeft, ArrowRight } from "lucide-react";
import PageHero from "@/components/ui/PageHero";
import Container from "@/components/ui/Container";
import Button from "@/components/ui/Button";
import Badge from "@/components/ui/Badge";

const TEMPLATE_PATH = path.join(process.cwd(), "content/ecosystem-template.md");
const REPO = "livepeer/website";
const DEFAULT_BRANCH = "main";
const TEMPLATE_FILENAME = "your-app.md";

function buildNewFileUrl(templateContents: string): string {
  const url = new URL(
    `https://github.com/${REPO}/new/${DEFAULT_BRANCH}/content/ecosystem`
  );
  url.searchParams.set("filename", TEMPLATE_FILENAME);
  url.searchParams.set("value", templateContents);
  return url.toString();
}

const SAMPLE = {
  name: "Your App",
  url: "https://your-app.com",
  hostname: "your-app.com",
  description: "What your app does, in one sentence.",
  categories: ["AI Video", "API"],
  logo: "your-app.svg",
};

export default function SubmitAppForm() {
  const templateContents = fs.readFileSync(TEMPLATE_PATH, "utf8");
  const newFileUrl = buildNewFileUrl(templateContents);

  return (
    <PageHero>
      <Container>
        <div className="mx-auto max-w-5xl">
          <div className="mx-auto max-w-2xl text-center">
            <div className="mb-8 flex items-center justify-center gap-2 font-mono text-sm text-white/30">
              <Link
                href="/ecosystem"
                className="transition-colors hover:text-white/60"
              >
                Ecosystem
              </Link>
              <span>›</span>
              <span className="text-white/50">Submit</span>
            </div>

            <h1 className="text-4xl font-bold tracking-tight text-white sm:text-5xl">
              Building on Livepeer?
            </h1>
            <p className="mt-5 text-base leading-relaxed text-balance text-white/60 sm:text-lg">
              Fill out the template and open a pull request. We&apos;ll review
              and add your app to the ecosystem directory.
            </p>
          </div>

          {/* Preview: YAML → rendered card */}
          <div className="mt-14 grid items-stretch gap-6 lg:grid-cols-[1fr_auto_1fr]">
            <div className="overflow-hidden rounded-2xl border border-dark-border bg-dark-card">
              <div className="flex items-center justify-between border-b border-dark-border px-4 py-2.5">
                <span className="font-mono text-[11px] text-white/30">
                  content/ecosystem/your-app.md
                </span>
                <span className="font-mono text-[10px] uppercase tracking-wider text-white/20">
                  YAML
                </span>
              </div>
              <pre className="whitespace-pre-wrap break-words px-5 py-4 font-mono text-xs leading-relaxed sm:text-[13px]">
                <code>
                  <span className="text-white/25">---</span>
                  {"\n"}
                  <span className="text-white/40">name:</span>
                  <span className="text-white/80"> {SAMPLE.name}</span>
                  {"\n"}
                  <span className="text-white/40">url:</span>
                  <span className="text-white/80"> {SAMPLE.url}</span>
                  {"\n"}
                  <span className="text-white/40">description:</span>
                  <span className="text-white/80"> {SAMPLE.description}</span>
                  {"\n"}
                  <span className="text-white/40">categories:</span>
                  {"\n"}
                  {SAMPLE.categories.map((cat) => (
                    <span key={cat}>
                      <span className="text-white/40">{"  - "}</span>
                      <span className="text-white/80">{cat}</span>
                      {"\n"}
                    </span>
                  ))}
                  <span className="text-white/40">logo:</span>
                  <span className="text-white/80"> {SAMPLE.logo}</span>
                  {"\n"}
                  <span className="text-white/25">---</span>
                </code>
              </pre>
            </div>

            <div
              className="flex items-center justify-center text-white/20"
              aria-hidden="true"
            >
              <ArrowRight className="hidden h-5 w-5 lg:block" />
              <ArrowRight className="h-5 w-5 rotate-90 lg:hidden" />
            </div>

            <div className="flex h-full flex-col rounded-2xl border border-dark-border bg-dark-card p-5 sm:p-6">
              <div className="mb-4 flex items-start justify-between">
                <div className="flex h-14 w-14 items-center justify-center overflow-hidden rounded-xl bg-white/[0.06]">
                  <span className="text-2xl font-semibold text-white/30">
                    {SAMPLE.name.charAt(0)}
                  </span>
                </div>
              </div>
              <h3 className="text-base font-semibold text-white">
                {SAMPLE.name}
              </h3>
              <p className="mt-0.5 font-mono text-xs text-white/25">
                {SAMPLE.hostname}
              </p>
              <p className="mt-3 flex-1 text-sm leading-relaxed text-white/40">
                {SAMPLE.description}
              </p>
              <div className="mt-4 flex flex-wrap gap-1.5">
                {SAMPLE.categories.map((cat) => (
                  <Badge key={cat} variant="category">
                    {cat}
                  </Badge>
                ))}
              </div>
            </div>
          </div>

          {/* CTA */}
          <div className="mt-14 flex flex-col items-center">
            <Button
              href={newFileUrl}
              target="_blank"
              rel="noopener noreferrer"
              variant="white"
              size="lg"
              className="font-semibold"
            >
              Open template in GitHub
              <ArrowUpRight className="h-4 w-4" />
            </Button>
            <p className="mt-3 font-mono text-[11px] text-white/30">
              Requires a GitHub account.
            </p>
          </div>

          <div className="divider-gradient my-8" />

          <div className="flex justify-center">
            <Link
              href="/ecosystem"
              className="group inline-flex items-center gap-2 font-mono text-sm text-white/30 transition-colors hover:text-white/60"
            >
              <ArrowLeft className="h-3.5 w-3.5 transition-transform group-hover:-translate-x-0.5" />
              Back to ecosystem
            </Link>
          </div>
        </div>
      </Container>
    </PageHero>
  );
}

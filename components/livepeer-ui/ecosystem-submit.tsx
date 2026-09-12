import Link from "next/link";
import { ArrowLeftIcon, ArrowUpRightIcon } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

/** One documented frontmatter key. */
type Field = { key: string; note: string };

const REQUIRED_FIELDS: Field[] = [
  { key: "name", note: "Display name, as it should appear in the catalogue." },
  {
    key: "url",
    note: "Where the project lives. The URL shown under the title is derived from it.",
  },
  {
    key: "description",
    note: "One sentence, around 140 characters. It runs on the card and is searched.",
  },
  { key: "categories", note: "One or more, from the set below." },
  {
    key: "logo",
    note: "Filename of the mark you add to public/ecosystem in the same pull request.",
  },
];

const OPTIONAL_FIELDS: Field[] = [
  { key: "madeBy", note: "The company or person behind it." },
  {
    key: "logoBg",
    note: "Hex value for the logo tile, when the mark needs a plate to read.",
  },
  { key: "order", note: "Lower sorts first. Omit it for alphabetical." },
  {
    key: "twitter, bluesky, github",
    note: "Profile URLs. Each becomes an icon link on your entry.",
  },
  { key: "contact", note: "An email address or a contact page." },
  { key: "docs, support", note: "Documentation, and where users get help." },
  { key: "terms, privacy", note: "Legal pages, if you publish them." },
];

/** The card preview's stand-in project — deliberately generic. */
const SAMPLE = {
  name: "Your Project",
  displayUrl: "your-project.com",
  description: "One sentence on what it does and who it is for.",
  categories: ["AI Video", "API"],
};

/**
 * A titled block. Same mono caption as the entry page's metadata rail, so the
 * two sibling routes read as one place.
 */
function Section({
  title,
  children,
  className,
}: {
  title: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section className={className}>
      <h2 className="font-mono text-ui-caption tracking-wide text-muted-foreground uppercase">
        {title}
      </h2>
      {children}
    </section>
  );
}

/**
 * A frontmatter key and what it is for.
 *
 * Label-left/value-right here, where the entry page's rail stacks the two. The
 * difference is width: that rail is 288px, so a justified row leaves a gulf and
 * truncates the value. This column is 768px and the keys are short identifiers,
 * so the aligned key column becomes a scannable index instead.
 *
 * 13rem is the widest key in the list ("twitter, bluesky, github", 202px in
 * mono at this size) plus a little slack — enough that no key wraps, and no
 * wider, since every other row pays for the column in white space.
 */
function FieldRow({ field }: { field: Field }) {
  return (
    <div className="border-b border-border py-3 last:border-b-0 sm:grid sm:grid-cols-[13rem_1fr] sm:gap-6">
      <dt className="font-mono text-sm">{field.key}</dt>
      <dd className="mt-1 text-sm text-muted-foreground sm:mt-0">
        {field.note}
      </dd>
    </div>
  );
}

/** A framed preview panel: a hairline box under a mono path caption. */
function Panel({
  path,
  children,
}: {
  path: string;
  children: React.ReactNode;
}) {
  return (
    <div className="overflow-hidden rounded-sm border border-border">
      {/* The two captions are the point of the pair: the filename you create
          on the left, the URL it becomes on the right. That the slug comes
          from the filename is real and not otherwise stated anywhere. */}
      <p className="truncate border-b border-border px-4 py-2.5 font-mono text-xs text-muted-foreground">
        {path}
      </p>
      {children}
    </div>
  );
}

/**
 * Contributing a project to the ecosystem catalogue.
 *
 * "Project", not "app", throughout: the catalogue carries SDKs, plugins, and
 * open-source engines alongside consumer products, and the listing already
 * says "Submit project". The data model still calls the type EcosystemApp —
 * that is internal and not worth churning.
 *
 * The catalogue is markdown in this repo rather than a form backed by a
 * database (see CLAUDE.md → Content), so this page is documentation with one
 * button, not a submission form. Its job is to make the shape of the file
 * obvious before someone opens an editor — hence the paired preview, which
 * shows the frontmatter beside the card it produces.
 */
export function EcosystemSubmit({
  templateUrl,
  categories,
}: {
  /** GitHub "new file" URL, prefilled with content/ecosystem-template.md. */
  templateUrl: string;
  /** Categories already in use, so contributors reuse rather than invent. */
  categories: string[];
}) {
  const cta = (
    <div className="flex flex-wrap items-center gap-x-5 gap-y-3">
      <Button
        size="lg"
        nativeButton={false}
        render={
          <a href={templateUrl} target="_blank" rel="noopener noreferrer" />
        }
        className="h-12 rounded-sm px-5"
      >
        Open the template on GitHub
        <ArrowUpRightIcon className="size-4" aria-hidden="true" />
      </Button>
      <p className="font-mono text-xs text-muted-foreground">
        Requires a GitHub account.
      </p>
    </div>
  );

  return (
    // Same measure as the entry page. Two views of one catalogue shouldn't
    // change width between them.
    <div className="mx-auto w-full max-w-5xl px-4 pt-16 pb-24 sm:px-6 lg:px-10">
      <nav
        aria-label="Breadcrumb"
        className="font-mono text-xs text-muted-foreground"
      >
        <Link
          href="/ecosystem"
          className="transition-colors hover:text-foreground"
        >
          Ecosystem
        </Link>
        <span className="mx-2 opacity-50">/</span>
        <span className="text-foreground">Submit</span>
      </nav>

      <header className="mt-8">
        <h1 className="text-page-title text-balance sm:text-display-sm">
          Submit your project
        </h1>
        <p className="mt-6 max-w-[46ch] text-reading-body text-pretty text-muted-foreground">
          The catalogue is a folder of markdown files in this site&apos;s
          repository. Add one for your project, commit a logo alongside it, and
          open a pull request.
        </p>
        <div className="mt-8">{cta}</div>
      </header>

      {/* Frontmatter beside the card it produces. The page's one figurative
          move, and it earns the space: every field below is easier to place
          once you have seen where it lands. */}
      <div className="mt-14 grid gap-4 border-t border-border pt-10 lg:grid-cols-2">
        <Panel path="content/ecosystem/your-project.md">
          <pre className="overflow-x-auto px-4 py-4 font-mono text-xs leading-relaxed">
            <code>
              <span className="text-muted-foreground/50">---</span>
              {"\n"}
              <span className="text-muted-foreground">name:</span> {SAMPLE.name}
              {"\n"}
              <span className="text-muted-foreground">url:</span> https://
              {SAMPLE.displayUrl}
              {"\n"}
              <span className="text-muted-foreground">description:</span>{" "}
              {SAMPLE.description}
              {"\n"}
              <span className="text-muted-foreground">categories:</span>
              {"\n"}
              {SAMPLE.categories.map((category) => (
                <span key={category}>
                  <span className="text-muted-foreground">{"  - "}</span>
                  {category}
                  {"\n"}
                </span>
              ))}
              <span className="text-muted-foreground">logo:</span>{" "}
              your-project.svg
              {"\n"}
              <span className="text-muted-foreground/50">---</span>
            </code>
          </pre>
        </Panel>

        <Panel path="livepeer.org/ecosystem/your-project">
          {/* The listing card, rebuilt at rest — same tile, mono URL, and
              secondary badges, so the preview cannot drift from the real one
              without someone noticing. */}
          <div className="flex flex-col p-6">
            <span
              aria-hidden="true"
              className="flex size-14 items-center justify-center rounded-sm bg-secondary text-lg font-medium text-muted-foreground"
            >
              {SAMPLE.name.charAt(0)}
            </span>
            <div className="mt-6">
              <p className="text-lg font-medium">{SAMPLE.name}</p>
              <p className="mt-1 font-mono text-xs text-muted-foreground">
                {SAMPLE.displayUrl}
              </p>
            </div>
            <p className="mt-5 text-sm leading-relaxed text-muted-foreground">
              {SAMPLE.description}
            </p>
            <div className="mt-auto flex flex-wrap gap-1.5 pt-6">
              {SAMPLE.categories.map((category) => (
                <Badge
                  key={category}
                  variant="secondary"
                  className="rounded-sm font-mono text-[0.6875rem] font-normal uppercase"
                >
                  {category}
                </Badge>
              ))}
            </div>
          </div>
        </Panel>
      </div>

      {/* Capped short of the container: a key column plus a note runs to 90
          characters at the full 1024, and this is the part people actually
          read line by line. */}
      <div className="mt-16 max-w-3xl">
        <Section title="Required">
          <dl className="mt-3">
            {REQUIRED_FIELDS.map((field) => (
              <FieldRow key={field.key} field={field} />
            ))}
          </dl>
        </Section>

        <Section title="Optional" className="mt-12">
          <dl className="mt-3">
            {OPTIONAL_FIELDS.map((field) => (
              <FieldRow key={field.key} field={field} />
            ))}
          </dl>
        </Section>

        <Section title="Categories" className="mt-12">
          <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
            Reuse what is already here where you can — the filter is only useful
            if the same idea carries the same name. If nothing fits, add one and
            say so in the pull request.
          </p>
          <div className="mt-4 flex flex-wrap gap-1.5">
            {categories.map((category) => (
              <Badge
                key={category}
                variant="secondary"
                className="rounded-sm font-mono text-[0.6875rem] font-normal uppercase"
              >
                {category}
              </Badge>
            ))}
          </div>
        </Section>

        <Section title="Logo" className="mt-12">
          <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
            A square SVG or PNG, at least 128&times;128, committed to{" "}
            <code className="font-mono text-foreground">public/ecosystem</code>{" "}
            in the same pull request, with a filename matching the{" "}
            <code className="font-mono text-foreground">logo</code> field. It
            sits contained inside a tile rather than cropped, so transparent
            backgrounds are fine. If your mark needs a plate to read against a
            dark surface, set{" "}
            <code className="font-mono text-foreground">logoBg</code>.
          </p>
        </Section>

        <Section title="The write-up" className="mt-12">
          <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
            Everything below the frontmatter becomes the body of your entry
            page. The template sketches four sections — what it is, what you can
            build, the developer surface, and how you use the network — as a
            starting point. Rearrange them if your project is better explained
            another way.
          </p>
        </Section>
      </div>

      <div className="mt-16 border-t border-border pt-10">{cta}</div>

      <div className="mt-14 border-t border-border pt-8">
        <Link
          href="/ecosystem"
          className="group inline-flex items-center gap-2 font-mono text-xs text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeftIcon
            className="size-3.5 transition-transform group-hover:-translate-x-0.5"
            aria-hidden="true"
          />
          Back to ecosystem
        </Link>
      </div>
    </div>
  );
}

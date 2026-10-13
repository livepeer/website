import { openQuestions, type LegalPage } from "@/lib/legal";

/**
 * A legal page: the title, when it last changed, and the text in the reading
 * column, set the way a guide is. Nothing else, since a legal page is read
 * to be relied on, not browsed.
 *
 * Where a draft is shown (previews and dev, never livepeer.org; see
 * getLegalPage), a note above the text says so and how many questions for
 * counsel remain, and each "[Confirm: …]" is highlighted where it sits, so a
 * review on the preview finds them without searching.
 */
export function LegalDocument({ page }: { page: LegalPage }) {
  const open = openQuestions(page.html);
  // The same test as isReady in lib/legal.ts, without its logging: here it
  // only decides whether to show the note.
  const ready = !page.draft && !!page.effective && open === 0;
  const html = ready
    ? page.html
    : page.html.replace(
        /\[\s*Confirm\b[^\]]*\]/gi,
        (question) =>
          `<mark class="rounded-sm bg-accent px-1 text-foreground">${question}</mark>`
      );

  return (
    <article className="mx-auto w-full max-w-[46rem] px-6 pt-20 pb-28 sm:px-8">
      {!ready && (
        <div className="mb-10 rounded-lg border border-border bg-muted/50 p-4 text-sm leading-relaxed text-muted-foreground">
          <p className="font-medium text-foreground">
            {page.draft ? "Draft for counsel review." : "Not ready to publish."}
          </p>
          <p className="mt-1">
            This page isn&rsquo;t shown on livepeer.org until it is Published in
            Notion with an effective date
            {open > 0
              ? ` and the ${open} highlighted ${open === 1 ? "question" : "questions"} for counsel resolved`
              : ""}
            .
          </p>
        </div>
      )}
      <h1 className="text-[1.75rem] leading-[1.15] font-bold tracking-[-0.02em] text-balance sm:text-[2.25rem]">
        {page.title}
      </h1>
      <p className="mt-3 text-sm text-muted-foreground">
        {page.effective
          ? `Last updated ${new Date(page.effective).toLocaleDateString(
              "en-US",
              {
                timeZone: "UTC",
                month: "long",
                day: "numeric",
                year: "numeric",
              }
            )}`
          : "Not yet in effect"}
      </p>
      <div
        className="reading-prose mt-10"
        dangerouslySetInnerHTML={{ __html: html }}
      />
    </article>
  );
}

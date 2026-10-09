import type { Guide } from "@/lib/guides";

/**
 * A guide's page, under its cover: the title and the body, set the way a
 * record sets its write-up. Rendered by the guide's route and by the
 * roadmap's intercepting route, which slides the same guide over the
 * register when it is reached from there — see app/roadmap/@modal.
 */
export function GuideRecord({ guide }: { guide: Guide }) {
  return (
    <>
      <h1 className="text-[1.75rem] leading-[1.15] font-bold tracking-[-0.02em] text-balance sm:text-[2.25rem]">
        {guide.title}
      </h1>
      <div
        className="reading-prose mt-8"
        dangerouslySetInnerHTML={{ __html: guide.html }}
      />
    </>
  );
}

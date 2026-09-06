/**
 * A slot for the record slid over the register.
 *
 * `@modal` is a parallel route: it renders alongside the page rather than
 * replacing it, which is what keeps the index mounted — and keeps its scroll
 * position, filters and open cards — while a commitment is read on top of it.
 *
 * Nothing else about the segment changes. On a direct visit the slot resolves
 * to `default.tsx`, which renders nothing.
 */
export default function RoadmapLayout({
  children,
  modal,
}: {
  children: React.ReactNode;
  modal: React.ReactNode;
}) {
  return (
    <>
      {children}
      {modal}
    </>
  );
}

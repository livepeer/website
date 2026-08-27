/**
 * Nothing, which is the point.
 *
 * Every parallel route needs a fallback for the case where it has no match —
 * a direct visit to /roadmap, or a refresh on /roadmap/<slug>, where the page
 * itself should render rather than an overlay over it.
 */
export default function NoModal() {
  return null;
}

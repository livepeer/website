"use client";

import { useSyncExternalStore } from "react";

const REDUCED_MOTION = "(prefers-reduced-motion: reduce)";

function subscribeToReducedMotion(onChange: () => void) {
  const query = window.matchMedia(REDUCED_MOTION);
  query.addEventListener("change", onChange);
  return () => query.removeEventListener("change", onChange);
}

/**
 * The reader's reduced-motion setting, read so the server and the first
 * client render agree. Motion's own hook answers from `matchMedia` on the
 * very first client render, while the server could only have rendered the
 * moving state — so with the setting on, the two disagreed and React threw
 * the tree away. An external store with a server snapshot of "no" hydrates
 * as the server rendered and switches in the render after.
 */
export function usePrefersReducedMotion(): boolean {
  return useSyncExternalStore(
    subscribeToReducedMotion,
    () => window.matchMedia(REDUCED_MOTION).matches,
    () => false
  );
}

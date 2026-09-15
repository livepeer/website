"use client";

import { useEffect } from "react";

/**
 * Opens the activity row a link points at.
 *
 * A post's address is its row in the log, and the row is a closed
 * <details>: a browser scrolls to the address on its own but leaves the
 * row shut, so a reader who followed a link from the changelog would land
 * on one line and have to click. Browsers are only now starting to open
 * a <details> whose contents are the fragment target, and none open one
 * that is the target itself, so this does it — on arrival and again when
 * the address changes, since the dates in the log are links too. The
 * scrolling is the browser's, and StartAtTop's on a route change.
 */
export function RevealPost() {
  useEffect(() => {
    const reveal = () => {
      const id = decodeURIComponent(window.location.hash.slice(1));
      if (!id) return;
      const target = document.getElementById(id);
      if (!target) return;
      const details = target.querySelector("details");
      if (details) details.open = true;
    };
    reveal();
    window.addEventListener("hashchange", reveal);
    return () => window.removeEventListener("hashchange", reveal);
  }, []);
  return null;
}

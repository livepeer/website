"use client";

import { useEffect } from "react";

/**
 * A record page opens at its own beginning.
 *
 * Opening a record from the register does not scroll it — the panel slides
 * over the list, and the list is what the reader was in the middle of. The
 * cost is that the new history entry inherits the register's offset, because
 * that is what "do not scroll" means to the browser: the URL changed and the
 * page did not move.
 *
 * Reload there and the browser restores that offset onto a completely
 * different document — one commitment rather than a list of fourteen — and
 * drops the reader into the middle of it. The same happens on any entry
 * reached that way: a refresh, a restored tab, a link opened from history.
 *
 * Twice, a frame apart, because scroll restoration is not guaranteed to have
 * finished when effects run — the browser may restore after layout settles,
 * which would land after a single call and undo it. The second is a no-op
 * whenever the first already won.
 *
 * Only the page does this. The intercepting routes render the panel instead
 * and never mount it, which is what keeps the register still while it is open.
 */
export function StartAtTop() {
  useEffect(() => {
    window.scrollTo(0, 0);
    const frame = requestAnimationFrame(() => window.scrollTo(0, 0));
    return () => cancelAnimationFrame(frame);
  }, []);

  return null;
}

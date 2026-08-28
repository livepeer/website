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
 * Scrolling to the top is not enough on its own, which is what an earlier
 * version of this got wrong. Restoration is not something that has already
 * happened by the time effects run — the browser holds it until the document
 * is tall enough to honour it, which on these pages means after hydration and
 * after the cover loads. So it lands *after* the correction and undoes it.
 * Turning restoration off is the part that actually decides the outcome; the
 * scroll then only has to clean up the case where it had already fired.
 *
 * Off for as long as this page is mounted, and back on when it goes. The flag
 * is global rather than per-page, and the register behind it is a list whose
 * position is worth keeping — leaving it manual on the way out would take
 * that away from every entry after this one.
 *
 * Instant, because the app scrolls smoothly by default and a record arriving
 * at the wrong offset should never have been at that offset to animate from.
 *
 * Only the page does this. The intercepting routes render the panel instead
 * and never mount it, which is what keeps the register still while it is open.
 */
export function StartAtTop() {
  useEffect(() => {
    const previous = history.scrollRestoration;
    history.scrollRestoration = "manual";

    const top = () => window.scrollTo({ top: 0, left: 0, behavior: "instant" });
    top();
    // A frame later as well: a restoration already queued for this frame can
    // still land after the call above, and manual is read when it runs.
    const frame = requestAnimationFrame(top);

    return () => {
      cancelAnimationFrame(frame);
      history.scrollRestoration = previous;
    };
  }, []);

  return null;
}

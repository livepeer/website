import { Fragment, type ReactNode } from "react";

/**
 * A headline with its hyphenated words held whole.
 *
 * A browser breaks a line after any hyphen, so "Wrap-up" could end one line
 * on "Wrap-" and open the next on "up", which in a 44px headline reads as two
 * words. Each word with a hyphen inside it is set unbreakable and the line
 * breaks before it instead. A leading or trailing dash, as in "2026 – today",
 * is left alone; only a hyphen between two characters joins a word.
 */
export function keepHyphenated(text: string): ReactNode {
  return text.split(/(\s+)/).map((part, i) =>
    /\S-\S/.test(part) ? (
      <span key={i} className="whitespace-nowrap">
        {part}
      </span>
    ) : (
      <Fragment key={i}>{part}</Fragment>
    )
  );
}

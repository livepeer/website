/**
 * A changelog entry's period: the window it reports on, named by a key
 * that is also its address — livepeer.org/changelog/<key>.
 *
 *   2026-08    a month
 *   2026-Q3    a quarter
 *   2026-W36   an ISO week, Monday to Sunday
 *   2026       a year
 *
 * The key on a row in _Changelog entries_ decides the window; the site
 * composes the entry from the register and the updates inside it. The
 * cadence is therefore whatever the rows say, and can change without a
 * change here. Nothing touches the filesystem, so a client component can
 * import a label.
 */

export type Period = {
  key: string;
  kind: "month" | "quarter" | "week" | "year";
  /** "August 2026", "Q3 2026", "Week 36, 2026", "2026". */
  label: string;
  /** First and last day of the window, ISO. */
  start: string;
  end: string;
};

export const PERIOD =
  /^(\d{4})(?:-(0[1-9]|1[0-2])|-Q([1-4])|-W(0[1-9]|[1-4]\d|5[0-3]))?$/;

function iso(y: number, m: number, d: number): string {
  return new Date(Date.UTC(y, m, d)).toISOString().slice(0, 10);
}

export function parsePeriod(key: string, where = "a changelog entry"): Period {
  const m = PERIOD.exec(key);
  if (!m) {
    throw new Error(
      `${where}: period ${JSON.stringify(key)} is not a month (2026-08), ` +
        `a quarter (2026-Q3), a week (2026-W36) or a year (2026).`
    );
  }
  const y = Number(m[1]);
  if (m[2]) {
    const mo = Number(m[2]) - 1;
    const name = new Date(Date.UTC(y, mo, 1)).toLocaleDateString("en-US", {
      timeZone: "UTC",
      month: "long",
    });
    return {
      key,
      kind: "month",
      label: `${name} ${y}`,
      start: iso(y, mo, 1),
      end: iso(y, mo + 1, 0),
    };
  }
  if (m[3]) {
    const q = Number(m[3]) - 1;
    return {
      key,
      kind: "quarter",
      label: `Q${q + 1} ${y}`,
      start: iso(y, q * 3, 1),
      end: iso(y, q * 3 + 3, 0),
    };
  }
  if (m[4]) {
    // ISO 8601: week 1 is the week holding January 4th; weeks run Monday
    // to Sunday.
    const n = Number(m[4]);
    const jan4 = new Date(Date.UTC(y, 0, 4));
    const monday1 = 4 - ((jan4.getUTCDay() + 6) % 7);
    const start = iso(y, 0, monday1 + (n - 1) * 7);
    const end = iso(y, 0, monday1 + (n - 1) * 7 + 6);
    return { key, kind: "week", label: `Week ${n}, ${y}`, start, end };
  }
  return {
    key,
    kind: "year",
    label: String(y),
    start: iso(y, 0, 1),
    end: iso(y, 12, 0),
  };
}

/** The month a day falls in, as a period key: "2026-09-14" → "2026-09". */
export function monthOf(isoDate: string): string {
  return isoDate.slice(0, 7);
}

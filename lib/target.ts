/**
 * When a commitment is meant to land: a date and the precision it is
 * stated at, the way Linear stores a project's target.
 *
 * The date is what a picker produces, so the value can never be malformed;
 * the precision is what keeps it honest. Jul 1 2027 at Quarter reads
 * "Q3 2027" everywhere on the site, and the same date at Day reads
 * "July 1, 2027". Any day inside the window places it — the reader takes
 * the window the date falls in — and the register writes the last day of
 * the window, so in Notion the date reads as the deadline it is.
 *
 * Quarter is the default, and what an empty precision means: a quarter is
 * the size most of this work is honestly planned at, and a day claims a
 * certainty only a few commitments have — an upgrade at a block height, a
 * launch with an event behind it.
 *
 * Nothing here touches the filesystem, so a client component can import it.
 */

export const PRECISIONS = ["day", "month", "quarter", "half", "year"] as const;
export type Precision = (typeof PRECISIONS)[number];

/** Notion's select options, in the order the picker offers them. */
export const PRECISION_BY_NOTION: Record<string, Precision> = {
  Day: "day",
  Month: "month",
  Quarter: "quarter",
  "Half-year": "half",
  Year: "year",
};

export type TargetWindow = {
  /** "Q3 2026", "July 2026", "H1 2027", "2027", "September 15, 2026". */
  label: string;
  /** The quarter a day or month falls in; the window itself otherwise. */
  period: string;
  /** First and last day of the window, ISO. */
  start: string;
  end: string;
  /**
   * A number that orders windows by where they start, then by where they
   * end, so Q3 2026 comes before H2 2026, which starts the same day and
   * runs longer. yyyymmdd of the start, then yyyymmdd of the end.
   */
  sort: number;
};

const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;

function iso(y: number, m: number, d: number): string {
  return new Date(Date.UTC(y, m, d)).toISOString().slice(0, 10);
}

function yyyymmdd(isoDate: string): number {
  return Number(isoDate.replaceAll("-", ""));
}

/** The window a date falls in at a precision. */
export function targetWindow(
  date: string,
  precision: Precision,
  where = "a commitment"
): TargetWindow {
  if (!ISO_DATE.test(date)) {
    throw new Error(
      `${where}: target date ${JSON.stringify(date)} is not a date.`
    );
  }
  const y = Number(date.slice(0, 4));
  const m = Number(date.slice(5, 7)) - 1;
  const q = Math.floor(m / 3);
  const h = Math.floor(m / 6);
  const quarter = `Q${q + 1} ${y}`;
  const monthName = new Date(Date.UTC(y, m, 1)).toLocaleDateString("en-US", {
    timeZone: "UTC",
    month: "long",
  });

  const [label, period, start, end] = ((): [string, string, string, string] => {
    switch (precision) {
      case "day":
        return [
          `${monthName} ${Number(date.slice(8, 10))}, ${y}`,
          quarter,
          date,
          date,
        ];
      case "month":
        return [`${monthName} ${y}`, quarter, iso(y, m, 1), iso(y, m + 1, 0)];
      case "quarter":
        return [quarter, quarter, iso(y, q * 3, 1), iso(y, q * 3 + 3, 0)];
      case "half":
        return [
          `H${h + 1} ${y}`,
          `H${h + 1} ${y}`,
          iso(y, h * 6, 1),
          iso(y, h * 6 + 6, 0),
        ];
      case "year":
        return [String(y), String(y), iso(y, 0, 1), iso(y, 12, 0)];
    }
  })();

  return {
    label,
    period,
    start,
    end,
    sort: yyyymmdd(start) * 1e8 + yyyymmdd(end),
  };
}

/**
 * A precision as either source writes it — Notion's option ("Half-year") or
 * the markdown copy's lowercase key ("half") — and Quarter when empty.
 */
export function readPrecision(
  name: string | undefined,
  where = "a commitment"
): Precision {
  if (!name) return "quarter";
  const precision =
    PRECISION_BY_NOTION[name] ??
    PRECISIONS.find((p) => p === name.toLowerCase());
  if (!precision) {
    throw new Error(
      `${where}: target precision ${JSON.stringify(name)} is not one of ` +
        `${Object.keys(PRECISION_BY_NOTION).join(", ")}.`
    );
  }
  return precision;
}

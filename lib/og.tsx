import { ImageResponse } from "next/og";
import { readFile } from "node:fs/promises";
import { join } from "node:path";

/**
 * Social share cards.
 *
 * The registry defines the brand card outright — `@livepeer-ui/og` is "the
 * Livepeer lockup centered on black, 1200 × 630", pure `#000000` with a white
 * 640px lockup and nothing else. `renderBrandCard()` is that card verbatim; it
 * is what livepeer.org itself shares.
 *
 * `renderPageCard()` is the same canvas with a page title, so a shared link to
 * /compute is distinguishable from one to /token in a feed. It adds no new
 * design language: black, the lockup, one `--border` hairline, and display
 * type. Deliberately no description and no domain — every platform renders the
 * og:description and the hostname as text beside the card already, so putting
 * them *in* the image is the same word doing the job twice.
 *
 * Both are dark-only. A share card is one fixed PNG and cannot answer the
 * viewer's theme, so "both themes are first-class" has nothing to attach to
 * here; black is what the registry specifies.
 */

export const OG_SIZE = { width: 1200, height: 630 };
export const OG_CONTENT_TYPE = "image/png";

/** `--background` in dark, and the literal value in the registry's og item. */
const BACKGROUND = "#000000";
/** `--foreground` in dark — oklch(0.985 0 0). */
const FOREGROUND = "#fafafa";
/** `--border` in dark — oklch(1 0 0 / 15%). */
const BORDER = "rgba(255, 255, 255, 0.15)";

// Inlined rather than imported from components/brand.tsx: Satori resolves no
// CSS custom properties and does not inherit `currentColor` the way a browser
// does, so the fill has to be a literal on the element. The registry's own og
// item inlines the same paths for the same reason.
const LOCKUP_VIEWBOX = "0 0 711 89";
const LOCKUP_PATHS = [
  "M0 16.4436V0.944092H15.4995V16.4436H0Z",
  "M28.4692 34.504V19.0045H43.9687V34.504H28.4692Z",
  "M56.8936 52.5661V37.0667H72.393V52.5661H56.8936Z",
  "M28.4692 70.5814V55.0819H43.9687V70.5814H28.4692Z",
  "M0 88.6207V73.1212H15.4995V88.6207H0Z",
  "M0 52.5661V37.0667H15.4995V52.5661H0Z",
  "M118.899 88.6863V0.97998H135.921V73.6405H185.815V88.6863H118.899Z",
  "M195.932 88.6863V0.97998H212.954V88.6863H195.932Z",
  "M291.653 0.97998H310.34L277.221 88.6863H255.142L221.283 0.97998H240.34L266.551 70.9493L291.653 0.97998Z",
  "M319.038 88.6863V52.5316H336.06V37.121H319.038V0.97998H385.955V16.0258H336.06V37.121H378.369V52.5316H336.06V73.6405H387.25V88.6863H319.038Z",
  "M400.019 88.6863V0.97998H439.798C457.005 0.97998 468.23 9.63853 468.23 26.9229C468.23 42.2786 457.005 52.6235 439.798 52.6235H417.041V88.6863H400.019ZM417.041 37.0306H437.886C446.521 37.0306 451.146 32.8877 451.146 26.7406C451.146 20.1235 446.521 16.0258 437.886 16.0258H417.041V37.0306Z",
  "M479.889 88.6863V52.5316H496.911V37.121H479.889V0.97998H546.805V16.0258H496.911V37.121H539.219V52.5316H496.911V73.6405H548.1V88.6863H479.889Z",
  "M560.869 88.6863V52.5316H577.891V37.121H560.869V0.97998H627.785V16.0258H577.891V37.121H620.2V52.5316H577.891V73.6405H629.081V88.6863H560.869Z",
  "M641.85 88.6863V0.97998H682.925C698.488 0.983166 710.061 8.54418 710.061 22.8274C710.061 33.708 705.127 40.3254 695.013 44.0563C704.202 44.0563 708.766 48.2153 708.766 56.4722V88.6863H691.744V60.6923C691.744 54.3927 689.894 52.5578 683.541 52.5578H658.872V88.6863H641.85ZM658.872 37.0884H677.867C687.797 37.0884 692.977 33.7995 692.977 26.616C692.977 19.4325 687.982 16.0258 677.867 16.0258H658.872V37.0884Z",
];

/** The lockup's intrinsic aspect ratio, so a width is the only input needed. */
const LOCKUP_RATIO = 89 / 711;

function Lockup({ width }: { width: number }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox={LOCKUP_VIEWBOX}
      width={width}
      height={Math.round(width * LOCKUP_RATIO)}
      fill={FOREGROUND}
    >
      {LOCKUP_PATHS.map((d) => (
        <path key={d} d={d} />
      ))}
    </svg>
  );
}

/**
 * The registry's og item, unchanged: the lockup centered on black.
 *
 * Renders no text, so it needs no font — which is why it is a separate
 * function rather than `renderPageCard()` with the title omitted.
 */
export function renderBrandCard() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: BACKGROUND,
        }}
      >
        <Lockup width={640} />
      </div>
    ),
    OG_SIZE
  );
}

/**
 * A page card: lockup, hairline, page title.
 *
 * The hairline is the same device the site's own header uses at the same
 * `--border` value — it separates the mark from the page the way the header
 * separates chrome from content, rather than decorating the card.
 */
export async function renderPageCard(title: string) {
  // Satori reads ttf/otf/woff but not woff2, so the OTF cuts are the only
  // usable Favorit Pro in the repo. The display roles are weight 300 and this
  // is 400 — the one place a card departs from the type scale. Light is
  // woff2-only, and at the size a feed thumbnail renders, 400 holds up better
  // than 300 anyway.
  const favoritPro = await readFile(
    join(process.cwd(), "public/fonts/FavoritPro-Regular.otf")
  );

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          background: BACKGROUND,
          fontFamily: "Favorit Pro",
        }}
      >
        <div style={{ display: "flex", padding: "80px 80px 0" }}>
          <Lockup width={240} />
        </div>

        <div
          style={{
            display: "flex",
            height: 1,
            marginTop: 48,
            background: BORDER,
          }}
        />

        <div
          style={{
            display: "flex",
            flex: 1,
            // Centred in the field below the rule, not bottom-anchored:
            // anchoring left a ~310px void in the middle of the card that read
            // as a gap rather than as space.
            alignItems: "center",
            padding: "0 80px",
          }}
        >
          <div
            style={{
              display: "flex",
              maxWidth: 1000,
              fontSize: 80,
              lineHeight: 0.98,
              // --text-display-* tracking, so the title is set the way the
              // pages set their own headings.
              letterSpacing: "-0.045em",
              color: FOREGROUND,
            }}
          >
            {title}
          </div>
        </div>
      </div>
    ),
    {
      ...OG_SIZE,
      fonts: [
        {
          name: "Favorit Pro",
          data: favoritPro,
          weight: 400,
          style: "normal",
        },
      ],
    }
  );
}

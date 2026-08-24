import { ImageResponse } from "next/og";
import { readFile } from "node:fs/promises";
import { join } from "node:path";

/**
 * Social share cards.
 *
 * Every card is one of Peace Node's stock images with the lockup over it. Page
 * cards centre the lockup and say nothing else — the art is what distinguishes
 * /agent from /token in a feed, and the platform already prints the title and
 * hostname as text beside the image. Blog cards add the post title, because a
 * headline is the one thing a reader chooses on and it is not otherwise in the
 * picture.
 *
 * The source is pulled from the CDN already cropped to 1200 × 630, so Satori
 * never resamples it. That also fixes a real softness: the art was being served
 * through the `?fm=webp&q=82` in the blog frontmatter, which measured half the
 * detail of the original — the grain that makes these read as photographs was
 * being compressed into flat mush. `fm=jpg&q=95` restores it at a fifth of the
 * weight of the source PNG.
 */

export const OG_SIZE = { width: 1200, height: 630 };
export const OG_CONTENT_TYPE = "image/png";

/** `--background` in dark, and the literal value in the registry's og item. */
const BACKGROUND = "#000000";
/** `--foreground` in dark — oklch(0.985 0 0). */
const FOREGROUND = "#fafafa";

// Inlined rather than imported from components/brand.tsx: Satori resolves no
// CSS custom properties and does not inherit `currentColor` the way a browser
// does, so the fill has to be a literal on the element. The registry's own og
// item inlines the same paths for the same reason.
const LOCKUP_VIEWBOX = "0 0 711 89";
/** The six squares of the symbol. */
const SYMBOL_PATHS = [
  "M0 16.4436V0.944092H15.4995V16.4436H0Z",
  "M28.4692 34.504V19.0045H43.9687V34.504H28.4692Z",
  "M56.8936 52.5661V37.0667H72.393V52.5661H56.8936Z",
  "M28.4692 70.5814V55.0819H43.9687V70.5814H28.4692Z",
  "M0 88.6207V73.1212H15.4995V88.6207H0Z",
  "M0 52.5661V37.0667H15.4995V52.5661H0Z",
];
/** L-I-V-E-P-E-E-R. */
const WORDMARK_PATHS = [
  "M118.899 88.6863V0.97998H135.921V73.6405H185.815V88.6863H118.899Z",
  "M195.932 88.6863V0.97998H212.954V88.6863H195.932Z",
  "M291.653 0.97998H310.34L277.221 88.6863H255.142L221.283 0.97998H240.34L266.551 70.9493L291.653 0.97998Z",
  "M319.038 88.6863V52.5316H336.06V37.121H319.038V0.97998H385.955V16.0258H336.06V37.121H378.369V52.5316H336.06V73.6405H387.25V88.6863H319.038Z",
  "M400.019 88.6863V0.97998H439.798C457.005 0.97998 468.23 9.63853 468.23 26.9229C468.23 42.2786 457.005 52.6235 439.798 52.6235H417.041V88.6863H400.019ZM417.041 37.0306H437.886C446.521 37.0306 451.146 32.8877 451.146 26.7406C451.146 20.1235 446.521 16.0258 437.886 16.0258H417.041V37.0306Z",
  "M479.889 88.6863V52.5316H496.911V37.121H479.889V0.97998H546.805V16.0258H496.911V37.121H539.219V52.5316H496.911V73.6405H548.1V88.6863H479.889Z",
  "M560.869 88.6863V52.5316H577.891V37.121H560.869V0.97998H627.785V16.0258H577.891V37.121H620.2V52.5316H577.891V73.6405H629.081V88.6863H560.869Z",
  "M641.85 88.6863V0.97998H682.925C698.488 0.983166 710.061 8.54418 710.061 22.8274C710.061 33.708 705.127 40.3254 695.013 44.0563C704.202 44.0563 708.766 48.2153 708.766 56.4722V88.6863H691.744V60.6923C691.744 54.3927 689.894 52.5578 683.541 52.5578H658.872V88.6863H641.85ZM658.872 37.0884H677.867C687.797 37.0884 692.977 33.7995 692.977 26.616C692.977 19.4325 687.982 16.0258 677.867 16.0258H658.872V37.0884Z",
];

/** Intrinsic aspect ratio, so a width is the only input the lockup needs. */
const LOCKUP_RATIO = 89 / 711;

/**
 * Symbol and wordmark together — the only mark these cards use.
 *
 * The titled card carried the wordmark alone until it was measured: the claim
 * was that the symbol turns to mush at corner-mark size, and at 215px wide each
 * of its three columns is 11.6px on the 1200px canvas, 3.5px once Slack draws
 * the card at 360px. Soft, but the silhouette holds — and a share card is the
 * site meeting people who are not on it, where the symbol is the part that is
 * recognised without being read.
 */
function Lockup({ width }: { width: number }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox={LOCKUP_VIEWBOX}
      width={width}
      height={Math.round(width * LOCKUP_RATIO)}
      fill={FOREGROUND}
    >
      {[...SYMBOL_PATHS, ...WORDMARK_PATHS].map((d) => (
        <path key={d} d={d} />
      ))}
    </svg>
  );
}

const CDN = "https://cdn.sanity.io/images/l36s876e/production";

/**
 * The art each page shares under.
 *
 * Drawn from Peace Node's stock-image set — the nav thumbnails plus the assets
 * on the marketing page — so a card is recognisably from the same library as
 * the rest of the site. Pages reuse the image their own nav entry already
 * carries where one exists; /, /foundation and /blog take unused assets so no
 * two pages share a picture.
 */
export const ogArt = {
  // The greenest frame in the set — measured 48% of its pixels in the
  // green band, and 15% close to the brand hue. The default card is the
  // one most people see, so it is the one that should carry the colour.
  home: `${CDN}/7ed804401d8fac1f4d9d0dec7c79e0cdbf53fbc4-1456x816.png`,
  agent: `${CDN}/284ddcce63e09dc485789f43254049e39f5a2e40-1456x816.png`,
  compute: `${CDN}/111bb7231a9a5e9997fdcd53ccfbbba739d8706c-1456x816.png`,
  token: `${CDN}/ca81ff8f671969141086bf1626a8df7386bb2cd4-1456x816.png`,
  ecosystem: `${CDN}/4a527a2ef16f7ef5aed60fc3a87cfe31f67844e8-1456x816.png`,
  foundation: `${CDN}/3210a93c58ad86eda9c081a5d8f5687c923c736f-1456x816.png`,
  blog: `${CDN}/c2628855a32836a85f90ba723cd2629f9a84c942-1456x816.png`,
  // Swapped with home rather than duplicated: no two pages share a frame.
  brand: `${CDN}/a8385777180dc439004d670730f378a416102dbe-1456x816.png`,
  // Matched to home rather than to the rest of the set: 27% of its pixels
  // saturated against home's 27%, two thirds of that in the green band against
  // home's two thirds, and a bottom-left band at 32% luminance against home's
  // 31% — which is the number that decides how hard the scrim has to work under
  // the headline. The frame this replaced was 64% saturated with 7% green and a
  // 60% bottom band: the most colourful card on a site whose own colour is one
  // green. Drawn from the stock library rather than borrowed from home, so no
  // two pages still share a frame.
  //
  // The nav dropdown thumbnail deliberately keeps the frame this replaced. The
  // two reference the same asset id and were moved together at first, on the
  // reasoning that a menu image and a share card showing different pictures is
  // drift — but they are seen in different places by different readers, and
  // only the card had a reason to change. /blog and /brand differ the same way.
  roadmap: `${CDN}/236781e57df9491a4aa1b5d9cc7d71d6a8270c0c-1456x816.png`,
} as const;

/**
 * Fetch the art already cropped to the card, as a data URI.
 *
 * The CDN does the resize, so Satori composites 1200 × 630 pixels onto a
 * 1200 × 630 canvas and never resamples. Returns null rather than throwing —
 * a card with no art still carries the lockup, which is a better failure than
 * a build that dies because a CDN blipped.
 */
async function loadArt(url: string): Promise<string | null> {
  try {
    const source = new URL(url);
    source.search = "";
    source.searchParams.set("w", String(OG_SIZE.width));
    source.searchParams.set("h", String(OG_SIZE.height));
    source.searchParams.set("fit", "crop");
    source.searchParams.set("fm", "jpg");
    source.searchParams.set("q", "95");
    const response = await fetch(source);
    if (!response.ok) return null;
    const bytes = Buffer.from(await response.arrayBuffer());
    return `data:image/jpeg;base64,${bytes.toString("base64")}`;
  } catch {
    return null;
  }
}

/**
 * The art and its scrim, as sibling layers.
 *
 * Every layer is absolutely positioned against the same root box, and that root
 * carries no padding and no centring. Satori resolves `position: absolute`
 * against the padding box of the nearest positioned ancestor *after* its flex
 * alignment has been applied, so padding or `justifyContent` on the root shifts
 * the artwork off the canvas instead of the content — which is exactly what it
 * did on the first pass.
 */
function ArtBackdrop({ art, scrim }: { art: string | null; scrim: string }) {
  return (
    <>
      {art && (
        <img
          src={art}
          alt=""
          width={OG_SIZE.width}
          height={OG_SIZE.height}
          style={{ position: "absolute", top: 0, left: 0 }}
        />
      )}
      {/* The art runs from near-black to blown highlights, so the lockup cannot
          rely on it. A scrim guarantees the contrast instead of hoping for it. */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: OG_SIZE.width,
          height: OG_SIZE.height,
          display: "flex",
          background: scrim,
        }}
      />
    </>
  );
}

/** The root every card shares: no padding, no alignment — see ArtBackdrop. */
const CANVAS = {
  position: "relative" as const,
  display: "flex" as const,
  width: OG_SIZE.width,
  height: OG_SIZE.height,
  background: BACKGROUND,
};

/** A layer filling the canvas, which is where alignment and padding may live. */
const LAYER = {
  position: "absolute" as const,
  top: 0,
  left: 0,
  width: OG_SIZE.width,
  height: OG_SIZE.height,
  display: "flex" as const,
};

/** A page card: the lockup centred on the page's art. */
export async function renderArtCard(art: string) {
  const image = await loadArt(art);

  return new ImageResponse(
    (
      <div style={CANVAS}>
        {/* Radial, not a flat wash. A single tint heavy enough to carry white
            over the brightest of these images drains the colour out of the
            darker ones — a flat 45% measured 2.2:1 on the brightest, and the
            wash needed to fix that turned the vignette into a visible smudge.
            Darkening only the middle clears 3.6:1 at worst while leaving the
            art intact at the edges. 3:1 is the bar that applies here: the
            lockup is a graphic, so WCAG 1.4.11 governs, not the 4.5:1 written
            for body text. */}
        <ArtBackdrop
          art={image}
          scrim="radial-gradient(circle at 50% 50%, rgba(0,0,0,0.72) 0%, rgba(0,0,0,0.66) 40%, rgba(0,0,0,0.34) 75%, rgba(0,0,0,0.22) 100%)"
        />
        <div style={{ ...LAYER, alignItems: "center", justifyContent: "center" }}>
          <Lockup width={520} />
        </div>
      </div>
    ),
    OG_SIZE
  );
}

/**
 * A titled card: art, the wordmark, and a line naming what this is.
 *
 * Was renderPostCard, for blog posts alone. Nothing about it is post-specific,
 * and the card every other page was getting — art plus a centred lockup — is
 * the same card for all of them, so a shared /roadmap link and a shared /token
 * link were indistinguishable in a timeline. A page worth sharing should say
 * which page it is.
 *
 * Favorit Pro rather than Inter, which every page title on the site now uses.
 * design.md reserves the display face for "major marketing statements and
 * editorial titles" and rules it out for product UI — a share card is the
 * former, and it is the one surface here that is pure marketing.
 */
/**
 * Headline size, from the length of the headline.
 *
 * One size cannot serve both callers: the roadmap's line is 30 characters and
 * the longest blog title is 94. At a fixed 60 the short one sat light against
 * the mark, and anything large enough to fix that broke the long one over
 * three lines. Sized by length, each gets the largest setting that still holds
 * its own line count — 68 is the most "What we\u2019re building, and when."
 * takes before it wraps mid-phrase, which costs more than the size gains.
 *
 * Steps rather than a curve, so a title near a boundary cannot land on a size
 * nobody has looked at.
 */
function headlineSize(title: string) {
  if (title.length <= 45) return 68;
  if (title.length <= 80) return 60;
  return 52;
}

export async function renderTitledCard(
  art: string | undefined,
  title: string,
  /**
   * An optional line above the headline, naming the surface — the same eyebrow
   * the page itself sets above its h1. A card that only carries a headline
   * makes the reader infer which part of the site it came from; the page does
   * not ask that of anyone standing on it, and a timeline is a harder place to
   * infer from than a page.
   */
  eyebrow?: string
) {
  const [image, favoritPro] = await Promise.all([
    art ? loadArt(art) : Promise.resolve(null),
    // Satori reads ttf/otf/woff but not woff2, so the OTF cuts are the only
    // usable Favorit Pro in the repo.
    readFile(join(process.cwd(), "public/fonts/FavoritPro-Regular.otf")),
  ]);

  return new ImageResponse(
    (
      <div style={{ ...CANVAS, fontFamily: "Favorit Pro" }}>
        {/* Weighted to the foot, where the headline sits: light enough at the
            top that the art still reads, dense enough at the bottom that the
            title holds over any of it. */}
        <ArtBackdrop
          art={image}
          scrim="linear-gradient(to bottom, rgba(0,0,0,0.30) 0%, rgba(0,0,0,0.45) 45%, rgba(0,0,0,0.88) 100%)"
        />
        <div
          style={{
            ...LAYER,
            flexDirection: "column",
            justifyContent: "space-between",
            padding: 64,
          }}
        >
          {/* Sized against the headline, not against legibility.
              215 was derived from holding the letterforms at the size the old
              wordmark set them, which kept the mark 27px tall against a 60px
              headline — legible at every width and still an afterthought in
              the frame. Checked against a real Discord unfurl, which draws
              these around 800px rather than the 400 a Slack preview suggests:
              at that size 215 disappears and 400 competes with the headline
              for the subject. 340 puts the mark at 43px, 72% of the headline,
              so the two anchor opposite corners without either winning.

              It helps the small end too — the symbol's columns go from 3.5px
              to 5.5px once Slack draws the card at 360px. */}
          <div style={{ display: "flex" }}>
            <Lockup width={340} />
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
            {eyebrow ? (
              // Sized and tracked off the page's own Label: 11px at 0.09em
              // there, scaled to the card. Held at 72% rather than full white
              // so it reads as a label on the headline rather than a second
              // line of it.
              <div
                style={{
                  display: "flex",
                  fontSize: 26,
                  letterSpacing: "0.12em",
                  textTransform: "uppercase",
                  color: "rgba(255,255,255,0.72)",
                }}
              >
                {eyebrow}
              </div>
            ) : null}
            <div
              style={{
                display: "flex",
                maxWidth: 940,
                fontSize: headlineSize(title),
                lineHeight: 1.08,
                letterSpacing: "-0.02em",
                color: FOREGROUND,
              }}
            >
              {title}
            </div>
          </div>
        </div>
      </div>
    ),
    {
      ...OG_SIZE,
      fonts: [
        { name: "Favorit Pro", data: favoritPro, weight: 400, style: "normal" },
      ],
    }
  );
}

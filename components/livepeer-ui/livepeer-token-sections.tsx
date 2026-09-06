import { ArrowUpRightIcon } from "lucide-react";

import { LivepeerGradientSymbol, LivepeerSymbol } from "@/components/brand";
import { Button } from "@/components/ui/button";

export type TokenContent = {
  hero: {
    eyebrow: string;
    heading: string;
    description: string;
  };
  exchanges: {
    /** Rendered as "Get $LPT at…" — the $LPT sits inline with the symbol. */
    leadIn: string;
    trailing: string;
    links: { name: string; href: string }[];
  };
  stake: {
    heading: string;
    description: string;
    cta: { label: string; href: string };
  };
};

/* ------------------------------------------------------------------ *
 * Exchange marks
 *
 * Drawn with currentColor rather than each brand's own colour: every mark
 * sits on a band already filled with that brand's colour, so a coloured
 * logo would disappear into it. The band sets black or white and the mark
 * inherits. (The mockup gets there with brightness-0/invert filters on
 * bitmaps; we have the paths, so we can just not colour them.)
 * ------------------------------------------------------------------ */

function BinanceMark({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 126 126"
      fill="currentColor"
      aria-hidden="true"
    >
      <path d="M38.4 53.6L63 29l24.6 24.6 14.3-14.3L63 .6 24.1 39.3l14.3 14.3zM.6 63l14.3-14.3L29.2 63 14.9 77.3.6 63zm37.8 9.4L63 97l24.6-24.6 14.3 14.3L63 125.4 24.1 86.7l14.3-14.3zM96.8 63l14.3-14.3L125.4 63l-14.3 14.3L96.8 63z" />
      <path d="M77.5 63L63 48.5 52.2 59.3l-1.2 1.2L48.5 63 63 77.5 77.5 63z" />
    </svg>
  );
}

function CoinbaseMark({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 1024 1024"
      fill="currentColor"
      aria-hidden="true"
    >
      <path d="M512 0C229.2 0 0 229.2 0 512s229.2 512 512 512 512-229.2 512-512S794.8 0 512 0zm0 716.8c-113.1 0-204.8-91.7-204.8-204.8S398.9 307.2 512 307.2 716.8 398.9 716.8 512 625.1 716.8 512 716.8z" />
    </svg>
  );
}

function KrakenMark({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 42 32"
      fill="currentColor"
      aria-hidden="true"
    >
      <path d="M20.9964832,0 C9.39735269,0 0,9.11917531 0,20.3663948 L0,29.0927818 C0,30.6995672 1.34340172,32 2.99584756,32 C4.65059006,32 6.00102529,30.6995672 6.00102529,29.0927818 L6.00102529,20.3663948 C6.00102529,18.7575216 7.33753704,17.4547226 8.99916951,17.4547226 C10.653912,17.4547226 11.9974573,18.7575216 11.9974573,20.3663948 L11.9974573,29.0927818 C11.9974573,30.6995672 13.340859,32 14.9956015,32 C16.6549373,32 17.998339,30.6995672 17.998339,29.0927818 L17.998339,20.3663948 C17.998339,18.7575216 19.3418843,17.4547226 20.9964832,17.4547226 C22.6581157,17.4547226 24.001661,18.7575216 24.001661,20.3663948 L24.001661,29.0927818 C24.001661,30.6995672 25.3450627,32 26.9975085,32 C28.652251,32 29.9956528,30.6995672 29.9956528,29.0927818 L29.9956528,20.3663948 C29.9956528,18.7575216 31.339198,17.4547226 33.0008305,17.4547226 C34.655573,17.4547226 35.9991182,18.7575216 35.9991182,20.3663948 L35.9991182,29.0927818 C35.9991182,30.6995672 37.34252,32 39.0018558,32 C40.6565983,32 42,30.6995672 42,29.0927818 L42,20.3663948 C42,9.11917531 32.5957573,0 20.9964832,0" />
    </svg>
  );
}

function UniswapMark({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 641 640"
      fill="currentColor"
      aria-hidden="true"
    >
      <path d="M224.534 123.226C218.692 122.32 218.445 122.213 221.195 121.791C226.464 120.98 238.905 122.085 247.479 124.123C267.494 128.881 285.707 141.069 305.148 162.714L310.313 168.465L317.701 167.277C348.828 162.275 380.493 166.25 406.978 178.485C414.264 181.851 425.752 188.552 427.187 190.274C427.645 190.822 428.485 194.355 429.053 198.124C431.02 211.164 430.036 221.16 426.047 228.625C423.877 232.688 423.756 233.975 425.215 237.452C426.38 240.227 429.627 242.28 432.843 242.276C439.425 242.267 446.509 231.627 449.791 216.823L451.095 210.943L453.678 213.868C467.846 229.92 478.974 251.811 480.885 267.393L481.383 271.455L479.002 267.762C474.903 261.407 470.785 257.08 465.512 253.591C456.006 247.301 445.955 245.161 419.337 243.758C395.296 242.491 381.69 240.438 368.198 236.038C345.244 228.554 333.672 218.587 306.405 182.812C294.294 166.923 286.808 158.131 279.362 151.051C262.442 134.964 245.816 126.527 224.534 123.226Z" />
      <path d="M432.61 158.704C433.215 148.057 434.659 141.033 437.562 134.62C438.711 132.081 439.788 130.003 439.954 130.003C440.12 130.003 439.621 131.877 438.844 134.167C436.733 140.392 436.387 148.905 437.84 158.811C439.686 171.379 440.735 173.192 454.019 186.769C460.25 193.137 467.497 201.168 470.124 204.616L474.901 210.886L470.124 206.405C464.282 200.926 450.847 190.24 447.879 188.712C445.89 187.688 445.594 187.705 444.366 188.927C443.235 190.053 442.997 191.744 442.84 199.741C442.596 212.204 440.897 220.204 436.797 228.203C434.58 232.529 434.23 231.606 436.237 226.723C437.735 223.077 437.887 221.474 437.876 209.408C437.853 185.167 434.975 179.339 418.097 169.355C413.821 166.826 406.776 163.178 402.442 161.249C398.107 159.32 394.664 157.639 394.789 157.514C395.267 157.038 411.727 161.842 418.352 164.39C428.206 168.181 429.833 168.672 431.03 168.215C431.832 167.909 432.22 165.572 432.61 158.704Z" />
      <path d="M235.883 200.175C224.022 183.846 216.684 158.809 218.272 140.093L218.764 134.301L221.463 134.794C226.534 135.719 235.275 138.973 239.369 141.459C250.602 148.281 255.465 157.263 260.413 180.328C261.862 187.083 263.763 194.728 264.638 197.317C266.047 201.483 271.369 211.214 275.696 217.534C278.813 222.085 276.743 224.242 269.853 223.62C259.331 222.67 245.078 212.834 235.883 200.175Z" />
      <path d="M418.223 321.707C362.793 299.389 343.271 280.017 343.271 247.331C343.271 242.521 343.437 238.585 343.638 238.585C343.84 238.585 345.985 240.173 348.404 242.113C359.644 251.128 372.231 254.979 407.076 260.062C427.58 263.054 439.119 265.47 449.763 269C483.595 280.22 504.527 302.99 509.518 334.004C510.969 343.016 510.118 359.915 507.766 368.822C505.91 375.857 500.245 388.537 498.742 389.023C498.325 389.158 497.917 387.562 497.81 385.389C497.24 373.744 491.355 362.406 481.472 353.913C470.235 344.257 455.137 336.569 418.223 321.707Z" />
      <path d="M379.31 330.978C378.615 326.846 377.411 321.568 376.633 319.25L375.219 315.036L377.846 317.985C381.481 322.065 384.354 327.287 386.789 334.241C388.647 339.549 388.856 341.127 388.842 349.753C388.828 358.221 388.596 359.996 386.88 364.773C384.174 372.307 380.816 377.649 375.181 383.383C365.056 393.688 352.038 399.393 333.253 401.76C329.987 402.171 320.47 402.864 312.103 403.299C291.016 404.395 277.138 406.661 264.668 411.04C262.875 411.67 261.274 412.052 261.112 411.89C260.607 411.388 269.098 406.326 276.111 402.948C285.999 398.185 295.842 395.586 317.897 391.913C328.792 390.098 340.043 387.897 342.9 387.021C369.88 378.749 383.748 357.402 379.31 330.978Z" />
      <path d="M404.719 376.105C397.355 360.273 395.664 344.988 399.698 330.732C400.13 329.209 400.824 327.962 401.242 327.962C401.659 327.962 403.397 328.902 405.103 330.05C408.497 332.335 415.303 336.182 433.437 346.069C456.065 358.406 468.966 367.959 477.74 378.873C485.423 388.432 490.178 399.318 492.467 412.593C493.762 420.113 493.003 438.206 491.074 445.778C484.99 469.653 470.85 488.406 450.682 499.349C447.727 500.952 445.075 502.269 444.788 502.275C444.501 502.28 445.577 499.543 447.18 496.191C453.965 482.009 454.737 468.214 449.608 452.859C446.467 443.457 440.064 431.985 427.135 412.596C412.103 390.054 408.417 384.054 404.719 376.105Z" />
      <path d="M196.519 461.525C217.089 444.157 242.682 431.819 265.996 428.032C276.043 426.399 292.78 427.047 302.084 429.428C316.998 433.245 330.338 441.793 337.276 451.978C344.057 461.932 346.966 470.606 349.995 489.906C351.189 497.519 352.489 505.164 352.882 506.895C355.156 516.897 359.583 524.892 365.067 528.907C373.779 535.283 388.78 535.68 403.536 529.924C406.041 528.947 408.215 528.271 408.368 528.424C408.903 528.955 401.473 533.93 396.23 536.548C389.177 540.071 383.568 541.434 376.115 541.434C362.6 541.434 351.379 534.558 342.016 520.539C340.174 517.78 336.032 509.516 332.813 502.176C322.928 479.628 318.046 472.759 306.568 465.242C296.579 458.701 283.697 457.53 274.006 462.282C261.276 468.523 257.724 484.791 266.842 495.101C270.465 499.198 277.223 502.732 282.749 503.419C293.086 504.705 301.97 496.841 301.97 486.404C301.97 479.627 299.365 475.76 292.808 472.801C283.852 468.76 274.226 473.483 274.272 481.897C274.292 485.484 275.854 487.737 279.45 489.364C281.757 490.408 281.811 490.491 279.929 490.1C271.712 488.396 269.787 478.49 276.394 471.913C284.326 464.018 300.729 467.502 306.362 478.279C308.728 482.805 309.003 491.82 306.94 497.264C302.322 509.448 288.859 515.855 275.201 512.368C265.903 509.994 262.117 507.424 250.906 495.876C231.425 475.809 223.862 471.92 195.777 467.536L190.395 466.696L196.519 461.525Z" />
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M49.6202 12.0031C114.678 90.9638 214.977 213.901 219.957 220.784C224.068 226.467 222.521 231.576 215.478 235.58C211.561 237.807 203.508 240.063 199.476 240.063C194.916 240.063 189.779 237.867 186.038 234.318C183.393 231.81 172.721 215.874 148.084 177.646C129.233 148.396 113.457 124.131 113.027 123.725C112.032 122.785 112.049 122.817 146.162 183.854C167.582 222.181 174.813 235.731 174.813 237.543C174.813 241.229 173.808 243.166 169.261 248.238C161.681 256.694 158.293 266.195 155.847 285.859C153.104 307.902 145.394 323.473 124.026 350.122C111.518 365.722 109.471 368.581 106.315 374.869C102.339 382.786 101.246 387.221 100.803 397.219C100.335 407.79 101.247 414.619 104.477 424.726C107.304 433.575 110.255 439.417 117.8 451.104C124.311 461.188 128.061 468.683 128.061 471.614C128.061 473.947 128.506 473.95 138.596 471.672C162.741 466.219 182.348 456.629 193.375 444.877C200.199 437.603 201.801 433.586 201.853 423.618C201.887 417.098 201.658 415.733 199.896 411.982C197.027 405.877 191.804 400.801 180.292 392.932C165.209 382.621 158.767 374.32 156.987 362.904C155.527 353.537 157.221 346.928 165.565 329.44C174.202 311.338 176.342 303.624 177.79 285.378C178.725 273.589 180.02 268.94 183.407 265.209C186.939 261.317 190.119 260 198.861 258.805C213.113 256.858 222.188 253.171 229.648 246.297C236.119 240.334 238.827 234.588 239.243 225.938L239.558 219.382L235.942 215.166C222.846 199.896 40.85 0 40.044 0C39.8719 0 44.1813 5.40178 49.6202 12.0031ZM135.412 409.18C138.373 403.937 136.8 397.195 131.847 393.902C127.167 390.79 119.897 392.256 119.897 396.311C119.897 397.548 120.582 398.449 122.124 399.243C124.72 400.579 124.909 402.081 122.866 405.152C120.797 408.262 120.964 410.996 123.337 412.854C127.162 415.849 132.576 414.202 135.412 409.18Z"
      />
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M248.552 262.244C241.862 264.299 235.358 271.39 233.344 278.826C232.116 283.362 232.813 291.319 234.653 293.776C237.625 297.745 240.499 298.791 248.282 298.736C263.518 298.63 276.764 292.095 278.304 283.925C279.567 277.229 273.749 267.948 265.736 263.874C261.601 261.772 252.807 260.938 248.552 262.244ZM266.364 276.172C268.714 272.834 267.686 269.225 263.69 266.785C256.08 262.138 244.571 265.983 244.571 273.173C244.571 276.752 250.572 280.656 256.074 280.656C259.735 280.656 264.746 278.473 266.364 276.172Z"
      />
    </svg>
  );
}

function OkxMark({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 32 32"
      fill="currentColor"
      aria-hidden="true"
    >
      <rect x="1" y="1" width="9" height="9" rx="1.5" />
      <rect x="11.5" y="1" width="9" height="9" rx="1.5" />
      <rect x="22" y="1" width="9" height="9" rx="1.5" />
      <rect x="1" y="11.5" width="9" height="9" rx="1.5" />
      <rect x="22" y="11.5" width="9" height="9" rx="1.5" />
      <rect x="1" y="22" width="9" height="9" rx="1.5" />
      <rect x="11.5" y="22" width="9" height="9" rx="1.5" />
      <rect x="22" y="22" width="9" height="9" rx="1.5" />
    </svg>
  );
}

/**
 * Each venue's own brand colour, keyed by name.
 *
 * These are the one place on the site where a raw hex is right: they are not
 * theme colours and have no light/dark variant to serve — they are Binance's
 * yellow and Coinbase's blue, fixed values owned by someone else, in the same
 * category as a contributor's logoBg in the ecosystem catalogue. Every other
 * surface on this page is a registry token.
 */
const EXCHANGE_STYLES: Record<string, { className: string; markSize: string }> =
  {
    Binance: { className: "bg-[#ffd000] text-black", markSize: "size-7" },
    Coinbase: { className: "bg-[#0052ff] text-white", markSize: "size-7" },
    Kraken: { className: "bg-[#5741d9] text-white", markSize: "size-7" },
    Uniswap: { className: "bg-[#ff007a] text-white", markSize: "size-8" },
    OKX: { className: "bg-[#b6ff20] text-black", markSize: "size-8" },
  };

const EXCHANGE_MARKS: Record<
  string,
  (props: { className?: string }) => React.ReactElement
> = {
  Binance: BinanceMark,
  Coinbase: CoinbaseMark,
  Kraken: KrakenMark,
  Uniswap: UniswapMark,
  OKX: OkxMark,
};

/* ------------------------------------------------------------------ *
 * The network diagram
 * ------------------------------------------------------------------ */

/**
 * The four roles, and the five flows between them.
 *
 * Copy lives here beside the coordinates rather than in the page's content
 * object, because the two are inseparable: "JOBS + PAYMENTS" is set on a
 * specific path at a specific offset, and moving the words without moving the
 * geometry produces a broken drawing rather than different copy.
 */
const NODES = [
  {
    x: 30,
    y: 20,
    name: "Applications",
    note: "Request video compute jobs",
  },
  {
    x: 30,
    y: 444,
    name: "Gateway Nodes",
    note: "Route jobs to orchestrators",
  },
  {
    x: 490,
    y: 20,
    name: "Orchestrator Nodes",
    note: "GPU clusters process work",
  },
  {
    x: 490,
    y: 444,
    name: "Delegators",
    note: "Stake LPT and earn fees",
  },
] as const;

const NODE_WIDTH = 280;
const NODE_HEIGHT = 112;

/**
 * The diagram's green, darkened for light mode.
 *
 * --color-brand is tuned to sit on black, where it measures 8.8:1. On white it
 * is 2.4:1 — fine for a 1.5px line, not fine for a 13px label. Rather than
 * introduce a second green, light mode mixes the one token toward black: 25%
 * is the lightest step that clears AA, at 4.9:1, so the drawing stays as vivid
 * as legibility allows. (color-mix on a token is the same move the registry's
 * own secondary button uses for its hover state.)
 */
const DIAGRAM_GREEN =
  "text-[color-mix(in_oklch,var(--color-brand),black_25%)] dark:text-brand";

/**
 * One flow: its line, the pair of travelling dots, and its label.
 *
 * `dur` and `begin` are staggered per edge (and several `begin` values are
 * negative, which starts the animation mid-cycle) so the five dots never line
 * up into a pulse. The drawing should read as continuous traffic, not a
 * metronome.
 */
const EDGES = [
  {
    id: "requests",
    d: "M170 132V444",
    label: "REQUESTS",
    dur: "2.8s",
    begin: "0s",
  },
  {
    id: "jobs-payments",
    d: "M290 444 490 112",
    label: "JOBS + PAYMENTS",
    labelDy: -10,
    dur: "3.2s",
    begin: "-1.4s",
  },
  {
    id: "video-response",
    d: "M510 132 310 464",
    label: "VIDEO RESPONSE",
    labelDy: 14,
    // The line runs top-right to bottom-left; text set on it directly would
    // read upside down, so the label rides a second path drawn the other way.
    labelPath: "M310 464 510 132",
    dur: "3.2s",
    begin: "0s",
  },
  {
    id: "stake",
    d: "M630 444V132",
    label: "STAKE",
    labelDy: -18,
    // Dashed: stake is a standing commitment, not a per-job transfer like the
    // four solid flows.
    dash: "8 7",
    dur: "3s",
    begin: "-0.8s",
  },
  {
    id: "fees",
    d: "M700 132V444",
    label: "FEES",
    labelDy: -18,
    dur: "3s",
    begin: "-2s",
  },
] as const;

/**
 * How the token coordinates the network, as a drawing.
 *
 * Green throughout, and non-interactive throughout — nothing here is a
 * control. That is the only footing on which green is allowed to carry meaning
 * on this site (design.md), and a diagram of value moving between roles is
 * exactly the brand-expression case the rule reserves it for.
 *
 * The travelling dots are hidden under prefers-reduced-motion; the lines,
 * labels, and cards carry the whole message without them.
 */
function TokenNetworkDiagram() {
  return (
    // The drawing does not compress below ~640px without the 13px labels
    // falling to 6px — legible in a mockup screenshot, not on a phone. So it
    // holds a floor and scrolls sideways inside its own box rather than
    // shrinking past readability. The page itself never scrolls horizontally.
    //
    // The right edge fades below md to say there is more drawing off-screen —
    // without it the diagram just stops mid-line and reads as clipped rather
    // than scrollable. Dropped at md, where the full 672px fits and nothing is
    // hidden to hint at.
    <div className="-mx-4 overflow-x-auto px-4 [mask-image:linear-gradient(to_right,black_82%,transparent_100%)] sm:mx-0 sm:px-0 md:[mask-image:none]">
      <svg
        viewBox="0 0 800 576"
        role="img"
        aria-labelledby="token-network-title token-network-desc"
        className="mx-auto h-auto w-full max-w-2xl min-w-[640px] text-foreground"
      >
        <title id="token-network-title">
          How Livepeer Token coordinates the network
        </title>
        <desc id="token-network-desc">
          Applications send requests through gateway nodes to orchestrators,
          which return video. Delegators stake Livepeer Token with orchestrators
          and receive a share of the fees.
        </desc>

        <defs>
          {EDGES.filter((edge) => "labelPath" in edge).map((edge) => (
            <path
              key={edge.id}
              id={`${edge.id}-label-path`}
              d={(edge as { labelPath: string }).labelPath}
            />
          ))}
        </defs>

        {/* Lines */}
        <g
          className={DIAGRAM_GREEN}
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
        >
          {EDGES.map((edge) => (
            <path
              key={edge.id}
              id={`${edge.id}-path`}
              d={edge.d}
              strokeDasharray={"dash" in edge ? edge.dash : undefined}
            />
          ))}
        </g>

        {/* Travelling dots — a bright core inside a soft halo. */}
        <g aria-hidden="true">
          {EDGES.map((edge) => (
            <g
              key={edge.id}
              className={`${DIAGRAM_GREEN} motion-reduce:hidden`}
              fill="currentColor"
            >
              <circle r="7" opacity="0.12">
                <animateMotion
                  path={edge.d}
                  dur={edge.dur}
                  begin={edge.begin}
                  repeatCount="indefinite"
                />
              </circle>
              <circle r="2.75">
                <animateMotion
                  path={edge.d}
                  dur={edge.dur}
                  begin={edge.begin}
                  repeatCount="indefinite"
                />
              </circle>
            </g>
          ))}
        </g>

        {/* Labels. REQUESTS is set upright and rotated because its line is the
            leftmost edge of the drawing — riding the path would push it into
            the Applications card. The rest ride their own lines. */}
        <g
          className={`${DIAGRAM_GREEN} text-[13px] font-medium tracking-wide`}
          fill="currentColor"
        >
          <text
            x="145"
            y="288"
            textAnchor="middle"
            dominantBaseline="middle"
            transform="rotate(-90 145 288)"
          >
            REQUESTS
          </text>
          {EDGES.filter((edge) => edge.id !== "requests").map((edge) => (
            <text key={edge.id} dy={"labelDy" in edge ? edge.labelDy : 0}>
              <textPath
                href={`#${"labelPath" in edge ? `${edge.id}-label-path` : `${edge.id}-path`}`}
                startOffset="50%"
                textAnchor="middle"
              >
                {edge.label}
              </textPath>
            </text>
          ))}
        </g>

        {/* Role cards. Filled with the page background so the lines pass
            behind them rather than through the words. */}
        {NODES.map((node) => (
          <g key={node.name}>
            <rect
              x={node.x}
              y={node.y}
              width={NODE_WIDTH}
              height={NODE_HEIGHT}
              rx="6"
              fill="var(--background)"
              stroke="currentColor"
              strokeOpacity="0.16"
              strokeWidth="1.5"
            />
            <text
              x={node.x + NODE_WIDTH / 2}
              y={node.y + 47}
              textAnchor="middle"
              dominantBaseline="middle"
              fill="currentColor"
              className="text-sm font-semibold"
            >
              {node.name}
            </text>
            <text
              x={node.x + NODE_WIDTH / 2}
              y={node.y + 68}
              textAnchor="middle"
              dominantBaseline="middle"
              fill="currentColor"
              opacity="0.55"
              className="text-[13px]"
            >
              {node.note}
            </text>
          </g>
        ))}
      </svg>
    </div>
  );
}

/* ------------------------------------------------------------------ *
 * Sections
 * ------------------------------------------------------------------ */

/**
 * Hero and diagram, as one section.
 *
 * They are one thought — the headline claims the token coordinates the
 * network, and the drawing is the evidence — so there is no rule or gap
 * between them to suggest otherwise.
 */
export function TokenHeroSection({
  content,
}: {
  content: TokenContent["hero"];
}) {
  return (
    <section className="px-4 pt-32 pb-12 sm:px-6 sm:pt-36 sm:pb-16 lg:px-10">
      <div className="mx-auto flex w-full max-w-page flex-col items-center text-center">
        <div className="flex items-center justify-center gap-2">
          {/* The gradient symbol, not flat brand green: this is the token's
              own mark standing in for its ticker. Non-interactive. */}
          <LivepeerGradientSymbol
            className="h-2.5 w-auto shrink-0 sm:h-3"
            aria-hidden="true"
          />
          <p className="text-xs text-muted-foreground">{content.eyebrow}</p>
        </div>

        <h1 className="mt-6 max-w-[22ch] text-display-sm text-balance sm:text-display-fluid">
          {content.heading}
        </h1>
        <p className="mt-5 max-w-prose text-sm leading-relaxed text-balance text-muted-foreground">
          {content.description}
        </p>

        <div className="mt-12 w-full sm:mt-16">
          <TokenNetworkDiagram />
        </div>
      </div>
    </section>
  );
}

/**
 * Where to get the token, beside what it is for.
 *
 * The venue column is deliberately loud — five full-bleed bands in five
 * borrowed brand colours, the only place on the site that lets outside colour
 * in. It earns the square it sits in: six equal rows, no slack. The stake
 * panel stretches to match it, which is the cost of the pairing and the reason
 * this square survives where the compute page's did not (there, neither half
 * filled it).
 */
export function TokenExchangesSection({
  content,
}: {
  content: Pick<TokenContent, "exchanges" | "stake">;
}) {
  return (
    // data-header-solid: the label row at the top of the venue column is a
    // near-white band, and the stake panel beside it is near-black. A
    // translucent header cannot serve both — over the white half the muted nav
    // links fall to roughly 1.7:1 — so this band opts the header into an
    // opaque background while it passes underneath.
    <section data-header-solid className="grid border-t md:grid-cols-2">
      <article className="grid aspect-square grid-rows-6 overflow-hidden">
        {/* Inverted: the label row is the one piece of chrome in a column of
            borrowed colour, so it takes the strongest contrast available
            rather than competing on hue. */}
        <div className="flex items-center justify-center bg-foreground px-6 text-center text-background sm:px-10">
          <h2 className="flex items-center gap-1.5 text-xs">
            <span className="text-background/60">
              {content.exchanges.leadIn}
            </span>
            <span className="flex items-center gap-1">
              <LivepeerGradientSymbol
                className="h-2.5 w-auto shrink-0 sm:h-3"
                aria-hidden="true"
              />
              <span>$LPT</span>
            </span>
            <span className="text-background/60">
              {content.exchanges.trailing}
            </span>
          </h2>
        </div>

        {content.exchanges.links.map((link) => {
          const style = EXCHANGE_STYLES[link.name];
          const Mark = EXCHANGE_MARKS[link.name];
          return (
            <a
              key={link.name}
              href={link.href}
              target="_blank"
              rel="noreferrer"
              aria-label={`Buy LPT on ${link.name}`}
              // Darkening on hover rather than a colour change: the band is
              // the venue's own colour and shifting its hue would misrepresent
              // it. brightness is the one move that works on all five.
              className={`flex items-center justify-between px-6 transition-[filter] hover:brightness-95 sm:px-10 ${style.className}`}
            >
              {Mark ? <Mark className={style.markSize} /> : null}
              <span className="inline-flex items-center gap-1.5 text-xl tracking-tight sm:text-2xl">
                <span>{link.name}</span>
                <ArrowUpRightIcon className="size-[1em]" aria-hidden="true" />
              </span>
            </a>
          );
        })}
      </article>

      <article className="flex items-center bg-muted px-6 py-20 text-center sm:px-10">
        <div className="mx-auto flex max-w-md flex-col items-center">
          {/* The Livepeer mark in brand green, answering the five borrowed
              colours opposite: those are where you buy the token, this is what
              it does on the network. Non-interactive, which is the only footing
              green gets (design.md). */}
          <LivepeerSymbol
            className="size-10 text-brand sm:size-14"
            aria-hidden="true"
          />
          <h2 className="mt-8 text-page-title text-balance sm:text-display-sm">
            {content.stake.heading}
          </h2>
          <p className="mt-4 text-sm leading-relaxed text-pretty text-muted-foreground">
            {content.stake.description}
          </p>
          <Button
            size="lg"
            variant="outline"
            nativeButton={false}
            render={
              <a
                href={content.stake.cta.href}
                target="_blank"
                rel="noopener noreferrer"
              />
            }
            className="mt-8 h-12 rounded-sm px-5"
          >
            {content.stake.cta.label}
            <ArrowUpRightIcon className="size-4" aria-hidden="true" />
          </Button>
        </div>
      </article>
    </section>
  );
}

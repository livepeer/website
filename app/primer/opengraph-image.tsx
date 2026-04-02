import { ImageResponse } from "next/og";
import { readFile } from "node:fs/promises";
import { join } from "node:path";

export const alt = "Livepeer — A 10-Minute Primer";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function OGImage() {
  const [fontRegular, devicesSvg] = await Promise.all([
    readFile(join(process.cwd(), "public/fonts/FavoritPro-Regular.otf")),
    readFile(join(process.cwd(), "public/images/primer/devices.svg"), "utf-8"),
  ]);

  const illustrationUri = `data:image/svg+xml;base64,${Buffer.from(devicesSvg).toString("base64")}`;

  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        background: "#5AE680",
        fontFamily: "Favorit Pro",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Left side — wordmark + subtitle with hand-drawn arrow */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          paddingLeft: 80,
          width: "42%",
          position: "relative",
          zIndex: 2,
        }}
      >
        {/* Livepeer Wordmark — black fill, large */}
        <svg width="420" height="62" viewBox="115 0 596 90" fill="none">
          <path
            d="M118.899 88.6863V0.97998H135.921V73.6405H185.815V88.6863H118.899Z"
            fill="black"
          />
          <path
            d="M195.932 88.6863V0.97998H212.954V88.6863H195.932Z"
            fill="black"
          />
          <path
            d="M291.653 0.97998H310.34L277.221 88.6863H255.142L221.283 0.97998H240.34L266.551 70.9493L291.653 0.97998Z"
            fill="black"
          />
          <path
            d="M319.038 88.6863V52.5316H336.06V37.121H319.038V0.97998H385.955V16.0258H336.06V37.121H378.369V52.5316H336.06V73.6405H387.25V88.6863H319.038Z"
            fill="black"
          />
          <path
            d="M400.019 88.6863V0.97998H439.798C457.005 0.97998 468.23 9.63853 468.23 26.9229C468.23 42.2786 457.005 52.6235 439.798 52.6235H417.041V88.6863H400.019ZM417.041 37.0306H437.886C446.521 37.0306 451.146 32.8877 451.146 26.7406C451.146 20.1235 446.521 16.0258 437.886 16.0258H417.041V37.0306Z"
            fill="black"
          />
          <path
            d="M479.889 88.6863V52.5316H496.911V37.121H479.889V0.97998H546.805V16.0258H496.911V37.121H539.219V52.5316H496.911V73.6405H548.1V88.6863H479.889Z"
            fill="black"
          />
          <path
            d="M560.869 88.6863V52.5316H577.891V37.121H560.869V0.97998H627.785V16.0258H577.891V37.121H620.2V52.5316H577.891V73.6405H629.081V88.6863H560.869Z"
            fill="black"
          />
          <path
            d="M641.85 88.6863V0.97998H682.925C698.488 0.983166 710.061 8.54418 710.061 22.8274C710.061 33.708 705.127 40.3254 695.013 44.0563C704.202 44.0563 708.766 48.2153 708.766 56.4722V88.6863H691.744V60.6923C691.744 54.3927 689.894 52.5578 683.541 52.5578H658.872V88.6863H641.85ZM658.872 37.0884H677.867C687.797 37.0884 692.977 33.7995 692.977 26.616C692.977 19.4325 687.982 16.0258 677.867 16.0258H658.872V37.0884Z"
            fill="black"
          />
        </svg>

        {/* "A 10 MINUTE PRIMER" + hand-drawn curved arrow — slightly angled */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            marginTop: 48,
            gap: 10,
            transform: "rotate(-2deg)",
          }}
        >
          <div
            style={{
              fontSize: 27,
              fontWeight: 400,
              color: "black",
              letterSpacing: "0.06em",
              textTransform: "uppercase",
              display: "flex",
            }}
          >
            A 10-MINUTE PRIMER
          </div>
          {/* Hand-drawn arrow */}
          <svg width="80" height="32" viewBox="0 0 80 32" fill="none">
            {/* Curved shaft — connects to chevron tip */}
            <path
              d="M4 30C22 12 46 8 62 16"
              stroke="black"
              strokeWidth="2"
              strokeLinecap="round"
              fill="none"
            />
            {/* Arrowhead — chevron with even arms */}
            <path
              d="M55 9L63 16L55 23"
              stroke="black"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              fill="none"
            />
          </svg>
        </div>
      </div>

      {/* Devices illustration — full view with long arm, slight laptop crop on right edge */}
      <img
        src={illustrationUri}
        width={900}
        height={640}
        style={{
          position: "absolute",
          right: -80,
          bottom: -120,
          transform: "rotate(-12deg)",
          transformOrigin: "center center",
        }}
      />
    </div>,
    {
      ...size,
      fonts: [
        {
          name: "Favorit Pro",
          data: fontRegular,
          weight: 400,
          style: "normal" as const,
        },
      ],
    }
  );
}

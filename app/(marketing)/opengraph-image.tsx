import { ImageResponse } from "next/og";
import { readFile } from "node:fs/promises";
import { join } from "node:path";

export const alt = "Livepeer — Open infrastructure for real-time AI video";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function OGImage() {
  const fontRegular = await readFile(
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
          justifyContent: "center",
          alignItems: "center",
          background: "#181818",
          fontFamily: "Favorit Pro",
          position: "relative",
        }}
      >
        {/* Centered radial glow — larger and slightly stronger */}
        <div
          style={{
            position: "absolute",
            width: 1000,
            height: 1000,
            borderRadius: "50%",
            background:
              "radial-gradient(circle, rgba(24,121,78,0.14) 0%, rgba(109,176,156,0.06) 35%, transparent 65%)",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            display: "flex",
          }}
        />

        {/* Secondary glow — bottom right for depth */}
        <div
          style={{
            position: "absolute",
            width: 600,
            height: 600,
            borderRadius: "50%",
            background:
              "radial-gradient(circle, rgba(24,121,78,0.08) 0%, transparent 70%)",
            bottom: -200,
            right: -100,
            display: "flex",
          }}
        />

        {/* Subtle grid overlay */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            display: "flex",
            backgroundImage:
              "linear-gradient(rgba(255,255,255,0.025) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.025) 1px, transparent 1px)",
            backgroundSize: "60px 60px",
          }}
        />

        {/* Lockup (symbol + LIVEPEER text) — 560px wide */}
        <svg
          width="560"
          height="70"
          viewBox="0 0 711 89"
          fill="none"
        >
          <path d="M0 16.4436V0.944092H15.4995V16.4436H0Z" fill="white" />
          <path d="M28.4692 34.504V19.0045H43.9687V34.504H28.4692Z" fill="white" />
          <path d="M56.8936 52.5661V37.0667H72.393V52.5661H56.8936Z" fill="white" />
          <path d="M28.4692 70.5814V55.0819H43.9687V70.5814H28.4692Z" fill="white" />
          <path d="M0 88.6207V73.1212H15.4995V88.6207H0Z" fill="white" />
          <path d="M0 52.5661V37.0667H15.4995V52.5661H0Z" fill="white" />
          <path d="M118.899 88.6863V0.97998H135.921V73.6405H185.815V88.6863H118.899Z" fill="white" />
          <path d="M195.932 88.6863V0.97998H212.954V88.6863H195.932Z" fill="white" />
          <path d="M291.653 0.97998H310.34L277.221 88.6863H255.142L221.283 0.97998H240.34L266.551 70.9493L291.653 0.97998Z" fill="white" />
          <path d="M319.038 88.6863V52.5316H336.06V37.121H319.038V0.97998H385.955V16.0258H336.06V37.121H378.369V52.5316H336.06V73.6405H387.25V88.6863H319.038Z" fill="white" />
          <path d="M400.019 88.6863V0.97998H439.798C457.005 0.97998 468.23 9.63853 468.23 26.9229C468.23 42.2786 457.005 52.6235 439.798 52.6235H417.041V88.6863H400.019ZM417.041 37.0306H437.886C446.521 37.0306 451.146 32.8877 451.146 26.7406C451.146 20.1235 446.521 16.0258 437.886 16.0258H417.041V37.0306Z" fill="white" />
          <path d="M479.889 88.6863V52.5316H496.911V37.121H479.889V0.97998H546.805V16.0258H496.911V37.121H539.219V52.5316H496.911V73.6405H548.1V88.6863H479.889Z" fill="white" />
          <path d="M560.869 88.6863V52.5316H577.891V37.121H560.869V0.97998H627.785V16.0258H577.891V37.121H620.2V52.5316H577.891V73.6405H629.081V88.6863H560.869Z" fill="white" />
          <path d="M641.85 88.6863V0.97998H682.925C698.488 0.983166 710.061 8.54418 710.061 22.8274C710.061 33.708 705.127 40.3254 695.013 44.0563C704.202 44.0563 708.766 48.2153 708.766 56.4722V88.6863H691.744V60.6923C691.744 54.3927 689.894 52.5578 683.541 52.5578H658.872V88.6863H641.85ZM658.872 37.0884H677.867C687.797 37.0884 692.977 33.7995 692.977 26.616C692.977 19.4325 687.982 16.0258 677.867 16.0258H658.872V37.0884Z" fill="white" />
        </svg>

        {/* Tagline */}
        <div
          style={{
            fontSize: 38,
            fontWeight: 400,
            color: "rgba(255,255,255,0.5)",
            marginTop: 36,
            letterSpacing: "0.03em",
            display: "flex",
          }}
        >
          Open infrastructure for real-time AI video
        </div>

        {/* Accent line */}
        <div
          style={{
            width: 100,
            height: 1,
            marginTop: 28,
            background: "linear-gradient(90deg, #18794E, #40BF86)",
            display: "flex",
          }}
        />

        {/* Bottom domain */}
        <div
          style={{
            position: "absolute",
            bottom: 40,
            fontSize: 22,
            color: "rgba(255,255,255,0.2)",
            letterSpacing: "0.08em",
            display: "flex",
          }}
        >
          livepeer.org
        </div>
      </div>
    ),
    {
      ...size,
      fonts: [
        {
          name: "Favorit Pro",
          data: fontRegular,
          weight: 400,
          style: "normal",
        },
      ],
    }
  );
}

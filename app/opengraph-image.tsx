import { ImageResponse } from "next/og";
import { readFile } from "node:fs/promises";
import { join } from "node:path";

export const alt = "Livepeer — Open infrastructure for real-time AI video";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function OGImage() {
  const [fontBold, fontRegular] = await Promise.all([
    readFile(join(process.cwd(), "public/fonts/FavoritPro-Bold.otf")),
    readFile(join(process.cwd(), "public/fonts/FavoritPro-Regular.otf")),
  ]);

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
          background: "linear-gradient(145deg, #181818 0%, #1a2a20 50%, #181818 100%)",
          fontFamily: "Favorit Pro",
          position: "relative",
        }}
      >
        {/* Subtle grid overlay */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            display: "flex",
            backgroundImage:
              "linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)",
            backgroundSize: "60px 60px",
          }}
        />

        {/* Accent glow */}
        <div
          style={{
            position: "absolute",
            width: 500,
            height: 500,
            borderRadius: "50%",
            background:
              "radial-gradient(circle, rgba(24,121,78,0.15) 0%, transparent 70%)",
            top: -100,
            right: -100,
            display: "flex",
          }}
        />
        <div
          style={{
            position: "absolute",
            width: 400,
            height: 400,
            borderRadius: "50%",
            background:
              "radial-gradient(circle, rgba(24,121,78,0.1) 0%, transparent 70%)",
            bottom: -80,
            left: -80,
            display: "flex",
          }}
        />

        {/* Livepeer symbol */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 0,
            marginBottom: 40,
          }}
        >
          <svg
            width="56"
            height="70"
            viewBox="0 0 73 89"
            fill="none"
          >
            <rect x="0" y="0" width="15.5" height="15.5" fill="white" />
            <rect x="28.47" y="18.06" width="15.5" height="15.5" fill="white" />
            <rect x="56.89" y="36.12" width="15.5" height="15.5" fill="white" />
            <rect x="28.47" y="54.14" width="15.5" height="15.5" fill="white" />
            <rect x="0" y="72.18" width="15.5" height="15.5" fill="white" />
            <rect x="0" y="36.12" width="15.5" height="15.5" fill="white" />
          </svg>
        </div>

        {/* Title */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 0,
          }}
        >
          <div
            style={{
              fontSize: 64,
              fontWeight: 700,
              color: "white",
              lineHeight: 1.1,
              textAlign: "center",
              letterSpacing: "-0.02em",
              display: "flex",
            }}
          >
            Open infrastructure
          </div>
          <div
            style={{
              fontSize: 64,
              fontWeight: 700,
              lineHeight: 1.1,
              textAlign: "center",
              letterSpacing: "-0.02em",
              display: "flex",
              background: "linear-gradient(90deg, #18794E, #40BF86)",
              backgroundClip: "text",
              color: "transparent",
            }}
          >
            for real-time AI video
          </div>
        </div>

        {/* Description */}
        <div
          style={{
            fontSize: 22,
            color: "rgba(255,255,255,0.5)",
            marginTop: 24,
            maxWidth: 600,
            textAlign: "center",
            lineHeight: 1.4,
            display: "flex",
          }}
        >
          Generate, transform, and interpret live video streams on an open elastic
          GPU network.
        </div>

        {/* Bottom bar */}
        <div
          style={{
            position: "absolute",
            bottom: 40,
            left: 60,
            right: 60,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <div
            style={{
              fontSize: 16,
              color: "rgba(255,255,255,0.3)",
              display: "flex",
              letterSpacing: "0.05em",
            }}
          >
            livepeer.org
          </div>
          <div
            style={{
              width: 40,
              height: 1,
              background:
                "linear-gradient(90deg, transparent, rgba(24,121,78,0.5), transparent)",
              display: "flex",
            }}
          />
        </div>
      </div>
    ),
    {
      ...size,
      fonts: [
        {
          name: "Favorit Pro",
          data: fontBold,
          weight: 700,
          style: "normal",
        },
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

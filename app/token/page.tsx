"use client";

import { useEffect, useRef } from "react";
import { motion, animate, useMotionValue, useMotionValueEvent } from "framer-motion";
import Container from "@/components/ui/Container";
import SectionHeader from "@/components/ui/SectionHeader";
import ImageMask from "@/components/ui/ImageMask";
import Button from "@/components/ui/Button";
import { EXTERNAL_LINKS } from "@/lib/constants";

/* ── Grid units matching brand page hero (9×5) ── */
const COLS = 9;
const TILE = 100 / COLS;
const RAYS = [0, 22, 45, 68, 90, 135, 170, -15, -40, -70];

const PULSE_PATH = [
  "M 100 100",
  "L 100 0",
  "L 750 0",
  "A 150 150 0 0 1 750 300",
  "L 100 300",
  "A 100 100 0 1 0 200 400",
  "L 200 100",
  "L 100 100",
].join(" ");

function HeroPulseTrail() {
  const dotRef = useRef<HTMLDivElement>(null);
  const pathRef = useRef<SVGPathElement>(null);
  const progress = useMotionValue(0);

  useEffect(() => {
    const timeout = setTimeout(() => {
      if (dotRef.current) dotRef.current.style.opacity = "0.8";
      animate(progress, 1, {
        duration: 20,
        ease: "linear",
        repeat: Infinity,
        repeatType: "loop",
      });
    }, 3000);
    return () => clearTimeout(timeout);
  }, [progress]);

  useMotionValueEvent(progress, "change", (v) => {
    const path = pathRef.current;
    const dot = dotRef.current;
    if (!path || !dot) return;
    const totalLength = path.getTotalLength();
    const point = path.getPointAtLength(v * totalLength);
    dot.style.left = `${(point.x / 100) * TILE}vw`;
    dot.style.top = `${(point.y / 100) * TILE}vw`;
  });

  return (
    <>
      <svg
        width="0"
        height="0"
        viewBox="0 0 900 500"
        style={{ position: "absolute", pointerEvents: "none" }}
        aria-hidden="true"
      >
        <path ref={pathRef} d={PULSE_PATH} />
      </svg>
      <div
        ref={dotRef}
        className="absolute h-1.5 w-1.5 -translate-x-1/2 -translate-y-1/2 rounded-full"
        style={{
          opacity: 0,
          background:
            "radial-gradient(circle, rgba(64,191,134,0.9), rgba(64,191,134,0.3) 60%, transparent 100%)",
          boxShadow: "0 0 6px 2px rgba(64,191,134,0.25)",
        }}
      />
    </>
  );
}

const fadeUp = {
  hidden: { opacity: 0, y: 12 },
  visible: { opacity: 1, y: 0 },
};

/* ── Token Flow Visualization ── */
const FC = {
  cardBg: "rgba(255,255,255,0.04)",
  cardBorder: "rgba(255,255,255,0.08)",
  cardBorderHover: "rgba(255,255,255,0.15)",
  green: "#00EB88",
  greenDim: "rgba(0, 235, 136, 0.08)",
  greenSoft: "rgba(0, 235, 136, 0.2)",
  greenGlow: "rgba(0, 235, 136, 0.4)",
  textPrimary: "rgba(255,255,255,0.92)",
  textSecondary: "rgba(255,255,255,0.55)",
  textTertiary: "rgba(255,255,255,0.3)",
};

function FlowNode({
  x,
  y,
  label,
  sublabel,
  number,
  isActive,
  width = 150,
  height = 64,
}: {
  x: number;
  y: number;
  label: string;
  sublabel: string;
  number: string;
  isActive: boolean;
  width?: number;
  height?: number;
}) {
  const r = 10;
  return (
    <g style={{ cursor: "pointer" }}>
      {isActive && (
        <rect
          x={x - width / 2 - 6}
          y={y - height / 2 - 6}
          width={width + 12}
          height={height + 12}
          rx={r + 4}
          ry={r + 4}
          fill="none"
          stroke={FC.green}
          strokeWidth="1"
          opacity="0.25"
        >
          <animate
            attributeName="opacity"
            values="0.15;0.3;0.15"
            dur="2.5s"
            repeatCount="indefinite"
          />
        </rect>
      )}
      <rect
        x={x - width / 2}
        y={y - height / 2}
        width={width}
        height={height}
        rx={r}
        ry={r}
        fill={isActive ? FC.greenDim : FC.cardBg}
        stroke={isActive ? FC.greenSoft : FC.cardBorder}
        strokeWidth="1"
      />
      <text
        x={x - width / 2 + 14}
        y={y - height / 2 + 18}
        fill={FC.green}
        fontSize="10"
        fontFamily="-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif"
        fontWeight="500"
        opacity="0.5"
      >
        {number}
      </text>
      <text
        x={x}
        y={y + 2}
        fill={isActive ? "#fff" : FC.textPrimary}
        fontSize="13"
        fontFamily="-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif"
        fontWeight="700"
        textAnchor="middle"
      >
        {label}
      </text>
      <text
        x={x}
        y={y + 18}
        fill={FC.textSecondary}
        fontSize="8.5"
        fontFamily="-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif"
        fontWeight="400"
        textAnchor="middle"
      >
        {sublabel}
      </text>
    </g>
  );
}

function TokenPacket({
  path,
  dur,
  delay,
  label,
  size = 3.5,
  color,
}: {
  path: string;
  dur: string;
  delay: string;
  label?: string;
  size?: number;
  color?: string;
}) {
  const c = color || FC.green;
  return (
    <g>
      <circle r={size + 4} fill={c} opacity="0.1" filter="url(#soft-glow)">
        <animateMotion
          dur={dur}
          begin={delay}
          repeatCount="indefinite"
          path={path}
        />
        <animate
          attributeName="opacity"
          values="0;0.15;0.15;0"
          dur={dur}
          begin={delay}
          repeatCount="indefinite"
        />
      </circle>
      <circle r={size} fill={c} opacity="0.85">
        <animateMotion
          dur={dur}
          begin={delay}
          repeatCount="indefinite"
          path={path}
        />
        <animate
          attributeName="opacity"
          values="0;0.9;0.9;0"
          dur={dur}
          begin={delay}
          repeatCount="indefinite"
        />
      </circle>
      <circle r={size * 0.35} fill="#fff" opacity="0.7">
        <animateMotion
          dur={dur}
          begin={delay}
          repeatCount="indefinite"
          path={path}
        />
        <animate
          attributeName="opacity"
          values="0;0.7;0.7;0"
          dur={dur}
          begin={delay}
          repeatCount="indefinite"
        />
      </circle>
      {label && (
        <text
          fontSize="6.5"
          fontFamily="-apple-system, sans-serif"
          fontWeight="600"
          fill={c}
          textAnchor="middle"
          dy="-10"
          opacity="0"
        >
          <animateMotion
            dur={dur}
            begin={delay}
            repeatCount="indefinite"
            path={path}
          />
          <animate
            attributeName="opacity"
            values="0;0.6;0.6;0"
            dur={dur}
            begin={delay}
            repeatCount="indefinite"
          />
          {label}
        </text>
      )}
    </g>
  );
}

function FlowPath({ d, dashed = false }: { d: string; dashed?: boolean }) {
  return (
    <path
      d={d}
      fill="none"
      stroke={FC.green}
      strokeWidth="1"
      opacity={dashed ? 0.15 : 0.2}
      strokeDasharray={dashed ? "5 5" : "none"}
      strokeLinecap="round"
    />
  );
}

function TokenFlowVisualization() {

  const flowNodes = [
    {
      id: 0,
      label: "Applications",
      sublabel: "Request video compute jobs",
      number: "01",
      x: 130,
      y: 130,
    },
    {
      id: 1,
      label: "Gateway Nodes",
      sublabel: "Route jobs to orchestrators",
      number: "02",
      x: 400,
      y: 130,
    },
    {
      id: 2,
      label: "Orchestrator Nodes",
      sublabel: "GPU clusters process work",
      number: "03",
      x: 670,
      y: 130,
      width: 170,
    },
    {
      id: 3,
      label: "Delegators",
      sublabel: "Stake LPT and earn fees",
      number: "04",
      x: 670,
      y: 290,
    },
  ];

  return (
    <div>
      <div className="overflow-hidden">
        <svg viewBox="0 0 800 370" className="block w-full">
          <defs>
            <filter id="soft-glow">
              <feGaussianBlur stdDeviation="5" />
            </filter>
            <marker
              id="arrow"
              markerWidth="7"
              markerHeight="5"
              refX="7"
              refY="2.5"
              orient="auto"
            >
              <polygon
                points="0 0, 7 2.5, 0 5"
                fill={FC.green}
                opacity="0.35"
              />
            </marker>
          </defs>

          {/* Applications → Gateways */}
          <FlowPath d="M205,130 L325,130" />
          <line
            x1="205"
            y1="130"
            x2="320"
            y2="130"
            stroke={FC.green}
            strokeWidth="1"
            opacity="0.2"
            markerEnd="url(#arrow)"
          />

          {/* Gateways → Orchestrators */}
          <FlowPath d="M475,130 L585,130" />
          <line
            x1="475"
            y1="130"
            x2="580"
            y2="130"
            stroke={FC.green}
            strokeWidth="1"
            opacity="0.2"
            markerEnd="url(#arrow)"
          />

          {/* Orchestrators → Delegators (fees down) */}
          <FlowPath d="M690,162 L690,258" />
          <line
            x1="690"
            y1="162"
            x2="690"
            y2="253"
            stroke={FC.green}
            strokeWidth="1"
            opacity="0.2"
            markerEnd="url(#arrow)"
          />

          {/* Delegators → Orchestrators (stake up, dashed) */}
          <FlowPath d="M650,258 L650,162" dashed={true} />
          <line
            x1="650"
            y1="258"
            x2="650"
            y2="167"
            stroke={FC.green}
            strokeWidth="1"
            opacity="0.15"
            markerEnd="url(#arrow)"
          />

          {/* Path labels */}
          <text
            x="265"
            y="121"
            fill={FC.green}
            fontSize="8"
            fontFamily="-apple-system, sans-serif"
            fontWeight="500"
            textAnchor="middle"
            opacity="0.35"
          >
            REQUESTS
          </text>
          <text
            x="530"
            y="121"
            fill={FC.green}
            fontSize="8"
            fontFamily="-apple-system, sans-serif"
            fontWeight="500"
            textAnchor="middle"
            opacity="0.35"
          >
            JOBS + PAYMENTS
          </text>
          <text
            x="705"
            y="212"
            fill={FC.green}
            fontSize="8"
            fontFamily="-apple-system, sans-serif"
            fontWeight="500"
            opacity="0.35"
            transform="rotate(90, 705, 212)"
          >
            FEES
          </text>
          <text
            x="635"
            y="212"
            fill={FC.green}
            fontSize="8"
            fontFamily="-apple-system, sans-serif"
            fontWeight="500"
            opacity="0.25"
            transform="rotate(-90, 635, 212)"
          >
            STAKE
          </text>

          {/* Animated packets */}
          <TokenPacket
            path="M205,130 L325,130"
            dur="2.2s"
            delay="0s"
            label="REQ"
          />
          <TokenPacket
            path="M205,130 L325,130"
            dur="2.2s"
            delay="1.1s"
            size={2.5}
          />
          <TokenPacket
            path="M475,130 L585,130"
            dur="2.2s"
            delay="0.4s"
            label="JOB"
          />
          <TokenPacket
            path="M475,130 L585,130"
            dur="2.2s"
            delay="1.5s"
            size={2.5}
          />
          <TokenPacket
            path="M690,162 L690,258"
            dur="3s"
            delay="0.2s"
            label="ETH"
            size={4}
          />
          <TokenPacket
            path="M650,258 L650,162"
            dur="3.5s"
            delay="1.2s"
            label="LPT"
            size={3}
            color="rgba(0, 235, 136, 0.5)"
          />

          {/* Nodes */}
          {flowNodes.map((n) => (
            <FlowNode
              key={n.id}
              x={n.x}
              y={n.y}
              label={n.label}
              sublabel={n.sublabel}
              number={n.number}
              isActive={false}
              width={(n as { width?: number }).width || 150}
            />
          ))}

          {/* Ambient particles */}
          {Array.from({ length: 10 }).map((_, i) => (
            <circle
              key={`p-${i}`}
              cx={80 + ((i * 71) % 640)}
              cy={40 + ((i * 31) % 290)}
              r="1"
              fill={FC.green}
              opacity="0"
            >
              <animate
                attributeName="opacity"
                values="0;0.2;0"
                dur={`${4 + (i % 4)}s`}
                begin={`${(i * 0.6) % 6}s`}
                repeatCount="indefinite"
              />
            </circle>
          ))}
        </svg>
      </div>
    </div>
  );
}

function BinanceLogo({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 126 126" fill="#F0B90B">
      <path d="M38.4 53.6L63 29l24.6 24.6 14.3-14.3L63 .6 24.1 39.3l14.3 14.3zM.6 63l14.3-14.3L29.2 63 14.9 77.3.6 63zm37.8 9.4L63 97l24.6-24.6 14.3 14.3L63 125.4 24.1 86.7l14.3-14.3zM96.8 63l14.3-14.3L125.4 63l-14.3 14.3L96.8 63z" />
      <path d="M77.5 63L63 48.5 52.2 59.3l-1.2 1.2L48.5 63 63 77.5 77.5 63z" />
    </svg>
  );
}

function CoinbaseLogo({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 1024 1024" fill="#0052FF">
      <path d="M512 0C229.2 0 0 229.2 0 512s229.2 512 512 512 512-229.2 512-512S794.8 0 512 0zm0 716.8c-113.1 0-204.8-91.7-204.8-204.8S398.9 307.2 512 307.2 716.8 398.9 716.8 512 625.1 716.8 512 716.8z" />
    </svg>
  );
}

function KrakenLogo({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 42 32" fill="#5741d9">
      <path d="M20.9964832,0 C9.39735269,0 0,9.11917531 0,20.3663948 L0,29.0927818 C0,30.6995672 1.34340172,32 2.99584756,32 C4.65059006,32 6.00102529,30.6995672 6.00102529,29.0927818 L6.00102529,20.3663948 C6.00102529,18.7575216 7.33753704,17.4547226 8.99916951,17.4547226 C10.653912,17.4547226 11.9974573,18.7575216 11.9974573,20.3663948 L11.9974573,29.0927818 C11.9974573,30.6995672 13.340859,32 14.9956015,32 C16.6549373,32 17.998339,30.6995672 17.998339,29.0927818 L17.998339,20.3663948 C17.998339,18.7575216 19.3418843,17.4547226 20.9964832,17.4547226 C22.6581157,17.4547226 24.001661,18.7575216 24.001661,20.3663948 L24.001661,29.0927818 C24.001661,30.6995672 25.3450627,32 26.9975085,32 C28.652251,32 29.9956528,30.6995672 29.9956528,29.0927818 L29.9956528,20.3663948 C29.9956528,18.7575216 31.339198,17.4547226 33.0008305,17.4547226 C34.655573,17.4547226 35.9991182,18.7575216 35.9991182,20.3663948 L35.9991182,29.0927818 C35.9991182,30.6995672 37.34252,32 39.0018558,32 C40.6565983,32 42,30.6995672 42,29.0927818 L42,20.3663948 C42,9.11917531 32.5957573,0 20.9964832,0" />
    </svg>
  );
}

function UniswapLogo({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 641 640" fill="none">
      <path d="M224.534 123.226C218.692 122.32 218.445 122.213 221.195 121.791C226.464 120.98 238.905 122.085 247.479 124.123C267.494 128.881 285.707 141.069 305.148 162.714L310.313 168.465L317.701 167.277C348.828 162.275 380.493 166.25 406.978 178.485C414.264 181.851 425.752 188.552 427.187 190.274C427.645 190.822 428.485 194.355 429.053 198.124C431.02 211.164 430.036 221.16 426.047 228.625C423.877 232.688 423.756 233.975 425.215 237.452C426.38 240.227 429.627 242.28 432.843 242.276C439.425 242.267 446.509 231.627 449.791 216.823L451.095 210.943L453.678 213.868C467.846 229.92 478.974 251.811 480.885 267.393L481.383 271.455L479.002 267.762C474.903 261.407 470.785 257.08 465.512 253.591C456.006 247.301 445.955 245.161 419.337 243.758C395.296 242.491 381.69 240.438 368.198 236.038C345.244 228.554 333.672 218.587 306.405 182.812C294.294 166.923 286.808 158.131 279.362 151.051C262.442 134.964 245.816 126.527 224.534 123.226Z" fill="#FF007A"/>
      <path d="M432.61 158.704C433.215 148.057 434.659 141.033 437.562 134.62C438.711 132.081 439.788 130.003 439.954 130.003C440.12 130.003 439.621 131.877 438.844 134.167C436.733 140.392 436.387 148.905 437.84 158.811C439.686 171.379 440.735 173.192 454.019 186.769C460.25 193.137 467.497 201.168 470.124 204.616L474.901 210.886L470.124 206.405C464.282 200.926 450.847 190.24 447.879 188.712C445.89 187.688 445.594 187.705 444.366 188.927C443.235 190.053 442.997 191.744 442.84 199.741C442.596 212.204 440.897 220.204 436.797 228.203C434.58 232.529 434.23 231.606 436.237 226.723C437.735 223.077 437.887 221.474 437.876 209.408C437.853 185.167 434.975 179.339 418.097 169.355C413.821 166.826 406.776 163.178 402.442 161.249C398.107 159.32 394.664 157.639 394.789 157.514C395.267 157.038 411.727 161.842 418.352 164.39C428.206 168.181 429.833 168.672 431.03 168.215C431.832 167.909 432.22 165.572 432.61 158.704Z" fill="#FF007A"/>
      <path d="M235.883 200.175C224.022 183.846 216.684 158.809 218.272 140.093L218.764 134.301L221.463 134.794C226.534 135.719 235.275 138.973 239.369 141.459C250.602 148.281 255.465 157.263 260.413 180.328C261.862 187.083 263.763 194.728 264.638 197.317C266.047 201.483 271.369 211.214 275.696 217.534C278.813 222.085 276.743 224.242 269.853 223.62C259.331 222.67 245.078 212.834 235.883 200.175Z" fill="#FF007A"/>
      <path d="M418.223 321.707C362.793 299.389 343.271 280.017 343.271 247.331C343.271 242.521 343.437 238.585 343.638 238.585C343.84 238.585 345.985 240.173 348.404 242.113C359.644 251.128 372.231 254.979 407.076 260.062C427.58 263.054 439.119 265.47 449.763 269C483.595 280.22 504.527 302.99 509.518 334.004C510.969 343.016 510.118 359.915 507.766 368.822C505.91 375.857 500.245 388.537 498.742 389.023C498.325 389.158 497.917 387.562 497.81 385.389C497.24 373.744 491.355 362.406 481.472 353.913C470.235 344.257 455.137 336.569 418.223 321.707Z" fill="#FF007A"/>
      <path d="M379.31 330.978C378.615 326.846 377.411 321.568 376.633 319.25L375.219 315.036L377.846 317.985C381.481 322.065 384.354 327.287 386.789 334.241C388.647 339.549 388.856 341.127 388.842 349.753C388.828 358.221 388.596 359.996 386.88 364.773C384.174 372.307 380.816 377.649 375.181 383.383C365.056 393.688 352.038 399.393 333.253 401.76C329.987 402.171 320.47 402.864 312.103 403.299C291.016 404.395 277.138 406.661 264.668 411.04C262.875 411.67 261.274 412.052 261.112 411.89C260.607 411.388 269.098 406.326 276.111 402.948C285.999 398.185 295.842 395.586 317.897 391.913C328.792 390.098 340.043 387.897 342.9 387.021C369.88 378.749 383.748 357.402 379.31 330.978Z" fill="#FF007A"/>
      <path d="M404.719 376.105C397.355 360.273 395.664 344.988 399.698 330.732C400.13 329.209 400.824 327.962 401.242 327.962C401.659 327.962 403.397 328.902 405.103 330.05C408.497 332.335 415.303 336.182 433.437 346.069C456.065 358.406 468.966 367.959 477.74 378.873C485.423 388.432 490.178 399.318 492.467 412.593C493.762 420.113 493.003 438.206 491.074 445.778C484.99 469.653 470.85 488.406 450.682 499.349C447.727 500.952 445.075 502.269 444.788 502.275C444.501 502.28 445.577 499.543 447.18 496.191C453.965 482.009 454.737 468.214 449.608 452.859C446.467 443.457 440.064 431.985 427.135 412.596C412.103 390.054 408.417 384.054 404.719 376.105Z" fill="#FF007A"/>
      <path d="M196.519 461.525C217.089 444.157 242.682 431.819 265.996 428.032C276.043 426.399 292.78 427.047 302.084 429.428C316.998 433.245 330.338 441.793 337.276 451.978C344.057 461.932 346.966 470.606 349.995 489.906C351.189 497.519 352.489 505.164 352.882 506.895C355.156 516.897 359.583 524.892 365.067 528.907C373.779 535.283 388.78 535.68 403.536 529.924C406.041 528.947 408.215 528.271 408.368 528.424C408.903 528.955 401.473 533.93 396.23 536.548C389.177 540.071 383.568 541.434 376.115 541.434C362.6 541.434 351.379 534.558 342.016 520.539C340.174 517.78 336.032 509.516 332.813 502.176C322.928 479.628 318.046 472.759 306.568 465.242C296.579 458.701 283.697 457.53 274.006 462.282C261.276 468.523 257.724 484.791 266.842 495.101C270.465 499.198 277.223 502.732 282.749 503.419C293.086 504.705 301.97 496.841 301.97 486.404C301.97 479.627 299.365 475.76 292.808 472.801C283.852 468.76 274.226 473.483 274.272 481.897C274.292 485.484 275.854 487.737 279.45 489.364C281.757 490.408 281.811 490.491 279.929 490.1C271.712 488.396 269.787 478.49 276.394 471.913C284.326 464.018 300.729 467.502 306.362 478.279C308.728 482.805 309.003 491.82 306.94 497.264C302.322 509.448 288.859 515.855 275.201 512.368C265.903 509.994 262.117 507.424 250.906 495.876C231.425 475.809 223.862 471.92 195.777 467.536L190.395 466.696L196.519 461.525Z" fill="#FF007A"/>
      <path fillRule="evenodd" clipRule="evenodd" d="M49.6202 12.0031C114.678 90.9638 214.977 213.901 219.957 220.784C224.068 226.467 222.521 231.576 215.478 235.58C211.561 237.807 203.508 240.063 199.476 240.063C194.916 240.063 189.779 237.867 186.038 234.318C183.393 231.81 172.721 215.874 148.084 177.646C129.233 148.396 113.457 124.131 113.027 123.725C112.032 122.785 112.049 122.817 146.162 183.854C167.582 222.181 174.813 235.731 174.813 237.543C174.813 241.229 173.808 243.166 169.261 248.238C161.681 256.694 158.293 266.195 155.847 285.859C153.104 307.902 145.394 323.473 124.026 350.122C111.518 365.722 109.471 368.581 106.315 374.869C102.339 382.786 101.246 387.221 100.803 397.219C100.335 407.79 101.247 414.619 104.477 424.726C107.304 433.575 110.255 439.417 117.8 451.104C124.311 461.188 128.061 468.683 128.061 471.614C128.061 473.947 128.506 473.95 138.596 471.672C162.741 466.219 182.348 456.629 193.375 444.877C200.199 437.603 201.801 433.586 201.853 423.618C201.887 417.098 201.658 415.733 199.896 411.982C197.027 405.877 191.804 400.801 180.292 392.932C165.209 382.621 158.767 374.32 156.987 362.904C155.527 353.537 157.221 346.928 165.565 329.44C174.202 311.338 176.342 303.624 177.79 285.378C178.725 273.589 180.02 268.94 183.407 265.209C186.939 261.317 190.119 260 198.861 258.805C213.113 256.858 222.188 253.171 229.648 246.297C236.119 240.334 238.827 234.588 239.243 225.938L239.558 219.382L235.942 215.166C222.846 199.896 40.85 0 40.044 0C39.8719 0 44.1813 5.40178 49.6202 12.0031ZM135.412 409.18C138.373 403.937 136.8 397.195 131.847 393.902C127.167 390.79 119.897 392.256 119.897 396.311C119.897 397.548 120.582 398.449 122.124 399.243C124.72 400.579 124.909 402.081 122.866 405.152C120.797 408.262 120.964 410.996 123.337 412.854C127.162 415.849 132.576 414.202 135.412 409.18Z" fill="#FF007A"/>
      <path fillRule="evenodd" clipRule="evenodd" d="M248.552 262.244C241.862 264.299 235.358 271.39 233.344 278.826C232.116 283.362 232.813 291.319 234.653 293.776C237.625 297.745 240.499 298.791 248.282 298.736C263.518 298.63 276.764 292.095 278.304 283.925C279.567 277.229 273.749 267.948 265.736 263.874C261.601 261.772 252.807 260.938 248.552 262.244ZM266.364 276.172C268.714 272.834 267.686 269.225 263.69 266.785C256.08 262.138 244.571 265.983 244.571 273.173C244.571 276.752 250.572 280.656 256.074 280.656C259.735 280.656 264.746 278.473 266.364 276.172Z" fill="#FF007A"/>
    </svg>
  );
}

function OKXLogo({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 32 32" fill="white">
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

const exchanges = [
  {
    name: "Binance",
    href: "https://www.binance.com/en/trade/LPT_USDT",
    Logo: BinanceLogo,
  },
  {
    name: "Coinbase",
    href: "https://www.coinbase.com/price/livepeer",
    Logo: CoinbaseLogo,
  },
  {
    name: "Kraken",
    href: "https://www.kraken.com/prices/livepeer",
    Logo: KrakenLogo,
  },
  {
    name: "Uniswap",
    href: "https://app.uniswap.org/tokens/ethereum/0x58b6a8a3302369daec383334672404ee733ab239",
    Logo: UniswapLogo,
  },
  {
    name: "OKX",
    href: "https://www.okx.com/trade-spot/lpt-usdt",
    Logo: OKXLogo,
  },
];

export default function TokenPage() {
  return (
    <>
      {/* Hero — brand page treatment */}
      <section className="relative flex min-h-[70vh] items-center overflow-hidden">
        {/* Full-bleed ImageMask */}
        <div className="absolute inset-0">
          <ImageMask
            className="h-full w-full"
            cols={COLS}
            rows={20}
            seed={13}
            scanLine={false}
          >
            <div
              className="h-full w-full"
              style={{
                background:
                  "linear-gradient(160deg, #030d09 0%, #0a2818 40%, #18794e 100%)",
              }}
            />
          </ImageMask>
        </div>

        {/* Geometric shapes + pulse trail */}
        <div
          className="pointer-events-none absolute inset-0"
          aria-hidden="true"
        >
          {/* Large circle — cols 6–8, rows 0–2 */}
          <div
            className="absolute rounded-full animate-[breathe_8s_ease-in-out_infinite]"
            style={{
              left: `${6 * TILE}vw`,
              top: "0vw",
              width: `${3 * TILE}vw`,
              aspectRatio: "1 / 1",
              border: "1px solid rgba(255,255,255,0.15)",
            }}
          />

          {/* Small circle — cols 0–1, rows 3–4 */}
          <div
            className="absolute rounded-full animate-[breathe_8s_ease-in-out_infinite_3s]"
            style={{
              left: "0vw",
              top: `${3 * TILE}vw`,
              width: `${2 * TILE}vw`,
              aspectRatio: "1 / 1",
              border: "1px solid rgba(255,255,255,0.10)",
            }}
          />

          {/* Starburst — (col 1, row 1) */}
          <div
            className="absolute rounded-full animate-[node-pulse_6s_ease-in-out_infinite]"
            style={{
              left: `calc(${1 * TILE}vw - 20px)`,
              top: `calc(${1 * TILE}vw - 20px)`,
              width: "40px",
              height: "40px",
              background:
                "radial-gradient(circle, rgba(64,191,134,0.25) 0%, rgba(64,191,134,0.08) 40%, transparent 70%)",
            }}
          />
          {RAYS.map((angle, i) => (
            <div
              key={`hero-ray-${i}`}
              className="absolute"
              style={{
                left: `${1 * TILE}vw`,
                top: `${1 * TILE}vw`,
                width: "40%",
                height: "1px",
                background:
                  "linear-gradient(to right, rgba(255,255,255,0.12), rgba(255,255,255,0.03) 35%, transparent 70%)",
                transformOrigin: "0% 50%",
                transform: `rotate(${angle}deg)`,
              }}
            />
          ))}

          {/* V-line — col 7 seam, rows 3–5 */}
          <div
            className="absolute"
            style={{
              left: `${7 * TILE}vw`,
              top: `${3 * TILE}vw`,
              width: "1px",
              height: `${2 * TILE}vw`,
              background:
                "linear-gradient(to bottom, rgba(255,255,255,0.10), transparent 100%)",
            }}
          />

          {/* Crosshair — (col 6, row 4) */}
          <div
            className="absolute"
            style={{
              left: `${6 * TILE}vw`,
              top: `${4 * TILE}vw`,
            }}
          >
            <div
              style={{
                position: "absolute",
                left: "-6px",
                top: "-0.5px",
                width: "13px",
                height: "1px",
                background: "rgba(255,255,255,0.12)",
              }}
            />
            <div
              style={{
                position: "absolute",
                left: "-0.5px",
                top: "-6px",
                width: "1px",
                height: "13px",
                background: "rgba(255,255,255,0.12)",
              }}
            />
          </div>

          {/* Pulse trail */}
          <HeroPulseTrail />
        </div>

        {/* Center darken for text readability */}
        <div
          className="pointer-events-none absolute inset-0 lg:hidden"
          style={{
            background:
              "radial-gradient(ellipse 90% 60% at 50% 48%, rgba(4,6,5,0.88) 0%, rgba(4,6,5,0.5) 70%, transparent 100%)",
          }}
        />
        <div
          className="pointer-events-none absolute inset-0 hidden lg:block"
          style={{
            background:
              "radial-gradient(ellipse 60% 50% at 50% 48%, rgba(4,6,5,0.78) 0%, rgba(4,6,5,0.35) 70%, transparent 100%)",
          }}
        />

        <Container className="relative z-10 py-24 lg:py-32">
          <motion.div
            className="mx-auto max-w-3xl text-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
          >
            <p className="mb-3 font-mono text-sm font-medium tracking-wider text-white/40 uppercase">
              Livepeer Token
            </p>
            <h1 className="text-4xl font-bold leading-tight tracking-tight sm:text-5xl lg:text-7xl lg:leading-[1.1]">
              The token that powers the network
            </h1>
            <p className="mt-6 text-lg text-white/60">
              Livepeer Token (LPT) is part of the coordination mechanism behind
              the Livepeer network. It aligns incentives between the GPU
              providers who do the work, the applications that need video
              processing, and the stakeholders who help secure the network.
            </p>
            <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
              <Button href="#exchanges" variant="primary">
                Find an Exchange
              </Button>
            </div>
          </motion.div>
        </Container>

        {/* Bottom fade to page bg */}
        <div
          className="pointer-events-none absolute bottom-0 left-0 right-0 h-48"
          aria-hidden="true"
          style={{
            background: "linear-gradient(to bottom, transparent, #121212)",
          }}
        />
      </section>

      {/* What is LPT */}
      <section className="relative py-24 lg:py-32">
        <Container>
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            transition={{ staggerChildren: 0.06 }}
          >
            <motion.div variants={fadeUp} transition={{ duration: 0.4 }}>
              <SectionHeader
                label="What is LPT"
                title="Essential network infrastructure"
                align="split"
                description="LPT keeps the network honest and efficient. GPU providers stake LPT as a commitment to do reliable work. Delegators back trusted providers with LPT and earn a share of the fees the network generates. The more LPT staked to a provider, the more work that provider receives."
              />
            </motion.div>
          </motion.div>
        </Container>
      </section>

      {/* Network Architecture */}
      <section className="relative py-24 lg:py-32">
        <div className="divider-gradient absolute top-0 left-0 right-0" />
        <Container>
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            transition={{ staggerChildren: 0.06 }}
          >
            <motion.div variants={fadeUp} transition={{ duration: 0.4 }}>
              <SectionHeader
                label="Network Architecture"
                title="How LPT flows through the network"
                align="split"
                description="The Livepeer protocol coordinates video compute work across applications, gateways, and orchestrators — with LPT staking determining which orchestrators get selected, and ETH fees flowing as payment for work performed."
              />
            </motion.div>

            {/* Interactive flow visualization */}
            <motion.div
              variants={fadeUp}
              transition={{ duration: 0.4 }}
              className="mt-10"
            >
              <TokenFlowVisualization />
            </motion.div>
          </motion.div>
        </Container>
      </section>

      {/* Exchanges */}
      <section id="exchanges" className="relative py-24 lg:py-32">
        <div className="divider-gradient absolute top-0 left-0 right-0" />
        <Container>
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            transition={{ staggerChildren: 0.06 }}
          >
            <motion.div variants={fadeUp} transition={{ duration: 0.4 }}>
              <SectionHeader
                label="Exchanges"
                title="Get Livepeer Token"
                align="center"
              />
            </motion.div>

            <div className="mt-16 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
              {exchanges.map((exchange) => (
                <motion.a
                  key={exchange.name}
                  href={exchange.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  variants={fadeUp}
                  transition={{ duration: 0.4 }}
                  className="group flex flex-col items-center gap-4 rounded-xl border border-white/[0.07] bg-[#1a1a1a] px-6 py-7 transition-all duration-200 hover:border-white/[0.15] hover:bg-[#1e1e1e]"
                >
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/[0.06] transition-colors group-hover:bg-white/[0.1]">
                    <exchange.Logo className="h-5 w-5" />
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-[14px] font-medium text-white/80 group-hover:text-white">
                      {exchange.name}
                    </span>
                    <svg
                      className="h-3 w-3 text-white/20 transition-all group-hover:text-white/40 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                      fill="none"
                      viewBox="0 0 12 12"
                      stroke="currentColor"
                      strokeWidth="1.5"
                    >
                      <path
                        d="M3.5 2H10v6.5M10 2L2 10"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </div>
                </motion.a>
              ))}
            </div>

          </motion.div>
        </Container>
      </section>

      {/* Delegate LPT */}
      <section className="relative py-24 lg:py-32">
        <div className="divider-gradient absolute top-0 left-0 right-0" />
        <Container>
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            transition={{ staggerChildren: 0.06 }}
          >
            <motion.div variants={fadeUp} transition={{ duration: 0.4 }}>
              <SectionHeader
                label="Delegate"
                title="Earn rewards by staking LPT"
                description="Back GPU providers you trust with your LPT and earn a share of the fees and inflation rewards they generate."
                align="center"
              />
            </motion.div>

            {/* CTA */}
            <motion.div
              variants={fadeUp}
              transition={{ duration: 0.4 }}
              className="mt-10 flex justify-center"
            >
              <Button href={EXTERNAL_LINKS.explorer} variant="primary">
                Open Explorer
                <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 12 12" stroke="currentColor" strokeWidth="1.5">
                  <path d="M3.5 2H10v6.5M10 2L2 10" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </Button>
            </motion.div>
          </motion.div>
        </Container>
      </section>
    </>
  );
}

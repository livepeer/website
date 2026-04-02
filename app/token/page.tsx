"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Container from "@/components/ui/Container";
import SectionHeader from "@/components/ui/SectionHeader";
import Button from "@/components/ui/Button";
import { EXTERNAL_LINKS } from "@/lib/constants";

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
  const [activeNode, setActiveNode] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    if (isPaused) return;
    const id = setInterval(() => setActiveNode((n) => (n + 1) % 5), 3000);
    return () => clearInterval(id);
  }, [isPaused]);

  const flowNodes = [
    {
      id: 0,
      label: "Applications",
      sublabel: "Request video compute jobs",
      number: "01",
      x: 130,
      y: 85,
    },
    {
      id: 1,
      label: "Gateway Nodes",
      sublabel: "Route jobs to orchestrators",
      number: "02",
      x: 400,
      y: 85,
    },
    {
      id: 2,
      label: "Orchestrator Nodes",
      sublabel: "GPU clusters process work",
      number: "03",
      x: 670,
      y: 85,
    },
    {
      id: 3,
      label: "Delegators",
      sublabel: "Stake LPT for network security",
      number: "04",
      x: 670,
      y: 275,
    },
    {
      id: 4,
      label: "Micropayments",
      sublabel: "Ticket-based payment settlement",
      number: "05",
      x: 400,
      y: 275,
    },
  ];

  const descriptions = [
    "Apps send video compute requests through Livepeer network endpoints.",
    "Gateways receive jobs from apps and route them to available orchestrators.",
    "Orchestrators perform transcoding and AI processing on GPU clusters.",
    "Delegators stake LPT to orchestrators, earning fees and rewards.",
    "Gateways pay orchestrators via probabilistic micropayment tickets.",
  ];

  return (
    <div>
      {/* Active description bar */}
      <div className="mb-5 flex items-center gap-3.5 rounded-xl border border-white/[0.08] bg-white/[0.04] px-5 py-3.5">
        <div
          className="h-2 w-2 flex-shrink-0 rounded-full bg-[#00EB88]"
          style={{ boxShadow: `0 0 8px ${FC.greenGlow}` }}
        />
        <div className="flex-1 text-[13px] leading-relaxed text-white/90">
          {descriptions[activeNode]}
        </div>
        <button
          onClick={() => setIsPaused(!isPaused)}
          className="flex-shrink-0 rounded-lg border border-white/[0.08] px-3.5 py-1.5 text-[11px] font-medium text-white/55 transition-colors hover:border-white/[0.15]"
        >
          {isPaused ? "Play" : "Pause"}
        </button>
      </div>

      {/* SVG visualization */}
      <div className="overflow-hidden rounded-2xl border border-white/[0.08] bg-white/[0.04]">
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
            <radialGradient id="center-glow" cx="50%" cy="50%" r="35%">
              <stop offset="0%" stopColor={FC.green} stopOpacity="0.03" />
              <stop offset="100%" stopColor={FC.green} stopOpacity="0" />
            </radialGradient>
          </defs>

          <ellipse
            cx="400"
            cy="180"
            rx="250"
            ry="140"
            fill="url(#center-glow)"
          />

          {/* Paths */}
          <FlowPath d="M205,85 L325,85" />
          <line
            x1="205"
            y1="85"
            x2="320"
            y2="85"
            stroke={FC.green}
            strokeWidth="1"
            opacity="0.2"
            markerEnd="url(#arrow)"
          />
          <FlowPath d="M475,85 L595,85" />
          <line
            x1="475"
            y1="85"
            x2="590"
            y2="85"
            stroke={FC.green}
            strokeWidth="1"
            opacity="0.2"
            markerEnd="url(#arrow)"
          />
          <FlowPath d="M670,117 L670,243" />
          <line
            x1="670"
            y1="117"
            x2="670"
            y2="238"
            stroke={FC.green}
            strokeWidth="1"
            opacity="0.2"
            markerEnd="url(#arrow)"
          />
          <FlowPath d="M650,243 L650,117" dashed={true} />
          <FlowPath d="M400,117 L400,243" />
          <line
            x1="400"
            y1="117"
            x2="400"
            y2="238"
            stroke={FC.green}
            strokeWidth="1"
            opacity="0.2"
            markerEnd="url(#arrow)"
          />
          <FlowPath d="M475,275 L595,275" />
          <line
            x1="475"
            y1="275"
            x2="590"
            y2="275"
            stroke={FC.green}
            strokeWidth="1"
            opacity="0.2"
            markerEnd="url(#arrow)"
          />

          {/* Path labels */}
          <text
            x="265"
            y="76"
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
            x="535"
            y="76"
            fill={FC.green}
            fontSize="8"
            fontFamily="-apple-system, sans-serif"
            fontWeight="500"
            textAnchor="middle"
            opacity="0.35"
          >
            JOBS
          </text>
          <text
            x="685"
            y="183"
            fill={FC.green}
            fontSize="8"
            fontFamily="-apple-system, sans-serif"
            fontWeight="500"
            opacity="0.35"
            transform="rotate(90, 685, 183)"
          >
            REWARDS
          </text>
          <text
            x="635"
            y="183"
            fill={FC.green}
            fontSize="8"
            fontFamily="-apple-system, sans-serif"
            fontWeight="500"
            opacity="0.25"
            transform="rotate(-90, 635, 183)"
          >
            STAKE
          </text>
          <text
            x="415"
            y="183"
            fill={FC.green}
            fontSize="8"
            fontFamily="-apple-system, sans-serif"
            fontWeight="500"
            opacity="0.35"
            transform="rotate(90, 415, 183)"
          >
            TICKETS
          </text>
          <text
            x="535"
            y="266"
            fill={FC.green}
            fontSize="8"
            fontFamily="-apple-system, sans-serif"
            fontWeight="500"
            textAnchor="middle"
            opacity="0.35"
          >
            SETTLEMENT
          </text>

          {/* Center label */}
          <text
            x="400"
            y="178"
            fill={FC.green}
            fontSize="10"
            fontFamily="-apple-system, sans-serif"
            fontWeight="600"
            textAnchor="middle"
            opacity="0.25"
            letterSpacing="0.08em"
          >
            LPT COORDINATION
          </text>
          <text
            x="400"
            y="194"
            fill={FC.textTertiary}
            fontSize="8"
            fontFamily="-apple-system, sans-serif"
            textAnchor="middle"
            opacity="0.5"
          >
            Token secures every layer
          </text>

          {/* Animated packets */}
          <TokenPacket
            path="M205,85 L325,85"
            dur="2.2s"
            delay="0s"
            label="REQ"
          />
          <TokenPacket
            path="M205,85 L325,85"
            dur="2.2s"
            delay="1.1s"
            size={2.5}
          />
          <TokenPacket
            path="M475,85 L595,85"
            dur="2.2s"
            delay="0.4s"
            label="JOB"
          />
          <TokenPacket
            path="M475,85 L595,85"
            dur="2.2s"
            delay="1.5s"
            size={2.5}
          />
          <TokenPacket
            path="M670,117 L670,243"
            dur="3s"
            delay="0.2s"
            label="LPT"
            size={4}
          />
          <TokenPacket
            path="M650,243 L650,117"
            dur="3.5s"
            delay="1.2s"
            label="STAKE"
            size={3}
            color="rgba(0, 235, 136, 0.5)"
          />
          <TokenPacket
            path="M400,117 L400,243"
            dur="2.8s"
            delay="0.3s"
            label="ETH"
          />
          <TokenPacket
            path="M400,117 L400,243"
            dur="2.8s"
            delay="1.6s"
            size={2.5}
          />
          <TokenPacket
            path="M475,275 L595,275"
            dur="2.5s"
            delay="0.7s"
            label="PAY"
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
              isActive={activeNode === n.id}
              width={n.id === 2 || n.id === 4 ? 170 : 150}
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

      {/* Node selector tabs */}
      <div className="mt-3 grid grid-cols-5 gap-2">
        {flowNodes.map((node, i) => (
          <button
            key={node.id}
            onClick={() => {
              setActiveNode(i);
              setIsPaused(true);
            }}
            className={`rounded-xl border px-3 py-3.5 text-left transition-all duration-200 ${
              activeNode === i
                ? "border-[rgba(0,235,136,0.2)] bg-[rgba(0,235,136,0.08)]"
                : "border-white/[0.08] bg-white/[0.04] hover:border-white/[0.15]"
            }`}
          >
            <div className="font-mono text-[10px] font-medium text-[#00EB88]/50 mb-1.5">
              {node.number}
            </div>
            <div
              className={`text-[12px] font-semibold leading-tight ${
                activeNode === i ? "text-white" : "text-white/55"
              }`}
            >
              {node.label}
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}

const exchanges = [
  { name: "Binance", href: "https://www.binance.com/en/trade/LPT_USDT" },
  { name: "Coinbase", href: "https://www.coinbase.com/price/livepeer" },
  { name: "Kraken", href: "https://www.kraken.com/prices/livepeer" },
  {
    name: "Uniswap",
    href: "https://app.uniswap.org/tokens/ethereum/0x58b6a8a3302369daec383334672404ee733ab239",
  },
  { name: "OKX", href: "https://www.okx.com/trade-spot/lpt-usdt" },
];

export default function TokenPage() {
  return (
    <>
      {/* Hero */}
      <section className="relative pt-32 pb-20 lg:pt-44 lg:pb-28">
        <Container>
          <motion.div
            initial="hidden"
            animate="visible"
            transition={{ staggerChildren: 0.08 }}
            className="mx-auto max-w-3xl text-center"
          >
            <motion.p
              variants={fadeUp}
              transition={{ duration: 0.4 }}
              className="mb-4 font-mono text-xs font-medium tracking-wider text-white/30 uppercase"
            >
              Livepeer Token
            </motion.p>
            <motion.h1
              variants={fadeUp}
              transition={{ duration: 0.5 }}
              className="text-4xl font-bold tracking-tight text-balance sm:text-5xl lg:text-6xl"
            >
              The token that powers the network
            </motion.h1>
            <motion.p
              variants={fadeUp}
              transition={{ duration: 0.5 }}
              className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-white/50 text-pretty"
            >
              Livepeer Token (LPT) is part of the coordination mechanism behind the
              Livepeer network. It aligns incentives between the GPU providers
              who do the work, the applications that need video processing, and
              the stakeholders who help secure the network.
            </motion.p>
            <motion.div
              variants={fadeUp}
              transition={{ duration: 0.4 }}
              className="mt-8 flex flex-wrap items-center justify-center gap-3"
            >
              <Button href="#exchanges" variant="primary">
                Find an Exchange
              </Button>
            </motion.div>
          </motion.div>
        </Container>
      </section>

      {/* What is LPT */}
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
                description="The Livepeer protocol coordinates work between applications, gateways, orchestrators, and delegators, with LPT as the coordination mechanism at every layer."
              />
            </motion.div>

            {/* Interactive flow visualization */}
            <motion.div
              variants={fadeUp}
              transition={{ duration: 0.4 }}
              className="mt-20"
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
                align="split"
              />
            </motion.div>

            <div className="mt-16 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {exchanges.map((exchange) => (
                <motion.a
                  key={exchange.name}
                  href={exchange.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  variants={fadeUp}
                  transition={{ duration: 0.4 }}
                  className="group flex items-center justify-between rounded-xl border border-white/[0.07] bg-[#1a1a1a] px-6 py-5 transition-colors duration-200 hover:border-white/[0.12]"
                >
                  <span className="text-[15px] font-medium text-white/90">
                    {exchange.name}
                  </span>
                  <span className="flex items-center gap-1 text-[13px] font-medium text-green-bright transition-colors group-hover:text-green-light">
                    Explore
                    <svg
                      className="h-3 w-3 text-white/30"
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
                  </span>
                </motion.a>
              ))}
            </div>

            {/* Delegate LPT */}
            <motion.div
              variants={fadeUp}
              transition={{ duration: 0.4 }}
              className="mt-16 flex flex-col items-start gap-4 rounded-xl border border-white/[0.07] bg-[#1a1a1a] px-6 py-6 sm:flex-row sm:items-center sm:justify-between"
            >
              <div>
                <h3 className="text-[15px] font-medium text-white/90">
                  Delegate LPT
                </h3>
                <p className="mt-1 text-[13px] leading-relaxed text-white/40">
                  Delegators back GPU providers with LPT and earn a share of the
                  fees those providers generate.
                </p>
              </div>
              <Button href={EXTERNAL_LINKS.explorer} variant="secondary">
                Open Explorer
              </Button>
            </motion.div>
          </motion.div>
        </Container>
      </section>
    </>
  );
}

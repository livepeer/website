"use client";

import { useState, useCallback, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Flame,
  Snowflake,
  Star,
  Copy,
  Check,
  Shield,
  ExternalLink,
  BarChart3,
  Play,
  Code,
  FileText,
  Clock,
  Server,
  ArrowUpRight,
} from "lucide-react";
import { LivepeerWordmark } from "@/components/icons/LivepeerLogo";
import { MODELS } from "@/lib/studio/mock-data";
import { getModelIcon, formatRuns, formatPrice } from "@/lib/studio/utils";
import PlaygroundForm from "@/components/studio/playground/PlaygroundForm";
import PlaygroundOutput from "@/components/studio/playground/PlaygroundOutput";
import CodeSnippets from "@/components/studio/playground/CodeSnippets";
import type { Model } from "@/lib/studio/types";

// ─── Tabs ───

type Tab = "playground" | "api" | "readme" | "stats";

const TABS: { key: Tab; label: string; icon: React.ElementType }[] = [
  { key: "playground", label: "Playground", icon: Play },
  { key: "api", label: "API", icon: Code },
  { key: "readme", label: "README", icon: FileText },
  { key: "stats", label: "Stats", icon: BarChart3 },
];

// ─── Playground Tab ───

function PlaygroundTab({ model }: { model: Model }) {
  const [inputMode, setInputMode] = useState<"form" | "json" | "python" | "node" | "http">("form");
  const [isRunning, setIsRunning] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [inferenceTime, setInferenceTime] = useState<number | undefined>();

  const handleRun = useCallback(
    (_values: Record<string, unknown>) => {
      setIsRunning(true);
      setResult(null);
      const time = 0.3 + Math.random() * 1.5;
      setTimeout(() => {
        setIsRunning(false);
        setInferenceTime(parseFloat(time.toFixed(1)));

        const cfg = model.playgroundConfig;
        if (!cfg) return;

        if (cfg.outputType === "text" && cfg.mockOutputText) {
          setResult(cfg.mockOutputText);
        } else if (
          (cfg.outputType === "image" || cfg.outputType === "video") &&
          cfg.mockOutputUrl
        ) {
          setResult(cfg.mockOutputUrl);
        } else if (cfg.outputType === "audio") {
          setResult("audio-mock");
        } else if (cfg.outputType === "json") {
          setResult(
            JSON.stringify(
              {
                embedding: [0.023, -0.041, 0.087, 0.012, -0.056],
                model: model.id,
                usage: { prompt_tokens: 12, total_tokens: 12 },
              },
              null,
              2,
            ),
          );
        } else {
          setResult(cfg.mockOutputUrl || "Output generated successfully");
        }
      }, time * 1000);
    },
    [model],
  );

  // Ctrl+Enter shortcut
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "Enter" && !isRunning) {
        handleRun({});
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [handleRun, isRunning]);

  if (!model.playgroundConfig) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <Play className="h-10 w-10 text-white/10" />
        <p className="mt-3 text-sm text-white/40">
          Playground not available for this model
        </p>
      </div>
    );
  }

  const INPUT_MODES = [
    { key: "form" as const, label: "Form" },
    { key: "json" as const, label: "JSON" },
    { key: "python" as const, label: "Python" },
    { key: "node" as const, label: "Node.js" },
    { key: "http" as const, label: "HTTP" },
  ];

  return (
    <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
      {/* Left: Input */}
      <div>
        <div className="mb-4 flex items-center gap-0 border-b border-white/[0.06]">
          {INPUT_MODES.map((mode) => (
            <button
              key={mode.key}
              onClick={() => setInputMode(mode.key)}
              className={`border-b-2 px-3 py-1.5 text-xs font-medium transition-colors focus:outline-none ${
                inputMode === mode.key
                  ? "border-green-bright text-white"
                  : "border-transparent text-white/50 hover:text-white/60"
              }`}
            >
              {mode.label}
            </button>
          ))}
        </div>

        {inputMode === "form" ? (
          <PlaygroundForm
            config={model.playgroundConfig}
            onRun={handleRun}
            isRunning={isRunning}
          />
        ) : (
          <CodeSnippets model={model} />
        )}
      </div>

      {/* Right: Output */}
      <div>
        <h3 className="mb-4 text-sm font-medium text-white/50">Output</h3>
        <PlaygroundOutput
          outputType={model.playgroundConfig.outputType}
          result={result}
          isRunning={isRunning}
          inferenceTime={inferenceTime}
          category={model.category}
          modelName={model.name}
        />
      </div>
    </div>
  );
}

// ─── API Tab ───

function ApiTab({ model }: { model: Model }) {
  const baseUrl = model.apiEndpoint ?? "https://gateway.livepeer.org/v1";
  const endpoint =
    model.category === "LLM"
      ? `${baseUrl}/chat/completions`
      : `${baseUrl}/${model.id}`;

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      {/* Endpoint */}
      <div>
        <p className="mb-2 text-xs font-medium text-white/60">Endpoint</p>
        <div className="flex items-center gap-2 rounded-lg border border-white/[0.06] bg-black/40 p-3">
          <span className="rounded bg-green/15 px-1.5 py-0.5 text-[10px] font-bold text-green-bright">
            POST
          </span>
          <code className="font-mono text-sm text-white/60">{endpoint}</code>
        </div>
      </div>

      {/* Auth */}
      <div className="rounded-lg border border-white/[0.06] bg-white/[0.02] p-4">
        <p className="text-sm font-medium text-white/70">Authentication</p>
        <p className="mt-1 text-xs text-white/60">
          {model.managed
            ? `Get your API key from the ${model.provider} dashboard.`
            : "Get your API key from a Livepeer network provider."}
        </p>
        {(model.providerUrl || model.apiEndpoint) && (
          <a
            href={model.providerUrl || model.apiEndpoint}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-3 inline-flex items-center gap-1.5 rounded-lg bg-green/10 px-3 py-2 text-xs font-medium text-green-bright transition-colors hover:bg-green/20 focus:outline-none"
          >
            Get API Key from {model.provider}
            <ExternalLink className="h-3 w-3" />
          </a>
        )}
      </div>

      {/* Code snippets */}
      <div>
        <p className="mb-2 text-xs font-medium text-white/60">
          Code Examples
        </p>
        <CodeSnippets model={model} />
      </div>

      {/* Rate limits */}
      <div className="rounded-lg border border-white/[0.06] bg-white/[0.02] p-4">
        <p className="text-sm font-medium text-white/70">Rate Limits</p>
        <div className="mt-2 grid grid-cols-3 gap-4 text-xs">
          <div>
            <p className="text-white/50">Free tier</p>
            <p className="font-mono text-white/60">100 req/day</p>
          </div>
          <div>
            <p className="text-white/50">Standard</p>
            <p className="font-mono text-white/60">10K req/day</p>
          </div>
          <div>
            <p className="text-white/50">Enterprise</p>
            <p className="font-mono text-white/60">Unlimited</p>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── README Tab ───

function ReadmeTab({ model }: { model: Model }) {
  if (!model.readme) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <FileText className="h-10 w-10 text-white/10" />
        <p className="mt-3 text-sm text-white/40">No README available</p>
      </div>
    );
  }

  // Simple markdown-ish rendering (headers, code blocks, lists, tables)
  const lines = model.readme.split("\n");
  const elements: React.ReactNode[] = [];
  let inCodeBlock = false;
  let codeContent = "";
  let inTable = false;
  let tableRows: string[][] = [];

  const flushTable = () => {
    if (tableRows.length > 0) {
      elements.push(
        <div
          key={`table-${elements.length}`}
          className="my-4 overflow-hidden rounded-lg border border-white/[0.06]"
        >
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-white/[0.06] bg-white/[0.02]">
                {tableRows[0].map((cell, i) => (
                  <th
                    key={i}
                    className="px-3 py-2 text-left font-medium text-white/50"
                  >
                    {cell.trim()}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {tableRows.slice(2).map((row, ri) => (
                <tr
                  key={ri}
                  className="border-b border-white/[0.04] last:border-0"
                >
                  {row.map((cell, ci) => (
                    <td key={ci} className="px-3 py-2 text-white/40">
                      {cell.trim()}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>,
      );
      tableRows = [];
    }
    inTable = false;
  };

  lines.forEach((line, i) => {
    if (line.startsWith("```")) {
      if (inCodeBlock) {
        elements.push(
          <pre
            key={`code-${i}`}
            className="my-3 overflow-x-auto rounded-lg border border-white/[0.06] bg-black/40 p-4 font-mono text-xs leading-relaxed text-white/60"
          >
            {codeContent.trim()}
          </pre>,
        );
        codeContent = "";
        inCodeBlock = false;
      } else {
        if (inTable) flushTable();
        inCodeBlock = true;
      }
      return;
    }

    if (inCodeBlock) {
      codeContent += line + "\n";
      return;
    }

    if (line.startsWith("|")) {
      if (!inTable) inTable = true;
      const cells = line
        .split("|")
        .filter((c) => c.trim() !== "");
      tableRows.push(cells);
      return;
    } else if (inTable) {
      flushTable();
    }

    if (line.startsWith("# ")) {
      elements.push(
        <h1 key={i} className="mt-6 mb-3 text-xl font-semibold text-white">
          {line.slice(2)}
        </h1>,
      );
    } else if (line.startsWith("## ")) {
      elements.push(
        <h2
          key={i}
          className="mt-5 mb-2 text-lg font-semibold text-white/90"
        >
          {line.slice(3)}
        </h2>,
      );
    } else if (line.startsWith("### ")) {
      elements.push(
        <h3
          key={i}
          className="mt-4 mb-2 text-sm font-semibold text-white/80"
        >
          {line.slice(4)}
        </h3>,
      );
    } else if (line.startsWith("- **")) {
      const match = line.match(/^- \*\*(.+?)\*\*\s*[—–-]\s*(.+)$/);
      if (match) {
        elements.push(
          <div key={i} className="ml-4 mb-1 text-sm text-white/50">
            <span className="font-medium text-white/70">{match[1]}</span>
            <span className="text-white/30"> — </span>
            {match[2]}
          </div>,
        );
      } else {
        elements.push(
          <div key={i} className="ml-4 mb-1 text-sm text-white/50">
            {line.slice(2).replace(/\*\*/g, "")}
          </div>,
        );
      }
    } else if (line.startsWith("- ")) {
      elements.push(
        <div key={i} className="ml-4 mb-1 text-sm text-white/50">
          <span className="text-white/20 mr-2">-</span>
          {line.slice(2)}
        </div>,
      );
    } else if (line.trim() === "") {
      elements.push(<div key={i} className="h-2" />);
    } else {
      elements.push(
        <p key={i} className="mb-2 text-sm leading-relaxed text-white/50">
          {line}
        </p>,
      );
    }
  });

  if (inTable) flushTable();

  return <div className="mx-auto max-w-3xl">{elements}</div>;
}

// ─── Stats Tab ───

function StatsTab({ model }: { model: Model }) {
  // Mock data for per-model stats
  const latencyBuckets = [
    { label: "P50", value: model.latency, color: "bg-green-bright/60" },
    {
      label: "P90",
      value: Math.round(model.latency * 1.8),
      color: "bg-green-bright/40",
    },
    {
      label: "P99",
      value: Math.round(model.latency * 3.2),
      color: "bg-green-bright/20",
    },
  ];
  const maxLatency = Math.max(...latencyBuckets.map((b) => b.value));

  // Mock 7-day request data
  const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  const dailyRequests = days.map(() =>
    Math.round((model.runs7d / 7) * (0.7 + Math.random() * 0.6)),
  );
  const maxReq = Math.max(...dailyRequests);

  // Mock uptime grid (90 days)
  const uptimeGrid = Array.from({ length: 90 }, () =>
    Math.random() > 0.03 ? "up" : "down",
  );

  return (
    <div className="mx-auto max-w-3xl space-y-8">
      {/* Latency */}
      <div>
        <h3 className="mb-3 text-sm font-medium text-white/60">
          Latency Distribution
        </h3>
        <div className="flex items-end gap-6">
          {latencyBuckets.map((bucket) => (
            <div key={bucket.label} className="flex flex-col items-center gap-2">
              <div
                className={`w-20 rounded-t-lg ${bucket.color} transition-all`}
                style={{
                  height: `${(bucket.value / maxLatency) * 120}px`,
                }}
              />
              <div className="text-center">
                <p className="font-mono text-sm font-semibold text-white">
                  {bucket.value}ms
                </p>
                <p className="text-[10px] text-white/50">{bucket.label}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 7-day request volume */}
      <div>
        <h3 className="mb-3 text-sm font-medium text-white/60">
          Requests (7D)
        </h3>
        <div className="flex items-end gap-2">
          {dailyRequests.map((count, i) => (
            <div key={i} className="flex flex-1 flex-col items-center gap-1.5">
              <div
                className="w-full rounded-t bg-green-bright/30 transition-all hover:bg-green-bright/50"
                style={{
                  height: `${(count / maxReq) * 100}px`,
                }}
              />
              <span className="text-[10px] text-white/40">{days[i]}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Uptime heatmap */}
      <div>
        <div className="mb-3 flex items-center justify-between">
          <h3 className="text-sm font-medium text-white/60">
            Uptime (90 days)
          </h3>
          <span className="font-mono text-xs text-white/60">
            {model.uptime}%
          </span>
        </div>
        <div className="flex flex-wrap gap-[2px]">
          {uptimeGrid.map((status, i) => (
            <div
              key={i}
              className={`h-2.5 w-2.5 rounded-[2px] ${
                status === "up" ? "bg-green-bright/40" : "bg-red-500/40"
              }`}
              title={`Day ${90 - i}: ${status}`}
            />
          ))}
        </div>
        <div className="mt-2 flex items-center gap-3 text-[10px] text-white/40">
          <span className="flex items-center gap-1">
            <span className="h-2 w-2 rounded-[2px] bg-green-bright/40" /> Up
          </span>
          <span className="flex items-center gap-1">
            <span className="h-2 w-2 rounded-[2px] bg-red-500/40" /> Down
          </span>
        </div>
      </div>

      {/* Top orchestrators */}
      <div>
        <h3 className="mb-3 text-sm font-medium text-white/60">
          Top Orchestrators
        </h3>
        <div className="overflow-hidden rounded-lg border border-white/[0.06]">
          {[
            { region: "NA-East", latency: model.latency - 2, reqs: "34%" },
            { region: "EU-West", latency: model.latency + 5, reqs: "28%" },
            { region: "NA-West", latency: model.latency + 1, reqs: "22%" },
            { region: "Asia-Pacific", latency: model.latency + 18, reqs: "11%" },
            { region: "EU-Central", latency: model.latency + 8, reqs: "5%" },
          ].map((orch, i) => (
            <div
              key={i}
              className="flex items-center justify-between border-b border-white/[0.04] px-4 py-2.5 text-xs last:border-0"
            >
              <span className="text-white/60">{orch.region}</span>
              <span className="font-mono text-white/40">{orch.latency}ms</span>
              <span className="text-white/50">{orch.reqs} of requests</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Main Page ───

export default function ModelDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [activeTab, setActiveTab] = useState<Tab>("playground");
  const [starred, setStarred] = useState(false);
  const [copied, setCopied] = useState(false);

  const model = MODELS.find((m) => m.id === id);

  if (!model) {
    return (
      <div className="flex h-screen flex-col bg-dark">
        <header className="border-b border-white/[0.06] bg-dark-lighter">
          <div className="flex h-12 items-center px-5">
            <Link href="/studio" aria-label="Livepeer home" className="flex items-center gap-2.5 focus:outline-none rounded-lg">
              <LivepeerWordmark className="h-3.5 w-auto text-white" />
              <span className="rounded-md border border-green-bright/25 bg-green-bright/10 px-1.5 py-0.5 text-[10px] font-semibold text-green-bright">
                STUDIO
              </span>
            </Link>
          </div>
        </header>
        <div className="flex flex-1 flex-col items-center justify-center text-center">
          <p className="text-sm text-white/40">Model not found</p>
          <Link
            href="/studio"
            className="mt-3 text-xs text-green-bright hover:underline focus:outline-none rounded"
          >
            Back to Studio
          </Link>
        </div>
      </div>
    );
  }

  const Icon = getModelIcon(model.category);

  const handleCopyId = () => {
    navigator.clipboard.writeText(model.id);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex min-h-screen flex-col bg-dark">
      {/* Header */}
      <header className="border-b border-white/[0.06] bg-dark-lighter">
        <div className="flex h-12 items-center justify-between px-5">
          <div className="flex items-center gap-2.5">
            <Link
              href="/studio"
              aria-label="Back to Studio"
              className="flex h-8 w-8 items-center justify-center rounded-lg text-white/50 transition-colors hover:bg-white/[0.06] hover:text-white/60 focus:outline-none"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
            </Link>
            <div className="h-5 w-px bg-white/[0.08]" />
            <Link
              href="/studio"
              aria-label="Livepeer home"
              className="flex items-center gap-2.5 rounded-lg px-2 py-1 transition-colors hover:bg-white/[0.04] focus:outline-none"
            >
              <LivepeerWordmark className="h-3.5 w-auto text-white" />
              <span className="rounded-md border border-green-bright/25 bg-green-bright/10 px-1.5 py-0.5 text-[10px] font-semibold text-green-bright">
                STUDIO
              </span>
            </Link>
          </div>
          <a
            href="https://docs.livepeer.org"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm text-white/50 transition-colors hover:bg-white/[0.06] hover:text-white/60 focus:outline-none"
          >
            Docs
            <ExternalLink className="h-2.5 w-2.5 opacity-50" />
          </a>
        </div>
      </header>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        <div className="mx-auto max-w-5xl px-5 py-8">
          {/* Hero */}
          <div className="flex items-start justify-between">
            <div className="flex items-start gap-4">
              <div
                className={`flex h-14 w-14 items-center justify-center rounded-xl ${
                  model.managed ? "bg-blue/10" : "bg-white/[0.06]"
                }`}
              >
                {model.managed ? (
                  <Shield className="h-6 w-6 text-blue-bright/60" />
                ) : (
                  <Icon className="h-6 w-6 text-white/50" />
                )}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-white/50">
                    {model.provider}
                  </span>
                  <span className="text-white/30">/</span>
                  <h1 className="text-xl font-semibold text-white">
                    {model.name}
                  </h1>
                  {model.precision && (
                    <span className="text-xs text-white/40">
                      {model.precision}
                    </span>
                  )}
                </div>
                <p className="mt-1.5 max-w-2xl text-sm leading-relaxed text-white/60">
                  {model.description}
                </p>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => setStarred(!starred)}
                className={`flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs transition-colors focus:outline-none ${
                  starred
                    ? "border-blue/30 bg-blue/10 text-blue-bright"
                    : "border-white/[0.08] text-white/40 hover:bg-white/[0.04]"
                }`}
              >
                <Star
                  className={`h-3.5 w-3.5 ${starred ? "fill-blue-bright" : ""}`}
                />
                Star
              </button>
              <button
                onClick={handleCopyId}
                className="flex items-center gap-1.5 rounded-lg border border-white/[0.08] px-3 py-1.5 text-xs text-white/40 transition-colors hover:bg-white/[0.04] focus:outline-none"
              >
                {copied ? (
                  <Check className="h-3.5 w-3.5 text-green-bright" />
                ) : (
                  <Copy className="h-3.5 w-3.5" />
                )}
                Copy ID
              </button>
            </div>
          </div>

          {/* Badges row */}
          <div className="mt-4 flex flex-wrap items-center gap-3 text-xs">
            {model.status === "hot" ? (
              <span className="inline-flex items-center gap-1 rounded-full bg-green-bright/10 px-2 py-0.5 font-medium text-green-bright">
                <span className="h-1.5 w-1.5 rounded-full bg-green-bright" />
                Ready
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 rounded-full bg-white/[0.06] px-2 py-0.5 text-white/40">
                <Snowflake className="h-2.5 w-2.5" />
                Cold
              </span>
            )}
            {model.managed && (
              <span className="inline-flex items-center gap-1 rounded-full bg-blue/10 px-2 py-0.5 font-medium text-blue-bright">
                <Shield className="h-2.5 w-2.5" />
                Managed
              </span>
            )}
            <span className="flex items-center gap-1 text-white/50">
              <Flame className="h-3 w-3" />
              {formatRuns(model.runs7d)} runs
            </span>
            <span className="flex items-center gap-1 text-white/50">
              <Clock className="h-3 w-3" />
              {model.latency}ms
            </span>
            <span className="flex items-center gap-1 text-white/50">
              <Server className="h-3 w-3" />
              {model.orchestrators} orchestrators
            </span>
            <span className="font-mono text-white/50">
              {formatPrice(model)}
            </span>
            {model.networkPrice && (
              <span className="font-mono text-white/40">
                Network: ${model.networkPrice.amount} /{model.networkPrice.unit}
              </span>
            )}
          </div>

          {/* Provider attribution */}
          {model.managed && model.providerUrl && (
            <div className="mt-4 flex items-center gap-2 rounded-lg border border-blue/15 bg-blue/5 px-3 py-2">
              <Shield className="h-3.5 w-3.5 text-blue-bright/60" />
              <span className="text-xs text-white/60">
                Managed by{" "}
                <a
                  href={model.providerUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-bright hover:underline focus:outline-none rounded"
                >
                  {model.provider}
                </a>{" "}
                with SLA guarantee
              </span>
            </div>
          )}

          {/* Tabs */}
          <div className="mt-8 flex gap-0 border-b border-white/[0.06]" role="tablist">
            {TABS.map((tab) => (
              <button
                key={tab.key}
                role="tab"
                aria-selected={activeTab === tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`flex items-center gap-1.5 border-b-2 px-4 py-2.5 text-sm font-medium transition-colors focus:outline-none ${
                  activeTab === tab.key
                    ? "border-green-bright text-white"
                    : "border-transparent text-white/50 hover:text-white/60"
                }`}
              >
                <tab.icon
                  className={`h-3.5 w-3.5 ${
                    activeTab === tab.key ? "text-green-bright" : ""
                  }`}
                />
                {tab.label}
              </button>
            ))}
          </div>

          {/* Tab content */}
          <div className="mt-6 pb-12" role="tabpanel" id={`tabpanel-${activeTab}`}>
            {activeTab === "playground" && <PlaygroundTab model={model} />}
            {activeTab === "api" && <ApiTab model={model} />}
            {activeTab === "readme" && <ReadmeTab model={model} />}
            {activeTab === "stats" && <StatsTab model={model} />}
          </div>

          {/* Footer attribution */}
          <div className="border-t border-white/[0.06] pt-6">
            <div className="flex items-center gap-3 rounded-lg border border-white/[0.06] bg-white/[0.02] p-4">
              {model.managed ? (
                <Shield className="h-5 w-5 text-blue-bright/40" />
              ) : (
                <Icon className="h-5 w-5 text-green-bright/40" />
              )}
              <div className="flex-1">
                <p className="text-sm font-medium text-white/60">
                  {model.managed
                    ? `Powered by ${model.provider}`
                    : "Powered by Livepeer Network"}
                </p>
                <p className="text-xs text-white/50">
                  {model.managed
                    ? "Managed service with SLA guarantee"
                    : `${model.orchestrators} orchestrators serving this model`}
                </p>
              </div>
              {model.providerUrl && (
                <a
                  href={model.providerUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 text-xs text-green-bright hover:underline focus:outline-none rounded"
                >
                  Visit {model.provider}
                  <ArrowUpRight className="h-3 w-3" />
                </a>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

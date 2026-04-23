"use client";

import { useState } from "react";
import { Copy, Trash2, RefreshCw, Info } from "lucide-react";
import Link from "next/link";
import { SETTINGS_API_KEYS } from "@/lib/dashboard/mock-data";
import type { ApiKey, ApiKeyScope } from "@/lib/dashboard/types";
import Select from "@/components/ui/Select";
import RowMenu from "./RowMenu";

function formatRequests(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}k`;
  return n.toString();
}

const SCOPE_OPTIONS: { value: ApiKeyScope; label: string; description: string }[] = [
  {
    value: "any",
    label: "Any provider",
    description: "Routes to any connected provider, falls back to Free tier.",
  },
  {
    value: "freeTier",
    label: "Free tier",
    description: "Community provider only. Rate-limited.",
  },
  {
    value: "paymthouse",
    label: "Paymthouse",
    description: "Fiat billing (USD, EUR).",
  },
  {
    value: "livepeerCloud",
    label: "Livepeer Cloud",
    description: "Managed USD billing.",
  },
];

const SCOPE_LABEL: Record<ApiKeyScope, string> = {
  any: "Any provider",
  freeTier: "Free tier",
  paymthouse: "Paymthouse",
  livepeerCloud: "Livepeer Cloud",
  ethWallet: "ETH wallet",
};

function scopePillClasses(scope: ApiKeyScope): string {
  // Free tier keeps its distinctive green. Everything else reads as a neutral routing chip.
  if (scope === "freeTier") {
    return "border-green-bright/20 bg-green-bright/[0.08] text-green-bright";
  }
  return "border-white/[0.10] bg-white/[0.04] text-white/75";
}

function ScopeSelect({
  value,
  onChange,
}: {
  value: ApiKeyScope;
  onChange: (v: ApiKeyScope) => void;
}) {
  return (
    <Select
      ariaLabel="Routing scope"
      label="Scope"
      value={value}
      options={SCOPE_OPTIONS}
      onChange={(v) => onChange(v as ApiKeyScope)}
      className="sm:w-48"
      menuClassName="w-64"
    />
  );
}

export default function ApiKeysTab() {
  const [keys, setKeys] = useState<ApiKey[]>(SETTINGS_API_KEYS);
  const [newKeyName, setNewKeyName] = useState("");
  const [newKeyScope, setNewKeyScope] = useState<ApiKeyScope>("any");

  const handleCreate = () => {
    if (!newKeyName.trim()) return;
    const key: ApiKey = {
      id: `key-${Date.now()}`,
      name: newKeyName.trim(),
      prefix: `lpk_live_${Math.random().toString(36).slice(2, 6)}`,
      status: "active",
      created: new Date().toISOString().split("T")[0],
      lastUsed: "—",
      calls7d: 0,
      scope: newKeyScope,
    };
    setKeys((prev) => [...prev, key]);
    setNewKeyName("");
    setNewKeyScope("any");
  };

  const handleCopy = (prefix: string) => {
    navigator.clipboard.writeText(`${prefix}${"•".repeat(24)}`);
  };

  const handleRevoke = (id: string) => {
    setKeys((prev) =>
      prev.map((k) =>
        k.id === id ? { ...k, status: "revoked" as const } : k,
      ),
    );
  };

  const handleRotate = (id: string) => {
    setKeys((prev) =>
      prev.map((k) =>
        k.id === id
          ? { ...k, prefix: `${k.prefix.split("_").slice(0, 2).join("_")}_${Math.random().toString(36).slice(2, 6)}` }
          : k,
      ),
    );
  };

  return (
    <div className="space-y-12 px-5 py-8 lg:px-6">
      <section>
        <h2 className="hidden text-base font-medium text-white lg:block">API tokens</h2>
        <p className="text-sm text-white/50 lg:mt-1">
          Each connected provider gets a default token automatically. Need separate keys for staging, production, or per-project scoping? Create a new one below.
        </p>

        {/* Routing model banner */}
        <div className="mt-4 flex items-start gap-3 rounded-lg border border-white/[0.08] bg-dark-surface px-4 py-3">
          <Info className="mt-0.5 h-4 w-4 shrink-0 text-white/40" />
          <p className="text-xs text-white/60">
            The Free tier runs on a community payment provider with rate limits.{" "}
            <Link
              href="/dashboard/settings?tab=billing"
              className="text-green-bright hover:underline"
            >
              Connect a provider
            </Link>{" "}
            in Billing for higher limits.
          </p>
        </div>

        {/* Create form */}
        <div className="mt-4 flex flex-col gap-2 sm:flex-row">
          <input
            type="text"
            value={newKeyName}
            onChange={(e) => setNewKeyName(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleCreate()}
            placeholder="Enter token name"
            className="w-full rounded-md border border-white/[0.08] bg-white/[0.03] px-3 py-2.5 text-sm text-white placeholder:text-white/50 transition-colors focus:border-white/20 focus:bg-white/[0.05] focus:outline-none sm:flex-1 sm:py-2"
          />
          <ScopeSelect value={newKeyScope} onChange={setNewKeyScope} />
          <button
            onClick={handleCreate}
            disabled={!newKeyName.trim()}
            className="w-full rounded-md border border-white/[0.12] px-4 py-2.5 text-sm font-medium text-white/80 transition-colors hover:bg-white/[0.06] hover:text-white disabled:cursor-not-allowed disabled:opacity-40 sm:w-auto sm:shrink-0 sm:py-2"
          >
            Create token
          </button>
        </div>

        {/* Token list */}
        <div className="mt-4 rounded-lg border border-white/[0.06]">
          {keys.map((key) => {
            const scope: ApiKeyScope = key.scope ?? "any";
            return (
              <div
                key={key.id}
                className="group flex items-center gap-4 border-b border-white/[0.06] px-4 py-3.5 transition-colors first:rounded-t-lg last:rounded-b-lg last:border-0 hover:bg-white/[0.02]"
              >
                {/* Name + prefix + status */}
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <p className="truncate text-sm font-medium text-white">{key.name}</p>
                    {key.isDefault && (
                      <span className="rounded-full bg-white/[0.06] px-1.5 py-0.5 text-[10px] font-medium uppercase tracking-wider text-white/50">
                        Auto
                      </span>
                    )}
                    {key.status === "revoked" && (
                      <span className="rounded-full bg-red-500/10 px-2 py-0.5 text-[10px] font-medium text-red-400">
                        Revoked
                      </span>
                    )}
                  </div>
                  <p className="mt-0.5 truncate font-mono text-xs text-white/50">
                    {key.prefix}
                    {"•".repeat(24)}
                  </p>
                  <p className="mt-1 text-[12px] text-white/45">
                    <span className="font-mono text-white/60">
                      {formatRequests(key.calls7d)}
                    </span>{" "}
                    requests this week
                  </p>
                </div>

                {/* Right rail: scope pill + actions */}
                <div className="flex shrink-0 items-center gap-3">
                  {!key.isDefault && (
                    <span
                      className={`inline-flex items-center rounded-full border px-2.5 py-1 text-[11px] font-medium ${scopePillClasses(scope)}`}
                    >
                      {SCOPE_LABEL[scope]}
                    </span>
                  )}
                  <RowMenu
                    ariaLabel={`Actions for ${key.name}`}
                    items={[
                      {
                        label: "Copy token",
                        icon: Copy,
                        onClick: () => handleCopy(key.prefix),
                      },
                      {
                        label: "Rotate",
                        icon: RefreshCw,
                        disabled: key.status === "revoked",
                        onClick: () => handleRotate(key.id),
                      },
                      // Free tier (isDefault) is permanent — tied to the account's free quota.
                      // Hide Delete entirely rather than disabling so users don't wonder if it'll unlock later.
                      ...(key.isDefault
                        ? []
                        : [
                            {
                              label: "Revoke",
                              icon: Trash2,
                              destructive: true,
                              disabled: key.status === "revoked",
                              onClick: () => handleRevoke(key.id),
                            },
                          ]),
                    ]}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}

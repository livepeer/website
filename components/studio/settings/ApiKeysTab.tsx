"use client";

import { useEffect, useMemo, useState } from "react";
import { Copy, Trash2, Info } from "lucide-react";
import Link from "next/link";
import type { ApiKey } from "@/lib/studio/types";
import RowMenu from "./RowMenu";
import Dialog from "@/components/ui/Dialog";

function formatRequests(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}k`;
  return n.toString();
}

interface ApiTokenResponseRow {
  id: string;
  name: string;
  prefix: string;
  createdAt: string;
  lastUsedAt: string | null;
  status: "active" | "revoked";
}

function toApiKey(row: ApiTokenResponseRow): ApiKey {
  return {
    id: row.id,
    name: row.name,
    prefix: row.prefix,
    status: row.status,
    created: row.createdAt.slice(0, 10),
    lastUsed: row.lastUsedAt ? row.lastUsedAt.slice(0, 10) : "—",
    calls7d: 0,
  };
}

export default function ApiKeysTab() {
  const [keys, setKeys] = useState<ApiKey[]>([]);
  const [newKeyName, setNewKeyName] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [createdToken, setCreatedToken] = useState<{
    name: string;
    token: string;
  } | null>(null);

  const sortedKeys = useMemo(
    () => [...keys].sort((a, b) => b.created.localeCompare(a.created)),
    [keys],
  );

  const loadTokens = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/tokens", {
        method: "GET",
        cache: "no-store",
      });
      if (!response.ok) {
        throw new Error("Could not load tokens.");
      }
      const payload = (await response.json()) as { tokens?: ApiTokenResponseRow[] };
      setKeys((payload.tokens ?? []).map(toApiKey));
    } catch (loadError) {
      setError(
        loadError instanceof Error ? loadError.message : "Could not load tokens.",
      );
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    void loadTokens();
  }, []);

  const handleCreate = async () => {
    if (!newKeyName.trim()) return;
    setIsCreating(true);
    setError(null);
    try {
      const response = await fetch("/api/tokens", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newKeyName.trim() }),
      });
      const payload = (await response.json().catch(() => ({}))) as {
        id?: string;
        name?: string;
        token?: string;
        prefix?: string;
        createdAt?: string;
        error_description?: string;
      };
      if (!response.ok || !payload.id || !payload.token || !payload.prefix) {
        throw new Error(payload.error_description || "Could not create token.");
      }

      const key: ApiKey = {
        id: payload.id,
        name: payload.name || newKeyName.trim(),
        prefix: payload.prefix,
        status: "active",
        created: (payload.createdAt || new Date().toISOString()).slice(0, 10),
        lastUsed: "—",
        calls7d: 0,
      };
      setKeys((prev) => [...prev.filter((item) => item.id !== key.id), key]);
      setCreatedToken({
        name: key.name,
        token: payload.token,
      });
      setNewKeyName("");
    } catch (createError) {
      setError(
        createError instanceof Error
          ? createError.message
          : "Could not create token.",
      );
    } finally {
      setIsCreating(false);
    }
  };

  const handleCopy = async (value: string) => {
    await navigator.clipboard.writeText(value);
  };

  const handleRevoke = async (id: string) => {
    setError(null);
    try {
      const response = await fetch(`/api/tokens/${id}`, {
        method: "DELETE",
      });
      if (!response.ok) {
        throw new Error("Could not revoke token.");
      }
      setKeys((prev) =>
        prev.map((k) =>
          k.id === id ? { ...k, status: "revoked" as const } : k,
        ),
      );
    } catch (revokeError) {
      setError(
        revokeError instanceof Error
          ? revokeError.message
          : "Could not revoke token.",
      );
    }
  };

  return (
    <div className="space-y-12 px-6 py-8">
      <section>
        <h2 className="text-base font-medium text-white">API tokens</h2>
        <p className="mt-1 text-sm text-white/50">
          One token routes to every connected payment provider via OAuth.
        </p>

        {/* Routing model banner */}
        <div className="mt-4 flex items-start gap-3 rounded-lg border border-white/[0.08] bg-dark-surface px-4 py-3">
          <Info className="mt-0.5 h-4 w-4 shrink-0 text-white/40" />
          <p className="text-xs text-white/60">
            The Free tier runs on a community payment provider with rate limits.{" "}
            <Link
              href="/studio/settings?tab=billing"
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
            disabled={isCreating}
            placeholder="Enter token name"
            className="w-full rounded-md border border-white/[0.08] bg-white/[0.03] px-3 py-2.5 text-sm text-white placeholder:text-white/50 transition-colors focus:border-white/20 focus:bg-white/[0.05] focus:outline-none sm:flex-1 sm:py-2"
          />
          <button
            onClick={handleCreate}
            disabled={!newKeyName.trim() || isCreating}
            className="w-full rounded-md border border-white/[0.12] px-4 py-2.5 text-sm font-medium text-white/80 transition-colors hover:bg-white/[0.06] hover:text-white disabled:cursor-not-allowed disabled:opacity-40 sm:w-auto sm:shrink-0 sm:py-2"
          >
            {isCreating ? "Creating..." : "Create token"}
          </button>
        </div>

        {error && <p className="mt-3 text-xs text-red-300/90">{error}</p>}

        {/* Token list */}
        <div className="mt-4 rounded-lg border border-white/[0.06]">
          {isLoading ? (
            <div className="px-4 py-6 text-xs text-white/50">Loading tokens...</div>
          ) : sortedKeys.length === 0 ? (
            <div className="px-4 py-6 text-xs text-white/50">
              No tokens yet. Create your first `pmth_` token above.
            </div>
          ) : (
            sortedKeys.map((key) => (
              <div
                key={key.id}
                className="group flex items-center gap-4 border-b border-white/[0.06] px-4 py-3.5 transition-colors first:rounded-t-lg last:rounded-b-lg last:border-0 hover:bg-white/[0.02]"
              >
                {/* Name + prefix + status */}
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-medium text-white">{key.name}</p>
                    {key.status === "revoked" && (
                      <span className="rounded-full bg-red-500/10 px-2 py-0.5 text-[10px] font-medium text-red-400">
                        Revoked
                      </span>
                    )}
                  </div>
                  <p className="mt-0.5 truncate font-mono text-xs text-white/50">
                    {key.prefix}
                  </p>
                  <p className="mt-1 text-[12px] text-white/45">
                    Session token
                    <span className="mx-1.5 text-white/20">·</span>
                    <span className="font-mono text-white/60">
                      {formatRequests(key.calls7d)}
                    </span>{" "}
                    requests this week
                  </p>
                </div>

                {/* Right rail: badge + actions */}
                <div className="flex shrink-0 items-center gap-3">
                  <span className="inline-flex items-center rounded-full border border-green-bright/20 bg-green-bright/[0.08] px-2.5 py-1 text-[11px] font-medium text-green-bright">
                    pmth_
                  </span>
                  <RowMenu
                    ariaLabel={`Actions for ${key.name}`}
                    items={[
                      {
                        label: "Copy prefix",
                        icon: Copy,
                        onClick: () => void handleCopy(key.prefix),
                      },
                      {
                        label: "Revoke",
                        icon: Trash2,
                        destructive: true,
                        disabled: key.status === "revoked",
                        onClick: () => void handleRevoke(key.id),
                      },
                    ]}
                  />
                </div>
              </div>
            ))
          )}
        </div>
      </section>

      <Dialog
        open={Boolean(createdToken)}
        onClose={() => setCreatedToken(null)}
        maxWidth="max-w-[560px]"
      >
        <div className="border-b border-white/[0.08] px-5 py-4">
          <h3 className="text-base font-medium text-white">Token created</h3>
          <p className="mt-1 text-xs text-white/50">
            Copy this token now. You will not be able to view it again.
          </p>
        </div>
        <div className="space-y-4 px-5 py-4">
          <p className="text-sm text-white/80">
            {createdToken?.name}
          </p>
          <div className="rounded-lg border border-white/[0.08] bg-black/40 px-3 py-2 font-mono text-xs text-green-bright">
            {createdToken?.token}
          </div>
        </div>
        <div className="flex items-center justify-end gap-2 border-t border-white/[0.08] px-5 py-4">
          <button
            type="button"
            onClick={() => setCreatedToken(null)}
            className="rounded-md border border-white/[0.12] px-3 py-2 text-xs text-white/70 transition-colors hover:bg-white/[0.05]"
          >
            Close
          </button>
          <button
            type="button"
            onClick={() =>
              createdToken ? void handleCopy(createdToken.token) : undefined
            }
            className="rounded-md bg-green px-3 py-2 text-xs font-medium text-white transition-colors hover:bg-green-light"
          >
            Copy token
          </button>
        </div>
      </Dialog>
    </div>
  );
}

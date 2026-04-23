"use client";

import { useCallback, useMemo, useState } from "react";
import { RotateCcw } from "lucide-react";
import type { PlaygroundConfig } from "@/lib/dashboard/types";

interface JsonInputProps {
  config: PlaygroundConfig;
  onRun: (values: Record<string, unknown>) => void;
  isRunning: boolean;
}

export default function JsonInput({ config, onRun, isRunning }: JsonInputProps) {
  const defaultJson = useMemo(() => {
    const defaults: Record<string, unknown> = {};
    config.fields.forEach((f) => {
      if (f.defaultValue !== undefined) defaults[f.name] = f.defaultValue;
    });
    return JSON.stringify(defaults, null, 2);
  }, [config.fields]);

  const [text, setText] = useState(defaultJson);
  const [error, setError] = useState<string | null>(null);

  const handleReset = () => {
    setText(defaultJson);
    setError(null);
  };

  const handleRun = useCallback(() => {
    try {
      const parsed = text.trim() ? JSON.parse(text) : {};
      setError(null);
      onRun(parsed as Record<string, unknown>);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Invalid JSON");
    }
  }, [text, onRun]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleRun();
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col">
      <div className="pb-4">
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          spellCheck={false}
          rows={16}
          className="w-full resize-y rounded-md border border-white/[0.08] bg-white/[0.03] px-4 py-3 font-mono text-xs leading-relaxed text-white/80 placeholder:text-white/40 focus:border-white/20 focus:bg-white/[0.05] focus:outline-none"
        />
        {error && (
          <p className="mt-2 text-[11px] text-red-400">{error}</p>
        )}
      </div>

      <div className="flex items-center gap-2 border-t border-white/[0.06] pt-4">
        <button
          type="button"
          onClick={handleReset}
          className="flex items-center gap-1.5 rounded-lg border border-white/[0.08] px-3 py-2 text-xs text-white/40 transition-colors hover:bg-white/[0.04] hover:text-white/60 focus:outline-none"
        >
          <RotateCcw className="h-3 w-3" />
          Reset to defaults
        </button>
        <button
          type="submit"
          disabled={isRunning}
          className="flex items-center gap-2 rounded-lg bg-green px-4 py-2 text-sm font-medium text-white transition-all hover:bg-green-light disabled:opacity-50 focus:outline-none"
        >
          {isRunning ? (
            <>
              <span className="h-3 w-3 animate-spin rounded-full border-2 border-white/30 border-t-white" />
              Running...
            </>
          ) : (
            "Run"
          )}
        </button>
        <span className="ml-auto text-[10px] text-white/40">ctrl+enter</span>
      </div>
    </form>
  );
}

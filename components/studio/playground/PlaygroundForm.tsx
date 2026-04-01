"use client";

import { useState, useCallback } from "react";
import { RotateCcw } from "lucide-react";
import type { PlaygroundConfig, PlaygroundField } from "@/lib/studio/types";

interface PlaygroundFormProps {
  config: PlaygroundConfig;
  onRun: (values: Record<string, unknown>) => void;
  isRunning: boolean;
}

function TypeBadge({ type }: { type: string }) {
  return (
    <span className="ml-1.5 rounded bg-white/[0.06] px-1.5 py-0.5 text-[10px] font-mono text-white/50">
      {type}
    </span>
  );
}

function RequiredBadge() {
  return (
    <span className="ml-1 text-[10px] font-medium text-red-400">*</span>
  );
}

function FieldRenderer({
  field,
  value,
  onChange,
}: {
  field: PlaygroundField;
  value: unknown;
  onChange: (val: unknown) => void;
}) {
  const inputClass =
    "w-full rounded-lg border border-white/[0.08] bg-white/[0.03] px-3 py-2.5 text-sm text-white placeholder:text-white/40 focus:outline-none focus:border-white/20 transition-colors";

  switch (field.type) {
    case "textarea":
      return (
        <textarea
          id={`field-${field.name}`}
          value={(value as string) ?? ""}
          onChange={(e) => onChange(e.target.value)}
          placeholder={field.placeholder}
          rows={4}
          aria-required={field.required}
          className={`${inputClass} resize-y min-h-[80px]`}
        />
      );

    case "text":
      return (
        <input
          id={`field-${field.name}`}
          type="text"
          value={(value as string) ?? ""}
          onChange={(e) => onChange(e.target.value)}
          placeholder={field.placeholder}
          aria-required={field.required}
          className={inputClass}
        />
      );

    case "number":
      return (
        <input
          id={`field-${field.name}`}
          type="number"
          value={value !== undefined && value !== "" ? (value as number) : ""}
          onChange={(e) =>
            onChange(e.target.value === "" ? "" : Number(e.target.value))
          }
          placeholder={field.placeholder}
          min={field.min}
          max={field.max}
          step={field.step}
          aria-required={field.required}
          className={inputClass}
        />
      );

    case "range": {
      const numVal =
        value !== undefined ? (value as number) : (field.defaultValue as number) ?? field.min ?? 0;
      return (
        <div className="flex items-center gap-3">
          <input
            id={`field-${field.name}`}
            type="range"
            value={numVal}
            onChange={(e) => onChange(Number(e.target.value))}
            min={field.min ?? 0}
            max={field.max ?? 1}
            step={field.step ?? 0.01}
            aria-required={field.required}
            className="flex-1 accent-green-bright"
          />
          <span className="w-12 text-right font-mono text-xs text-white/50">
            {numVal}
          </span>
        </div>
      );
    }

    case "select":
      return (
        <select
          id={`field-${field.name}`}
          value={(value as string) ?? (field.defaultValue as string) ?? ""}
          onChange={(e) => onChange(e.target.value)}
          aria-required={field.required}
          className={`${inputClass} appearance-none cursor-pointer`}
        >
          {field.options?.map((opt) => (
            <option key={opt} value={opt}>
              {opt}
            </option>
          ))}
        </select>
      );

    case "boolean":
      return (
        <label htmlFor={`field-${field.name}`} className="flex items-center gap-2.5 cursor-pointer">
          <input
            id={`field-${field.name}`}
            type="checkbox"
            checked={(value as boolean) ?? (field.defaultValue as boolean) ?? false}
            onChange={(e) => onChange(e.target.checked)}
            aria-required={field.required}
            className="h-4 w-4 rounded border-white/20 bg-white/[0.03] accent-green-bright"
          />
          <span className="text-sm text-white/50">Enabled</span>
        </label>
      );

    case "file":
      return (
        <div className="relative">
          <div className="flex items-center justify-center rounded-lg border-2 border-dashed border-white/[0.08] bg-white/[0.02] py-6 transition-colors hover:border-white/15 hover:bg-white/[0.04]">
            <label className="cursor-pointer text-center">
              <p className="text-sm text-white/40">
                {value ? (value as File).name : "Drop a file or click to upload"}
              </p>
              <p className="mt-1 text-[11px] text-white/40">
                {field.description || "Supports common file formats"}
              </p>
              <input
                id={`field-${field.name}`}
                type="file"
                className="hidden"
                accept="image/*,audio/*,video/*"
                aria-required={field.required}
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) onChange(file);
                }}
              />
            </label>
          </div>
        </div>
      );

    default:
      return null;
  }
}

export default function PlaygroundForm({
  config,
  onRun,
  isRunning,
}: PlaygroundFormProps) {
  const getDefaults = useCallback(() => {
    const defaults: Record<string, unknown> = {};
    config.fields.forEach((f) => {
      if (f.defaultValue !== undefined) defaults[f.name] = f.defaultValue;
    });
    return defaults;
  }, [config.fields]);

  const [values, setValues] = useState<Record<string, unknown>>(getDefaults);

  const handleChange = (name: string, value: unknown) => {
    setValues((prev) => ({ ...prev, [name]: value }));
  };

  const handleReset = () => {
    setValues(getDefaults());
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onRun(values);
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col">
      <div className="space-y-5 pb-4">
        {config.fields.map((field) => (
          <div key={field.name}>
            <div className="mb-1.5 flex items-center">
              <label htmlFor={`field-${field.name}`} className="text-sm font-medium text-white/70">
                {field.label}
              </label>
              {field.required && <RequiredBadge />}
              <TypeBadge type={field.type === "textarea" ? "string" : field.type} />
            </div>
            <FieldRenderer
              field={field}
              value={values[field.name]}
              onChange={(val) => handleChange(field.name, val)}
            />
            {field.description && field.type !== "file" && (
              <p className="mt-1 text-[11px] text-white/40">
                {field.description}
                {field.defaultValue !== undefined && (
                  <span>
                    {" "}
                    Default: {String(field.defaultValue)}
                  </span>
                )}
              </p>
            )}
          </div>
        ))}
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

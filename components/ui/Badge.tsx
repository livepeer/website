import { ReactNode } from "react";

const VARIANT_STYLES = {
  default:
    "rounded-full border-green/30 bg-green-subtle text-green-light px-3 py-1 text-xs",
  category:
    "rounded border-transparent bg-white/[0.10] text-white/50 px-2.5 py-0.5 text-[11px] uppercase tracking-wide",
  tag: "rounded border-transparent bg-white/[0.06] text-white/30 px-2.5 py-0.5 text-[11px]",
  neutral:
    "rounded-full border-transparent bg-white/[0.06] text-white/40 px-1.5 py-[1px] text-[9px] leading-tight tracking-wide",
} as const;

export default function Badge({
  children,
  variant = "default",
  className = "",
}: {
  children: ReactNode;
  variant?: keyof typeof VARIANT_STYLES;
  className?: string;
}) {
  return (
    <span
      className={`inline-flex items-center border font-mono font-medium ${VARIANT_STYLES[variant]} ${className}`}
    >
      {children}
    </span>
  );
}

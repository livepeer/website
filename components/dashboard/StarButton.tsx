"use client";

import { Star } from "lucide-react";
import { useStarredModels } from "@/lib/dashboard/useStarredModels";

type Variant = "overlay" | "inline";

interface StarButtonProps {
  modelId: string;
  variant?: Variant;
  className?: string;
}

export default function StarButton({
  modelId,
  variant = "overlay",
  className = "",
}: StarButtonProps) {
  const { isStarred, toggleStar } = useStarredModels();
  const starred = isStarred(modelId);

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    toggleStar(modelId);
  };

  if (variant === "inline") {
    return (
      <button
        type="button"
        onClick={handleClick}
        aria-pressed={starred}
        aria-label={starred ? "Unstar capability" : "Star capability"}
        className={`flex items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-xs transition-colors focus:outline-none sm:px-3 ${
          starred
            ? "border-warm/30 bg-warm-subtle text-warm"
            : "border-white/[0.08] text-white/40 hover:bg-white/[0.04]"
        } ${className}`}
      >
        <Star
          className={`h-3.5 w-3.5 ${starred ? "fill-warm" : ""}`}
        />
        <span className="hidden sm:inline">
          {starred ? "Starred" : "Star"}
        </span>
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      aria-pressed={starred}
      aria-label={starred ? "Unstar capability" : "Star capability"}
      className={`flex h-6 w-6 items-center justify-center rounded-full bg-black/40 backdrop-blur-sm transition-opacity duration-200 hover:bg-black/60 focus:outline-none focus-visible:ring-1 focus-visible:ring-white/40 before:absolute before:-inset-2.5 before:content-[''] ${
        starred
          ? "opacity-100"
          : "opacity-0 group-hover:opacity-100 focus-visible:opacity-100"
      } ${className}`}
    >
      <Star
        className={`h-3 w-3 transition-colors ${
          starred ? "fill-warm text-warm" : "text-white/70"
        }`}
      />
    </button>
  );
}

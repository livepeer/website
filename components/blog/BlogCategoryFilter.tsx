"use client";

import FilterPill from "@/components/ui/FilterPill";

export default function BlogCategoryFilter({
  categories,
  activeCategory,
  onCategoryChange,
}: {
  categories: string[];
  activeCategory: string | null;
  onCategoryChange: (category: string | null) => void;
}) {
  const items = ["All", ...categories];
  const active = activeCategory ?? "All";

  return (
    <div
      className="flex flex-wrap gap-2 select-none"
      role="group"
      aria-label="Filter by category"
    >
      {items.map((item) => (
        <FilterPill
          key={item}
          label={item}
          isActive={active === item}
          onToggle={() => onCategoryChange(item === "All" ? null : item)}
        />
      ))}
    </div>
  );
}

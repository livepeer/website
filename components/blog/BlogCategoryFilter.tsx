"use client";

import FilterPills from "@/components/ui/FilterPills";

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
    <FilterPills
      items={items}
      active={active}
      onChange={(value) => onCategoryChange(value === "All" ? null : value)}
    />
  );
}

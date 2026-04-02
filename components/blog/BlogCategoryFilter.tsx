"use client";

export default function BlogCategoryFilter({
  categories,
  activeCategory,
  onCategoryChange,
}: {
  categories: string[];
  activeCategory: string | null;
  onCategoryChange: (category: string | null) => void;
}) {
  return (
    <div className="flex flex-wrap gap-2">
      <button
        onClick={() => onCategoryChange(null)}
        className={`cursor-pointer select-none rounded-full px-4 py-1.5 font-mono text-xs font-medium transition-colors ${
          activeCategory === null
            ? "bg-green text-white"
            : "border border-white/10 text-white/40 hover:text-white/70"
        }`}
      >
        All
      </button>
      {categories.map((category) => (
        <button
          key={category}
          onClick={() => onCategoryChange(category)}
          className={`cursor-pointer select-none rounded-full px-4 py-1.5 font-mono text-xs font-medium transition-colors ${
            activeCategory === category
              ? "bg-green text-white"
              : "border border-white/10 text-white/40 hover:text-white/70"
          }`}
        >
          {category}
        </button>
      ))}
    </div>
  );
}

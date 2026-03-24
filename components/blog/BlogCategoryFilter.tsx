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
    <div className="flex flex-wrap gap-1.5">
      <button
        onClick={() => onCategoryChange(null)}
        className={`whitespace-nowrap rounded-md border px-4 py-2 text-sm transition-colors ${
          activeCategory === null
            ? "border-white/20 bg-white/10 font-medium text-white"
            : "border-dark-border text-white/40 hover:border-white/10 hover:text-white/60"
        }`}
      >
        All
      </button>
      {categories.map((category) => (
        <button
          key={category}
          onClick={() => onCategoryChange(category)}
          className={`whitespace-nowrap rounded-md border px-4 py-2 text-sm transition-colors ${
            activeCategory === category
              ? "border-white/20 bg-white/10 font-medium text-white"
              : "border-dark-border text-white/40 hover:border-white/10 hover:text-white/60"
          }`}
        >
          {category}
        </button>
      ))}
    </div>
  );
}

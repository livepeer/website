"use client";

type SingleSelect = {
  items: string[];
  active: string;
  onChange: (value: string) => void;
  multi?: false;
};

type MultiSelect = {
  items: string[];
  active: string[];
  onChange: (value: string[]) => void;
  multi: true;
};

export default function FilterPills(props: SingleSelect | MultiSelect) {
  const { items, active, multi } = props;

  const isActive = (item: string) =>
    multi ? (active as string[]).includes(item) : active === item;

  const handleClick = (item: string) => {
    if (multi) {
      const current = active as string[];
      const next = current.includes(item)
        ? current.filter((c) => c !== item)
        : [...current, item];
      (props as MultiSelect).onChange(next);
    } else {
      (props as SingleSelect).onChange(item);
    }
  };

  return (
    <div
      className="flex flex-wrap gap-2 select-none"
      role="group"
      aria-label="Filter by category"
    >
      {items.map((item) => (
        <button
          key={item}
          type="button"
          onClick={() => handleClick(item)}
          aria-pressed={isActive(item)}
          className={`cursor-pointer rounded-full px-4 py-1.5 font-mono text-xs font-medium transition-colors ${
            isActive(item)
              ? "border border-green bg-green text-white"
              : "border border-white/10 text-white/50 hover:text-white/80"
          }`}
        >
          {item}
        </button>
      ))}
    </div>
  );
}

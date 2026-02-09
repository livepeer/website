import { ReactNode } from "react";

export default function Badge({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <span
      className={`inline-flex items-center rounded-full border border-green/30 bg-green-subtle px-3 py-1 text-xs font-medium text-green-light ${className}`}
    >
      {children}
    </span>
  );
}

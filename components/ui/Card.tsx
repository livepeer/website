import { ReactNode } from "react";

export default function Card({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`rounded-2xl border border-dark-border bg-dark-card p-6 hover:border-white/10 ${className}`}
    >
      {children}
    </div>
  );
}

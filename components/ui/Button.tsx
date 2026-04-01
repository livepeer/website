import { ReactNode, AnchorHTMLAttributes, ButtonHTMLAttributes } from "react";

type Variant = "primary" | "secondary" | "ghost";

const variantStyles: Record<Variant, string> = {
  primary: "bg-green text-white hover:bg-green-light active:bg-green-dark",
  secondary:
    "border border-white/20 text-white hover:bg-white/10 active:bg-white/5",
  ghost: "text-white/70 hover:text-white hover:bg-white/5",
};

type BaseProps = {
  variant?: Variant;
  children: ReactNode;
  className?: string;
};

type AsLink = BaseProps &
  AnchorHTMLAttributes<HTMLAnchorElement> & { href: string };
type AsButton = BaseProps & ButtonHTMLAttributes<HTMLButtonElement>;

export default function Button(props: AsLink | AsButton) {
  const { variant = "primary", children, className = "", ...rest } = props;
  const base = `cursor-pointer select-none inline-flex items-center justify-center gap-2 rounded-lg px-5 py-2.5 text-sm font-medium transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-green ${variantStyles[variant]} ${className}`;

  if ("href" in rest) {
    return (
      <a
        className={base}
        {...(rest as AnchorHTMLAttributes<HTMLAnchorElement>)}
      >
        {children}
      </a>
    );
  }

  return (
    <button
      className={base}
      {...(rest as ButtonHTMLAttributes<HTMLButtonElement>)}
    >
      {children}
    </button>
  );
}

import { ReactNode, AnchorHTMLAttributes, ButtonHTMLAttributes } from "react";

type Variant = "primary" | "secondary" | "white" | "ghost";
type Size = "sm" | "md" | "lg";

const variantStyles: Record<Variant, string> = {
  primary: "bg-green text-white hover:bg-green-light active:bg-green-dark",
  secondary:
    "border border-white/20 text-white hover:bg-white/10 active:bg-white/5",
  white:
    "bg-white text-black hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-30",
  ghost: "text-white/70 hover:text-white hover:bg-white/5",
};

const sizeStyles: Record<Size, string> = {
  sm: "px-3.5 py-1.5 text-xs",
  md: "px-5 py-2.5 text-sm",
  lg: "px-6 py-3 text-sm",
};

type BaseProps = {
  variant?: Variant;
  size?: Size;
  children: ReactNode;
  className?: string;
};

type AsLink = BaseProps &
  AnchorHTMLAttributes<HTMLAnchorElement> & { href: string };
type AsButton = BaseProps & ButtonHTMLAttributes<HTMLButtonElement>;

export default function Button(props: AsLink | AsButton) {
  const {
    variant = "primary",
    size = "md",
    children,
    className = "",
    ...rest
  } = props;
  const base = `inline-flex items-center justify-center gap-2 rounded-full select-none font-medium transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-green ${sizeStyles[size]} ${variantStyles[variant]} ${className}`;

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

import { ReactNode, AnchorHTMLAttributes, ButtonHTMLAttributes } from "react";

type Variant = "primary" | "secondary" | "white" | "ghost";
type Size = "sm" | "md" | "lg";

const variantStyles: Record<Variant, string> = {
  primary: "cta-primary text-white hover:brightness-110 active:brightness-95",
  secondary:
    "border border-foreground/20 text-foreground hover:bg-foreground/10 active:bg-foreground/5",
  white:
    "bg-foreground text-background hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-30",
  ghost: "text-foreground/70 hover:text-foreground hover:bg-foreground/5",
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
  const base = `inline-flex items-center justify-center gap-2 rounded-lg select-none font-medium transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-green ${sizeStyles[size]} ${variantStyles[variant]} ${className}`;

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

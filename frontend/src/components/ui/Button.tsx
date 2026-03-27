import { type ButtonHTMLAttributes } from "react";

type Variant = "primary" | "secondary" | "tertiary";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
}

const variantClasses: Record<Variant, string> = {
  primary:
    "bg-gradient-to-br from-primary to-primary-container text-white shadow-[0_4px_20px_-4px_rgba(119,90,25,0.4)] hover:shadow-[0_6px_24px_-4px_rgba(119,90,25,0.5)] hover:scale-[0.98] active:scale-95",
  secondary:
    "border border-outline-variant/30 text-on-surface hover:bg-surface-container-high active:bg-surface-container-highest",
  tertiary:
    "text-primary hover:text-primary-container underline-offset-4 hover:underline",
};

export default function Button({
  variant = "primary",
  className = "",
  children,
  ...props
}: ButtonProps) {
  return (
    <button
      className={`inline-flex items-center justify-center gap-2 px-6 py-3 font-label text-xs uppercase tracking-widest transition-all duration-200 rounded ${variantClasses[variant]} disabled:opacity-50 disabled:cursor-not-allowed ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}

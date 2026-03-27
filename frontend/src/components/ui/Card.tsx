import { type HTMLAttributes } from "react";

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "elevated" | "dark";
}

const variantClasses = {
  default: "bg-surface-container-lowest editorial-shadow",
  elevated: "bg-surface-container-lowest editorial-shadow-lg",
  dark: "bg-surface/5 editorial-shadow",
};

export default function Card({
  variant = "default",
  className = "",
  children,
  ...props
}: CardProps) {
  return (
    <div
      className={`rounded-lg p-6 ${variantClasses[variant]} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}

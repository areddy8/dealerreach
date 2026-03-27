import { type InputHTMLAttributes } from "react";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  dark?: boolean;
}

export default function Input({
  label,
  dark = false,
  className = "",
  id,
  ...props
}: InputProps) {
  const inputId = id || label?.toLowerCase().replace(/\s+/g, "-");

  return (
    <div className="space-y-2">
      {label && (
        <label
          htmlFor={inputId}
          className={`block font-label text-[10px] uppercase tracking-[0.2em] ${
            dark ? "text-surface/50" : "text-on-surface-variant/70"
          }`}
        >
          {label}
        </label>
      )}
      <input
        id={inputId}
        className={`w-full bg-transparent border-0 border-b py-3 text-sm transition-colors focus:outline-none ${
          dark
            ? "border-surface/20 text-surface placeholder-surface/30 focus:border-primary"
            : "border-outline-variant/30 text-on-surface placeholder-on-surface-variant/40 focus:border-primary"
        } ${className}`}
        {...props}
      />
    </div>
  );
}

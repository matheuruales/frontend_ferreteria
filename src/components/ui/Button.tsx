import type { ButtonHTMLAttributes } from "react";

type Variant = "primary" | "secondary" | "danger" | "ghost";
type Size = "sm" | "md" | "lg";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  loading?: boolean;
  loadingText?: string;
}

const VARIANT_CLASSES: Record<Variant, string> = {
  primary: [
    "bg-primary-500 text-white shadow-sm",
    "hover:bg-primary-600 focus-visible:outline-primary-500",
    "disabled:bg-primary-300",
  ].join(" "),
  secondary: [
    "border border-neutral-300 bg-white text-neutral-700 shadow-sm",
    "hover:bg-neutral-50 focus-visible:outline-neutral-400",
    "disabled:text-neutral-400",
  ].join(" "),
  danger: [
    "bg-danger-500 text-white shadow-sm",
    "hover:bg-danger-600 focus-visible:outline-danger-500",
    "disabled:bg-danger-300",
  ].join(" "),
  ghost: [
    "text-primary-600",
    "hover:underline focus-visible:outline-primary-500",
    "disabled:text-neutral-400",
  ].join(" "),
};

const SIZE_CLASSES: Record<Size, string> = {
  sm: "px-3 py-1.5 text-xs",
  md: "px-4 py-2.5 text-sm",
  lg: "px-6 py-3 text-base",
};

export function Button({
  variant = "primary",
  size = "md",
  loading = false,
  loadingText,
  disabled,
  children,
  className = "",
  ...props
}: ButtonProps) {
  return (
    <button
      disabled={disabled || loading}
      className={[
        "inline-flex items-center justify-center rounded-lg font-semibold",
        "transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2",
        "disabled:cursor-not-allowed disabled:opacity-60",
        VARIANT_CLASSES[variant],
        SIZE_CLASSES[size],
        className,
      ].join(" ")}
      {...props}
    >
      {loading && (
        <span
          aria-hidden="true"
          className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent"
        />
      )}
      {loading && loadingText ? loadingText : children}
    </button>
  );
}

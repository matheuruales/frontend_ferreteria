import type { InputHTMLAttributes } from "react";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
}

export function Input({
  label,
  error,
  hint,
  id,
  className = "",
  disabled,
  ...props
}: InputProps) {
  const inputId = id ?? label?.toLowerCase().replace(/\s+/g, "-");
  const errorId = error ? `${inputId}-error` : undefined;
  const hintId = hint ? `${inputId}-hint` : undefined;

  const describedBy = [errorId, hintId].filter(Boolean).join(" ") || undefined;

  return (
    <div className="w-full">
      {label && (
        <label
          htmlFor={inputId}
          className="mb-1 block text-sm font-medium text-neutral-700"
        >
          {label}
        </label>
      )}

      <input
        id={inputId}
        disabled={disabled}
        aria-invalid={!!error}
        aria-describedby={describedBy}
        className={[
          "w-full rounded-lg border px-3 py-2 text-sm shadow-sm outline-none transition",
          "focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20",
          "disabled:cursor-not-allowed disabled:opacity-50",
          error
            ? "border-danger-400 bg-danger-50"
            : "border-neutral-300 bg-white",
          className,
        ].join(" ")}
        {...props}
      />

      {hint && !error && (
        <p id={hintId} className="mt-1 text-xs text-neutral-500">
          {hint}
        </p>
      )}

      {error && (
        <p id={errorId} className="mt-1 text-xs text-danger-600" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}

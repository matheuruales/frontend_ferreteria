type AlertVariant = "error" | "success" | "warning" | "info";

interface AlertProps {
  variant?: AlertVariant;
  children: React.ReactNode;
  className?: string;
}

const VARIANT_CLASSES: Record<AlertVariant, string> = {
  error: "border-danger-200 bg-danger-50 text-danger-700",
  success: "border-success-200 bg-success-50 text-success-700",
  warning: "border-warning-200 bg-warning-50 text-warning-700",
  info: "border-secondary-200 bg-secondary-50 text-secondary-700",
};

const VARIANT_ICONS: Record<AlertVariant, string> = {
  error: "✕",
  success: "✓",
  warning: "!",
  info: "i",
};

export function Alert({ variant = "error", children, className = "" }: AlertProps) {
  return (
    <div
      role="alert"
      className={[
        "flex items-start gap-3 rounded-lg border px-4 py-3 text-sm",
        VARIANT_CLASSES[variant],
        className,
      ].join(" ")}
    >
      <span
        aria-hidden="true"
        className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full border border-current text-xs font-bold"
      >
        {VARIANT_ICONS[variant]}
      </span>
      <span>{children}</span>
    </div>
  );
}

interface CardProps {
  children: React.ReactNode;
  className?: string;
  /** Render as a clickable anchor element. */
  href?: string;
  /** Enable hover shadow effect (useful for interactive cards). */
  hoverable?: boolean;
}

export function Card({ children, className = "", href, hoverable }: CardProps) {
  const base = [
    "rounded-2xl border border-neutral-200 bg-white p-6 shadow-card",
    hoverable && "transition hover:border-primary-300 hover:shadow-card-hover",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  if (href) {
    return (
      <a href={href} className={base}>
        {children}
      </a>
    );
  }

  return <div className={base}>{children}</div>;
}

/** Thin horizontal separator for inside Card. */
export function CardDivider() {
  return <hr className="my-4 border-neutral-100" />;
}

/** Pre-styled card title. */
export function CardTitle({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <h2 className={`text-base font-semibold text-neutral-800 ${className}`}>
      {children}
    </h2>
  );
}

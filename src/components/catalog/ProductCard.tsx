import Link from "next/link";
import Image from "next/image";
import type { Product } from "@/types";

interface ProductCardProps {
  product: Product;
  showAddToCart?: boolean | undefined;
  onAddToCart?: ((productId: string) => void) | undefined;
  layout?: "grid" | "list";
  isAdding?: boolean;
}

function IconPackage() {
  return (
    <svg viewBox="0 0 24 24" className="size-12 text-[#9ca3af]" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M12 3 4 7l8 4 8-4-8-4Z" />
      <path d="M4 7v10l8 4 8-4V7" />
      <path d="M12 11v10" />
    </svg>
  );
}

function formatCOP(amount: number): string {
  return new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

function renderStars(average: number): string {
  const rounded = Math.max(0, Math.min(5, Math.round(average)));
  return `${"★".repeat(rounded)}${"☆".repeat(5 - rounded)}`;
}

export default function ProductCard({
  product,
  showAddToCart = true,
  onAddToCart,
  layout = "grid",
  isAdding = false,
}: ProductCardProps) {
  const hasDiscount =
    product.compare_at_price !== undefined &&
    product.compare_at_price !== null &&
    product.compare_at_price > product.price;

  const outOfStock = product.stock === 0;
  const discountPercent = hasDiscount
    ? Math.round(((product.compare_at_price! - product.price) / product.compare_at_price!) * 100)
    : 0;
  const reviewCount = product.review_count ?? 0;
  const ratingAverage = product.rating_average ?? null;

  const cardClass =
    layout === "list"
      ? "group overflow-hidden rounded-[14px] border border-[#e5e7eb] bg-white transition hover:shadow-[0_8px_32px_rgba(30,58,95,0.10)]"
      : "group overflow-hidden rounded-[14px] border border-[#e5e7eb] bg-white transition hover:-translate-y-0.5 hover:shadow-[0_8px_32px_rgba(30,58,95,0.10)]";
  const bodyClass = layout === "list" ? "grid gap-0 md:grid-cols-[220px_1fr]" : "";
  const imageWrapClass =
    layout === "list"
      ? "relative block h-[220px] overflow-hidden bg-[#f3f4f6]"
      : "relative block aspect-square overflow-hidden bg-[#f3f4f6]";

  return (
    <article className={cardClass}>
      <div className={bodyClass}>
        <Link href={`/catalogo/${product.slug}`} className={imageWrapClass}>
          {product.image_url ? (
            <Image
              src={product.image_url}
              alt={product.name}
              fill
              sizes="(max-width: 768px) 80vw, (max-width: 1200px) 33vw, 25vw"
              className="object-contain p-4 transition-transform duration-200 group-hover:scale-105"
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center">
              <IconPackage />
            </div>
          )}

          {hasDiscount && !outOfStock && (
            <span className="absolute left-2.5 top-2.5 rounded-md bg-[#d62828] px-2 py-1 font-display text-[11px] font-bold text-white">
              -{discountPercent}%
            </span>
          )}
          {!hasDiscount && product.is_featured && !outOfStock && (
            <span className="absolute left-2.5 top-2.5 rounded-md bg-[#10b981] px-2 py-1 font-display text-[11px] font-bold text-white">
              Nuevo
            </span>
          )}

          {outOfStock && (
            <div className="absolute inset-0 flex items-center justify-center bg-white/70">
              <span className="rounded-full bg-[#111827] px-3 py-1 text-xs font-semibold text-white">
                Sin disponibilidad
              </span>
            </div>
          )}
        </Link>

        <div className="p-3.5">
          {product.brand && (
            <div className="mb-1 text-[11px] font-medium uppercase tracking-[0.05em] text-[#6b7280]">
              {product.brand}
            </div>
          )}

          <Link
            href={`/catalogo/${product.slug}`}
            className="mb-1.5 line-clamp-2 block font-display text-sm font-semibold leading-[1.3] text-[#111827]"
          >
            {product.name}
          </Link>

          <div className="mb-2 flex items-center gap-1 text-[13px]">
            {reviewCount > 0 && ratingAverage ? (
              <>
                <span className="text-[#f59e0b]">{renderStars(ratingAverage)}</span>
                <span className="text-[11px] text-[#6b7280]">
                  {ratingAverage.toFixed(1)} ({reviewCount})
                </span>
              </>
            ) : (
              <span className="text-[12px] text-[#6b7280]">Sin reseñas</span>
            )}
          </div>

          <div className="mb-3 flex flex-wrap items-center gap-1.5">
            <span className="font-display text-lg font-extrabold text-[#1e3a5f]">
              {formatCOP(product.price)}
            </span>
            {hasDiscount && (
              <>
                <span className="text-[13px] text-[#6b7280] line-through">
                  {formatCOP(product.compare_at_price!)}
                </span>
                <span className="rounded bg-[rgba(214,40,40,0.1)] px-1.5 py-0.5 text-[11px] font-bold text-[#d62828]">
                  -{discountPercent}%
                </span>
              </>
            )}
          </div>

          {showAddToCart &&
            (onAddToCart ? (
              <button
                onClick={() => onAddToCart(product.id)}
                disabled={outOfStock || isAdding}
                className="w-full rounded-lg bg-[#1e3a5f] py-2.5 font-display text-[13px] font-semibold text-white hover:bg-[#1a3355] disabled:cursor-not-allowed disabled:bg-[#9ca3af]"
                type="button"
              >
                {outOfStock ? "Sin stock" : isAdding ? "Agregando..." : "Agregar al carrito"}
              </button>
            ) : (
              <Link
                href={`/catalogo/${product.slug}`}
                className="block w-full rounded-lg bg-[#1e3a5f] py-2.5 text-center font-display text-[13px] font-semibold text-white hover:bg-[#1a3355]"
              >
                {outOfStock ? "Sin stock" : "Agregar al carrito"}
              </Link>
            ))}
        </div>
      </div>
    </article>
  );
}

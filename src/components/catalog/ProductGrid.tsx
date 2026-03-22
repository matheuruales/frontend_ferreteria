import type { Product } from "@/types";
import ProductCard from "./ProductCard";

interface ProductGridProps {
  products: Product[];
  total: number;
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  onAddToCart?: (productId: string) => void;
  showAddToCart?: boolean;
  viewMode?: "grid" | "list";
  addingProductId?: string | null;
}

function IconSearch() {
  return (
    <svg viewBox="0 0 24 24" className="size-10 text-[#9ca3af]" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="11" cy="11" r="7" />
      <path d="m20 20-3.5-3.5" />
    </svg>
  );
}

function buildPagination(page: number, totalPages: number): Array<number | "dots"> {
  if (totalPages <= 7) return Array.from({ length: totalPages }, (_, i) => i + 1);

  const pages: Array<number | "dots"> = [1];
  const left = Math.max(2, page - 1);
  const right = Math.min(totalPages - 1, page + 1);

  if (left > 2) pages.push("dots");
  for (let p = left; p <= right; p += 1) pages.push(p);
  if (right < totalPages - 1) pages.push("dots");
  pages.push(totalPages);

  return pages;
}

export default function ProductGrid({
  products,
  total,
  page,
  totalPages,
  onPageChange,
  onAddToCart,
  showAddToCart = true,
  viewMode = "grid",
  addingProductId = null,
}: ProductGridProps) {
  if (products.length === 0) {
    return (
      <div className="rounded-2xl border border-[#e5e7eb] bg-white py-16 text-center">
        <div className="mb-2 flex justify-center">
          <IconSearch />
        </div>
        <p className="font-display text-lg font-semibold text-[#111827]">No se encontraron productos</p>
        <p className="mt-1 text-sm text-[#6b7280]">Intenta con otros filtros o términos de búsqueda</p>
      </div>
    );
  }

  const start = (page - 1) * 20 + 1;
  const end = Math.min(total, page * 20);

  return (
    <div>
      <div
        className={
          viewMode === "list"
            ? "mb-10 space-y-4"
            : "mb-10 grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3"
        }
      >
        {products.map((product) => (
          <ProductCard
            key={product.id}
            product={product}
            showAddToCart={showAddToCart}
            onAddToCart={onAddToCart}
            layout={viewMode}
            isAdding={addingProductId === product.id}
          />
        ))}
      </div>

      {totalPages > 1 && (
        <>
          <div className="flex items-center justify-center gap-1.5">
            <button
              onClick={() => onPageChange(page - 1)}
              disabled={page <= 1}
              className="flex h-9 w-9 items-center justify-center rounded-lg border-[1.5px] border-[#e5e7eb] bg-white text-[#6b7280] disabled:cursor-not-allowed disabled:opacity-40"
              aria-label="Pagina anterior"
            >
              ‹
            </button>

            {buildPagination(page, totalPages).map((token, i) =>
              token === "dots" ? (
                <span key={`dots-${i}`} className="px-1 text-[#6b7280]">
                  ...
                </span>
              ) : (
                <button
                  key={token}
                  onClick={() => onPageChange(token)}
                  className={`flex h-9 w-9 items-center justify-center rounded-lg border-[1.5px] text-sm font-medium ${
                    token === page
                      ? "border-[#1e3a5f] bg-[#1e3a5f] text-white"
                      : "border-[#e5e7eb] bg-white text-[#111827]"
                  }`}
                >
                  {token}
                </button>
              )
            )}

            <button
              onClick={() => onPageChange(page + 1)}
              disabled={page >= totalPages}
              className="flex h-9 w-9 items-center justify-center rounded-lg border-[1.5px] border-[#e5e7eb] bg-white text-[#6b7280] disabled:cursor-not-allowed disabled:opacity-40"
              aria-label="Pagina siguiente"
            >
              ›
            </button>
          </div>

          <p className="mt-3 text-center text-[13px] text-[#6b7280]">
            Mostrando {start}-{end} de {total} productos
          </p>
        </>
      )}
    </div>
  );
}

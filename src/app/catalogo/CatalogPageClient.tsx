"use client";

import { useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import ProductGrid from "@/components/catalog/ProductGrid";
import { useAuth } from "@/hooks/useAuth";
import { useCart } from "@/hooks/useCart";
import { isAuthenticated } from "@/lib/auth";
import type { Product } from "@/types";

interface CatalogPageClientProps {
  initialProducts: Product[];
  total: number;
  page: number;
  totalPages: number;
  error?: boolean | undefined;
  heading: string;
}

const SORT_OPTIONS = [
  { value: "name_asc", label: "Nombre: A-Z" },
  { value: "name_desc", label: "Nombre: Z-A" },
  { value: "price_asc", label: "Precio: menor a mayor" },
  { value: "price_desc", label: "Precio: mayor a menor" },
  { value: "newest", label: "Más recientes" },
  { value: "rating_desc", label: "Mejor valorados" },
  { value: "popularity_desc", label: "Más reseñados" },
  { value: "discount_desc", label: "Mayor descuento" },
];

export default function CatalogPageClient({
  initialProducts,
  total,
  page,
  totalPages,
  error,
  heading,
}: CatalogPageClientProps) {
  const router = useRouter();
  const sp = useSearchParams();
  const { user, getProfile, loading: authLoading } = useAuth();
  const { addItem, setOpenDrawer } = useCart();

  const [addingProductId, setAddingProductId] = useState<string | null>(null);
  const [addError, setAddError] = useState<string | null>(null);

  const rawSortValue = sp.get("sort") ?? "name_asc";
  const sortValue = SORT_OPTIONS.some((opt) => opt.value === rawSortValue)
    ? rawSortValue
    : "name_asc";
  const viewMode = sp.get("view") === "list" ? "list" : "grid";

  const nextAfterLogin = useMemo(() => {
    const qs = sp.toString();
    return qs ? `/catalogo?${qs}` : "/catalogo";
  }, [sp]);

  const handlePageChange = (newPage: number) => {
    const params = new URLSearchParams(sp.toString());
    params.set("page", String(newPage));
    router.push(`/catalogo?${params.toString()}`);
  };

  const handleSortChange = (value: string) => {
    const params = new URLSearchParams(sp.toString());
    params.set("sort", value);
    params.set("page", "1");
    router.push(`/catalogo?${params.toString()}`);
  };

  const handleViewChange = (value: "grid" | "list") => {
    const params = new URLSearchParams(sp.toString());
    params.set("view", value);
    router.push(`/catalogo?${params.toString()}`);
  };

  const handleAddToCart = async (productId: string) => {
    setAddError(null);
    const hasSession = !!user || isAuthenticated();
    if (!hasSession) {
      router.push(`/login?next=${encodeURIComponent(nextAfterLogin)}`);
      return;
    }

    if (!user && !authLoading) {
      await getProfile();
    }

    setAddingProductId(productId);
    const result = await addItem(productId, 1);
    setAddingProductId(null);

    if (result.error) {
      setAddError(result.error);
      return;
    }
    setOpenDrawer(true);
  };

  if (error) {
    return (
      <div className="rounded-2xl border border-[#e5e7eb] bg-white py-16 text-center">
        <p className="mb-2 text-[#6b7280]">No se pudo cargar el catálogo.</p>
        <p className="text-sm text-[#9ca3af]">Verifica tu conexión e intenta de nuevo.</p>
      </div>
    );
  }

  const title = heading === "Catalogo" ? "Catálogo" : heading;

  return (
    <div>
      <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 className="font-display text-[26px] font-extrabold capitalize text-[#111827]">{title}</h1>
          <p className="mt-1 text-sm text-[#6b7280]">
            {total} productos encontrados · Mostrando {Math.max(1, (page - 1) * 20 + 1)}-
            {Math.min(total, page * 20)} de {total}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <select
            value={sortValue}
            onChange={(e) => handleSortChange(e.target.value)}
            className="h-10 min-w-[210px] rounded-lg border-[1.5px] border-[#e5e7eb] bg-white px-3 text-sm text-[#111827] outline-none focus:border-[#1e3a5f]"
          >
            {SORT_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>

          <div className="flex overflow-hidden rounded-lg border-[1.5px] border-[#e5e7eb]">
            <button
              className={`flex h-10 w-10 items-center justify-center ${
                viewMode === "grid" ? "bg-[#1e3a5f] text-white" : "bg-white text-[#6b7280]"
              }`}
              onClick={() => handleViewChange("grid")}
              type="button"
              aria-label="Vista de grilla"
            >
              ⊞
            </button>
            <button
              className={`flex h-10 w-10 items-center justify-center ${
                viewMode === "list" ? "bg-[#1e3a5f] text-white" : "bg-white text-[#6b7280]"
              }`}
              onClick={() => handleViewChange("list")}
              type="button"
              aria-label="Vista de lista"
            >
              ☰
            </button>
          </div>
        </div>
      </div>

      {addError && (
        <p className="mb-4 rounded-lg border border-[rgba(214,40,40,0.2)] bg-[rgba(214,40,40,0.07)] px-3 py-2 text-sm text-[#b91c1c]">
          {addError}
        </p>
      )}

      <ProductGrid
        products={initialProducts}
        total={total}
        page={page}
        totalPages={totalPages}
        onPageChange={handlePageChange}
        onAddToCart={handleAddToCart}
        viewMode={viewMode}
        addingProductId={addingProductId}
      />
    </div>
  );
}

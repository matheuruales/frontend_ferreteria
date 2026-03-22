"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import type { BrandFacet, Category } from "@/types";

interface ProductFiltersProps {
  categories: Category[];
  brands: BrandFacet[];
}

function formatPrice(value: string) {
  const n = Number(value);
  if (!Number.isFinite(n) || n <= 0) return value;
  return new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(n);
}

export default function ProductFilters({ categories, brands }: ProductFiltersProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [minPrice, setMinPrice] = useState(searchParams.get("min_price") ?? "");
  const [maxPrice, setMaxPrice] = useState(searchParams.get("max_price") ?? "");
  const [priceError, setPriceError] = useState<string | null>(null);

  useEffect(() => {
    setMinPrice(searchParams.get("min_price") ?? "");
    setMaxPrice(searchParams.get("max_price") ?? "");
  }, [searchParams]);

  const activeCategory = searchParams.get("category_slug") ?? "";
  const activeBrand = searchParams.get("brand") ?? "";
  const appliedMinPrice = searchParams.get("min_price") ?? "";
  const appliedMaxPrice = searchParams.get("max_price") ?? "";
  const activeMinRating = Number(searchParams.get("min_rating") ?? "0");
  const activeInStock = searchParams.get("in_stock") === "true";
  const activeOnSale = searchParams.get("on_sale") === "true";

  const activeTags = useMemo(() => {
    const tags: string[] = [];
    if (activeCategory) tags.push(activeCategory.replaceAll("-", " "));
    if (activeBrand) tags.push(activeBrand);
    if (appliedMinPrice || appliedMaxPrice) {
      const a = appliedMinPrice ? formatPrice(appliedMinPrice) : "$0";
      const b = appliedMaxPrice ? formatPrice(appliedMaxPrice) : "∞";
      tags.push(`${a} - ${b}`);
    }
    if (activeMinRating > 0) tags.push(`${activeMinRating}+ estrellas`);
    if (activeInStock) tags.push("En stock");
    if (activeOnSale) tags.push("Con descuento");
    return tags;
  }, [
    activeBrand,
    activeCategory,
    activeInStock,
    activeMinRating,
    activeOnSale,
    appliedMaxPrice,
    appliedMinPrice,
  ]);

  const categoryItems = useMemo(() => {
    const flattened: Array<{ slug: string; name: string; product_count: number }> = [];
    categories.forEach((cat) => {
      flattened.push({
        slug: cat.slug,
        name: cat.name,
        product_count: cat.product_count ?? 0,
      });
      (cat.subcategories ?? []).forEach((sub) => {
        flattened.push({
          slug: sub.slug,
          name: sub.name,
          product_count: sub.product_count ?? 0,
        });
      });
    });
    return flattened;
  }, [categories]);

  const updateParam = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value) params.set(key, value);
    else params.delete(key);
    params.set("page", "1");
    router.push(`/catalogo?${params.toString()}`);
  };

  const updateBooleanParam = (key: string, enabled: boolean) => {
    const params = new URLSearchParams(searchParams.toString());
    if (enabled) params.set(key, "true");
    else params.delete(key);
    params.set("page", "1");
    router.push(`/catalogo?${params.toString()}`);
  };

  const applyPrices = () => {
    setPriceError(null);

    const min = minPrice ? Number(minPrice) : null;
    const max = maxPrice ? Number(maxPrice) : null;

    if ((min !== null && !Number.isFinite(min)) || (max !== null && !Number.isFinite(max))) {
      setPriceError("Ingresa valores válidos de precio.");
      return;
    }
    if (min !== null && min < 0) {
      setPriceError("El precio mínimo no puede ser negativo.");
      return;
    }
    if (max !== null && max < 0) {
      setPriceError("El precio máximo no puede ser negativo.");
      return;
    }
    if (min !== null && max !== null && min > max) {
      setPriceError("El precio mínimo no puede ser mayor al máximo.");
      return;
    }

    const params = new URLSearchParams(searchParams.toString());
    if (minPrice) params.set("min_price", minPrice);
    else params.delete("min_price");
    if (maxPrice) params.set("max_price", maxPrice);
    else params.delete("max_price");
    params.set("page", "1");
    router.push(`/catalogo?${params.toString()}`);
  };

  const clearFilters = () => {
    setMinPrice("");
    setMaxPrice("");
    setPriceError(null);

    const params = new URLSearchParams();
    const q = searchParams.get("q");
    const sort = searchParams.get("sort");
    const view = searchParams.get("view");

    if (q) params.set("q", q);
    if (sort) params.set("sort", sort);
    if (view) params.set("view", view);

    const qs = params.toString();
    router.push(qs ? `/catalogo?${qs}` : "/catalogo");
  };

  const toggleMinRating = (value: number) => {
    const params = new URLSearchParams(searchParams.toString());
    if (activeMinRating === value) params.delete("min_rating");
    else params.set("min_rating", String(value));
    params.set("page", "1");
    router.push(`/catalogo?${params.toString()}`);
  };

  return (
    <aside className="space-y-7 border-r border-[#e5e7eb] pr-8">
      <div>
        <div className="mb-3 flex items-center justify-between text-[12px] font-semibold uppercase tracking-[0.04em] text-[#6b7280]">
          <span>Filtros activos ({activeTags.length})</span>
          <button
            onClick={clearFilters}
            className="text-[12px] font-semibold normal-case tracking-normal text-[#d62828]"
            type="button"
          >
            Limpiar todo
          </button>
        </div>
        <div className="flex flex-wrap gap-2">
          {activeTags.length === 0 && (
            <span className="rounded-full border border-[#e5e7eb] bg-[#f9fafb] px-3 py-1 text-xs text-[#6b7280]">
              Sin filtros
            </span>
          )}
          {activeTags.map((tag) => (
            <span
              key={tag}
              className="inline-flex items-center rounded-full border border-[rgba(30,58,95,0.2)] bg-[rgba(30,58,95,0.08)] px-3 py-1 text-xs font-medium capitalize text-[#1e3a5f]"
            >
              {tag}
            </span>
          ))}
        </div>
      </div>

      <section>
        <h3 className="mb-3 flex items-center justify-between border-b border-[#e5e7eb] pb-2 font-display text-[13px] font-bold uppercase tracking-[0.04em] text-[#111827]">
          Categoria <span>▾</span>
        </h3>
        <div className="max-h-[280px] space-y-2 overflow-auto pr-1">
          <button
            onClick={() => updateParam("category_slug", "")}
            className="flex w-full items-center gap-3 text-left"
            type="button"
          >
            <span
              className={`flex h-4 w-4 items-center justify-center rounded border text-[10px] ${
                !activeCategory
                  ? "border-[#1e3a5f] bg-[#1e3a5f] text-white"
                  : "border-[#e5e7eb] bg-white text-transparent"
              }`}
            >
              ✓
            </span>
            <span className="flex-1 text-sm text-[#111827]">Todas</span>
          </button>

          {categoryItems.map((cat) => {
            const checked = activeCategory === cat.slug;
            return (
              <button
                key={cat.slug}
                onClick={() => updateParam("category_slug", cat.slug)}
                className="flex w-full items-center gap-3 text-left"
                type="button"
              >
                <span
                  className={`flex h-4 w-4 items-center justify-center rounded border text-[10px] ${
                    checked
                      ? "border-[#1e3a5f] bg-[#1e3a5f] text-white"
                      : "border-[#e5e7eb] bg-white text-transparent"
                  }`}
                >
                  ✓
                </span>
                <span className="flex-1 text-sm text-[#111827]">{cat.name}</span>
                <span className="rounded-full bg-[#f9fafb] px-2 py-[1px] text-[11px] text-[#6b7280]">
                  {cat.product_count}
                </span>
              </button>
            );
          })}
        </div>
      </section>

      <section>
        <h3 className="mb-3 flex items-center justify-between border-b border-[#e5e7eb] pb-2 font-display text-[13px] font-bold uppercase tracking-[0.04em] text-[#111827]">
          Marca <span>▾</span>
        </h3>
        <div className="max-h-[260px] space-y-2 overflow-auto pr-1">
          <button
            onClick={() => updateParam("brand", "")}
            className="flex w-full items-center gap-3 text-left"
            type="button"
          >
            <span
              className={`flex h-4 w-4 items-center justify-center rounded border text-[10px] ${
                !activeBrand
                  ? "border-[#1e3a5f] bg-[#1e3a5f] text-white"
                  : "border-[#e5e7eb] bg-white text-transparent"
              }`}
            >
              ✓
            </span>
            <span className="flex-1 text-sm text-[#111827]">Todas</span>
          </button>

          {brands.map((brand) => {
            const checked = activeBrand === brand.name;
            return (
              <button
                key={brand.name}
                onClick={() => updateParam("brand", brand.name)}
                className="flex w-full items-center gap-3 text-left"
                type="button"
              >
                <span
                  className={`flex h-4 w-4 items-center justify-center rounded border text-[10px] ${
                    checked
                      ? "border-[#1e3a5f] bg-[#1e3a5f] text-white"
                      : "border-[#e5e7eb] bg-white text-transparent"
                  }`}
                >
                  ✓
                </span>
                <span className="flex-1 text-sm text-[#111827]">{brand.name}</span>
                <span className="rounded-full bg-[#f9fafb] px-2 py-[1px] text-[11px] text-[#6b7280]">
                  {brand.count}
                </span>
              </button>
            );
          })}
        </div>
      </section>

      <section>
        <h3 className="mb-3 flex items-center justify-between border-b border-[#e5e7eb] pb-2 font-display text-[13px] font-bold uppercase tracking-[0.04em] text-[#111827]">
          Precio <span>▾</span>
        </h3>
        <div className="flex items-center gap-2">
          <input
            type="number"
            value={minPrice}
            onChange={(e) => setMinPrice(e.target.value)}
            placeholder="50000"
            className="h-9 min-w-0 flex-1 rounded-lg border-[1.5px] border-[#e5e7eb] px-2.5 text-[13px] text-[#111827] outline-none focus:border-[#1e3a5f]"
          />
          <span className="text-[#6b7280]">-</span>
          <input
            type="number"
            value={maxPrice}
            onChange={(e) => setMaxPrice(e.target.value)}
            placeholder="200000"
            className="h-9 min-w-0 flex-1 rounded-lg border-[1.5px] border-[#e5e7eb] px-2.5 text-[13px] text-[#111827] outline-none focus:border-[#1e3a5f]"
          />
        </div>
        <button
          onClick={applyPrices}
          className="mt-3 w-full rounded-lg bg-[#1e3a5f] py-2 font-display text-[13px] font-semibold text-white hover:bg-[#1a3355]"
          type="button"
        >
          Aplicar rango
        </button>
        {priceError && <p className="mt-2 text-xs text-[#d62828]">{priceError}</p>}
      </section>

      <section>
        <h3 className="mb-3 flex items-center justify-between border-b border-[#e5e7eb] pb-2 font-display text-[13px] font-bold uppercase tracking-[0.04em] text-[#111827]">
          Calificacion <span>▾</span>
        </h3>
        <div className="space-y-2">
          {[5, 4, 3, 2].map((rating) => {
            const checked = activeMinRating === rating;
            return (
              <button
                key={rating}
                onClick={() => toggleMinRating(rating)}
                className="flex w-full items-center gap-3 text-left"
                type="button"
              >
                <span
                  className={`flex h-4 w-4 items-center justify-center rounded border text-[10px] ${
                    checked
                      ? "border-[#1e3a5f] bg-[#1e3a5f] text-white"
                      : "border-[#e5e7eb] bg-white text-transparent"
                  }`}
                >
                  ✓
                </span>
                <span className="text-sm text-[#f59e0b]">
                  {"★".repeat(rating)}
                  {"☆".repeat(5 - rating)}
                </span>
                <span className="text-sm text-[#6b7280]">y más</span>
              </button>
            );
          })}
        </div>
      </section>

      <section>
        <h3 className="mb-3 flex items-center justify-between border-b border-[#e5e7eb] pb-2 font-display text-[13px] font-bold uppercase tracking-[0.04em] text-[#111827]">
          Disponibilidad <span>▾</span>
        </h3>
        <div className="space-y-2">
          <button
            type="button"
            onClick={() => updateBooleanParam("in_stock", !activeInStock)}
            className="flex w-full items-center gap-3 text-left"
          >
            <span
              className={`flex h-4 w-4 items-center justify-center rounded border text-[10px] ${
                activeInStock
                  ? "border-[#1e3a5f] bg-[#1e3a5f] text-white"
                  : "border-[#e5e7eb] bg-white text-transparent"
              }`}
            >
              ✓
            </span>
            <span className="text-sm text-[#111827]">En stock</span>
          </button>

          <button
            type="button"
            onClick={() => updateBooleanParam("on_sale", !activeOnSale)}
            className="flex w-full items-center gap-3 text-left"
          >
            <span
              className={`flex h-4 w-4 items-center justify-center rounded border text-[10px] ${
                activeOnSale
                  ? "border-[#1e3a5f] bg-[#1e3a5f] text-white"
                  : "border-[#e5e7eb] bg-white text-transparent"
              }`}
            >
              ✓
            </span>
            <span className="text-sm text-[#111827]">Con descuento</span>
          </button>
        </div>
      </section>
    </aside>
  );
}

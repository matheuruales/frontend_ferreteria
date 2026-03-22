import type { Metadata } from "next";
import { Suspense } from "react";
import ProductFilters from "@/components/catalog/ProductFilters";
import ProductGridSkeleton from "@/components/catalog/ProductGridSkeleton";
import CatalogPageClient from "./CatalogPageClient";
import StoreCompactHeader from "@/components/layout/StoreCompactHeader";
import type { BrandFacet, Category, ProductListData } from "@/types";

export const revalidate = 60; // 1 minute ISR

interface CatalogSearchParams {
  q?: string;
  category_slug?: string;
  brand?: string;
  min_price?: string;
  max_price?: string;
  min_rating?: string;
  in_stock?: string;
  on_sale?: string;
  page?: string;
  sort?: string;
  view?: string;
}

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

async function getCategories(): Promise<Category[]> {
  try {
    const res = await fetch(`${API_URL}/api/v1/catalog/categories`, {
      next: { revalidate: 300 },
    });
    if (!res.ok) return [];
    const data = await res.json() as { categories: Category[] };
    return data.categories ?? [];
  } catch {
    return [];
  }
}

async function getBrands(): Promise<BrandFacet[]> {
  try {
    const res = await fetch(`${API_URL}/api/v1/catalog/brands`, {
      next: { revalidate: 300 },
    });
    if (!res.ok) return [];
    const data = await res.json() as { brands: BrandFacet[] };
    return data.brands ?? [];
  } catch {
    return [];
  }
}

async function getProducts(params: CatalogSearchParams): Promise<ProductListData | null> {
  const query = new URLSearchParams();
  if (params.q) query.set("q", params.q);
  if (params.category_slug) query.set("category_slug", params.category_slug);
  if (params.brand) query.set("brand", params.brand);
  if (params.min_price) query.set("min_price", params.min_price);
  if (params.max_price) query.set("max_price", params.max_price);
  if (params.min_rating) query.set("min_rating", params.min_rating);
  if (params.in_stock) query.set("in_stock", params.in_stock);
  if (params.on_sale) query.set("on_sale", params.on_sale);
  query.set("page", params.page ?? "1");
  query.set("per_page", "20");
  if (params.sort) query.set("sort", params.sort);

  try {
    const res = await fetch(`${API_URL}/api/v1/catalog/products?${query.toString()}`, {
      cache: "no-store",
    });
    if (!res.ok) return null;
    return res.json() as Promise<ProductListData>;
  } catch {
    return null;
  }
}

export async function generateMetadata({
  searchParams,
}: {
  searchParams: Promise<CatalogSearchParams>;
}): Promise<Metadata> {
  const params = await searchParams;
  const title = params.q
    ? `Búsqueda: "${params.q}" — Catálogo`
    : params.category_slug
    ? `Categoría: ${params.category_slug} — Catálogo`
    : "Catálogo de productos";

  return {
    title,
    description: "Explora nuestro catálogo de herramientas y materiales para ferretería.",
  };
}

export default async function CatalogPage({
  searchParams,
}: {
  searchParams: Promise<CatalogSearchParams>;
}) {
  const params = await searchParams;
  const [categories, brands, productsData] = await Promise.all([
    getCategories(),
    getBrands(),
    getProducts(params),
  ]);

  const page = parseInt(params.page ?? "1", 10);
  const heading = params.q
    ? `Resultados para \"${params.q}\"`
    : params.category_slug
    ? params.category_slug.replaceAll("-", " ")
    : "Catálogo";

  return (
    <main className="min-h-screen bg-[#f9fafb]">
      <StoreCompactHeader defaultQuery={params.q ?? ""} />

      <div className="home-shell px-4 pb-20 pt-4 sm:px-6 lg:px-8">
        <div className="mb-4 flex items-center gap-2 text-[13px] text-[#6b7280]">
          <a href="/" className="hover:text-[#1e3a5f]">Inicio</a>
          <span className="text-[#d1d5db]">›</span>
          <span className="font-medium capitalize text-[#111827]">{heading}</span>
        </div>

        <div className="flex gap-8">
          <div className="hidden w-[260px] shrink-0 lg:block">
            <Suspense>
              <ProductFilters categories={categories} brands={brands} />
            </Suspense>
          </div>

          <div className="min-w-0 flex-1">
            <Suspense fallback={<ProductGridSkeleton />}>
              <CatalogPageClient
                initialProducts={productsData?.products ?? []}
                total={productsData?.total ?? 0}
                page={page}
                totalPages={productsData?.total_pages ?? 1}
                error={productsData === null}
                heading={heading}
              />
            </Suspense>
          </div>
        </div>
      </div>
    </main>
  );
}

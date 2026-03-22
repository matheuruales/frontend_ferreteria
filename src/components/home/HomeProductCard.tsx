"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { useCart } from "@/hooks/useCart";
import type { Product } from "@/types";

interface HomeProductCardProps {
  product: Product;
  index: number;
}

const PRODUCT_EMOJIS = ["🔨", "🪛", "🪚", "🔌"];

function formatCOP(amount: number): string {
  return new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

function renderStars(score: number): string {
  const rounded = Math.max(0, Math.min(5, Math.round(score)));
  const filled = "★".repeat(rounded);
  const empty = "☆".repeat(Math.max(0, 5 - rounded));
  return `${filled}${empty}`;
}

export default function HomeProductCard({ product, index }: HomeProductCardProps) {
  const router = useRouter();
  const { user } = useAuth();
  const { addItem, setOpenDrawer } = useCart();
  const [adding, setAdding] = useState(false);

  const hasDiscount =
    product.compare_at_price !== undefined &&
    product.compare_at_price !== null &&
    product.compare_at_price > product.price;

  const discountPercent = hasDiscount
    ? Math.round(((product.compare_at_price! - product.price) / product.compare_at_price!) * 100)
    : 0;
  const ratingAverage = product.rating_average ?? null;
  const reviewCount = product.review_count ?? 0;

  const badge = hasDiscount ? `-${discountPercent}%` : index === 1 ? "Nuevo" : null;
  const badgeClass = hasDiscount ? "bg-danger-500 text-white" : "bg-emerald-500 text-white";

  async function handleAddToCart() {
    if (adding || product.stock === 0) return;

    if (!user) {
      router.push("/login");
      return;
    }

    setAdding(true);
    const result = await addItem(product.id, 1);
    setAdding(false);

    if (!result.error) {
      setOpenDrawer(true);
    }
  }

  return (
    <article className="overflow-hidden rounded-2xl border border-neutral-200 bg-white">
      <div className="relative flex aspect-[1.02/1] items-center justify-center bg-[#f3f4f6] p-6">
        {product.image_url ? (
          <Image
            src={product.image_url}
            alt={product.name}
            fill
            sizes="(max-width: 1024px) 50vw, 25vw"
            className="object-contain p-8"
          />
        ) : (
          <span className="text-7xl">{PRODUCT_EMOJIS[index] ?? "📦"}</span>
        )}

        {badge && (
          <span className={`absolute left-3 top-3 rounded-md px-2 py-1 text-[10px] font-bold ${badgeClass}`}>
            {badge}
          </span>
        )}
      </div>

      <div className="p-4">
        <p className="text-[10px] uppercase tracking-[0.08em] text-neutral-400">{product.brand ?? "Marca"}</p>

        <Link
          href={`/catalogo/${product.slug}`}
          className="font-display mt-1 line-clamp-2 min-h-[40px] text-[15px] font-semibold leading-[1.3] text-neutral-900 hover:text-secondary-500"
        >
          {product.name}
        </Link>

        <div className="mt-2 flex items-center gap-1.5 text-[13px]">
          {ratingAverage && reviewCount > 0 ? (
            <>
              <span className="text-amber-500">{renderStars(ratingAverage)}</span>
              <span className="text-xs text-neutral-500">
                {ratingAverage.toFixed(1)} ({reviewCount})
              </span>
            </>
          ) : (
            <span className="text-xs text-neutral-500">Sin reseñas</span>
          )}
        </div>

        <div className="mt-2.5 flex items-center gap-2">
          <span className="font-display text-[28px] font-extrabold leading-none text-secondary-500">
            {formatCOP(product.price)}
          </span>
          {hasDiscount && (
            <>
              <span className="text-xs text-neutral-400 line-through">{formatCOP(product.compare_at_price!)}</span>
              <span className="rounded bg-danger-50 px-1.5 py-0.5 text-[10px] font-bold text-danger-500">
                -{discountPercent}%
              </span>
            </>
          )}
        </div>

        <button
          onClick={() => void handleAddToCart()}
          disabled={product.stock === 0 || adding}
          className="mt-3 inline-flex h-10 w-full items-center justify-center rounded-lg bg-secondary-500 text-sm font-semibold text-white transition hover:bg-secondary-600 disabled:cursor-not-allowed disabled:bg-neutral-300"
        >
          {adding ? "Agregando..." : product.stock === 0 ? "Sin stock" : "Agregar al carrito"}
        </button>
      </div>
    </article>
  );
}

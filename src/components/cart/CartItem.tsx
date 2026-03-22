"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { useCart } from "@/hooks/useCart";
import type { CartItem as CartItemType } from "@/types";

interface CartItemProps {
  item: CartItemType;
}

function IconPackage() {
  return (
    <svg viewBox="0 0 24 24" className="size-8 text-[#9ca3af]" fill="none" stroke="currentColor" strokeWidth="1.8">
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

export default function CartItemRow({ item }: CartItemProps) {
  const { updateQuantity, removeItem } = useCart();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleQuantityChange = async (newQty: number) => {
    if (newQty < 1 || newQty > item.stock_available) return;
    setLoading(true);
    setError(null);
    const result = await updateQuantity(item.id, newQty);
    setLoading(false);
    if (result.error) setError(result.error);
  };

  const handleRemove = async () => {
    setLoading(true);
    await removeItem(item.id);
    setLoading(false);
  };

  return (
    <article
      className={`rounded-[14px] border border-[#e5e7eb] bg-white p-4 ${
        loading ? "opacity-60" : ""
      }`}
    >
      <div className="flex gap-3.5">
        <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-[10px] bg-[#f3f4f6]">
          {item.product_image_url ? (
            <Image
              src={item.product_image_url}
              alt={item.product_name}
              fill
              sizes="80px"
              className="object-contain p-2"
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center">
              <IconPackage />
            </div>
          )}
        </div>

        <div className="min-w-0 flex-1">
          <div className="mb-1 text-[11px] uppercase tracking-[0.04em] text-[#6b7280]">
            {item.product_name.split(" ")[0]}
          </div>
          <Link
            href={`/catalogo/${item.product_slug}`}
            className="mb-2 line-clamp-2 block font-display text-[13px] font-semibold leading-[1.3] text-[#111827]"
          >
            {item.product_name}
          </Link>

          <div className="flex items-center justify-between gap-2">
            <div className="inline-flex items-center overflow-hidden rounded-lg border border-[#e5e7eb]">
              <button
                onClick={() => void handleQuantityChange(item.quantity - 1)}
                disabled={loading || item.quantity <= 1}
                className="flex h-7 w-7 items-center justify-center bg-[#f9fafb] text-base disabled:opacity-40"
                type="button"
              >
                -
              </button>
              <span className="flex h-7 w-8 items-center justify-center border-x border-[#e5e7eb] text-sm font-bold">
                {item.quantity}
              </span>
              <button
                onClick={() => void handleQuantityChange(item.quantity + 1)}
                disabled={loading || item.quantity >= item.stock_available}
                className="flex h-7 w-7 items-center justify-center bg-[#f9fafb] text-base disabled:opacity-40"
                type="button"
              >
                +
              </button>
            </div>
            <div className="font-display text-base font-extrabold text-[#1e3a5f]">
              {formatCOP(item.subtotal)}
            </div>
          </div>

          <button
            onClick={() => void handleRemove()}
            disabled={loading}
            className="mt-2 text-xs text-[#d62828] disabled:opacity-40"
            type="button"
          >
            Eliminar · Guardar para después
          </button>

          {error && <p className="mt-2 text-xs text-[#d62828]">{error}</p>}
        </div>
      </div>
    </article>
  );
}

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { useCart } from "@/hooks/useCart";
import { isAuthenticated } from "@/lib/auth";
import type { Product } from "@/types";

interface AddToCartButtonProps {
  product: Product;
}

function IconHeart() {
  return (
    <svg viewBox="0 0 24 24" className="size-6" fill="none" stroke="currentColor" strokeWidth="1.9">
      <path d="M12 20s-7-4.5-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 5.5-7 10-7 10Z" />
    </svg>
  );
}

function IconTruck() {
  return (
    <svg viewBox="0 0 24 24" className="size-5 text-[#1e3a5f]" fill="none" stroke="currentColor" strokeWidth="1.9">
      <path d="M3 6h11v9H3z" />
      <path d="M14 9h4l3 3v3h-7" />
      <circle cx="8" cy="18" r="1.5" />
      <circle cx="18" cy="18" r="1.5" />
    </svg>
  );
}

function IconStore() {
  return (
    <svg viewBox="0 0 24 24" className="size-5 text-[#1e3a5f]" fill="none" stroke="currentColor" strokeWidth="1.9">
      <path d="M3 10h18" />
      <path d="M5 10v10h14V10" />
      <path d="M4 6h16l-1 4H5L4 6Z" />
      <path d="M9 20v-5h6v5" />
    </svg>
  );
}

function IconReturn() {
  return (
    <svg viewBox="0 0 24 24" className="size-5 text-[#1e3a5f]" fill="none" stroke="currentColor" strokeWidth="1.9">
      <path d="M9 7H4v5" />
      <path d="M4 12a8 8 0 1 0 2.4-5.7L4 7" />
    </svg>
  );
}

export default function AddToCartButton({ product }: AddToCartButtonProps) {
  const { user, getProfile, loading: authLoading } = useAuth();
  const { addItem, setOpenDrawer } = useCart();
  const router = useRouter();

  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState<"idle" | "cart" | "buy">("idle");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const outOfStock = product.stock === 0;

  const handleAdd = async (mode: "cart" | "buy") => {
    const hasSession = !!user || isAuthenticated();
    if (!hasSession) {
      const next = `/catalogo/${product.slug}`;
      router.push(`/login?next=${encodeURIComponent(next)}`);
      return;
    }

    // If token exists but user context is not hydrated yet, hydrate in background.
    if (!user && !authLoading) {
      await getProfile();
    }

    setLoading(mode);
    setError(null);
    setSuccess(false);

    const result = await addItem(product.id, quantity);
    setLoading("idle");

    if (result.error) {
      setError(result.error);
      return;
    }

    setSuccess(true);

    if (mode === "buy") {
      router.push("/checkout");
      return;
    }

    setOpenDrawer(true);
    window.setTimeout(() => setSuccess(false), 1800);
  };

  return (
    <div>
      <div className="mb-5">
        <div className="mb-2 text-sm font-semibold text-[#111827]">Cantidad</div>
        <div className="inline-flex items-center overflow-hidden rounded-[10px] border-[1.5px] border-[#e5e7eb]">
          <button
            onClick={() => setQuantity((q) => Math.max(1, q - 1))}
            className="flex h-11 w-11 items-center justify-center bg-[#f9fafb] text-xl text-[#111827]"
            disabled={outOfStock}
            type="button"
          >
            -
          </button>
          <input
            value={quantity}
            readOnly
            className="h-11 w-14 border-x-[1.5px] border-[#e5e7eb] bg-white text-center font-display text-base font-bold text-[#111827]"
          />
          <button
            onClick={() => setQuantity((q) => Math.min(product.stock, q + 1))}
            className="flex h-11 w-11 items-center justify-center bg-[#f9fafb] text-xl text-[#111827]"
            disabled={outOfStock || quantity >= product.stock}
            type="button"
          >
            +
          </button>
        </div>
      </div>

      <div className="mb-5 flex flex-wrap gap-3">
        <button
          onClick={() => void handleAdd("cart")}
          disabled={outOfStock || loading !== "idle" || authLoading}
          className="min-w-[220px] flex-1 rounded-xl bg-[#1e3a5f] py-3.5 font-display text-base font-bold text-white hover:bg-[#1a3355] disabled:cursor-not-allowed disabled:bg-[#9ca3af]"
          type="button"
        >
          {loading === "cart" ? "Agregando..." : success ? "Agregado" : "Agregar al carrito"}
        </button>

        <button
          onClick={() => void handleAdd("buy")}
          disabled={outOfStock || loading !== "idle" || authLoading}
          className="min-w-[220px] flex-1 rounded-xl bg-[#f57c00] py-3.5 font-display text-base font-bold text-white hover:bg-[#e56f00] disabled:cursor-not-allowed disabled:bg-[#fdba74]"
          type="button"
        >
          {loading === "buy" ? "Procesando..." : "Comprar ahora"}
        </button>

        <button
          type="button"
          className="flex h-[54px] w-[54px] items-center justify-center rounded-xl border-[1.5px] border-[#e5e7eb] bg-[#f9fafb] text-[#1e3a5f]"
          aria-label="Agregar a favoritos"
        >
          <IconHeart />
        </button>
      </div>

      {error && <p className="mb-4 text-sm text-[#d62828]">{error}</p>}

      {!user && !isAuthenticated() && !outOfStock && (
        <p className="mb-4 text-sm text-[#6b7280]">
          Debes iniciar sesión para comprar.{" "}
          <a href="/login" className="font-semibold text-[#1e3a5f] underline">
            Ingresar
          </a>
        </p>
      )}

      <div className="rounded-2xl border border-[#e5e7eb] bg-white p-5">
        <div className="space-y-3">
          <div className="flex items-start gap-3 border-b border-[#e5e7eb] pb-3">
            <span className="mt-0.5">
              <IconTruck />
            </span>
            <div className="flex-1">
              <div className="text-sm font-semibold text-[#111827]">Envío a domicilio</div>
              <div className="text-xs text-[#6b7280]">Bogotá, Medellín y Cali · Entrega mañana</div>
            </div>
            <span className="text-sm font-bold text-[#10b981]">Gratis</span>
          </div>

          <div className="flex items-start gap-3 border-b border-[#e5e7eb] pb-3">
            <span className="mt-0.5">
              <IconStore />
            </span>
            <div className="flex-1">
              <div className="text-sm font-semibold text-[#111827]">Recoge en tienda</div>
              <div className="text-xs text-[#6b7280]">Disponible hoy en tiendas seleccionadas</div>
            </div>
            <span className="text-sm font-bold text-[#10b981]">Gratis</span>
          </div>

          <div className="flex items-start gap-3">
            <span className="mt-0.5">
              <IconReturn />
            </span>
            <div>
              <div className="text-sm font-semibold text-[#111827]">Devolución gratuita</div>
              <div className="text-xs text-[#6b7280]">Tienes 30 días para devolver el producto</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

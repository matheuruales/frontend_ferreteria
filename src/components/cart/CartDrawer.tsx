"use client";

import { useEffect, useRef } from "react";
import { useCart } from "@/hooks/useCart";
import CartItemRow from "./CartItem";
import CartSummary from "./CartSummary";
import Link from "next/link";

function IconCart() {
  return (
    <svg viewBox="0 0 24 24" className="size-12 text-[#9ca3af]" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M3 4h2l1.2 9h10.6l2-7H7" />
      <circle cx="10" cy="19" r="1.3" />
      <circle cx="17" cy="19" r="1.3" />
    </svg>
  );
}

export default function CartDrawer() {
  const { cart, openDrawer, setOpenDrawer, loading } = useCart();
  const overlayRef = useRef<HTMLDivElement>(null);

  // Close on outside click
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpenDrawer(false);
    };
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [setOpenDrawer]);

  // Prevent body scroll when open
  useEffect(() => {
    if (openDrawer) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [openDrawer]);

  if (!openDrawer) return null;

  const items = cart?.items ?? [];
  const subtotal = cart?.subtotal ?? 0;

  return (
    <div className="fixed inset-0 z-50 flex">
      {/* Overlay */}
      <div
        ref={overlayRef}
        className="absolute inset-0 bg-black/40"
        onClick={() => setOpenDrawer(false)}
      />

      {/* Drawer */}
      <div className="relative ml-auto w-full max-w-md bg-white h-full flex flex-col shadow-xl">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-neutral-200">
          <h2 className="text-lg font-semibold text-neutral-900">
            Carrito {cart?.item_count ? `(${cart.item_count})` : ""}
          </h2>
          <button
            onClick={() => setOpenDrawer(false)}
            className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-neutral-100 text-neutral-500"
          >
            ✕
          </button>
        </div>

        {/* Items */}
        <div className="flex-1 overflow-y-auto p-4">
          {loading ? (
            <div className="text-center py-8 text-neutral-400">Cargando...</div>
          ) : items.length === 0 ? (
            <div className="text-center py-12">
              <div className="mb-4 flex justify-center">
                <IconCart />
              </div>
              <p className="text-neutral-600 font-medium">Tu carrito está vacío</p>
              <Link
                href="/catalogo"
                onClick={() => setOpenDrawer(false)}
                className="mt-4 inline-block text-sm text-primary-600 hover:underline"
              >
                Explorar productos
              </Link>
            </div>
          ) : (
            <div>
              {items.map((item) => (
                <CartItemRow key={item.id} item={item} />
              ))}
            </div>
          )}
        </div>

        {/* Summary */}
        {items.length > 0 && (
          <div className="p-4 border-t border-neutral-200">
            <CartSummary subtotal={subtotal} compact />
            <div className="mt-3 space-y-2">
              <Link
                href="/checkout"
                onClick={() => setOpenDrawer(false)}
                className="flex h-11 w-full items-center justify-center rounded-[10px] bg-[#f57c00] font-display text-sm font-bold text-white hover:bg-[#e56f00]"
              >
                Ir a pagar
              </Link>
              <Link
                href="/carrito"
                onClick={() => setOpenDrawer(false)}
                className="flex h-10 w-full items-center justify-center rounded-[10px] border-[1.5px] border-[#e5e7eb] font-display text-sm font-semibold text-[#1e3a5f] hover:bg-[#f9fafb]"
              >
                Ver carrito completo
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

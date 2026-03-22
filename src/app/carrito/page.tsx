"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/hooks/useAuth";
import { useCart } from "@/hooks/useCart";
import CartItemRow from "@/components/cart/CartItem";
import CartSummary from "@/components/cart/CartSummary";
import CheckoutMiniHeader from "@/components/layout/CheckoutMiniHeader";

export default function CartPage() {
  const { user, loading: authLoading } = useAuth();
  const { cart, loading: cartLoading } = useCart();
  const router = useRouter();
  const [coupon, setCoupon] = useState("");

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login");
    }
  }, [user, authLoading, router]);

  if (authLoading || cartLoading) {
    return (
      <div className="min-h-screen bg-[#f9fafb]">
        <CheckoutMiniHeader secureText="Compra segura" />
        <div className="home-shell px-4 py-16 text-center text-[#6b7280] sm:px-6">
          Cargando carrito...
        </div>
      </div>
    );
  }

  if (!user) return null;

  const items = cart?.items ?? [];
  const subtotal = cart?.subtotal ?? 0;

  return (
    <main className="min-h-screen bg-[#f9fafb]">
      <CheckoutMiniHeader secureText="Compra segura" />

      <div className="home-shell px-4 py-6 sm:px-6 lg:px-8">
        <h1 className="font-display text-[26px] font-extrabold text-[#111827]">Mi carrito</h1>
        <p className="mb-6 text-sm text-[#6b7280]">
          {cart?.item_count ?? 0} productos · {new Intl.NumberFormat("es-CO", {
            style: "currency",
            currency: "COP",
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
          }).format(subtotal)}
        </p>

        {items.length === 0 ? (
          <div className="rounded-2xl border border-[#e5e7eb] bg-white py-20 text-center">
            <p className="mb-3 text-5xl">🛒</p>
            <p className="font-display text-lg font-semibold text-[#111827]">Tu carrito está vacío</p>
            <p className="mt-1 text-sm text-[#6b7280]">Agrega productos desde el catálogo</p>
            <Link
              href="/catalogo"
              className="mt-6 inline-flex h-11 items-center rounded-xl bg-[#1e3a5f] px-7 font-display text-sm font-semibold text-white hover:bg-[#1a3355]"
            >
              Explorar catálogo
            </Link>
          </div>
        ) : (
          <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
            <div>
              <div className="space-y-3">
                {items.map((item) => (
                  <CartItemRow key={item.id} item={item} />
                ))}
              </div>

              <div className="mt-4 flex gap-2">
                <input
                  value={coupon}
                  onChange={(e) => setCoupon(e.target.value)}
                  placeholder="Código de descuento"
                  className="h-10 flex-1 rounded-lg border-[1.5px] border-[#e5e7eb] px-3 text-sm text-[#111827] outline-none focus:border-[#1e3a5f]"
                />
                <button
                  type="button"
                  className="h-10 rounded-lg border-[1.5px] border-[#1e3a5f] px-4 font-display text-sm font-semibold text-[#1e3a5f]"
                >
                  Aplicar
                </button>
              </div>
            </div>

            <div>
              <CartSummary subtotal={subtotal} />
            </div>
          </div>
        )}
      </div>
    </main>
  );
}

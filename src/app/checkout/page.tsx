"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/hooks/useAuth";
import { useCart } from "@/hooks/useCart";
import { useCheckout } from "@/hooks/useCheckout";
import ShippingForm from "@/components/checkout/ShippingForm";
import OrderSummary from "@/components/checkout/OrderSummary";
import StripePaymentForm from "@/components/checkout/StripePaymentForm";
import CheckoutMiniHeader from "@/components/layout/CheckoutMiniHeader";
import type { ShippingAddress } from "@/types";

type CheckoutStep = "shipping" | "summary" | "payment";

export default function CheckoutPage() {
  const { user, loading: authLoading } = useAuth();
  const { cart, loading: cartLoading } = useCart();
  const router = useRouter();
  const checkout = useCheckout();
  const [step, setStep] = useState<CheckoutStep>("shipping");

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login");
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    if (!cartLoading && cart && cart.item_count === 0) {
      router.push("/carrito");
    }
  }, [cart, cartLoading, router]);

  if (authLoading || cartLoading) {
    return (
      <div className="min-h-screen bg-[#f9fafb]">
        <CheckoutMiniHeader secureText="Pago cifrado SSL" />
        <div className="home-shell px-4 py-16 text-center text-[#6b7280] sm:px-6">Cargando...</div>
      </div>
    );
  }

  if (!user) return null;

  const handleShippingSubmit = async (address: ShippingAddress) => {
    const result = await checkout.submitShipping(address);
    if (!result.error) setStep("summary");
  };

  const handlePayNow = async () => {
    const result = await checkout.initiatePayment();
    if (!result.error) setStep("payment");
  };

  const isDone = (target: CheckoutStep) =>
    (target === "shipping" && step !== "shipping") || (target === "summary" && step === "payment");

  const activeSectionTitle =
    step === "shipping" ? "Dirección de envío" : step === "summary" ? "Resumen y confirmación" : "Método de pago";

  return (
    <main className="min-h-screen bg-[#f9fafb]">
      <CheckoutMiniHeader secureText="Pago cifrado SSL" />

      <div className="home-shell px-4 py-6 sm:px-6 lg:px-8">
        <div className="mb-6 flex items-center gap-2">
          <Step title="Carrito" value="1" done />
          <Line done />
          <Step title="Envío" value="2" active={step === "shipping"} done={isDone("shipping")} />
          <Line done={step === "payment"} />
          <Step title="Pago" value="3" active={step === "payment"} />
        </div>

        {checkout.error && (
          <div className="mb-4 rounded-lg border border-[#fecaca] bg-[#fef2f2] px-3 py-2 text-sm text-[#b91c1c]">
            {checkout.error}{" "}
            {checkout.error.includes("stock") && (
              <Link href="/carrito" className="font-semibold underline">
                Revisar carrito
              </Link>
            )}
          </div>
        )}

        <div className="grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
          <section className="rounded-[14px] border border-[#e5e7eb] bg-white p-5">
            <h1 className="mb-4 font-display text-lg font-bold text-[#111827]">{activeSectionTitle}</h1>

            {step === "shipping" && <ShippingForm onSubmit={handleShippingSubmit} loading={checkout.loading} />}

            {step === "summary" && checkout.summary && (
              <div className="space-y-4">
                <div className="rounded-[14px] border border-[#e5e7eb] bg-[#f9fafb] p-4 text-sm text-[#6b7280]">
                  Verifica los datos de envío y continúa al pago.
                </div>
                <div className="grid gap-2 sm:grid-cols-2">
                  <button
                    onClick={() => setStep("shipping")}
                    className="h-11 rounded-[10px] border-[1.5px] border-[#e5e7eb] font-display text-sm font-semibold text-[#1e3a5f]"
                    type="button"
                  >
                    ← Editar dirección
                  </button>
                  <button
                    onClick={() => void handlePayNow()}
                    disabled={checkout.loading}
                    className="h-11 rounded-[10px] bg-[#f57c00] font-display text-sm font-bold text-white hover:bg-[#e56f00] disabled:opacity-60"
                    type="button"
                  >
                    {checkout.loading ? "Preparando..." : "Confirmar y continuar"}
                  </button>
                </div>
              </div>
            )}

            {step === "payment" && checkout.checkoutUrl && (
              <div className="space-y-4">
                <StripePaymentForm checkoutUrl={checkout.checkoutUrl} loading={checkout.loading} />
                <button
                  onClick={() => setStep("summary")}
                  className="text-sm font-medium text-[#6b7280] hover:text-[#111827]"
                  type="button"
                >
                  ← Volver al resumen
                </button>
              </div>
            )}
          </section>

          <aside className="space-y-3">
            {checkout.summary ? (
              <OrderSummary summary={checkout.summary} />
            ) : (
              <div className="rounded-[14px] border border-[#e5e7eb] bg-white p-5 text-sm text-[#6b7280]">
                Completa tu dirección para ver el resumen del pedido.
              </div>
            )}
          </aside>
        </div>
      </div>
    </main>
  );
}

function Step({
  title,
  value,
  active = false,
  done = false,
}: {
  title: string;
  value: string;
  active?: boolean;
  done?: boolean;
}) {
  const circleClass = done
    ? "bg-[#10b981] text-white"
    : active
    ? "bg-[#1e3a5f] text-white"
    : "bg-[#e5e7eb] text-[#6b7280]";

  return (
    <div className="flex items-center gap-2">
      <span
        className={`inline-flex h-7 w-7 items-center justify-center rounded-full font-display text-xs font-bold ${circleClass}`}
      >
        {done ? "✓" : value}
      </span>
      <span className={`text-xs font-semibold ${active ? "text-[#1e3a5f]" : "text-[#6b7280]"}`}>{title}</span>
    </div>
  );
}

function Line({ done = false }: { done?: boolean }) {
  return <div className={`h-[2px] flex-1 ${done ? "bg-[#10b981]" : "bg-[#e5e7eb]"}`} />;
}

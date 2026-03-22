"use client";

import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import CheckoutMiniHeader from "@/components/layout/CheckoutMiniHeader";
import { useCart } from "@/hooks/useCart";
import { apiClient } from "@/lib/api-client";

type VerifyStatus = "loading" | "processing" | "succeeded" | "failed" | "unknown";

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function ConfirmacionContent() {
  const searchParams = useSearchParams();
  const { clearCart } = useCart();
  const [status, setStatus] = useState<VerifyStatus>("loading");
  const [orderId, setOrderId] = useState<string | null>(null);
  const [paymentReference, setPaymentReference] = useState<string | null>(null);
  const [transactionId, setTransactionId] = useState<string | null>(null);

  useEffect(() => {
    const wompiTransactionId = searchParams.get("id");
    if (!wompiTransactionId) {
      setStatus("unknown");
      return;
    }
    setTransactionId(wompiTransactionId);

    const verify = async () => {
      setStatus("processing");
      const maxAttempts = 10;

      for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
        const result = await apiClient.checkout.verifyTransaction({
          transaction_id: wompiTransactionId,
        });

        if (result.error) {
          if (result.error.status === 404 && attempt < maxAttempts) {
            await sleep(1200);
            continue;
          }
          setStatus("unknown");
          return;
        }

        const verifyStatus = (result.data.status || "").toUpperCase();
        setPaymentReference(result.data.payment_reference ?? null);

        if (verifyStatus === "APPROVED") {
          if (result.data.order_id) {
            setOrderId(result.data.order_id);
            await clearCart();
            setStatus("succeeded");
            return;
          }
          await sleep(1200);
          continue;
        }

        if (verifyStatus === "PENDING") {
          await sleep(1500);
          continue;
        }

        if (verifyStatus === "DECLINED" || verifyStatus === "VOIDED" || verifyStatus === "ERROR") {
          setStatus("failed");
          return;
        }

        setStatus("unknown");
        return;
      }

      setStatus("unknown");
    };

    void verify();
  }, [searchParams, clearCart]);

  if (status === "loading" || status === "processing") {
    return (
      <div className="mx-auto max-w-xl px-4 py-16 text-center">
        <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-4 border-[#e5e7eb] border-t-[#1e3a5f]" />
        <p className="font-medium text-[#111827]">Verificando tu pago con Wompi...</p>
        <p className="mt-1 text-sm text-[#6b7280]">Esto puede tardar unos segundos.</p>
      </div>
    );
  }

  if (status === "succeeded") {
    return (
      <div className="mx-auto max-w-xl px-4 py-10">
        <div className="rounded-[14px] border border-[#e5e7eb] bg-white p-6 text-center">
          <div className="mx-auto mb-5 flex h-24 w-24 items-center justify-center rounded-full border-4 border-[rgba(16,185,129,0.4)] bg-[rgba(16,185,129,0.1)] text-5xl">
            ✓
          </div>
          <h1 className="font-display text-[26px] font-extrabold text-[#111827]">Pedido confirmado</h1>
          <p className="mx-auto mt-2 max-w-sm text-sm text-[#6b7280]">
            El pago fue aprobado y el pedido quedó registrado correctamente.
          </p>

          <div className="mt-5 rounded-[14px] border border-[#e5e7eb] bg-white p-4 text-left text-sm">
            <div className="flex items-center justify-between border-b border-[#e5e7eb] py-2">
              <span className="text-[#6b7280]">Pedido</span>
              <span className="font-semibold text-[#111827]">
                {orderId ? `#${orderId.slice(0, 8).toUpperCase()}` : "-"}
              </span>
            </div>
            <div className="flex items-center justify-between border-b border-[#e5e7eb] py-2">
              <span className="text-[#6b7280]">Transacción Wompi</span>
              <span className="font-semibold text-[#111827]">{transactionId ?? "-"}</span>
            </div>
            <div className="flex items-center justify-between py-2">
              <span className="text-[#6b7280]">Referencia</span>
              <span className="font-semibold text-[#111827]">{paymentReference ?? "-"}</span>
            </div>
          </div>

          <div className="mt-5 space-y-2">
            <Link
              href="/cuenta/pedidos"
              className="flex h-12 w-full items-center justify-center rounded-xl bg-[#1e3a5f] font-display text-sm font-bold text-white hover:bg-[#1a3355]"
            >
              Ver mis pedidos
            </Link>
            <Link
              href="/catalogo"
              className="flex h-10 w-full items-center justify-center rounded-[10px] border-[1.5px] border-[#e5e7eb] font-display text-sm font-semibold text-[#1e3a5f]"
            >
              ← Seguir comprando
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (status === "failed") {
    return (
      <div className="mx-auto max-w-xl px-4 py-16 text-center">
        <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-[#fef2f2] text-4xl text-[#d62828]">
          ✕
        </div>
        <h1 className="font-display text-2xl font-extrabold text-[#111827]">Pago rechazado</h1>
        <p className="mt-2 text-sm text-[#6b7280]">
          Wompi reportó que la transacción fue rechazada o anulada.
        </p>
        <div className="mt-6 flex flex-col gap-2 sm:flex-row sm:justify-center">
          <Link
            href="/checkout"
            className="inline-flex h-11 items-center justify-center rounded-xl bg-[#1e3a5f] px-6 font-display text-sm font-semibold text-white"
          >
            Intentar de nuevo
          </Link>
          <Link
            href="/carrito"
            className="inline-flex h-11 items-center justify-center rounded-xl border border-[#e5e7eb] px-6 font-display text-sm font-semibold text-[#111827]"
          >
            Volver al carrito
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-xl px-4 py-16 text-center">
      <p className="text-[#111827]">No fue posible confirmar el estado final del pago.</p>
      <p className="mt-1 text-sm text-[#6b7280]">
        Si ya pagaste, revisa tu historial en unos segundos.
      </p>
      <Link href="/cuenta/pedidos" className="mt-4 inline-block text-sm font-semibold text-[#1e3a5f] underline">
        Ver mis pedidos
      </Link>
    </div>
  );
}

export default function ConfirmacionPage() {
  return (
    <main className="min-h-screen bg-[#f9fafb]">
      <CheckoutMiniHeader secureText="Pago procesado" />
      <Suspense
        fallback={
          <div className="mx-auto max-w-xl px-4 py-16 text-center">
            <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-4 border-[#e5e7eb] border-t-[#1e3a5f]" />
            <p className="text-[#6b7280]">Verificando tu pago...</p>
          </div>
        }
      >
        <ConfirmacionContent />
      </Suspense>
    </main>
  );
}

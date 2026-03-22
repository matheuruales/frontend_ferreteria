"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { apiClient } from "@/lib/api-client";
import type { AdminOrderDetail, OrderStatus } from "@/types";

function formatCOP(value: number): string {
  return new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}

function formatDate(iso: string): string {
  return new Intl.DateTimeFormat("es-CO", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(iso));
}

function statusLabel(status: string): string {
  const map: Record<string, string> = {
    pending: "Pendiente",
    paid: "Pagado",
    processing: "Preparando",
    confirmed: "Confirmado",
    shipped: "En reparto",
    completed: "Entregado",
    delivered: "Entregado",
    cancelled: "Cancelado",
  };
  return map[status] ?? status;
}

function statusColor(status: string): string {
  if (["completed", "delivered", "confirmed"].includes(status)) {
    return "bg-[rgba(16,185,129,0.1)] text-[#065f46]";
  }
  if (["cancelled"].includes(status)) {
    return "bg-[rgba(214,40,40,0.1)] text-[#991b1b]";
  }
  return "bg-[rgba(245,124,0,0.1)] text-[#92400e]";
}

function getNextStatus(status: string): OrderStatus | null {
  const map: Record<string, OrderStatus | null> = {
    pending: "paid",
    paid: "processing",
    confirmed: "processing",
    processing: "shipped",
    shipped: "delivered",
    delivered: null,
    completed: null,
    cancelled: null,
  };
  return map[status] ?? null;
}

export default function AdminPedidoDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [order, setOrder] = useState<AdminOrderDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [updating, setUpdating] = useState(false);

  async function loadOrder() {
    setLoading(true);
    setError(null);
    const result = await apiClient.admin.getOrder(id);
    setLoading(false);
    if (result.error) {
      setError(result.error.message);
      return;
    }
    setOrder(result.data);
  }

  async function handleAdvance() {
    if (!order) return;
    const next = getNextStatus(order.status);
    if (!next) return;

    setUpdating(true);
    setError(null);
    const result = await apiClient.admin.updateOrderStatus(order.id, { status: next });
    setUpdating(false);
    if (result.error) {
      setError(result.error.message);
      return;
    }
    await loadOrder();
  }

  useEffect(() => {
    if (!id) return;
    void loadOrder();
  }, [id]); // eslint-disable-line react-hooks/exhaustive-deps

  if (loading) {
    return (
      <div className="rounded-[14px] border border-[#e5e7eb] bg-white p-6 text-center text-[#6b7280]">
        Cargando pedido...
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="rounded-[14px] border border-[#e5e7eb] bg-white p-6">
        <p className="mb-4 text-sm text-[#b91c1c]">{error ?? "No se pudo cargar el pedido."}</p>
        <Link href="/admin/pedidos" className="text-sm font-semibold text-[#1e3a5f] underline">
          Volver a pedidos
        </Link>
      </div>
    );
  }

  const nextStatus = getNextStatus(order.status);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Link href="/admin/pedidos" className="text-sm font-semibold text-[#1e3a5f] underline">
          ← Volver a pedidos
        </Link>
        {nextStatus && (
          <button
            type="button"
            onClick={() => void handleAdvance()}
            disabled={updating}
            className="rounded-lg bg-[#1e3a5f] px-4 py-2 text-sm font-semibold text-white disabled:opacity-60"
          >
            {updating ? "Guardando..." : `Marcar ${statusLabel(nextStatus)}`}
          </button>
        )}
      </div>

      <section className="rounded-[14px] border border-[#e5e7eb] bg-white p-5">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="font-display text-xl font-extrabold text-[#111827]">{order.code}</h1>
            <p className="text-sm text-[#6b7280]">{formatDate(order.created_at)}</p>
          </div>
          <span className={`rounded-full px-3 py-1 text-xs font-bold ${statusColor(order.status)}`}>
            {statusLabel(order.status)}
          </span>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <article className="rounded-xl border border-[#e5e7eb] p-3">
            <p className="text-xs text-[#6b7280]">Cliente</p>
            <p className="text-sm font-semibold text-[#111827]">{order.customer_name}</p>
          </article>
          <article className="rounded-xl border border-[#e5e7eb] p-3">
            <p className="text-xs text-[#6b7280]">Items</p>
            <p className="text-sm font-semibold text-[#111827]">{order.item_count}</p>
          </article>
          <article className="rounded-xl border border-[#e5e7eb] p-3">
            <p className="text-xs text-[#6b7280]">Total</p>
            <p className="text-sm font-semibold text-[#111827]">{formatCOP(order.total)}</p>
          </article>
        </div>
      </section>

      <section className="overflow-hidden rounded-[14px] border border-[#e5e7eb] bg-white">
        <div className="border-b border-[#e5e7eb] px-5 py-3 font-display text-sm font-bold text-[#111827]">
          Productos
        </div>
        {order.items.map((item) => (
          <div key={item.id} className="flex items-center gap-3 border-b border-[#e5e7eb] px-5 py-3 last:border-b-0">
            <div className="relative h-12 w-12 overflow-hidden rounded-lg bg-[#f3f4f6]">
              {item.product_image_url ? (
                <Image src={item.product_image_url} alt={item.product_name} fill sizes="48px" className="object-contain p-1" />
              ) : (
                <div className="flex h-full items-center justify-center text-[#9ca3af]">□</div>
              )}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold text-[#111827]">{item.product_name}</p>
              <p className="text-xs text-[#6b7280]">
                {item.quantity} x {formatCOP(item.unit_price)}
              </p>
            </div>
            <div className="text-sm font-bold text-[#111827]">{formatCOP(item.subtotal)}</div>
          </div>
        ))}
      </section>

      <div className="grid gap-4 lg:grid-cols-2">
        <section className="overflow-hidden rounded-[14px] border border-[#e5e7eb] bg-white">
          <div className="border-b border-[#e5e7eb] px-5 py-3 font-display text-sm font-bold text-[#111827]">
            Resumen de pago
          </div>
          <Row label="Subtotal" value={formatCOP(order.subtotal)} />
          <Row label="Envío" value={order.shipping_cost > 0 ? formatCOP(order.shipping_cost) : "Gratis"} />
          <Row label="Total" value={formatCOP(order.total)} strong />
          {order.payment && <Row label="Referencia de pago" value={order.payment.payment_reference} />}
          {order.payment && <Row label="Estado del pago" value={order.payment.status} />}
        </section>

        <section className="overflow-hidden rounded-[14px] border border-[#e5e7eb] bg-white">
          <div className="border-b border-[#e5e7eb] px-5 py-3 font-display text-sm font-bold text-[#111827]">
            Dirección de envío
          </div>
          {order.shipping_address ? (
            <div className="px-5 py-4 text-sm leading-6 text-[#111827]">
              <div className="font-semibold">{order.shipping_address.recipient_name}</div>
              <div>{order.shipping_address.address_line}</div>
              <div>
                {order.shipping_address.city}, {order.shipping_address.state} {order.shipping_address.postal_code}
              </div>
              <div>{order.shipping_address.country}</div>
              {order.shipping_address.phone && <div>{order.shipping_address.phone}</div>}
            </div>
          ) : (
            <div className="px-5 py-4 text-sm text-[#6b7280]">Sin dirección registrada en el pedido.</div>
          )}
        </section>
      </div>
    </div>
  );
}

function Row({ label, value, strong = false }: { label: string; value: string; strong?: boolean }) {
  return (
    <div className="flex items-center justify-between border-b border-[#e5e7eb] px-5 py-3 last:border-b-0">
      <span className="text-sm text-[#6b7280]">{label}</span>
      <span className={strong ? "font-display text-base font-extrabold text-[#1e3a5f]" : "text-sm font-semibold text-[#111827]"}>
        {value}
      </span>
    </div>
  );
}

import Link from "next/link";
import Image from "next/image";
import type { OrderDetail } from "@/types";

interface OrderDetailProps {
  order: OrderDetail;
}

function formatCOP(amount: number): string {
  return new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
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

export default function OrderDetailView({ order }: OrderDetailProps) {
  const orderCode = `#${order.id.slice(0, 8).toUpperCase()}`;
  const statusLabel = getOrderStatusLabel(order.status);

  return (
    <div>
      <div className="mb-4">
        <Link href="/cuenta/pedidos" className="text-sm font-semibold text-[#1e3a5f]">
          ← Volver a pedidos
        </Link>
      </div>

      <section className="mb-4 rounded-[14px] border border-[#e5e7eb] bg-white p-5">
        <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
          <div>
            <h1 className="font-display text-[22px] font-extrabold text-[#111827]">Pedido {orderCode}</h1>
            <p className="text-sm text-[#6b7280]">{formatDate(order.created_at)} · {order.items.length} artículos</p>
          </div>
          <span className="rounded-full bg-[rgba(245,124,0,0.1)] px-3 py-1 text-sm font-bold text-[#92400e]">
            {statusLabel}
          </span>
        </div>

        <div className="rounded-xl border border-[#e5e7eb] bg-[#f9fafb] px-3 py-2 text-sm text-[#374151]">
          Estado actual del pedido: <span className="font-semibold text-[#111827]">{statusLabel}</span>
        </div>
      </section>

      <section className="mb-3 overflow-hidden rounded-[14px] border border-[#e5e7eb] bg-white">
        <div className="border-b border-[#e5e7eb] px-5 py-3 font-display text-sm font-bold text-[#111827]">
          Productos en este pedido
        </div>
        {order.items.map((item) => (
          <div key={item.id} className="flex items-center gap-3 border-b border-[#e5e7eb] px-5 py-3 last:border-b-0">
            <div className="relative h-12 w-12 overflow-hidden rounded-lg bg-[#f3f4f6]">
              {item.product_image_url ? (
                <Image src={item.product_image_url} alt={item.product_name} fill sizes="48px" className="object-contain p-1" />
              ) : (
                <div className="flex h-full items-center justify-center text-lg">📦</div>
              )}
            </div>
            <div className="flex-1">
              <div className="text-sm font-semibold text-[#111827]">{item.product_name}</div>
              <div className="text-xs text-[#6b7280]">Cantidad: {item.quantity}</div>
            </div>
            <div className="font-display text-sm font-extrabold text-[#111827]">{formatCOP(item.subtotal)}</div>
          </div>
        ))}
      </section>

      <section className="mb-3 overflow-hidden rounded-[14px] border border-[#e5e7eb] bg-white">
        <div className="border-b border-[#e5e7eb] px-5 py-3 font-display text-sm font-bold text-[#111827]">
          Resumen del pago
        </div>
        <Row label="Subtotal" value={formatCOP(order.subtotal)} />
        <Row
          label="Envío"
          value={order.shipping_cost > 0 ? formatCOP(order.shipping_cost) : "Gratis"}
          highlight={order.shipping_cost === 0}
        />
        <Row label="Total pagado" value={formatCOP(order.total)} total />
        {order.payment && <Row label="Estado del pago" value={order.payment.status} />}
      </section>

      {order.shipping_address && (
        <section className="mb-3 overflow-hidden rounded-[14px] border border-[#e5e7eb] bg-white">
          <div className="border-b border-[#e5e7eb] px-5 py-3 font-display text-sm font-bold text-[#111827]">
            Dirección de entrega
          </div>
          <div className="px-5 py-4 text-sm leading-6 text-[#111827]">
            <div className="font-semibold">{order.shipping_address.recipient_name}</div>
            <div>{order.shipping_address.address_line}</div>
            <div>
              {order.shipping_address.city}, {order.shipping_address.state} {order.shipping_address.postal_code}
            </div>
            <div>{order.shipping_address.country}</div>
            {order.shipping_address.phone && <div>{order.shipping_address.phone}</div>}
          </div>
        </section>
      )}
    </div>
  );
}

function Row({
  label,
  value,
  highlight = false,
  total = false,
}: {
  label: string;
  value: string;
  highlight?: boolean;
  total?: boolean;
}) {
  return (
    <div className="flex items-center justify-between border-b border-[#e5e7eb] px-5 py-3 last:border-b-0">
      <span className={total ? "font-display text-base font-extrabold text-[#111827]" : "text-sm text-[#6b7280]"}>
        {label}
      </span>
      <span
        className={
          total
            ? "font-display text-lg font-extrabold text-[#1e3a5f]"
            : highlight
            ? "text-sm font-semibold text-[#10b981]"
            : "text-sm font-semibold text-[#111827]"
        }
      >
        {value}
      </span>
    </div>
  );
}

function getOrderStatusLabel(status: string): string {
  switch (status) {
    case "pending":
      return "Pendiente";
    case "paid":
      return "Pagado";
    case "processing":
      return "En preparación";
    case "confirmed":
      return "Confirmado";
    case "shipped":
      return "En camino";
    case "completed":
      return "Completado";
    case "delivered":
      return "Entregado";
    case "cancelled":
      return "Cancelado";
    default:
      return status;
  }
}

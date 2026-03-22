import Link from "next/link";
import Image from "next/image";
import type { Order, OrderStatus } from "@/types";

interface OrderListProps {
  orders: Order[];
  page: number;
  total: number;
  perPage: number;
  onPageChange: (page: number) => void;
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
  }).format(new Date(iso));
}

const STATUS_LABELS: Record<OrderStatus, { label: string; className: string }> = {
  pending: { label: "Pendiente", className: "bg-neutral-100 text-neutral-600" },
  paid: { label: "Pagado", className: "bg-[rgba(30,58,95,0.1)] text-[#1e3a5f]" },
  processing: { label: "En preparación", className: "bg-[rgba(245,124,0,0.1)] text-[#92400e]" },
  confirmed: { label: "Confirmado", className: "bg-[rgba(245,124,0,0.1)] text-[#92400e]" },
  shipped: { label: "En camino", className: "bg-[rgba(30,58,95,0.1)] text-[#1e3a5f]" },
  completed: { label: "Entregado", className: "bg-[rgba(16,185,129,0.1)] text-[#065f46]" },
  delivered: { label: "Entregado", className: "bg-[rgba(16,185,129,0.1)] text-[#065f46]" },
  cancelled: { label: "Cancelado", className: "bg-[rgba(214,40,40,0.1)] text-[#d62828]" },
};

export default function OrderList({ orders, page, total, perPage, onPageChange }: OrderListProps) {
  const totalPages = Math.max(1, Math.ceil(total / perPage));

  if (orders.length === 0) {
    return (
      <div className="rounded-2xl border border-[#e5e7eb] bg-white py-16 text-center">
        <p className="mb-3 text-5xl">📦</p>
        <p className="font-display text-lg font-semibold text-[#111827]">Aún no tienes pedidos</p>
        <Link href="/catalogo" className="mt-3 inline-block text-sm font-semibold text-[#1e3a5f] underline">
          Explorar catálogo
        </Link>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-5 flex flex-wrap gap-2">
        <span className="rounded-full bg-[#1e3a5f] px-4 py-1.5 text-sm font-semibold text-white">
          Todos ({total})
        </span>
        <span className="rounded-full border border-[#e5e7eb] bg-white px-4 py-1.5 text-sm text-[#6b7280]">
          En proceso
        </span>
        <span className="rounded-full border border-[#e5e7eb] bg-white px-4 py-1.5 text-sm text-[#6b7280]">
          Entregados
        </span>
      </div>

      <div className="space-y-3">
        {orders.map((order) => {
          const badge = STATUS_LABELS[order.status];
          const idShort = `#${order.id.slice(0, 8).toUpperCase()}`;

          return (
            <article key={order.id} className="overflow-hidden rounded-[14px] border border-[#e5e7eb] bg-white">
              <div className="flex items-center gap-3 border-b border-[#e5e7eb] px-4 py-3">
                <div>
                  <div className="font-display text-sm font-bold text-[#1e3a5f]">{idShort}</div>
                  <div className="text-xs text-[#6b7280]">
                    {formatDate(order.created_at)} · {order.item_count} productos
                  </div>
                </div>
                <span className={`ml-auto rounded-full px-2.5 py-1 text-[11px] font-bold ${badge.className}`}>
                  {badge.label}
                </span>
              </div>

              <div className="flex items-center gap-3 px-4 py-3">
                <div className="flex gap-2">
                  {order.items_preview.slice(0, 2).map((item, i) => (
                    <div
                      key={`${order.id}-${i}`}
                      className="relative h-12 w-12 overflow-hidden rounded-lg border border-[#e5e7eb] bg-[#f3f4f6]"
                    >
                      {item.product_image_url ? (
                        <Image
                          src={item.product_image_url}
                          alt={item.product_name}
                          fill
                          sizes="48px"
                          className="object-contain p-1"
                        />
                      ) : (
                        <div className="flex h-full items-center justify-center text-lg">📦</div>
                      )}
                    </div>
                  ))}
                  {order.item_count > 2 && (
                    <div className="flex h-12 w-12 items-center justify-center rounded-lg border border-[#e5e7eb] bg-[rgba(30,58,95,0.06)] text-xs font-bold text-[#6b7280]">
                      +{order.item_count - 2}
                    </div>
                  )}
                </div>

                <div className="flex-1">
                  <div className="text-sm font-medium text-[#111827]">
                    {order.items_preview[0]?.product_name ?? "Pedido"}
                    {order.item_count > 1 ? ` + ${order.item_count - 1} más` : ""}
                  </div>
                  <div className="text-xs text-[#6b7280]">{order.item_count} artículos</div>
                </div>

                <div className="font-display text-base font-extrabold text-[#111827]">
                  {formatCOP(order.total)}
                </div>
              </div>

              <div className="flex gap-2 bg-[#f9fafb] px-4 py-2.5">
                <Link
                  href={`/cuenta/pedidos/${order.id}`}
                  className="rounded-lg bg-[#1e3a5f] px-3 py-1.5 font-display text-xs font-semibold text-white"
                >
                  Ver detalle
                </Link>
                <button className="rounded-lg border border-[#e5e7eb] bg-white px-3 py-1.5 font-display text-xs font-semibold text-[#111827]">
                  Rastrear
                </button>
              </div>
            </article>
          );
        })}
      </div>

      {totalPages > 1 && (
        <div className="mt-4 flex items-center justify-between text-sm text-[#6b7280]">
          <span>
            Página {page} de {totalPages}
          </span>
          <div className="flex gap-2">
            <button
              onClick={() => onPageChange(page - 1)}
              disabled={page <= 1}
              className="rounded-lg border border-[#e5e7eb] bg-white px-3 py-1.5 disabled:opacity-40"
              type="button"
            >
              Anterior
            </button>
            <button
              onClick={() => onPageChange(page + 1)}
              disabled={page >= totalPages}
              className="rounded-lg border border-[#e5e7eb] bg-white px-3 py-1.5 disabled:opacity-40"
              type="button"
            >
              Siguiente
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

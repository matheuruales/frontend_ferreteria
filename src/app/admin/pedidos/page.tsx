"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/hooks/useAuth";
import { apiClient } from "@/lib/api-client";
import type { AdminOrder, OrderStatus } from "@/types";

const PER_PAGE = 20;

const FILTER_OPTIONS: Array<{ value: "" | OrderStatus; label: string }> = [
  { value: "", label: "Todos los estados" },
  { value: "pending", label: "Pendiente" },
  { value: "paid", label: "Pagado" },
  { value: "processing", label: "Preparando" },
  { value: "shipped", label: "En reparto" },
  { value: "delivered", label: "Entregado" },
  { value: "cancelled", label: "Cancelado" },
];

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

export default function AdminPedidosPage() {
  const { user } = useAuth();
  const [orders, setOrders] = useState<AdminOrder[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState<"" | OrderStatus>("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [updatingOrderId, setUpdatingOrderId] = useState<string | null>(null);

  async function loadOrders(targetPage: number, filter: "" | OrderStatus = statusFilter) {
    setLoading(true);
    setError(null);
    const params: { page: number; per_page: number; status?: string } = {
      page: targetPage,
      per_page: PER_PAGE,
    };
    if (filter) {
      params.status = filter;
    }
    const result = await apiClient.admin.listOrders(params);
    setLoading(false);

    if (result.error) {
      setError(result.error.message);
      return;
    }

    setOrders(result.data.items);
    setTotal(result.data.total);
    setPage(targetPage);
  }

  async function handleAdvanceOrder(order: AdminOrder) {
    const next = getNextStatus(order.status);
    if (!next) return;

    setUpdatingOrderId(order.id);
    setError(null);
    const result = await apiClient.admin.updateOrderStatus(order.id, { status: next });
    setUpdatingOrderId(null);

    if (result.error) {
      setError(result.error.message);
      return;
    }

    await loadOrders(page, statusFilter);
  }

  useEffect(() => {
    if (!user) return;
    void loadOrders(1, statusFilter);
  }, [user, statusFilter]); // eslint-disable-line react-hooks/exhaustive-deps

  if (!user) return null;

  const totalPages = Math.max(1, Math.ceil(total / PER_PAGE));

  return (
    <section className="overflow-hidden rounded-[14px] border border-[#e5e7eb] bg-white">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#e5e7eb] px-5 py-4">
        <div>
          <h1 className="font-display text-base font-bold text-[#111827]">Gestión de pedidos</h1>
          <p className="text-xs text-[#6b7280]">
            Flujo: Pagado → Preparando → En reparto → Entregado
          </p>
        </div>
        <div className="flex items-center gap-2">
          <select
            value={statusFilter}
            onChange={(event) => setStatusFilter(event.target.value as "" | OrderStatus)}
            className="h-9 rounded-lg border border-[#e5e7eb] px-3 text-xs text-[#111827]"
          >
            {FILTER_OPTIONS.map((option) => (
              <option key={option.value || "all"} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          <button
            type="button"
            onClick={() => void loadOrders(page, statusFilter)}
            className="rounded-lg border border-[#e5e7eb] px-3 py-1.5 text-xs font-semibold text-[#1e3a5f]"
          >
            Actualizar
          </button>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr className="bg-[#f1f5f9] text-left text-[11px] uppercase tracking-[0.04em] text-[#6b7280]">
              <th className="px-4 py-2">Pedido</th>
              <th className="px-4 py-2">Fecha</th>
              <th className="px-4 py-2">Cliente</th>
              <th className="px-4 py-2">Items</th>
              <th className="px-4 py-2">Total</th>
              <th className="px-4 py-2">Estado</th>
              <th className="px-4 py-2">Proceso</th>
              <th className="px-4 py-2">Detalle</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={8} className="px-4 py-6 text-center text-sm text-[#6b7280]">
                  Cargando pedidos...
                </td>
              </tr>
            ) : error ? (
              <tr>
                <td colSpan={8} className="px-4 py-6 text-center text-sm text-[#b91c1c]">
                  {error}
                </td>
              </tr>
            ) : orders.length === 0 ? (
              <tr>
                <td colSpan={8} className="px-4 py-6 text-center text-sm text-[#6b7280]">
                  No hay pedidos para gestionar.
                </td>
              </tr>
            ) : (
              orders.map((order) => {
                const nextStatus = getNextStatus(order.status);
                return (
                  <tr key={order.id} className="border-b border-[#e5e7eb] last:border-b-0">
                    <td className="px-4 py-2.5">{order.code}</td>
                    <td className="px-4 py-2.5">{formatDate(order.created_at)}</td>
                    <td className="px-4 py-2.5">{order.customer_name}</td>
                    <td className="px-4 py-2.5">{order.item_count}</td>
                    <td className="px-4 py-2.5">{formatCOP(order.total)}</td>
                    <td className="px-4 py-2.5">
                      <span className={`rounded-full px-2 py-1 text-xs font-bold ${statusColor(order.status)}`}>
                        {statusLabel(order.status)}
                      </span>
                    </td>
                    <td className="px-4 py-2.5">
                      {nextStatus ? (
                        <button
                          type="button"
                          onClick={() => void handleAdvanceOrder(order)}
                          disabled={updatingOrderId === order.id}
                          className="rounded-lg bg-[#1e3a5f] px-3 py-1.5 text-xs font-semibold text-white disabled:opacity-50"
                        >
                          {updatingOrderId === order.id
                            ? "Guardando..."
                            : `Marcar ${statusLabel(nextStatus)}`}
                        </button>
                      ) : (
                        <span className="text-xs font-semibold text-[#6b7280]">Finalizado</span>
                      )}
                    </td>
                    <td className="px-4 py-2.5">
                      <Link
                        href={`/admin/pedidos/${order.id}`}
                        className="rounded-lg border border-[#e5e7eb] px-3 py-1.5 text-xs font-semibold text-[#1e3a5f] hover:bg-[#f8fafc]"
                      >
                        Ver detalle
                      </Link>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-between border-t border-[#e5e7eb] px-5 py-3 text-xs text-[#6b7280]">
          <span>
            Página {page} de {totalPages}
          </span>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => void loadOrders(page - 1, statusFilter)}
              disabled={page <= 1}
              className="rounded-lg border border-[#e5e7eb] px-3 py-1.5 disabled:opacity-40"
            >
              Anterior
            </button>
            <button
              type="button"
              onClick={() => void loadOrders(page + 1, statusFilter)}
              disabled={page >= totalPages}
              className="rounded-lg border border-[#e5e7eb] px-3 py-1.5 disabled:opacity-40"
            >
              Siguiente
            </button>
          </div>
        </div>
      )}
    </section>
  );
}

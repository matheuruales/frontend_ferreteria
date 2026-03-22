"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { apiClient } from "@/lib/api-client";
import type {
  AdminDashboardSummary,
  DashboardCategorySalesPoint,
  DashboardSalesMonthPoint,
  DashboardSalesWeekPoint,
  DashboardSalesWeekdayPoint,
} from "@/types";

const CATEGORY_COLORS = ["#1e3a5f", "#f57c00", "#10b981", "#7c8a9f"];
type SalesGranularity = "month" | "week" | "weekday";
type SalesPoint = { key: string; label: string; total: number };
const MONTH_SHORT = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"];
const WEEKDAY_SHORT = ["Lun", "Mar", "Mie", "Jue", "Vie", "Sab", "Dom"];

function toSafeNumber(value: unknown): number {
  const n = Number(value);
  return Number.isFinite(n) ? n : 0;
}

function getIsoWeek(date: Date): { year: number; week: number } {
  const tmp = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
  const day = tmp.getUTCDay() || 7;
  tmp.setUTCDate(tmp.getUTCDate() + 4 - day);
  const year = tmp.getUTCFullYear();
  const yearStart = new Date(Date.UTC(year, 0, 1));
  const week = Math.ceil((((tmp.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);
  return { year, week };
}

function buildMonthFallbackPoints(reference = new Date()): DashboardSalesMonthPoint[] {
  const points: DashboardSalesMonthPoint[] = [];
  const start = new Date(Date.UTC(reference.getUTCFullYear(), reference.getUTCMonth() - 11, 1));
  for (let i = 0; i < 12; i += 1) {
    const dt = new Date(Date.UTC(start.getUTCFullYear(), start.getUTCMonth() + i, 1));
    const year = dt.getUTCFullYear();
    const month = dt.getUTCMonth();
    points.push({
      key: `${year}-${String(month + 1).padStart(2, "0")}`,
      label: `${MONTH_SHORT[month]} ${year}`,
      total: 0,
    });
  }
  return points;
}

function buildWeekFallbackPoints(reference = new Date()): DashboardSalesWeekPoint[] {
  const points: DashboardSalesWeekPoint[] = [];
  const end = new Date(Date.UTC(reference.getUTCFullYear(), reference.getUTCMonth(), reference.getUTCDate()));
  const weekday = (end.getUTCDay() + 6) % 7;
  end.setUTCDate(end.getUTCDate() - weekday);
  end.setUTCHours(0, 0, 0, 0);
  end.setUTCDate(end.getUTCDate() - (7 * 7));

  for (let i = 0; i < 8; i += 1) {
    const dt = new Date(end);
    dt.setUTCDate(end.getUTCDate() + (i * 7));
    const { year, week } = getIsoWeek(dt);
    points.push({
      key: `${year}-W${String(week).padStart(2, "0")}`,
      label: `S${String(week).padStart(2, "0")}`,
      total: 0,
    });
  }
  return points;
}

function buildWeekdayFallbackPoints(): DashboardSalesWeekdayPoint[] {
  return WEEKDAY_SHORT.map((label, index) => ({
    key: String(index),
    label,
    total: 0,
  }));
}

function sanitizeSalesPoints<T extends SalesPoint>(raw: unknown, fallback: T[]): T[] {
  const lastFallback = fallback[fallback.length - 1];
  if (!lastFallback) return [];
  if (!Array.isArray(raw) || raw.length === 0) return fallback;

  const sanitized = raw
    .map((item, index) => {
      const row = item as Partial<SalesPoint> | null;
      const base = fallback[index] ?? lastFallback;
      if (!row || typeof row !== "object") return base;
      return {
        key: typeof row.key === "string" && row.key ? row.key : base.key,
        label: typeof row.label === "string" && row.label ? row.label : base.label,
        total: toSafeNumber(row.total),
      } as T;
    })
    .filter(Boolean);

  if (sanitized.length === 0) return fallback;
  if (sanitized.length < fallback.length) {
    return fallback.map((point, index) => sanitized[index] ?? point);
  }
  return sanitized;
}

function normalizeDashboardSummary(raw: AdminDashboardSummary): AdminDashboardSummary {
  const data = raw as Partial<AdminDashboardSummary> & Record<string, unknown>;
  const monthFallback = buildMonthFallbackPoints();
  const weekFallback = buildWeekFallbackPoints();
  const weekdayFallback = buildWeekdayFallbackPoints();

  return {
    ...raw,
    sales_by_month: sanitizeSalesPoints<DashboardSalesMonthPoint>(data.sales_by_month, monthFallback),
    sales_by_week: sanitizeSalesPoints<DashboardSalesWeekPoint>(data.sales_by_week, weekFallback),
    sales_by_weekday: sanitizeSalesPoints<DashboardSalesWeekdayPoint>(
      data.sales_by_weekday,
      weekdayFallback
    ),
  };
}

function formatCOP(value: number): string {
  return new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}

function formatInt(value: number): string {
  return new Intl.NumberFormat("es-CO", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
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

function buildCategoryGradient(points: DashboardCategorySalesPoint[]): string {
  if (points.length === 0) {
    return "conic-gradient(#e5e7eb 0 100%)";
  }

  let cursor = 0;
  const segments: string[] = [];
  points.forEach((point, index) => {
    const color = CATEGORY_COLORS[index] ?? "#9ca3af";
    const start = cursor;
    const end = Math.min(100, cursor + Math.max(0, point.percentage));
    if (end > start) {
      segments.push(`${color} ${start}% ${end}%`);
    }
    cursor = end;
  });

  if (cursor < 100) {
    segments.push(`#e5e7eb ${cursor}% 100%`);
  }
  return `conic-gradient(${segments.join(",")})`;
}

export default function AdminDashboardPage() {
  const { user } = useAuth();
  const [summary, setSummary] = useState<AdminDashboardSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [salesGranularity, setSalesGranularity] = useState<SalesGranularity>("month");

  async function loadSummary() {
    setLoading(true);
    setError(null);
    const result = await apiClient.admin.getDashboardSummary();
    setLoading(false);
    if (result.error) {
      setError(result.error.message);
      return;
    }
    setSummary(normalizeDashboardSummary(result.data));
  }

  useEffect(() => {
    if (user) {
      void loadSummary();
    }
  }, [user]);

  const salesPoints = useMemo(() => {
    if (!summary) return [];
    if (salesGranularity === "week") {
      return summary.sales_by_week as SalesPoint[];
    }
    if (salesGranularity === "weekday") {
      return summary.sales_by_weekday as SalesPoint[];
    }
    return summary.sales_by_month as SalesPoint[];
  }, [summary, salesGranularity]);

  const maxSales = useMemo(() => {
    const totals = salesPoints.map((p) => p.total);
    const max = Math.max(...totals, 0);
    return max > 0 ? max : 1;
  }, [salesPoints]);
  const hasSales = salesPoints.some((p) => p.total > 0);

  const salesTitle =
    salesGranularity === "week"
      ? "Ventas por semana"
      : salesGranularity === "weekday"
        ? "Ventas por dia de la semana"
        : "Ventas por mes";

  const salesRangeBadge =
    salesGranularity === "week" ? "8s" : salesGranularity === "weekday" ? "7d" : "12m";

  const highlightedBarIndex = useMemo(() => {
    if (salesPoints.length === 0) return -1;
    if (salesGranularity === "weekday") {
      return (new Date().getDay() + 6) % 7;
    }
    return salesPoints.length - 1;
  }, [salesPoints, salesGranularity]);

  if (!user) return null;

  if (loading) {
    return (
      <div className="flex min-h-[260px] items-center justify-center rounded-[14px] border border-[#e5e7eb] bg-white">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-[#e5e7eb] border-t-[#1e3a5f]" />
      </div>
    );
  }

  if (error || !summary) {
    return (
      <div className="space-y-3 rounded-[14px] border border-[#e5e7eb] bg-white p-5">
        <p className="text-sm text-[#b91c1c]">{error ?? "No se pudo cargar el dashboard."}</p>
        <button
          onClick={() => void loadSummary()}
          className="rounded-lg bg-[#1e3a5f] px-4 py-2 text-sm font-semibold text-white"
          type="button"
        >
          Reintentar
        </button>
      </div>
    );
  }

  const categoryChart = buildCategoryGradient(summary.sales_by_category);
  const categoryTotal = summary.sales_by_category.reduce((acc, item) => acc + item.total, 0);

  return (
    <div className="space-y-4">
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard
          icon="💰"
          value={formatCOP(summary.sales_this_month.value)}
          label="Ventas este mes"
          delta={summary.sales_this_month.delta_percentage}
        />
        <StatCard
          icon="📦"
          value={formatInt(summary.orders_this_month.value)}
          label="Pedidos este mes"
          delta={summary.orders_this_month.delta_percentage}
        />
        <StatCard
          icon="👥"
          value={formatInt(summary.new_customers_this_month.value)}
          label="Nuevos clientes"
          delta={summary.new_customers_this_month.delta_percentage}
        />
        <StatCard
          icon="🛒"
          value={formatCOP(summary.avg_ticket_this_month.value)}
          label="Ticket promedio"
          delta={summary.avg_ticket_this_month.delta_percentage}
        />
      </div>

      <div className="grid gap-4 xl:grid-cols-[2fr_1fr]">
        <section className="rounded-[14px] border border-[#e5e7eb] bg-white p-5">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-display text-[15px] font-bold text-[#111827]">{salesTitle}</h2>
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => setSalesGranularity("month")}
                className={`rounded px-2 py-1 text-xs font-semibold ${
                  salesGranularity === "month"
                    ? "bg-[#1e3a5f] text-white"
                    : "bg-[#f1f5f9] text-[#1e3a5f] hover:bg-[#e2e8f0]"
                }`}
              >
                Mes
              </button>
              <button
                type="button"
                onClick={() => setSalesGranularity("week")}
                className={`rounded px-2 py-1 text-xs font-semibold ${
                  salesGranularity === "week"
                    ? "bg-[#1e3a5f] text-white"
                    : "bg-[#f1f5f9] text-[#1e3a5f] hover:bg-[#e2e8f0]"
                }`}
              >
                Semana
              </button>
              <button
                type="button"
                onClick={() => setSalesGranularity("weekday")}
                className={`rounded px-2 py-1 text-xs font-semibold ${
                  salesGranularity === "weekday"
                    ? "bg-[#1e3a5f] text-white"
                    : "bg-[#f1f5f9] text-[#1e3a5f] hover:bg-[#e2e8f0]"
                }`}
              >
                Dia
              </button>
              <span className="rounded bg-[#f57c00] px-2 py-1 text-xs font-semibold text-white">
                {salesRangeBadge}
              </span>
            </div>
          </div>
          <div className="h-48 rounded-lg bg-[linear-gradient(180deg,rgba(30,58,95,0.08),rgba(30,58,95,0.02))] p-3">
            <div className="flex h-full gap-2">
              {salesPoints.map((point, i) => {
                const pct = Math.max(6, Math.round((point.total / maxSales) * 100));
                return (
                  <div
                    key={point.key}
                    className="group relative flex h-full flex-1 flex-col items-center justify-end"
                  >
                    <div
                      style={{ height: `${pct}%` }}
                      className={`w-full rounded-t ${
                        i === highlightedBarIndex ? "bg-[#f57c00]" : "bg-[#1e3a5f]/80"
                      }`}
                      title={`${point.label}: ${formatCOP(point.total)}`}
                    />
                    <span className="mt-1 text-[10px] text-[#6b7280]">
                      {point.label.length > 3 ? point.label.slice(0, 3) : point.label}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
          {!hasSales && (
            <p className="mt-2 text-xs text-[#6b7280]">Sin ventas pagadas registradas en este periodo.</p>
          )}
        </section>

        <section className="rounded-[14px] border border-[#e5e7eb] bg-white p-5">
          <h2 className="mb-4 font-display text-[15px] font-bold text-[#111827]">Ventas por categoría</h2>
          <div className="mx-auto mb-4 h-28 w-28 rounded-full p-4" style={{ background: categoryChart }}>
            <div className="flex h-full w-full items-center justify-center rounded-full bg-white px-1 text-center font-display text-[11px] font-bold text-[#111827]">
              {formatCOP(categoryTotal)}
            </div>
          </div>
          <ul className="space-y-1.5 text-xs text-[#6b7280]">
            {summary.sales_by_category.length > 0 ? (
              summary.sales_by_category.map((item: DashboardCategorySalesPoint, index) => (
                <li key={`${item.category_name}-${index}`} className="flex items-center gap-2">
                  <span
                    className="h-2.5 w-2.5 rounded-full"
                    style={{ backgroundColor: CATEGORY_COLORS[index] ?? "#9ca3af" }}
                  />
                  {item.category_name} {item.percentage.toFixed(1)}%
                </li>
              ))
            ) : (
              <li>Sin ventas por categoría todavía.</li>
            )}
          </ul>
        </section>
      </div>

      <div className="grid gap-4 xl:grid-cols-2">
        <TableCard title="Últimos pedidos" link="/admin/pedidos">
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr className="bg-[#f1f5f9] text-left text-[11px] uppercase tracking-[0.04em] text-[#6b7280]">
                <th className="px-4 py-2">Pedido</th>
                <th className="px-4 py-2">Cliente</th>
                <th className="px-4 py-2">Total</th>
                <th className="px-4 py-2">Estado</th>
              </tr>
            </thead>
            <tbody>
              {summary.recent_orders.length > 0 ? (
                summary.recent_orders.map((order) => (
                  <tr key={order.id} className="border-b border-[#e5e7eb] last:border-b-0">
                    <td className="px-4 py-2.5">{order.code}</td>
                    <td className="px-4 py-2.5">{order.customer_name}</td>
                    <td className="px-4 py-2.5">{formatCOP(order.total)}</td>
                    <td className="px-4 py-2.5">
                      <span className={`rounded-full px-2 py-1 text-xs font-bold ${statusColor(order.status)}`}>
                        {statusLabel(order.status)}
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={4} className="px-4 py-6 text-center text-sm text-[#6b7280]">
                    No hay pedidos aún.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </TableCard>

        <TableCard title="Productos con bajo stock" link="/admin/productos">
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr className="bg-[#f1f5f9] text-left text-[11px] uppercase tracking-[0.04em] text-[#6b7280]">
                <th className="px-4 py-2">Producto</th>
                <th className="px-4 py-2">SKU</th>
                <th className="px-4 py-2">Stock</th>
                <th className="px-4 py-2">Acción</th>
              </tr>
            </thead>
            <tbody>
              {summary.low_stock_products.length > 0 ? (
                summary.low_stock_products.map((product) => (
                  <tr key={product.id} className="border-b border-[#e5e7eb] last:border-b-0">
                    <td className="px-4 py-2.5">{product.name}</td>
                    <td className="px-4 py-2.5 text-[#6b7280]">{product.sku ?? "-"}</td>
                    <td className="px-4 py-2.5 font-bold text-[#d62828]">{product.stock}</td>
                    <td className="px-4 py-2.5 text-xs font-semibold text-[#1e3a5f]">Reabastecer</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={4} className="px-4 py-6 text-center text-sm text-[#6b7280]">
                    No hay alertas de stock.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </TableCard>
      </div>

    </div>
  );
}

function StatCard({
  icon,
  value,
  label,
  delta,
}: {
  icon: string;
  value: string;
  label: string;
  delta: number;
}) {
  const up = delta >= 0;
  return (
    <article className="rounded-[14px] border border-[#e5e7eb] bg-white p-5">
      <div className="mb-3 flex items-start justify-between">
        <div className="flex h-11 w-11 items-center justify-center rounded-[10px] bg-[rgba(30,58,95,0.1)] text-xl">
          {icon}
        </div>
        <span className={`text-xs font-semibold ${up ? "text-[#10b981]" : "text-[#d62828]"}`}>
          {up ? "↑" : "↓"} {Math.abs(delta).toFixed(1)}%
        </span>
      </div>
      <div className="font-display text-3xl font-extrabold text-[#111827]">{value}</div>
      <div className="text-sm text-[#6b7280]">{label}</div>
    </article>
  );
}

function TableCard({
  title,
  link,
  children,
}: {
  title: string;
  link: string;
  children: React.ReactNode;
}) {
  return (
    <section className="overflow-hidden rounded-[14px] border border-[#e5e7eb] bg-white">
      <div className="flex items-center justify-between border-b border-[#e5e7eb] px-5 py-4">
        <h2 className="font-display text-sm font-bold text-[#111827]">{title}</h2>
        <Link href={link} className="text-xs font-semibold text-[#1e3a5f]">
          Ver todos →
        </Link>
      </div>
      {children}
    </section>
  );
}

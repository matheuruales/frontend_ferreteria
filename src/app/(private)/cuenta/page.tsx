"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/hooks/useAuth";
import { apiClient } from "@/lib/api-client";
import type { Order, OrderStatus } from "@/types";

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

function getStatusLabel(status: OrderStatus): string {
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
    case "delivered":
      return "Entregado";
    case "cancelled":
      return "Cancelado";
    default:
      return status;
  }
}

function getStatusClass(status: OrderStatus): string {
  if (status === "completed" || status === "delivered") {
    return "bg-[rgba(16,185,129,0.1)] text-[#065f46]";
  }
  if (status === "cancelled") {
    return "bg-[rgba(214,40,40,0.1)] text-[#b91c1c]";
  }
  if (status === "pending" || status === "paid" || status === "processing" || status === "confirmed") {
    return "bg-[rgba(245,124,0,0.1)] text-[#92400e]";
  }
  return "bg-[rgba(30,58,95,0.1)] text-[#1e3a5f]";
}

function getOrderPreviewText(order: Order): string {
  const first = order.items_preview[0]?.product_name ?? "Pedido";
  if (order.item_count <= 1) return first;
  return `${first} + ${order.item_count - 1} más`;
}

async function fetchAllOrders(): Promise<{ orders: Order[]; error: string | null }> {
  const perPage = 50;
  const first = await apiClient.orders.listOrders({ page: 1, per_page: perPage });
  if (first.error) {
    return { orders: [], error: first.error.message };
  }

  const total = first.data.total;
  const pages = Math.max(1, Math.ceil(total / perPage));
  const allOrders: Order[] = [...first.data.orders];

  for (let page = 2; page <= pages; page += 1) {
    const next = await apiClient.orders.listOrders({ page, per_page: perPage });
    if (next.error) {
      return { orders: allOrders, error: next.error.message };
    }
    allOrders.push(...next.data.orders);
  }

  return { orders: allOrders, error: null };
}

export default function CuentaPage() {
  const { user, getProfile } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [fullName, setFullName] = useState("");
  const [savingProfile, setSavingProfile] = useState(false);
  const [profileError, setProfileError] = useState<string | null>(null);
  const [profileSuccess, setProfileSuccess] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;
    setFullName(user.full_name);
  }, [user]);

  useEffect(() => {
    if (!user) return;
    const load = async () => {
      setLoading(true);
      setError(null);
      const result = await fetchAllOrders();
      setOrders(result.orders);
      setError(result.error);
      setLoading(false);
    };
    void load();
  }, [user]);

  const summary = useMemo(() => {
    const orderCount = orders.length;
    const totalSpent = orders.reduce((acc, order) => acc + order.total, 0);
    const productsBought = orders.reduce((acc, order) => acc + order.item_count, 0);
    return { orderCount, totalSpent, productsBought };
  }, [orders]);

  const recentOrders = useMemo(() => orders.slice(0, 5), [orders]);

  if (!user) return null;

  const firstName = user.full_name.split(" ")[0] ?? user.full_name;

  const handleProfileSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setProfileError(null);
    setProfileSuccess(null);

    const normalized = fullName.trim();
    if (normalized.length < 2) {
      setProfileError("El nombre debe tener al menos 2 caracteres.");
      return;
    }

    setSavingProfile(true);
    const result = await apiClient.users.updateMe({ full_name: normalized });
    setSavingProfile(false);

    if (result.error) {
      setProfileError(result.error.message);
      return;
    }

    await getProfile();
    setProfileSuccess("Perfil actualizado correctamente.");
  };

  return (
    <div className="space-y-5">
      <div>
        <h1 className="font-display text-[26px] font-extrabold text-[#111827]">
          Bienvenido, {firstName}
        </h1>
        <p className="text-sm text-[#6b7280]">Resumen real de tu actividad de compra</p>
      </div>

      {error && (
        <div className="rounded-lg border border-[rgba(214,40,40,0.2)] bg-[rgba(214,40,40,0.07)] px-3 py-2 text-sm text-[#b91c1c]">
          {error}
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard icon="📦" value={String(summary.orderCount)} label="Pedidos realizados" />
        <StatCard icon="💰" value={formatCOP(summary.totalSpent)} label="Total comprado" />
        <StatCard icon="🧰" value={String(summary.productsBought)} label="Productos comprados" />
      </div>

      <section className="overflow-hidden rounded-2xl border border-[#e5e7eb] bg-white">
        <div className="flex items-center justify-between border-b border-[#e5e7eb] px-5 py-4">
          <h2 className="font-display text-base font-bold text-[#111827]">Pedidos recientes</h2>
          <Link href="/cuenta/pedidos" className="text-sm font-semibold text-[#1e3a5f]">
            Ver todos →
          </Link>
        </div>

        {loading ? (
          <div className="px-5 py-12 text-center text-sm text-[#6b7280]">Cargando pedidos...</div>
        ) : recentOrders.length === 0 ? (
          <div className="px-5 py-12 text-center">
            <p className="font-display text-base font-semibold text-[#111827]">Aún no tienes pedidos</p>
            <Link
              href="/catalogo"
              className="mt-3 inline-flex h-10 items-center rounded-lg bg-[#1e3a5f] px-4 font-display text-sm font-semibold text-white"
            >
              Explorar catálogo
            </Link>
          </div>
        ) : (
          recentOrders.map((order) => (
            <Link
              href={`/cuenta/pedidos/${order.id}`}
              key={order.id}
              className="flex items-center gap-3 border-b border-[#e5e7eb] px-5 py-4 last:border-b-0 hover:bg-[#f9fafb]"
            >
              <div className="min-w-[140px]">
                <div className="font-display text-sm font-bold text-[#1e3a5f]">
                  #{order.id.slice(0, 8).toUpperCase()}
                </div>
                <div className="text-xs text-[#6b7280]">{formatDate(order.created_at)}</div>
              </div>
              <div className="flex-1 text-sm text-[#6b7280]">{getOrderPreviewText(order)}</div>
              <div className="font-display text-sm font-extrabold text-[#111827]">{formatCOP(order.total)}</div>
              <span className={`rounded-full px-2.5 py-1 text-[11px] font-bold ${getStatusClass(order.status)}`}>
                {getStatusLabel(order.status)}
              </span>
              <span className="text-[#6b7280]">›</span>
            </Link>
          ))
        )}
      </section>

      <div className="grid gap-3 sm:grid-cols-3">
        <QuickAction icon="📦" label="Ver mis pedidos" href="/cuenta/pedidos" />
        <QuickAction icon="🛍️" label="Seguir comprando" href="/catalogo" />
        <QuickAction icon="💬" label="Soporte por email" href="mailto:soporte@multivariedades.com" />
      </div>

      <section id="configuracion" className="rounded-2xl border border-[#e5e7eb] bg-white p-5">
        <h2 className="mb-4 font-display text-lg font-bold text-[#111827]">Configuración de la cuenta</h2>

        <form onSubmit={handleProfileSubmit} className="grid gap-3 sm:grid-cols-[1fr_auto] sm:items-end">
          <label className="block">
            <span className="mb-1 block text-sm font-medium text-[#111827]">Nombre completo</span>
            <input
              value={fullName}
              onChange={(event) => setFullName(event.target.value)}
              className="h-11 w-full rounded-lg border-[1.5px] border-[#e5e7eb] px-3 text-sm text-[#111827] outline-none focus:border-[#1e3a5f]"
              type="text"
              name="full_name"
              autoComplete="name"
            />
          </label>

          <button
            type="submit"
            disabled={savingProfile}
            className="h-11 rounded-lg bg-[#1e3a5f] px-4 font-display text-sm font-semibold text-white hover:bg-[#1a3355] disabled:opacity-60"
          >
            {savingProfile ? "Guardando..." : "Guardar cambios"}
          </button>
        </form>

        {profileError && (
          <p className="mt-3 text-sm text-[#b91c1c]">{profileError}</p>
        )}
        {profileSuccess && (
          <p className="mt-3 text-sm text-[#065f46]">{profileSuccess}</p>
        )}
      </section>
    </div>
  );
}

function StatCard({ icon, value, label }: { icon: string; value: string; label: string }) {
  return (
    <article className="rounded-[14px] border border-[#e5e7eb] bg-white p-5">
      <div className="mb-2 text-2xl">{icon}</div>
      <div className="break-words font-display text-3xl font-extrabold text-[#111827]">{value}</div>
      <div className="text-sm text-[#6b7280]">{label}</div>
    </article>
  );
}

function QuickAction({ icon, label, href }: { icon: string; label: string; href: string }) {
  return (
    <Link
      href={href}
      className="rounded-xl border border-[#e5e7eb] bg-white p-4 text-center transition hover:border-[#1e3a5f] hover:bg-[rgba(30,58,95,0.03)]"
    >
      <div className="mb-1.5 text-2xl">{icon}</div>
      <div className="text-sm font-semibold text-[#111827]">{label}</div>
    </Link>
  );
}

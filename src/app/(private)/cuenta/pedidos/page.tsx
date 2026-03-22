"use client";

import { useEffect, useState } from "react";
import { apiClient } from "@/lib/api-client";
import OrderList from "@/components/orders/OrderList";
import type { Order } from "@/types";

export default function PedidosPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const perPage = 10;

  const loadOrders = async (p: number) => {
    setLoading(true);
    const result = await apiClient.orders.listOrders({ page: p, per_page: perPage });
    setLoading(false);
    if (result.error) {
      setError(result.error.message);
    } else {
      setOrders(result.data.orders);
      setTotal(result.data.total);
      setPage(p);
    }
  };

  useEffect(() => {
    void loadOrders(1);
  }, []);

  if (loading) {
    return (
      <div className="py-16 text-center text-neutral-400">Cargando pedidos...</div>
    );
  }

  if (error) {
    return (
      <div className="py-8 text-center text-danger-600">{error}</div>
    );
  }

  return (
    <div>
      <h1 className="mb-4 font-display text-2xl font-extrabold text-[#111827]">Mis pedidos</h1>
      <div className="mb-4">
        <input
          type="text"
          placeholder="Buscar por número de pedido..."
          className="h-10 w-full rounded-lg border-[1.5px] border-[#e5e7eb] bg-white px-3 text-sm text-[#111827] outline-none focus:border-[#1e3a5f]"
        />
      </div>
      <OrderList
        orders={orders}
        page={page}
        total={total}
        perPage={perPage}
        onPageChange={loadOrders}
      />
    </div>
  );
}

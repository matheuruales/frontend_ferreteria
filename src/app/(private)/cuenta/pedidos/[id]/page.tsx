"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { apiClient } from "@/lib/api-client";
import OrderDetailView from "@/components/orders/OrderDetail";
import type { OrderDetail } from "@/types";

export default function OrderDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [order, setOrder] = useState<OrderDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [errorStatus, setErrorStatus] = useState<number | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      const result = await apiClient.orders.getOrder(id);
      setLoading(false);
      if (result.error) {
        setErrorStatus(result.error.status ?? null);
        setErrorMessage(result.error.message);
      } else {
        setOrder(result.data);
      }
    };
    void load();
  }, [id]);

  if (loading) {
    return <div className="py-16 text-center text-[#6b7280]">Cargando pedido...</div>;
  }

  if (errorStatus === 403) {
    return (
      <div className="py-16 text-center">
        <p className="mb-2 font-medium text-[#111827]">Acceso no autorizado</p>
        <p className="mb-6 text-sm text-[#6b7280]">Este pedido no pertenece a tu cuenta.</p>
        <Link href="/cuenta/pedidos" className="text-sm font-semibold text-[#1e3a5f] underline">
          Volver a mis pedidos
        </Link>
      </div>
    );
  }

  if (errorStatus === 404 || !order) {
    return (
      <div className="py-16 text-center">
        <p className="mb-2 font-medium text-[#111827]">Pedido no encontrado</p>
        <p className="mb-6 text-sm text-[#6b7280]">
          {errorMessage ?? "Este pedido no existe o fue eliminado."}
        </p>
        <Link href="/cuenta/pedidos" className="text-sm font-semibold text-[#1e3a5f] underline">
          Volver a mis pedidos
        </Link>
      </div>
    );
  }

  if (errorMessage) {
    return (
      <div className="py-16 text-center">
        <p className="mb-4 text-[#d62828]">{errorMessage}</p>
        <Link href="/cuenta/pedidos" className="text-sm font-semibold text-[#1e3a5f] underline">
          Volver a mis pedidos
        </Link>
      </div>
    );
  }

  return <OrderDetailView order={order} />;
}

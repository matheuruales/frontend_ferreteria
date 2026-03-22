import Image from "next/image";
import type { CheckoutSummary } from "@/types";

interface OrderSummaryProps {
  summary: CheckoutSummary;
}

function formatCOP(amount: number): string {
  return new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

export default function OrderSummary({ summary }: OrderSummaryProps) {
  return (
    <div className="rounded-[14px] bg-[#f9fafb] p-4">
      <div className="mb-3 font-display text-[13px] font-bold text-[#111827]">Resumen del pedido</div>

      <div className="space-y-2">
        {summary.items.map((item) => (
          <div key={item.product_id} className="flex items-center justify-between text-[13px]">
            <div className="flex min-w-0 items-center gap-2.5">
              <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-md border border-[#e5e7eb] bg-white">
                {item.product_image_url ? (
                  <Image
                    src={item.product_image_url}
                    alt={item.product_name}
                    fill
                    sizes="40px"
                    className="object-contain p-1"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center text-sm">📦</div>
                )}
              </div>
              <span className="line-clamp-1 text-[#6b7280]">
                {item.product_name} ×{item.quantity}
              </span>
            </div>
            <span className="font-semibold text-[#111827]">{formatCOP(item.subtotal)}</span>
          </div>
        ))}
      </div>

      <div className="mt-3 border-t border-[#e5e7eb] pt-3 text-sm">
        <div className="mb-1.5 flex items-center justify-between text-[#6b7280]">
          <span>Subtotal</span>
          <span>{formatCOP(summary.subtotal)}</span>
        </div>
        <div className="mb-1.5 flex items-center justify-between text-[#6b7280]">
          <span>Envío</span>
          <span>{summary.shipping_cost > 0 ? formatCOP(summary.shipping_cost) : "Gratis"}</span>
        </div>
        <div className="flex items-center justify-between border-t border-[#e5e7eb] pt-2 font-display text-base font-extrabold">
          <span>Total a pagar</span>
          <span className="text-[#1e3a5f]">{formatCOP(summary.total)}</span>
        </div>
      </div>
    </div>
  );
}

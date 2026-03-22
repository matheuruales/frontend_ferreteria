import Link from "next/link";

interface CartSummaryProps {
  subtotal: number;
  compact?: boolean;
}

function formatCOP(amount: number): string {
  return new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

export default function CartSummary({ subtotal, compact }: CartSummaryProps) {
  const discount = 0;
  const shipping = 0;
  const total = subtotal - discount + shipping;

  if (compact) {
    return (
      <div className="rounded-[14px] border border-[#e5e7eb] bg-white p-4">
        <div className="space-y-2 text-sm">
          <div className="flex items-center justify-between text-[#6b7280]">
            <span>Subtotal</span>
            <span className="font-medium text-[#111827]">{formatCOP(subtotal)}</span>
          </div>
          <div className="flex items-center justify-between text-[#6b7280]">
            <span>Envío</span>
            <span className="font-semibold text-[#10b981]">Gratis</span>
          </div>
          <div className="flex items-center justify-between border-t border-[#e5e7eb] pt-2 font-display text-base font-bold">
            <span>Total</span>
            <span className="text-[#1e3a5f]">{formatCOP(total)}</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-[14px] border border-[#e5e7eb] bg-white p-5">
      <div className="space-y-2.5 text-sm">
        <div className="flex items-center justify-between border-b border-[#e5e7eb] pb-2">
          <span className="text-[#6b7280]">Subtotal</span>
          <span className="font-semibold text-[#111827]">{formatCOP(subtotal)}</span>
        </div>
        <div className="flex items-center justify-between border-b border-[#e5e7eb] pb-2">
          <span className="text-[#6b7280]">Descuento</span>
          <span className="font-semibold text-[#10b981]">-{formatCOP(discount)}</span>
        </div>
        <div className="flex items-center justify-between border-b border-[#e5e7eb] pb-2">
          <span className="text-[#6b7280]">Envío</span>
          <span className="font-bold text-[#10b981]">Gratis</span>
        </div>
        <div className="flex items-center justify-between pt-1">
          <span className="font-display text-lg font-extrabold text-[#111827]">Total</span>
          <span className="font-display text-2xl font-extrabold text-[#1e3a5f]">
            {formatCOP(total)}
          </span>
        </div>
      </div>

      <Link
        href="/checkout"
        className="mt-4 flex h-12 w-full items-center justify-center rounded-xl bg-[#f57c00] font-display text-base font-bold text-white hover:bg-[#e56f00]"
      >
        Proceder al pago →
      </Link>
      <Link
        href="/catalogo"
        className="mt-2 flex h-10 w-full items-center justify-center rounded-[10px] border-[1.5px] border-[#e5e7eb] font-display text-sm font-semibold text-[#1e3a5f] hover:bg-[#f9fafb]"
      >
        ← Seguir comprando
      </Link>

      <div className="mt-4 flex justify-center gap-4 text-[11px] text-[#6b7280]">
        <span>🔒 Pago seguro</span>
        <span>🚚 Envío rápido</span>
        <span>↩️ 30 días</span>
      </div>
    </div>
  );
}

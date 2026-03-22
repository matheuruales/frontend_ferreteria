"use client";

interface WompiCheckoutRedirectProps {
  checkoutUrl: string;
  loading?: boolean;
}

export default function WompiCheckoutRedirect({
  checkoutUrl,
  loading = false,
}: WompiCheckoutRedirectProps) {
  const handleContinue = () => {
    window.location.assign(checkoutUrl);
  };

  return (
    <div className="space-y-4">
      <div className="rounded-[14px] border border-[#e5e7eb] bg-[#f9fafb] p-4 text-sm text-[#374151]">
        Serás redirigido a Wompi para completar tu pago de forma segura.
      </div>

      <button
        type="button"
        onClick={handleContinue}
        disabled={loading}
        className="flex h-12 w-full items-center justify-center rounded-xl bg-[#f57c00] font-display text-[15px] font-bold text-white hover:bg-[#e56f00] disabled:opacity-60"
      >
        {loading ? "Redirigiendo..." : "Ir a pagar con Wompi"}
      </button>
    </div>
  );
}

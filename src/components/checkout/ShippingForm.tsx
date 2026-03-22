"use client";

import { useState } from "react";
import type { ShippingAddress } from "@/types";

interface ShippingFormProps {
  onSubmit: (address: ShippingAddress) => void;
  loading?: boolean;
}

export default function ShippingForm({ onSubmit, loading }: ShippingFormProps) {
  const [form, setForm] = useState<ShippingAddress>({
    recipient_name: "",
    address_line: "",
    city: "",
    state: "",
    postal_code: "",
    country: "Colombia",
    phone: "",
  });
  const [errors, setErrors] = useState<Partial<Record<keyof ShippingAddress, string>>>({});

  const validate = (): boolean => {
    const next: Partial<Record<keyof ShippingAddress, string>> = {};
    if (!form.recipient_name.trim()) next.recipient_name = "Requerido";
    if (!form.address_line.trim()) next.address_line = "Requerido";
    if (!form.city.trim()) next.city = "Requerido";
    if (!form.state.trim()) next.state = "Requerido";
    if (!form.postal_code.trim()) next.postal_code = "Requerido";
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    onSubmit(form);
  };

  const inputClass =
    "h-10 w-full rounded-lg border-[1.5px] border-[#e5e7eb] px-3 text-[13px] text-[#111827] outline-none focus:border-[#1e3a5f]";

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <div className="grid gap-3 sm:grid-cols-2">
        <Field
          label="Nombre"
          value={form.recipient_name}
          onChange={(v) => setForm((s) => ({ ...s, recipient_name: v }))}
          className={inputClass}
          error={errors.recipient_name}
        />
        <Field
          label="Teléfono"
          value={form.phone ?? ""}
          onChange={(v) => setForm((s) => ({ ...s, phone: v }))}
          className={inputClass}
          error={errors.phone}
        />
      </div>

      <Field
        label="Dirección"
        value={form.address_line}
        onChange={(v) => setForm((s) => ({ ...s, address_line: v }))}
        className={inputClass}
        error={errors.address_line}
      />

      <div className="grid gap-3 sm:grid-cols-2">
        <Field
          label="Ciudad"
          value={form.city}
          onChange={(v) => setForm((s) => ({ ...s, city: v }))}
          className={inputClass}
          error={errors.city}
        />
        <Field
          label="Departamento"
          value={form.state}
          onChange={(v) => setForm((s) => ({ ...s, state: v }))}
          className={inputClass}
          error={errors.state}
        />
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <Field
          label="Código postal"
          value={form.postal_code}
          onChange={(v) => setForm((s) => ({ ...s, postal_code: v }))}
          className={inputClass}
          error={errors.postal_code}
        />
        <Field
          label="País"
          value={form.country}
          onChange={(v) => setForm((s) => ({ ...s, country: v }))}
          className={inputClass}
          error={errors.country}
        />
      </div>

      <button
        type="submit"
        disabled={loading}
        className="mt-2 flex h-12 w-full items-center justify-center rounded-xl bg-[#f57c00] font-display text-[15px] font-bold text-white hover:bg-[#e56f00] disabled:opacity-60"
      >
        {loading ? "Validando..." : "Continuar al resumen"}
      </button>
    </form>
  );
}

function Field({
  label,
  value,
  onChange,
  className,
  error,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  className: string;
  error?: string | undefined;
}) {
  return (
    <label className="block">
      <span className="mb-1 block text-xs font-semibold text-[#111827]">{label}</span>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={className}
        type="text"
      />
      {error && <span className="mt-1 block text-xs text-[#d62828]">{error}</span>}
    </label>
  );
}

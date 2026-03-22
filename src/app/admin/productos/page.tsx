"use client";

import { useEffect, useMemo, useState } from "react";
import { apiClient } from "@/lib/api-client";
import type { AdminProduct, Category } from "@/types";

interface ProductFormState {
  name: string;
  slug: string;
  sku: string;
  brand: string;
  price: string;
  apply_discount: boolean;
  discount_percent: string;
  stock: string;
  category_id: string;
  status: "active" | "inactive";
  is_featured: boolean;
  image_url: string;
  short_description: string;
  description: string;
}

const PER_PAGE = 20;

const EMPTY_FORM: ProductFormState = {
  name: "",
  slug: "",
  sku: "",
  brand: "",
  price: "",
  apply_discount: false,
  discount_percent: "",
  stock: "",
  category_id: "",
  status: "active",
  is_featured: false,
  image_url: "",
  short_description: "",
  description: "",
};

export default function AdminProductosPage() {
  const [products, setProducts] = useState<AdminProduct[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"" | "active" | "inactive">("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [form, setForm] = useState<ProductFormState>(EMPTY_FORM);
  const [formError, setFormError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const totalPages = Math.max(1, Math.ceil(total / PER_PAGE));

  const categoryOptions = useMemo(() => flattenCategories(categories), [categories]);

  async function loadCategories() {
    const result = await apiClient.catalog.listCategories();
    if (!result.error) {
      setCategories(result.data.categories);
    }
  }

  async function loadProducts() {
    setLoading(true);
    setError(null);

    const params: {
      page: number;
      per_page: number;
      q?: string;
      status?: "active" | "inactive";
    } = {
      page,
      per_page: PER_PAGE,
    };
    if (query.trim()) params.q = query.trim();
    if (statusFilter) params.status = statusFilter;

    const result = await apiClient.admin.listProducts(params);

    setLoading(false);

    if (result.error) {
      setError(result.error.message);
      return;
    }

    setProducts(result.data.items);
    setTotal(result.data.total);
  }

  useEffect(() => {
    void loadCategories();
  }, []);

  useEffect(() => {
    void loadProducts();
  }, [page, statusFilter]); // eslint-disable-line react-hooks/exhaustive-deps

  function resetForm() {
    setForm(EMPTY_FORM);
    setFormError(null);
    setEditingId(null);
  }

  function startEdit(product: AdminProduct) {
    const hasExistingDiscount =
      product.compare_at_price !== undefined &&
      product.compare_at_price !== null &&
      product.compare_at_price > product.price;

    const basePrice = hasExistingDiscount
      ? product.compare_at_price!
      : product.price;
    const discountPercent = hasExistingDiscount
      ? Number((((basePrice - product.price) / basePrice) * 100).toFixed(2))
      : null;

    setEditingId(product.id);
    setFormError(null);
    setForm({
      name: product.name,
      slug: product.slug ?? "",
      sku: product.sku ?? "",
      brand: product.brand ?? "",
      price: String(basePrice),
      apply_discount: hasExistingDiscount,
      discount_percent: discountPercent !== null ? String(discountPercent) : "",
      stock: String(product.stock),
      category_id: product.category_id ?? "",
      status: product.status,
      is_featured: product.is_featured,
      image_url: product.image_url ?? "",
      short_description: product.short_description ?? "",
      description: product.description ?? "",
    });
  }

  async function handleDelete(productId: string) {
    const ok = window.confirm("¿Eliminar este producto?");
    if (!ok) return;

    const result = await apiClient.admin.deleteProduct(productId);
    if (result.error) {
      setError(result.error.message);
      return;
    }

    if (editingId === productId) {
      resetForm();
    }
    await loadProducts();
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setFormError(null);

    const basePrice = Number(form.price);
    const stock = Number(form.stock);
    const discountPercent = form.apply_discount ? Number(form.discount_percent) : 0;

    if (!form.name.trim()) {
      setFormError("El nombre es obligatorio.");
      return;
    }
    if (!Number.isFinite(basePrice) || basePrice <= 0) {
      setFormError("El precio base debe ser mayor que 0.");
      return;
    }
    if (!Number.isInteger(stock) || stock < 0) {
      setFormError("El stock debe ser un entero mayor o igual a 0.");
      return;
    }

    if (form.apply_discount) {
      if (!Number.isFinite(discountPercent) || discountPercent <= 0 || discountPercent >= 100) {
        setFormError("El porcentaje de descuento debe estar entre 0.01 y 99.99.");
        return;
      }
    }

    const finalPrice = form.apply_discount
      ? Number((basePrice * (1 - discountPercent / 100)).toFixed(2))
      : basePrice;

    if (!Number.isFinite(finalPrice) || finalPrice <= 0) {
      setFormError("El precio final calculado no es válido.");
      return;
    }

    const body = {
      name: form.name.trim(),
      ...(form.slug.trim() ? { slug: form.slug.trim() } : {}),
      ...(form.sku.trim() ? { sku: form.sku.trim() } : {}),
      ...(form.brand.trim() ? { brand: form.brand.trim() } : {}),
      price: finalPrice,
      ...(form.apply_discount ? { compare_at_price: basePrice } : {}),
      stock,
      ...(form.category_id ? { category_id: form.category_id } : {}),
      status: form.status,
      is_featured: form.is_featured,
      ...(form.image_url.trim() ? { image_url: form.image_url.trim() } : {}),
      ...(form.short_description.trim()
        ? { short_description: form.short_description.trim() }
        : {}),
      ...(form.description.trim() ? { description: form.description.trim() } : {}),
    };

    setSaving(true);
    const result = editingId
      ? await apiClient.admin.updateProduct(editingId, body)
      : await apiClient.admin.createProduct(body);
    setSaving(false);

    if (result.error) {
      setFormError(result.error.message);
      return;
    }

    resetForm();
    await loadProducts();
  }

  function formatCOP(amount: number) {
    return new Intl.NumberFormat("es-CO", {
      style: "currency",
      currency: "COP",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  }

  const numericBasePrice = Number(form.price);
  const numericDiscount = Number(form.discount_percent);
  const hasValidBasePrice = Number.isFinite(numericBasePrice) && numericBasePrice > 0;
  const hasValidDiscount =
    Number.isFinite(numericDiscount) && numericDiscount > 0 && numericDiscount < 100;
  const previewFinalPrice = hasValidBasePrice
    ? form.apply_discount && hasValidDiscount
      ? Number((numericBasePrice * (1 - numericDiscount / 100)).toFixed(2))
      : numericBasePrice
    : null;

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        <div className="flex min-w-[220px] flex-1 items-center gap-2 rounded-lg border border-[#e5e7eb] bg-white px-3 py-2 text-sm text-[#6b7280]">
          🔍
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Buscar producto..."
            className="w-full border-0 bg-transparent text-sm text-[#111827] outline-none"
          />
        </div>
        <button
          onClick={() => setStatusFilter("active")}
          className={`h-[34px] rounded-lg border px-3 text-xs ${
            statusFilter === "active"
              ? "border-[#1e3a5f] bg-[rgba(30,58,95,0.05)] text-[#1e3a5f]"
              : "border-[#e5e7eb] bg-white text-[#6b7280]"
          }`}
          type="button"
        >
          Activos
        </button>
        <button
          onClick={() => setStatusFilter("inactive")}
          className={`h-[34px] rounded-lg border px-3 text-xs ${
            statusFilter === "inactive"
              ? "border-[#1e3a5f] bg-[rgba(30,58,95,0.05)] text-[#1e3a5f]"
              : "border-[#e5e7eb] bg-white text-[#6b7280]"
          }`}
          type="button"
        >
          Borrador
        </button>
        <button
          onClick={() => {
            setPage(1);
            void loadProducts();
          }}
          className="h-[34px] rounded-lg bg-[#f57c00] px-4 font-display text-xs font-semibold text-white"
          type="button"
        >
          Buscar
        </button>
      </div>

      <div className="grid gap-4 xl:grid-cols-[1.35fr_0.85fr]">
        <div className="overflow-hidden rounded-xl border border-[#e5e7eb] bg-white">
          {error && (
            <div className="m-3 rounded-lg border border-[#fecaca] bg-[#fef2f2] px-3 py-2 text-sm text-[#b91c1c]">
              {error}
            </div>
          )}

          {loading ? (
            <p className="py-8 text-center text-[#6b7280]">Cargando productos...</p>
          ) : products.length === 0 ? (
            <p className="py-8 text-center text-[#6b7280]">No hay productos.</p>
          ) : (
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b border-[#e5e7eb] bg-[#f1f5f9] text-left text-[11px] uppercase tracking-[0.04em] text-[#6b7280]">
                  <th className="px-4 py-2.5">Producto</th>
                  <th className="px-4 py-2.5">Precio</th>
                  <th className="px-4 py-2.5">Stock</th>
                  <th className="px-4 py-2.5">Estado</th>
                  <th className="px-4 py-2.5"></th>
                </tr>
              </thead>
              <tbody>
                {products.map((product) => (
                  <tr key={product.id} className="border-b border-[#e5e7eb] last:border-b-0">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2.5">
                        <div className="flex h-9 w-9 items-center justify-center overflow-hidden rounded-md bg-[#f3f4f6] text-lg">
                          {product.image_url ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                              src={product.image_url}
                              alt={product.name}
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            "📦"
                          )}
                        </div>
                        <div>
                          <div className="text-sm font-semibold text-[#111827]">{product.name}</div>
                          <div className="text-[11px] text-[#6b7280]">{product.sku ?? product.slug}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="font-display text-sm font-bold text-[#111827]">{formatCOP(product.price)}</div>
                      {product.compare_at_price && (
                        <div className="text-[11px] text-[#6b7280] line-through">
                          {formatCOP(product.compare_at_price)}
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`text-sm font-bold ${
                          product.stock <= 10
                            ? "text-[#d62828]"
                            : product.stock <= 25
                            ? "text-[#f59e0b]"
                            : "text-[#10b981]"
                        }`}
                      >
                        {product.stock}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`rounded-full px-2 py-1 text-[11px] font-bold ${
                          product.status === "active"
                            ? "bg-[rgba(16,185,129,0.1)] text-[#065f46]"
                            : "bg-[rgba(245,158,11,0.1)] text-[#92400e]"
                        }`}
                      >
                        {product.status === "active" ? "Activo" : "Borrador"}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-1.5">
                        <button
                          onClick={() => startEdit(product)}
                          className="flex h-7 w-7 items-center justify-center rounded-md border border-[#e5e7eb] text-sm"
                          type="button"
                        >
                          ✏️
                        </button>
                        <button
                          onClick={() => void handleDelete(product.id)}
                          className="flex h-7 w-7 items-center justify-center rounded-md border border-[#e5e7eb] text-sm"
                          type="button"
                        >
                          🗑
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          {totalPages > 1 && (
            <div className="flex items-center justify-between border-t border-[#e5e7eb] px-4 py-2 text-xs text-[#6b7280]">
              <span>{total} productos</span>
              <div className="flex gap-1">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page <= 1}
                  className="h-7 rounded-md border border-[#e5e7eb] bg-white px-3 disabled:opacity-40"
                  type="button"
                >
                  ‹
                </button>
                <span className="flex h-7 items-center rounded-md bg-[#1e3a5f] px-3 font-semibold text-white">
                  {page}
                </span>
                <button
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page >= totalPages}
                  className="h-7 rounded-md border border-[#e5e7eb] bg-white px-3 disabled:opacity-40"
                  type="button"
                >
                  ›
                </button>
              </div>
            </div>
          )}
        </div>

        <div className="rounded-xl border border-[#e5e7eb] bg-white p-4">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="font-display text-base font-bold text-[#111827]">
              {editingId ? "Editar producto" : "Nuevo producto"}
            </h2>
            {editingId && (
              <button onClick={resetForm} className="text-xs font-semibold text-[#6b7280]" type="button">
                Cancelar
              </button>
            )}
          </div>

          {formError && (
            <div className="mb-3 rounded-lg border border-[#fecaca] bg-[#fef2f2] px-3 py-2 text-sm text-[#b91c1c]">
              {formError}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-2.5">
            <Input label="Nombre" value={form.name} onChange={(v) => setForm((s) => ({ ...s, name: v }))} />
            <div className="grid grid-cols-2 gap-2">
              <Input label="URL amigable" value={form.slug} onChange={(v) => setForm((s) => ({ ...s, slug: v }))} />
              <Input label="Referencia interna" value={form.sku} onChange={(v) => setForm((s) => ({ ...s, sku: v }))} />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <Input label="Precio base" type="decimal" value={form.price} onChange={(v) => setForm((s) => ({ ...s, price: v }))} />
              <Input label="Stock" type="number" value={form.stock} onChange={(v) => setForm((s) => ({ ...s, stock: v }))} />
            </div>
            <Input label="Marca" value={form.brand} onChange={(v) => setForm((s) => ({ ...s, brand: v }))} />

            <label className="flex items-center gap-2 text-sm text-[#111827]">
              <input
                type="checkbox"
                checked={form.apply_discount}
                onChange={(e) =>
                  setForm((s) => ({
                    ...s,
                    apply_discount: e.target.checked,
                    discount_percent: e.target.checked ? s.discount_percent : "",
                  }))
                }
              />
              Aplicar descuento
            </label>

            {form.apply_discount && (
              <Input
                label="Descuento (%)"
                type="decimal"
                value={form.discount_percent}
                onChange={(v) => setForm((s) => ({ ...s, discount_percent: v }))}
              />
            )}

            <div className="rounded-lg border border-[#e5e7eb] bg-[#f8fafc] px-3 py-2">
              <div className="text-[11px] font-semibold uppercase tracking-[0.04em] text-[#6b7280]">
                Precio final calculado
              </div>
              <div className="mt-1 font-display text-lg font-extrabold text-[#1e3a5f]">
                {previewFinalPrice !== null ? formatCOP(previewFinalPrice) : "Ingresa un precio base"}
              </div>
              {form.apply_discount && hasValidBasePrice && hasValidDiscount && (
                <div className="mt-1 text-xs text-[#6b7280]">
                  Antes: {formatCOP(numericBasePrice)} · Descuento: {numericDiscount.toFixed(2)}%
                </div>
              )}
            </div>

            <label className="block">
              <span className="mb-1 block text-xs font-semibold text-[#111827]">Categoría</span>
              <select
                value={form.category_id}
                onChange={(e) => setForm((s) => ({ ...s, category_id: e.target.value }))}
                className="h-9 w-full rounded-lg border border-[#e5e7eb] px-3 text-sm text-[#111827] outline-none focus:border-[#1e3a5f]"
              >
                <option value="">Sin categoría</option>
                {categoryOptions.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.label}
                  </option>
                ))}
              </select>
            </label>

            <label className="block">
              <span className="mb-1 block text-xs font-semibold text-[#111827]">Estado</span>
              <select
                value={form.status}
                onChange={(e) =>
                  setForm((s) => ({ ...s, status: e.target.value as "active" | "inactive" }))
                }
                className="h-9 w-full rounded-lg border border-[#e5e7eb] px-3 text-sm text-[#111827] outline-none focus:border-[#1e3a5f]"
              >
                <option value="active">Activo</option>
                <option value="inactive">Borrador</option>
              </select>
            </label>

            <Input label="Foto del producto (URL)" value={form.image_url} onChange={(v) => setForm((s) => ({ ...s, image_url: v }))} />
            <Input label="Descripción corta" value={form.short_description} onChange={(v) => setForm((s) => ({ ...s, short_description: v }))} />

            <label className="block">
              <span className="mb-1 block text-xs font-semibold text-[#111827]">Descripción larga</span>
              <textarea
                value={form.description}
                onChange={(e) => setForm((s) => ({ ...s, description: e.target.value }))}
                rows={3}
                className="w-full rounded-lg border border-[#e5e7eb] px-3 py-2 text-sm text-[#111827] outline-none focus:border-[#1e3a5f]"
              />
            </label>

            <label className="flex items-center gap-2 text-sm text-[#111827]">
              <input
                type="checkbox"
                checked={form.is_featured}
                onChange={(e) => setForm((s) => ({ ...s, is_featured: e.target.checked }))}
              />
              Mostrar en inicio (producto destacado)
            </label>

            <button
              type="submit"
              disabled={saving}
              className="h-10 w-full rounded-lg bg-[#f57c00] font-display text-sm font-semibold text-white hover:bg-[#e56f00] disabled:opacity-60"
            >
              {saving ? "Guardando..." : editingId ? "Guardar cambios" : "Crear producto"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

function Input({
  label,
  value,
  onChange,
  type = "text",
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: "text" | "number" | "decimal";
}) {
  const isDecimal = type === "decimal";
  return (
    <label className="block">
      <span className="mb-1 block text-xs font-semibold text-[#111827]">{label}</span>
      <input
        type={isDecimal ? "text" : type}
        inputMode={isDecimal ? "decimal" : undefined}
        placeholder={isDecimal ? "Ej: 150000 o 12.5" : undefined}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="h-9 w-full rounded-lg border border-[#e5e7eb] px-3 text-sm text-[#111827] outline-none focus:border-[#1e3a5f]"
      />
    </label>
  );
}

function flattenCategories(categories: Category[]): Array<{ id: string; label: string }> {
  const out: Array<{ id: string; label: string }> = [];

  for (const category of categories) {
    out.push({ id: category.id, label: category.name });
    if (category.subcategories && category.subcategories.length > 0) {
      for (const sub of category.subcategories) {
        out.push({ id: sub.id, label: `${category.name} / ${sub.name}` });
      }
    }
  }
  return out;
}

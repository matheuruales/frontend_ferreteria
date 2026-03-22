"use client";

import { useEffect, useMemo, useState } from "react";
import { apiClient } from "@/lib/api-client";
import type { AdminCategory, Category } from "@/types";

interface CategoryFormState {
  name: string;
  slug: string;
  parent_id: string;
  sort_order: string;
  is_featured: boolean;
  image_url: string;
  description: string;
}

const PER_PAGE = 20;

const EMPTY_FORM: CategoryFormState = {
  name: "",
  slug: "",
  parent_id: "",
  sort_order: "0",
  is_featured: false,
  image_url: "",
  description: "",
};

export default function AdminCategoriasPage() {
  const [categories, setCategories] = useState<AdminCategory[]>([]);
  const [treeCategories, setTreeCategories] = useState<Category[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [form, setForm] = useState<CategoryFormState>(EMPTY_FORM);
  const [formError, setFormError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const totalPages = Math.max(1, Math.ceil(total / PER_PAGE));

  const parentOptions = useMemo(
    () =>
      flattenCategories(treeCategories).filter((cat) => cat.id !== editingId),
    [treeCategories, editingId]
  );

  async function loadTreeCategories() {
    const result = await apiClient.catalog.listCategories();
    if (!result.error) {
      setTreeCategories(result.data.categories);
    }
  }

  async function loadCategories() {
    setLoading(true);
    setError(null);

    const params: { page: number; per_page: number; q?: string } = {
      page,
      per_page: PER_PAGE,
    };
    if (query.trim()) params.q = query.trim();

    const result = await apiClient.admin.listCategories(params);

    setLoading(false);

    if (result.error) {
      setError(result.error.message);
      return;
    }

    setCategories(result.data.items);
    setTotal(result.data.total);
  }

  useEffect(() => {
    void loadTreeCategories();
  }, []);

  useEffect(() => {
    void loadCategories();
  }, [page]); // eslint-disable-line react-hooks/exhaustive-deps

  function resetForm() {
    setForm(EMPTY_FORM);
    setFormError(null);
    setEditingId(null);
  }

  function startEdit(category: AdminCategory) {
    setEditingId(category.id);
    setFormError(null);
    setForm({
      name: category.name,
      slug: category.slug ?? "",
      parent_id: category.parent_id ?? "",
      sort_order: String(category.sort_order ?? 0),
      is_featured: category.is_featured,
      image_url: category.image_url ?? "",
      description: category.description ?? "",
    });
  }

  async function handleDelete(categoryId: string) {
    const ok = window.confirm(
      "¿Eliminar esta categoría? Los productos quedarán sin categoría."
    );
    if (!ok) return;

    const result = await apiClient.admin.deleteCategory(categoryId);
    if (result.error) {
      setError(result.error.message);
      return;
    }

    if (editingId === categoryId) {
      resetForm();
    }

    await Promise.all([loadCategories(), loadTreeCategories()]);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setFormError(null);

    if (!form.name.trim()) {
      setFormError("El nombre es obligatorio.");
      return;
    }

    const sortOrder = Number(form.sort_order);
    if (!Number.isInteger(sortOrder)) {
      setFormError("El orden debe ser un número entero.");
      return;
    }

    if (editingId && form.parent_id === editingId) {
      setFormError("Una categoría no puede ser su propia categoría padre.");
      return;
    }

    const baseBody = {
      name: form.name.trim(),
      ...(form.slug.trim() ? { slug: form.slug.trim() } : {}),
      sort_order: sortOrder,
      is_featured: form.is_featured,
      ...(form.image_url.trim() ? { image_url: form.image_url.trim() } : {}),
      ...(form.description.trim() ? { description: form.description.trim() } : {}),
    };

    setSaving(true);
    const result = editingId
      ? await apiClient.admin.updateCategory(editingId, {
          ...baseBody,
          parent_id: form.parent_id || null,
        })
      : await apiClient.admin.createCategory({
          ...baseBody,
          ...(form.parent_id ? { parent_id: form.parent_id } : {}),
        });
    setSaving(false);

    if (result.error) {
      setFormError(result.error.message);
      return;
    }

    resetForm();
    await Promise.all([loadCategories(), loadTreeCategories()]);
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        <div className="flex min-w-[220px] flex-1 items-center gap-2 rounded-lg border border-[#e5e7eb] bg-white px-3 py-2 text-sm text-[#6b7280]">
          🔍
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Buscar categoría..."
            className="w-full border-0 bg-transparent text-sm text-[#111827] outline-none"
          />
        </div>
        <button
          onClick={() => {
            setPage(1);
            void loadCategories();
          }}
          className="h-[34px] rounded-lg bg-[#1e3a5f] px-4 font-display text-xs font-semibold text-white"
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
            <p className="py-8 text-center text-[#6b7280]">Cargando categorías...</p>
          ) : categories.length === 0 ? (
            <p className="py-8 text-center text-[#6b7280]">No hay categorías.</p>
          ) : (
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b border-[#e5e7eb] bg-[#f1f5f9] text-left text-[11px] uppercase tracking-[0.04em] text-[#6b7280]">
                  <th className="px-4 py-2.5">Nombre</th>
                  <th className="px-4 py-2.5">Padre</th>
                  <th className="px-4 py-2.5">Orden</th>
                  <th className="px-4 py-2.5">Destacada</th>
                  <th className="px-4 py-2.5"></th>
                </tr>
              </thead>
              <tbody>
                {categories.map((category) => (
                  <tr key={category.id} className="border-b border-[#e5e7eb] last:border-b-0">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2.5">
                        <div className="flex h-9 w-9 items-center justify-center overflow-hidden rounded-md bg-[#f3f4f6] text-base">
                          {category.image_url ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                              src={category.image_url}
                              alt={category.name}
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            "🗂️"
                          )}
                        </div>
                        <div>
                          <div className="text-sm font-semibold text-[#111827]">{category.name}</div>
                          <div className="text-[11px] text-[#6b7280]">{category.slug}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm text-[#6b7280]">{category.parent_name ?? "Raíz"}</td>
                    <td className="px-4 py-3 text-sm text-[#111827]">{category.sort_order}</td>
                    <td className="px-4 py-3">
                      <span
                        className={`rounded-full px-2 py-1 text-[11px] font-bold ${
                          category.is_featured
                            ? "bg-[rgba(16,185,129,0.1)] text-[#065f46]"
                            : "bg-[#f1f5f9] text-[#6b7280]"
                        }`}
                      >
                        {category.is_featured ? "Sí" : "No"}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-1.5">
                        <button
                          onClick={() => startEdit(category)}
                          className="flex h-7 w-7 items-center justify-center rounded-md border border-[#e5e7eb] text-sm"
                          type="button"
                        >
                          ✏️
                        </button>
                        <button
                          onClick={() => void handleDelete(category.id)}
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
              <span>{total} categorías</span>
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
              {editingId ? "Editar categoría" : "Nueva categoría"}
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
            <Input label="URL amigable" value={form.slug} onChange={(v) => setForm((s) => ({ ...s, slug: v }))} />

            <label className="block">
              <span className="mb-1 block text-xs font-semibold text-[#111827]">Categoría padre</span>
              <select
                value={form.parent_id}
                onChange={(e) => setForm((s) => ({ ...s, parent_id: e.target.value }))}
                className="h-9 w-full rounded-lg border border-[#e5e7eb] px-3 text-sm text-[#111827] outline-none focus:border-[#1e3a5f]"
              >
                <option value="">Sin padre</option>
                {parentOptions.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.label}
                  </option>
                ))}
              </select>
            </label>

            <Input
              label="Orden"
              type="number"
              value={form.sort_order}
              onChange={(v) => setForm((s) => ({ ...s, sort_order: v }))}
            />
            <Input label="Foto de categoría (URL)" value={form.image_url} onChange={(v) => setForm((s) => ({ ...s, image_url: v }))} />

            <label className="block">
              <span className="mb-1 block text-xs font-semibold text-[#111827]">Descripción</span>
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
              Mostrar en inicio (categoría destacada)
            </label>

            <button
              type="submit"
              disabled={saving}
              className="h-10 w-full rounded-lg bg-[#1e3a5f] font-display text-sm font-semibold text-white hover:bg-[#1a3355] disabled:opacity-60"
            >
              {saving ? "Guardando..." : editingId ? "Guardar cambios" : "Crear categoría"}
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
  type?: "text" | "number";
}) {
  return (
    <label className="block">
      <span className="mb-1 block text-xs font-semibold text-[#111827]">{label}</span>
      <input
        type={type}
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

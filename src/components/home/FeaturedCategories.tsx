import Link from "next/link";
import type { Category } from "@/types";

interface FeaturedCategoriesProps {
  categories: Category[];
}

const CATEGORY_ICONS = ["🔨", "⚡", "🔩", "🎨", "🚰", "🔌"];
const ICON_BG = ["bg-white/15", "bg-primary-100", "bg-secondary-100", "bg-emerald-100", "bg-secondary-100", "bg-primary-100"];

export default function FeaturedCategories({ categories }: FeaturedCategoriesProps) {
  const visible = categories.slice(0, 6);

  return (
    <section className="py-16">
      <div className="home-shell px-4 sm:px-6 lg:px-8">
        <div className="mb-10 flex items-end justify-between gap-4">
          <div>
            <h2 className="font-display text-4xl font-extrabold text-neutral-900">
              Categorias <span className="text-primary-500">destacadas</span>
            </h2>
            <p className="mt-1 text-base text-neutral-500">Encuentra lo que necesitas rapidamente</p>
          </div>
          <Link href="/catalogo" className="text-sm font-semibold text-secondary-500 hover:text-secondary-600">
            Ver todas las categorias +
          </Link>
        </div>

        {visible.length > 0 ? (
          <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-6 lg:gap-5">
            {visible.map((category, index) => {
              const selected = index === 0;
              const totalProducts = category.product_count ?? 0;
              return (
                <Link
                  key={category.slug}
                  href={`/catalogo?category_slug=${category.slug}`}
                  className={`group flex min-h-[162px] flex-col items-center rounded-2xl border p-4 text-center transition ${
                    selected
                      ? "border-secondary-500 bg-secondary-500 text-white"
                      : "border-neutral-200 bg-white text-neutral-900 hover:border-primary-300"
                  }`}
                >
                  <div
                    className={`flex size-14 items-center justify-center rounded-[14px] text-2xl ${
                      selected ? "bg-white/15" : ICON_BG[index] ?? "bg-neutral-100"
                    }`}
                  >
                    {CATEGORY_ICONS[index] ?? "🧰"}
                  </div>
                  <p className={`font-display mt-4 text-[13px] font-bold ${selected ? "text-white" : "text-neutral-900"}`}>
                    {category.name}
                  </p>
                  <p className={`mt-1 text-xs ${selected ? "text-white/65" : "text-neutral-500"}`}>
                    {new Intl.NumberFormat("es-CO").format(totalProducts)} productos
                  </p>
                </Link>
              );
            })}
          </div>
        ) : (
          <div className="rounded-2xl border border-[#e5e7eb] bg-white p-6 text-sm text-[#6b7280]">
            No hay categorías destacadas aún. Márcalas desde Admin / Categorías.
          </div>
        )}
      </div>
    </section>
  );
}

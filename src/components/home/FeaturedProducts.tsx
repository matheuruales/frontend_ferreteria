import Link from "next/link";
import type { Product } from "@/types";
import HomeProductCard from "@/components/home/HomeProductCard";

interface FeaturedProductsProps {
  products: Product[];
}

export default function FeaturedProducts({ products }: FeaturedProductsProps) {
  const visible = products.slice(0, 4);

  return (
    <section className="pb-14 pt-8">
      <div className="home-shell px-4 sm:px-6 lg:px-8">
        <div className="mb-10 flex items-end justify-between gap-4">
          <div>
            <h2 className="font-display text-4xl font-extrabold text-neutral-900">
              Productos <span className="text-primary-500">destacados</span>
            </h2>
            <p className="mt-1 text-base text-neutral-500">Los mas vendidos esta semana</p>
          </div>
          <Link href="/catalogo" className="text-sm font-semibold text-secondary-500 hover:text-secondary-600">
            Ver todos +
          </Link>
        </div>

        {visible.length > 0 ? (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4 lg:gap-5">
            {visible.map((product, index) => (
              <HomeProductCard key={product.id} product={product} index={index} />
            ))}
          </div>
        ) : (
          <div className="rounded-2xl border border-[#e5e7eb] bg-white p-6 text-sm text-[#6b7280]">
            No hay productos destacados aún. Márcalos desde Admin / Productos.
          </div>
        )}
      </div>
    </section>
  );
}

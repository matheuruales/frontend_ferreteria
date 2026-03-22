import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import ProductGallery from "@/components/catalog/ProductGallery";
import ProductCard from "@/components/catalog/ProductCard";
import StoreCompactHeader from "@/components/layout/StoreCompactHeader";
import AddToCartButton from "./AddToCartButton";
import type { Product } from "@/types";

export const revalidate = 60;

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

type ProductResult =
  | { product: Product; error: null }
  | { product: null; error: "not_found" | "server_error" };

async function getProduct(slug: string): Promise<ProductResult> {
  try {
    const res = await fetch(`${API_URL}/api/v1/catalog/products/${slug}`, {
      next: { revalidate: 60 },
    });
    if (res.status === 404) return { product: null, error: "not_found" };
    if (!res.ok) return { product: null, error: "server_error" };
    const product = (await res.json()) as Product;
    return { product, error: null };
  } catch {
    return { product: null, error: "server_error" };
  }
}

async function getTopProducts(): Promise<{ slug: string }[]> {
  try {
    const res = await fetch(`${API_URL}/api/v1/catalog/products?per_page=50`, {
      next: { revalidate: 300 },
    });
    if (!res.ok) return [];
    const data = (await res.json()) as { products: { slug: string }[] };
    return (data.products ?? []).map((p) => ({ slug: p.slug }));
  } catch {
    return [];
  }
}

export async function generateStaticParams() {
  const products = await getTopProducts();
  return products;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const result = await getProduct(slug);
  if (!result.product) {
    return { title: "Producto no encontrado" };
  }
  const product = result.product;
  return {
    title: product.name,
    description: product.short_description ?? product.description?.slice(0, 160) ?? null,
    ...(product.image_url ? { openGraph: { images: [{ url: product.image_url }] } } : {}),
  };
}

function formatCOP(amount: number): string {
  return new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

function renderStars(average: number): string {
  const rounded = Math.max(0, Math.min(5, Math.round(average)));
  return `${"★".repeat(rounded)}${"☆".repeat(5 - rounded)}`;
}

export default async function ProductDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const result = await getProduct(slug);

  if (result.error === "server_error") {
    return (
      <main className="min-h-screen bg-[#f9fafb]">
        <StoreCompactHeader />
        <div className="home-shell px-4 py-20 text-center sm:px-6 lg:px-8">
          <p className="mb-2 text-[#6b7280]">No se pudo cargar el producto.</p>
          <p className="mb-6 text-sm text-[#9ca3af]">Verifica tu conexión e intenta de nuevo.</p>
          <Link href="/catalogo" className="text-sm font-semibold text-[#1e3a5f] underline">
            Volver al catálogo
          </Link>
        </div>
      </main>
    );
  }

  if (!result.product) notFound();

  const product = result.product;
  const hasDiscount =
    product.compare_at_price !== undefined &&
    product.compare_at_price !== null &&
    product.compare_at_price > product.price;
  const discount = hasDiscount
    ? Math.round(
        ((product.compare_at_price! - product.price) / product.compare_at_price!) * 100
      )
    : 0;

  const stockLabel =
    product.stock <= 0
      ? "Sin stock"
      : product.stock <= 10
      ? `Últimas ${product.stock} unidades`
      : "Disponible";

  const specRows: Array<[string, string]> = [
    ["SKU", product.sku ?? "No disponible"],
    ["Marca", product.brand ?? "Multivariedades"],
    ["Estado", product.stock > 0 ? "En stock" : "Agotado"],
    ["Precio", formatCOP(product.price)],
    ["Categoría", "Ferretería y herramientas"],
    ["Garantía", "1 año por defectos de fábrica"],
  ];
  const reviewCount = product.review_count ?? 0;
  const ratingAverage = product.rating_average ?? null;
  const hasReviews = reviewCount > 0 && ratingAverage !== null;

  return (
    <main className="min-h-screen bg-[#f9fafb]">
      <StoreCompactHeader />

      <div className="home-shell px-4 py-4 sm:px-6 lg:px-8">
        <nav className="mb-4 flex items-center gap-2 text-[13px] text-[#6b7280]">
          <Link href="/" className="hover:text-[#1e3a5f]">
            Inicio
          </Link>
          <span className="text-[#d1d5db]">›</span>
          <Link href="/catalogo" className="hover:text-[#1e3a5f]">
            Catálogo
          </Link>
          <span className="text-[#d1d5db]">›</span>
          <span className="line-clamp-1 font-medium text-[#111827]">{product.name}</span>
        </nav>

        <div className="mb-12 grid gap-8 xl:grid-cols-[minmax(0,600px)_1fr] xl:gap-14">
          <div>
            <ProductGallery
              images={product.images ?? []}
              productName={product.name}
              mainImageUrl={product.image_url}
              saleLabel={hasDiscount ? `-${discount}% OFF` : undefined}
            />
          </div>

          <div>
            <div className="mb-3 flex flex-wrap items-center gap-2 text-sm">
              {product.brand && (
                <span className="font-semibold uppercase tracking-[0.04em] text-[#1e3a5f]">
                  {product.brand}
                </span>
              )}
              <span className="text-[#d1d5db]">·</span>
              <span
                className={`rounded-full border px-2.5 py-0.5 text-xs font-semibold ${
                  product.stock > 0
                    ? "border-[rgba(245,124,0,0.3)] bg-[rgba(245,124,0,0.1)] text-[#92400e]"
                    : "border-[rgba(214,40,40,0.3)] bg-[rgba(214,40,40,0.1)] text-[#d62828]"
                }`}
              >
                {stockLabel}
              </span>
              {product.sku && (
                <>
                  <span className="text-[#d1d5db]">·</span>
                  <span className="text-xs text-[#6b7280]">SKU: {product.sku}</span>
                </>
              )}
            </div>

            <h1 className="mb-3 font-display text-3xl font-extrabold leading-tight text-[#111827]">
              {product.name}
            </h1>

            <div className="mb-5 flex items-center gap-2 text-sm">
              {hasReviews ? (
                <>
                  <span className="text-[#f59e0b]">{renderStars(ratingAverage)}</span>
                  <span className="font-display font-bold text-[#111827]">
                    {ratingAverage.toFixed(1)}
                  </span>
                  <span className="text-[#6b7280]">({reviewCount} reseñas)</span>
                </>
              ) : (
                <span className="text-[#6b7280]">Sin reseñas todavía</span>
              )}
            </div>

            <div className="mb-5 rounded-2xl bg-[#f9fafb] p-5">
              <div className="font-display text-4xl font-extrabold text-[#1e3a5f]">
                {formatCOP(product.price)}
              </div>
              {hasDiscount && (
                <>
                  <div className="mt-1 flex items-center gap-2">
                    <span className="text-lg text-[#6b7280] line-through">
                      {formatCOP(product.compare_at_price!)}
                    </span>
                    <span className="rounded-full bg-[rgba(214,40,40,0.1)] px-2.5 py-0.5 text-sm font-bold text-[#d62828]">
                      Ahorra {discount}%
                    </span>
                  </div>
                  <div className="mt-1 text-sm font-semibold text-[#065f46]">
                    Estás ahorrando {formatCOP(product.compare_at_price! - product.price)}
                  </div>
                </>
              )}
            </div>

            <div className="mb-5">
              <div className="mb-2 text-sm font-semibold text-[#111827]">
                Variante: <span className="font-normal text-[#6b7280]">Estándar</span>
              </div>
              <div className="flex flex-wrap gap-2">
                <span className="rounded-lg border-2 border-[#1e3a5f] bg-[rgba(30,58,95,0.05)] px-4 py-2 text-sm font-semibold text-[#1e3a5f]">
                  Estándar
                </span>
                <span className="rounded-lg border-[1.5px] border-[#e5e7eb] px-4 py-2 text-sm text-[#111827]">
                  Premium
                </span>
                <span className="rounded-lg border-[1.5px] border-[#e5e7eb] px-4 py-2 text-sm text-[#6b7280] line-through">
                  Pro
                </span>
              </div>
            </div>

            <AddToCartButton product={product} />
          </div>
        </div>

        <section className="mb-12">
          <div className="mb-5 flex border-b-2 border-[#e5e7eb]">
            <div className="border-b-2 border-[#1e3a5f] px-5 py-3 font-display text-sm font-semibold text-[#1e3a5f]">
              Especificaciones
            </div>
            <div className="px-5 py-3 font-display text-sm font-semibold text-[#6b7280]">Descripción</div>
            <div className="px-5 py-3 font-display text-sm font-semibold text-[#6b7280]">Reseñas</div>
          </div>

          <table className="w-full border-collapse overflow-hidden rounded-xl border border-[#e5e7eb] bg-white">
            <tbody>
              {specRows.map(([label, value]) => (
                <tr key={label} className="border-b border-[#e5e7eb] last:border-b-0">
                  <td className="w-[220px] bg-[#f9fafb] px-4 py-3 text-sm font-semibold text-[#6b7280]">
                    {label}
                  </td>
                  <td className="px-4 py-3 text-sm text-[#111827]">{value}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {product.description && (
            <p className="mt-4 text-sm leading-7 text-[#4b5563]">{product.description}</p>
          )}

          <div className="mt-8 rounded-xl border border-[#e5e7eb] bg-white p-5">
            <h3 className="mb-4 font-display text-xl font-bold text-[#111827]">
              Reseñas verificadas
            </h3>
            {product.reviews && product.reviews.length > 0 ? (
              <div className="space-y-4">
                {product.reviews.map((review) => (
                  <article key={review.id} className="border-b border-[#e5e7eb] pb-4 last:border-b-0">
                    <div className="mb-1 flex flex-wrap items-center gap-2 text-sm">
                      <span className="font-semibold text-[#111827]">
                        {review.user_name ?? "Cliente"}
                      </span>
                      {review.is_verified_purchase && (
                        <span className="rounded-full bg-[rgba(16,185,129,0.12)] px-2 py-0.5 text-xs font-semibold text-[#047857]">
                          Compra verificada
                        </span>
                      )}
                      <span className="text-xs text-[#6b7280]">
                        {new Date(review.created_at).toLocaleDateString("es-CO")}
                      </span>
                    </div>
                    <div className="mb-1 text-sm text-[#f59e0b]">{renderStars(review.rating)}</div>
                    {review.title && (
                      <h4 className="mb-1 text-sm font-semibold text-[#111827]">{review.title}</h4>
                    )}
                    {review.comment && (
                      <p className="text-sm leading-6 text-[#4b5563]">{review.comment}</p>
                    )}
                  </article>
                ))}
              </div>
            ) : (
              <p className="text-sm text-[#6b7280]">
                Este producto aún no tiene reseñas publicadas.
              </p>
            )}
          </div>
        </section>
      </div>

      {product.related_products && product.related_products.length > 0 && (
        <section className="bg-white py-12">
          <div className="home-shell px-4 sm:px-6 lg:px-8">
            <h2 className="mb-6 font-display text-[26px] font-extrabold text-[#111827]">
              Productos <span className="text-[#f57c00]">relacionados</span>
            </h2>
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {product.related_products.map((related) => (
                <ProductCard
                  key={related.id}
                  product={{
                    ...related,
                    ...(product.brand ? { brand: product.brand } : {}),
                    is_featured: false,
                    status: "active",
                  }}
                />
              ))}
            </div>
          </div>
        </section>
      )}
    </main>
  );
}

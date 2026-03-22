import Link from "next/link";

const MINI_PRODUCTS = [
  { emoji: "🔨", name: "Martillo", price: "$28.900" },
  { emoji: "🔧", name: "Llave inglesa", price: "$42.000" },
  { emoji: "🪚", name: "Sierra circular", price: "$189.000" },
  { emoji: "🪛", name: "Destornillador", price: "$12.500" },
];

const HERO_STATS = [
  { value: "5.000+", label: "Productos disponibles" },
  { value: "24h", label: "Entrega en ciudad" },
  { value: "98%", label: "Clientes satisfechos" },
];

export default function HeroSection() {
  return (
    <section className="bg-secondary-500 text-white">
      <div className="home-shell px-4 py-10 sm:px-6 sm:py-12 lg:px-8 lg:py-12">
        <div className="grid items-center gap-8 lg:grid-cols-[1fr_480px]">
          <div>
            <p className="inline-flex rounded-full bg-white/10 px-4 py-1.5 text-xs font-semibold text-primary-500">
              Tu ferreteria de confianza
            </p>

            <h1 className="font-display mt-5 max-w-xl text-4xl font-extrabold leading-[1.05] sm:text-5xl lg:text-[56px]">
              Todo lo que necesitas para <span className="text-primary-500">construir y reparar</span>
            </h1>

            <p className="mt-5 max-w-lg text-base leading-relaxed text-white/75">
              Mas de 5.000 productos de ferreteria, herramientas y materiales. Calidad garantizada,
              precios justos, entrega rapida.
            </p>

            <div className="mt-7 flex flex-col gap-3 sm:flex-row">
              <Link
                href="/catalogo"
                className="inline-flex h-11 items-center justify-center rounded-lg bg-primary-500 px-6 text-sm font-semibold text-white transition hover:bg-primary-600"
              >
                Ver catalogo completo +
              </Link>
              <Link
                href="/catalogo?sort=discount_desc"
                className="inline-flex h-11 items-center justify-center rounded-lg border border-white/35 px-6 text-sm font-semibold text-white transition hover:border-white"
              >
                Ver ofertas del dia
              </Link>
            </div>

            <div className="mt-8 grid max-w-lg grid-cols-3 gap-6 border-t border-white/10 pt-6">
              {HERO_STATS.map((item) => (
                <div key={item.label}>
                  <p className="font-display text-[30px] font-extrabold leading-none">{item.value}</p>
                  <p className="mt-1 text-xs text-white/60">{item.label}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
            <div className="grid grid-cols-2 gap-3">
              {MINI_PRODUCTS.map((item) => (
                <article
                  key={item.name}
                  className="flex h-[148px] flex-col items-center justify-center rounded-xl border border-white/10 bg-white/5 px-4 text-center"
                >
                  <p className="text-4xl">{item.emoji}</p>
                  <p className="mt-3 text-xs text-white/70">{item.name}</p>
                  <p className="mt-1 text-xs font-bold text-primary-500">{item.price}</p>
                </article>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

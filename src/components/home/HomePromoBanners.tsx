import Link from "next/link";

export default function HomePromoBanners() {
  return (
    <section className="pb-12">
      <div className="home-shell grid gap-4 px-4 sm:px-6 md:grid-cols-2 lg:px-8 lg:gap-5">
        <article className="relative overflow-hidden rounded-2xl bg-[linear-gradient(135deg,#2d568f_0%,#224473_100%)] p-8 text-white">
          <p className="text-[10px] uppercase tracking-[0.1em] text-white/70">Oferta especial</p>
          <h3 className="font-display mt-1 text-[34px] font-extrabold leading-[1.02]">Herramientas electricas hasta 30% OFF</h3>
          <p className="mt-2 text-sm text-white/80">Taladros, sierras, amoladoras y mas. Tiempo limitado.</p>
          <Link
            href="/catalogo?category_slug=herramientas-electricas"
            className="mt-5 inline-flex h-9 items-center rounded-lg bg-white px-4 text-sm font-semibold text-secondary-500"
          >
            Ver herramientas +
          </Link>
        </article>

        <article className="relative overflow-hidden rounded-2xl bg-[linear-gradient(135deg,#f57c00_0%,#fb923c_100%)] p-8 text-white">
          <div className="pointer-events-none absolute right-4 top-4 size-24 rounded-full bg-white/10 blur-2xl" />
          <p className="text-[10px] uppercase tracking-[0.1em] text-white/75">Nueva linea</p>
          <h3 className="font-display mt-1 text-[34px] font-extrabold leading-[1.02]">Pinturas premium con garantia de 5 anos</h3>
          <p className="mt-2 text-sm text-white/85">Interior, exterior y anticorrosivo. Envio gratis.</p>
          <Link
            href="/catalogo?category_slug=pinturas"
            className="mt-5 inline-flex h-9 items-center rounded-lg bg-white px-4 text-sm font-semibold text-primary-600"
          >
            Explorar pinturas +
          </Link>
        </article>
      </div>
    </section>
  );
}

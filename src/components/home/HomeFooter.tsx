import Link from "next/link";

const BENEFITS = [
  { icon: "🚚", title: "Envio rapido", text: "Entrega en 24-48 horas en tu ciudad" },
  { icon: "🛡️", title: "Garantia de calidad", text: "Productos originales certificados" },
  { icon: "💳", title: "Pago seguro", text: "Tarjetas, PSE y contra entrega" },
  { icon: "↩️", title: "Devoluciones gratis", text: "30 dias para cambiar de opinion" },
];

const FOOTER_COLUMNS = [
  {
    title: "Tienda",
    links: ["Catalogo", "Ofertas", "Novedades", "Marcas"],
  },
  {
    title: "Mi cuenta",
    links: ["Iniciar sesion", "Registrarme", "Mis pedidos", "Favoritos"],
  },
  {
    title: "Ayuda",
    links: ["Centro de ayuda", "Envios", "Devoluciones", "Garantias"],
  },
  {
    title: "Empresa",
    links: ["Sobre nosotros", "Contacto", "Blog", "Trabaja con nosotros"],
  },
];

export default function HomeFooter() {
  return (
    <footer className="mt-6">
      <div className="bg-secondary-500 py-5 text-white">
        <div className="home-shell grid gap-4 px-4 sm:px-6 lg:grid-cols-4 lg:px-8 lg:gap-6">
          {BENEFITS.map((item) => (
            <article key={item.title} className="flex items-start gap-3">
              <span className="text-lg leading-none">{item.icon}</span>
              <div>
                <p className="font-display text-sm font-bold">{item.title}</p>
                <p className="text-xs text-white/65">{item.text}</p>
              </div>
            </article>
          ))}
        </div>
      </div>

      <div className="bg-[#0f2745] text-white">
        <div className="home-shell px-4 pb-6 pt-10 sm:px-6 lg:px-8">
          <div className="grid gap-8 md:grid-cols-[1.2fr_repeat(4,1fr)]">
            <div>
              <h4 className="font-display text-2xl font-extrabold">
                Multi<span className="text-primary-500">variedades</span>
              </h4>
              <p className="mt-3 max-w-xs text-sm leading-relaxed text-white/65">
                Tu ferreteria de confianza. Mas de 20 anos brindando calidad y servicio a
                constructores, tecnicos y hogares.
              </p>
            </div>

            {FOOTER_COLUMNS.map((column) => (
              <nav key={column.title}>
                <h5 className="font-display text-xs font-bold uppercase tracking-[0.1em] text-white/60">
                  {column.title}
                </h5>
                <ul className="mt-4 space-y-2 text-sm text-white/78">
                  {column.links.map((label) => (
                    <li key={label}>
                      <Link href="/catalogo" className="transition hover:text-white">
                        {label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </nav>
            ))}
          </div>

          <div className="mt-10 flex flex-col gap-4 border-t border-white/10 pt-5 text-xs text-white/45 sm:flex-row sm:items-center sm:justify-between">
            <p>© 2026 Multivariedades. Todos los derechos reservados.</p>
            <div className="flex items-center gap-2">
              <span className="rounded bg-white/10 px-2 py-1">VISA</span>
              <span className="rounded bg-white/10 px-2 py-1">MC</span>
              <span className="rounded bg-white/10 px-2 py-1">PSE</span>
              <span className="rounded bg-white/10 px-2 py-1">Nequi</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}

"use client";

import { useState } from "react";
import Link from "next/link";
import { useAuth } from "@/hooks/useAuth";
import { useCart } from "@/hooks/useCart";

const HEADER_CATEGORIES = [
  { label: "Herramientas Manuales", href: "/catalogo?category_slug=herramientas-manuales" },
  { label: "Herramientas Electricas", href: "/catalogo?category_slug=herramientas-electricas" },
  { label: "Fijaciones y Tornillos", href: "/catalogo?category_slug=fijaciones" },
  { label: "Pinturas y Acabados", href: "/catalogo?category_slug=pinturas" },
  { label: "Plomeria", href: "/catalogo?category_slug=plomeria" },
  { label: "Electricidad", href: "/catalogo?category_slug=electricidad" },
  { label: "Seguridad Industrial", href: "/catalogo?category_slug=seguridad" },
];

function IconSearch() {
  return (
    <svg viewBox="0 0 24 24" className="size-4" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="11" cy="11" r="7" />
      <path d="m20 20-3.5-3.5" />
    </svg>
  );
}

function IconUser() {
  return (
    <svg viewBox="0 0 24 24" className="size-4" fill="none" stroke="currentColor" strokeWidth="1.9">
      <circle cx="12" cy="8" r="3.5" />
      <path d="M5 19a7 7 0 0 1 14 0" />
    </svg>
  );
}

function IconHeart() {
  return (
    <svg viewBox="0 0 24 24" className="size-4" fill="none" stroke="currentColor" strokeWidth="1.9">
      <path d="M12 20s-7-4.5-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 5.5-7 10-7 10Z" />
    </svg>
  );
}

function IconCart() {
  return (
    <svg viewBox="0 0 24 24" className="size-4" fill="none" stroke="currentColor" strokeWidth="1.9">
      <path d="M3 4h2l1.2 9h10.6l2-7H7" />
      <circle cx="10" cy="19" r="1.3" />
      <circle cx="17" cy="19" r="1.3" />
    </svg>
  );
}

function IconLogout() {
  return (
    <svg viewBox="0 0 24 24" className="size-4" fill="none" stroke="currentColor" strokeWidth="1.9">
      <path d="M9 4H6a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h3" />
      <path d="M16 17l5-5-5-5" />
      <path d="M21 12H9" />
    </svg>
  );
}

export default function Navbar() {
  const { user, logout } = useAuth();
  const { itemCount, setOpenDrawer } = useCart();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <>
      <div className="bg-primary-500 px-4 py-1 text-center text-[11px] font-semibold text-white">
        🔥 Envio gratis en pedidos mayores a $150.000 · Hasta 30% OFF en herramientas electricas · ¡Compra ahora!
      </div>

      <header className="bg-secondary-500 text-white">
        <div className="home-shell px-4 sm:px-6 lg:px-8">
          <div className="hidden h-[77px] items-center gap-8 border-b border-white/10 md:flex">
            <Link href="/" className="font-display text-[30px] font-extrabold tracking-[-0.02em]">
              Multi<span className="text-primary-500">variedades</span>
            </Link>

            <form action="/catalogo" className="flex min-w-0 flex-1 overflow-hidden rounded-lg bg-white">
              <input
                name="q"
                type="search"
                placeholder="Buscar herramientas, tornillos, pintura, cables..."
                className="h-11 min-w-0 flex-1 border-0 px-4 text-[15px] text-neutral-900 placeholder:text-neutral-500 focus:outline-none"
              />
              <button
                type="submit"
                className="inline-flex h-11 items-center gap-2 bg-primary-500 px-5 text-sm font-semibold text-white transition hover:bg-primary-600"
              >
                <IconSearch />
                Buscar
              </button>
            </form>

            <div className="flex items-center gap-4">
              {user ? (
                <>
                  <Link href="/cuenta" className="flex flex-col items-center gap-1 text-[12px] text-white/85 hover:text-white">
                    <IconUser />
                    Mi cuenta
                  </Link>
                </>
              ) : (
                <>
                  <Link href="/login" className="flex flex-col items-center gap-1 text-[12px] text-white/85 hover:text-white">
                    <IconUser />
                    Mi cuenta
                  </Link>
                  <Link
                    href="/catalogo?favoritos=1"
                    className="flex flex-col items-center gap-1 text-[12px] text-white/85 hover:text-white"
                  >
                    <IconHeart />
                    Favoritos
                  </Link>
                </>
              )}

              <button
                onClick={() => setOpenDrawer(true)}
                className="inline-flex h-[38px] items-center gap-2 rounded-lg bg-primary-500 px-4 text-sm font-semibold text-white transition hover:bg-primary-600"
                aria-label="Abrir carrito"
              >
                <IconCart />
                Carrito
                <span className="inline-flex min-w-4 items-center justify-center rounded-md bg-white px-1 text-[11px] font-bold text-primary-600">
                  {itemCount > 99 ? "99+" : itemCount}
                </span>
              </button>
              {user && (
                <button
                  onClick={() => void logout()}
                  className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-[#d62828]/70 bg-[rgba(214,40,40,0.12)] text-[#ff6b6b] transition hover:bg-[rgba(214,40,40,0.2)] hover:text-[#ff8b8b]"
                  aria-label="Cerrar sesión"
                  title="Cerrar sesión"
                >
                  <IconLogout />
                </button>
              )}
            </div>
          </div>

          <div className="hidden h-[51px] items-center gap-3 text-[13px] md:flex">
            {HEADER_CATEGORIES.map((item, index) => (
              <div key={item.label} className="flex items-center gap-3">
                <Link href={item.href} className="text-white/85 transition hover:text-white">
                  {item.label}
                </Link>
                {index !== HEADER_CATEGORIES.length - 1 && <span className="text-white/30">·</span>}
              </div>
            ))}
            <Link href="/catalogo?sort=discount_desc" className="ml-auto text-sm font-bold text-primary-500">
              🔥 Ofertas
            </Link>
          </div>

          <div className="py-3 md:hidden">
            <div className="flex items-center justify-between gap-2">
              <Link href="/" className="font-display text-2xl font-extrabold tracking-[-0.02em]">
                Multi<span className="text-primary-500">variedades</span>
              </Link>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setOpenDrawer(true)}
                  className="relative rounded-lg bg-primary-500 p-2.5 text-white"
                  aria-label="Abrir carrito"
                >
                  <IconCart />
                  <span className="absolute -right-1 -top-1 inline-flex min-w-4 items-center justify-center rounded-md bg-white px-1 text-[10px] font-bold text-primary-600">
                    {itemCount > 99 ? "99+" : itemCount}
                  </span>
                </button>
                {user && (
                  <button
                    onClick={() => void logout()}
                    className="rounded-lg border border-[#d62828]/70 bg-[rgba(214,40,40,0.12)] p-2.5 text-[#ff6b6b] hover:bg-[rgba(214,40,40,0.2)] hover:text-[#ff8b8b]"
                    aria-label="Cerrar sesión"
                    title="Cerrar sesión"
                  >
                    <IconLogout />
                  </button>
                )}
                <button
                  onClick={() => setMobileOpen((v) => !v)}
                  className="rounded-lg border border-white/20 px-3 py-2 text-sm text-white"
                  aria-label="Abrir menu"
                >
                  {mobileOpen ? "Cerrar" : "Menu"}
                </button>
              </div>
            </div>

            <form action="/catalogo" className="mt-3 flex overflow-hidden rounded-lg bg-white">
              <input
                name="q"
                type="search"
                placeholder="Buscar productos"
                className="h-10 min-w-0 flex-1 border-0 px-3 text-sm text-neutral-900 placeholder:text-neutral-500 focus:outline-none"
              />
              <button type="submit" className="inline-flex h-10 items-center justify-center bg-primary-500 px-4 text-white">
                <IconSearch />
              </button>
            </form>

            {mobileOpen && (
              <nav className="mt-3 grid gap-2 rounded-xl border border-white/15 bg-[#17324f] p-3">
                <Link href="/catalogo" onClick={() => setMobileOpen(false)} className="text-sm text-white/90">
                  Catalogo
                </Link>
                {user ? (
                  <>
                    <Link href="/cuenta" onClick={() => setMobileOpen(false)} className="text-sm text-white/90">
                      Mi cuenta
                    </Link>
                    <button
                      onClick={() => {
                        setMobileOpen(false);
                        void logout();
                      }}
                      className="text-left text-sm text-white/90"
                    >
                      Salir
                    </button>
                  </>
                ) : (
                  <>
                    <Link href="/login" onClick={() => setMobileOpen(false)} className="text-sm text-white/90">
                      Iniciar sesion
                    </Link>
                    <Link href="/registro" onClick={() => setMobileOpen(false)} className="text-sm text-white/90">
                      Registrarse
                    </Link>
                  </>
                )}
              </nav>
            )}
          </div>
        </div>
      </header>

    </>
  );
}

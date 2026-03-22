"use client";

import Link from "next/link";
import { useAuth } from "@/hooks/useAuth";
import { useCart } from "@/hooks/useCart";

interface StoreCompactHeaderProps {
  searchPlaceholder?: string;
  defaultQuery?: string;
}

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

export default function StoreCompactHeader({
  searchPlaceholder = "Buscar productos...",
  defaultQuery = "",
}: StoreCompactHeaderProps) {
  const { user, logout } = useAuth();
  const { itemCount, setOpenDrawer } = useCart();

  return (
    <header className="sticky top-0 z-40 bg-secondary-500 px-4 py-3 sm:px-6 lg:px-8">
      <div className="home-shell flex items-center gap-4 lg:gap-8">
        <Link
          href="/"
          className="font-display shrink-0 text-xl font-extrabold text-white sm:text-[22px]"
        >
          Multi<span className="text-primary-500">variedades</span>
        </Link>

        <form
          action="/catalogo"
          className="hidden h-[42px] min-w-0 flex-1 overflow-hidden rounded-lg bg-white md:flex"
        >
          <input
            name="q"
            defaultValue={defaultQuery}
            type="search"
            placeholder={searchPlaceholder}
            className="h-full min-w-0 flex-1 border-0 px-4 text-sm text-[#111827] placeholder:text-[#6b7280] focus:outline-none"
          />
          <button
            type="submit"
            className="inline-flex h-full items-center gap-1 bg-primary-500 px-5 font-display text-[13px] font-semibold text-white hover:bg-primary-600"
          >
            <IconSearch />
            Buscar
          </button>
        </form>

        <div className="ml-auto flex items-center gap-4">
          <Link
            href={user ? "/cuenta" : "/login"}
            className="hidden items-center gap-1 text-[13px] font-medium text-white/85 hover:text-white lg:inline-flex"
          >
            <IconUser />
            Mi cuenta
          </Link>
          <Link
            href="/catalogo?favoritos=1"
            className="hidden items-center gap-1 text-[13px] font-medium text-white/85 hover:text-white lg:inline-flex"
          >
            <IconHeart />
            Favoritos
          </Link>
          <button
            onClick={() => setOpenDrawer(true)}
            className="inline-flex items-center gap-2 rounded-lg bg-primary-500 px-4 py-2 font-display text-[13px] font-semibold text-white hover:bg-primary-600"
            aria-label="Abrir carrito"
          >
            <IconCart />
            Carrito
            <span className="inline-flex size-[18px] items-center justify-center rounded-full bg-white text-[11px] font-bold text-primary-500">
              {itemCount > 99 ? "99+" : itemCount}
            </span>
          </button>
          {user && (
            <button
              onClick={() => void logout()}
              className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-[#d62828]/70 bg-[rgba(214,40,40,0.12)] text-[#ff6b6b] hover:bg-[rgba(214,40,40,0.2)] hover:text-[#ff8b8b]"
              aria-label="Cerrar sesión"
              title="Cerrar sesión"
            >
              <IconLogout />
            </button>
          )}
        </div>
      </div>

      <div className="home-shell mt-3 md:hidden">
        <form action="/catalogo" className="flex h-10 overflow-hidden rounded-lg bg-white">
          <input
            name="q"
            defaultValue={defaultQuery}
            type="search"
            placeholder={searchPlaceholder}
            className="h-full min-w-0 flex-1 border-0 px-3 text-sm text-[#111827] placeholder:text-[#6b7280] focus:outline-none"
          />
          <button
            type="submit"
            className="inline-flex h-full items-center justify-center bg-primary-500 px-4 text-white"
          >
            <IconSearch />
          </button>
        </form>
      </div>
    </header>
  );
}

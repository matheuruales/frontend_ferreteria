"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { isAuthenticated } from "@/lib/auth";
import { useAuth } from "@/hooks/useAuth";
import { apiClient } from "@/lib/api-client";
import type { UserRole } from "@/types";

const SESSION_COOKIE = "mv_session";
const ADMIN_ROLES: UserRole[] = ["administrador", "gestor_tienda"];

function clearSessionCookie() {
  document.cookie = `${SESSION_COOKIE}=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Lax`;
}

function initials(name: string) {
  return name
    .split(" ")
    .slice(0, 2)
    .map((s) => s[0]?.toUpperCase() ?? "")
    .join("");
}

interface NavItem {
  href: string;
  label: string;
  icon: string;
  section: "Principal" | "Catálogo" | "Usuarios" | "Sistema";
  roles?: UserRole[];
  countOrange?: boolean;
}

const NAV_ITEMS: NavItem[] = [
  { href: "/admin", label: "Dashboard", icon: "📊", section: "Principal" },
  { href: "/admin/pedidos", label: "Pedidos", icon: "📦", section: "Principal" },
  { href: "/admin/productos", label: "Productos", icon: "🏷️", section: "Catálogo" },
  { href: "/admin/categorias", label: "Categorías", icon: "🗂️", section: "Catálogo" },
  { href: "/admin/usuarios", label: "Usuarios", icon: "👥", section: "Usuarios", roles: ["administrador"] },
  { href: "/admin", label: "Configuración", icon: "⚙️", section: "Sistema" },
];

const PAGE_TITLES: Record<string, string> = {
  "/admin": "Dashboard",
  "/admin/pedidos": "Gestión de pedidos",
  "/admin/productos": "Gestión de productos",
  "/admin/categorias": "Gestión de categorías",
  "/admin/usuarios": "Gestión de usuarios",
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, logout, getProfile } = useAuth();
  const [ready, setReady] = useState(false);
  const [productCount, setProductCount] = useState<number | null>(null);

  async function loadProductCount() {
    const result = await apiClient.admin.listProducts({ page: 1, per_page: 1 });
    if (!result.error) {
      setProductCount(result.data.total);
    }
  }

  useEffect(() => {
    if (!isAuthenticated()) {
      clearSessionCookie();
      router.replace("/login");
      return;
    }

    if (!user) {
      getProfile().then(() => setReady(true));
    } else {
      setReady(true);
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (ready && user && !ADMIN_ROLES.includes(user.role)) {
      router.replace("/cuenta");
    }
  }, [ready, user, router]);

  useEffect(() => {
    if (!ready || !user || !ADMIN_ROLES.includes(user.role)) return;

    void loadProductCount();

    const onFocus = () => {
      void loadProductCount();
    };
    const onVisible = () => {
      if (document.visibilityState === "visible") {
        void loadProductCount();
      }
    };

    window.addEventListener("focus", onFocus);
    document.addEventListener("visibilitychange", onVisible);
    const intervalId = window.setInterval(() => {
      void loadProductCount();
    }, 15000);

    return () => {
      window.removeEventListener("focus", onFocus);
      document.removeEventListener("visibilitychange", onVisible);
      window.clearInterval(intervalId);
    };
  }, [ready, user]);

  if (!ready || !user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#f1f5f9]">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-[#e5e7eb] border-t-[#1e3a5f]" />
      </div>
    );
  }

  if (!ADMIN_ROLES.includes(user.role)) return null;

  const navItems = NAV_ITEMS.filter((item) => !item.roles || item.roles.includes(user.role));
  const grouped = {
    Principal: navItems.filter((i) => i.section === "Principal"),
    Catálogo: navItems.filter((i) => i.section === "Catálogo"),
    Usuarios: navItems.filter((i) => i.section === "Usuarios"),
    Sistema: navItems.filter((i) => i.section === "Sistema"),
  };

  const pageTitle = PAGE_TITLES[pathname] ?? "Panel de administración";

  return (
    <div className="flex min-h-screen bg-[#f1f5f9]">
      <aside className="hidden w-60 shrink-0 flex-col bg-[#1e3a5f] lg:flex">
        <div className="border-b border-white/10 px-5 py-6">
          <div className="font-display text-lg font-extrabold text-white">
            Multi<span className="text-[#f57c00]">variedades</span>
          </div>
          <div className="text-[11px] uppercase tracking-[0.05em] text-white/50">
            Panel de Administración
          </div>
        </div>

        <nav className="flex-1 py-3">
          {(Object.keys(grouped) as Array<keyof typeof grouped>).map((section) => (
            <div key={section} className="mb-3">
              <div className="px-5 pb-1 text-[10px] font-bold uppercase tracking-[0.1em] text-white/35">
                {section}
              </div>
              {grouped[section].map((item) => {
                const active =
                  item.href === "/admin" ? pathname === "/admin" : pathname.startsWith(item.href);
                return (
                  <Link
                    key={`${section}-${item.label}`}
                    href={item.href}
                    className={`flex items-center gap-2.5 border-l-4 px-5 py-2 text-sm ${
                      active
                        ? "border-l-[#f57c00] bg-white/10 text-white"
                        : "border-l-transparent text-white/75 hover:bg-white/5 hover:text-white"
                    }`}
                  >
                    <span className="w-5 text-center">{item.icon}</span>
                    <span className="flex-1">{item.label}</span>
                    {item.href === "/admin/productos" && (
                      <span
                        className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
                          item.countOrange ? "bg-[#f57c00] text-white" : "bg-white/15 text-white/90"
                        }`}
                      >
                        {productCount === null
                          ? "..."
                          : new Intl.NumberFormat("es-CO").format(productCount)}
                      </span>
                    )}
                  </Link>
                );
              })}
            </div>
          ))}
        </nav>

        <div className="border-t border-white/10 px-5 py-4">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#f57c00] font-display text-xs font-extrabold text-white">
              {initials(user.full_name)}
            </div>
            <div className="min-w-0 flex-1">
              <div className="truncate text-sm font-semibold text-white">{user.full_name}</div>
              <div className="text-xs text-white/55">
                {user.role === "administrador" ? "Superadministrador" : "Gestor de tienda"}
              </div>
            </div>
          </div>
          <button
            onClick={() => void logout().then(() => router.replace("/login"))}
            className="mt-3 w-full rounded-lg border border-white/15 py-1.5 text-xs font-semibold text-white/80 hover:bg-white/10"
            type="button"
          >
            Cerrar sesión
          </button>
        </div>
      </aside>

      <div className="flex min-h-screen flex-1 flex-col">
        <header className="border-b border-[#e5e7eb] bg-white px-4 py-3 sm:px-6 lg:px-7">
          <div className="flex items-center justify-between gap-3">
            <div className="font-display text-lg font-extrabold text-[#111827]">{pageTitle}</div>
            <div className="flex items-center gap-2">
              <div className="hidden rounded-lg border border-[#e5e7eb] bg-[#f1f5f9] px-3 py-1.5 text-sm text-[#6b7280] md:block">
                🔍 Buscar en el panel...
              </div>
              <Link
                href="/admin/productos"
                className="rounded-lg bg-[#f57c00] px-3 py-1.5 font-display text-xs font-semibold text-white"
              >
                + Nuevo producto
              </Link>
            </div>
          </div>
        </header>

        <main className="flex-1 p-4 sm:p-6 lg:p-7">{children}</main>
      </div>
    </div>
  );
}

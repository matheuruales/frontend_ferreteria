"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import { isAuthenticated } from "@/lib/auth";
import { useAuth } from "@/hooks/useAuth";
import { apiClient } from "@/lib/api-client";
import StoreCompactHeader from "@/components/layout/StoreCompactHeader";

const SESSION_COOKIE = "mv_session";

function clearSessionCookie() {
  document.cookie = `${SESSION_COOKIE}=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Lax`;
}

function getInitials(fullName: string) {
  return fullName
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((s) => s[0]?.toUpperCase() ?? "")
    .join("");
}

export default function PrivateLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, logout, getProfile } = useAuth();
  const [ready, setReady] = useState(false);
  const [ordersCount, setOrdersCount] = useState(0);

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
  }, [user, getProfile, router]);

  useEffect(() => {
    if (!ready || !user) return;
    const loadOrdersCount = async () => {
      const result = await apiClient.orders.listOrders({ page: 1, per_page: 1 });
      if (!result.error) {
        setOrdersCount(result.data.total);
      }
    };
    void loadOrdersCount();
  }, [ready, user, pathname]);

  if (!ready || !user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#f9fafb]">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-[#e5e7eb] border-t-[#1e3a5f]" />
      </div>
    );
  }

  const links = [
    { href: "/cuenta", label: "Panel principal", icon: "🏠" },
    {
      href: "/cuenta/pedidos",
      label: "Mis pedidos",
      icon: "📦",
      badge: ordersCount > 0 ? String(ordersCount) : undefined,
    },
    { href: "/catalogo", label: "Seguir comprando", icon: "🛍️" },
    { href: "/cuenta#configuracion", label: "Configuración", icon: "⚙️" },
  ];

  const isActive = (href: string) => {
    if (href.includes("#")) return false;
    const normalized = href.split("#")[0] ?? href;
    return normalized === "/cuenta"
      ? pathname === "/cuenta"
      : pathname.startsWith(normalized);
  };

  return (
    <div className="min-h-screen bg-[#f9fafb]">
      <StoreCompactHeader />

      <div className="home-shell px-4 py-8 sm:px-6 lg:px-8">
        <div className="grid gap-6 lg:grid-cols-[240px_1fr]">
          <aside className="space-y-4">
            <div className="rounded-2xl border border-[#e5e7eb] bg-white p-5 text-center">
              <div className="mx-auto mb-3 flex h-[72px] w-[72px] items-center justify-center rounded-full bg-[linear-gradient(135deg,#1e3a5f,#2d5a96)] font-display text-2xl font-extrabold text-white">
                {getInitials(user.full_name)}
              </div>
              <div className="font-display text-base font-bold text-[#111827]">{user.full_name}</div>
              <div className="text-xs text-[#6b7280]">{user.email}</div>
            </div>

            <nav className="overflow-hidden rounded-2xl border border-[#e5e7eb] bg-white">
              {links.map((link) => (
                <Link
                  key={link.label}
                  href={link.href}
                  className={`flex items-center gap-3 border-b border-[#e5e7eb] px-4 py-3 text-sm last:border-b-0 ${
                    isActive(link.href)
                      ? "border-l-4 border-l-[#1e3a5f] bg-[rgba(30,58,95,0.06)] font-semibold text-[#1e3a5f]"
                      : "text-[#111827]"
                  }`}
                >
                  <span className="w-5 text-center">{link.icon}</span>
                  <span className="flex-1">{link.label}</span>
                  {link.badge && (
                    <span className="rounded-full bg-[#f57c00] px-1.5 py-0.5 text-[10px] font-bold text-white">
                      {link.badge}
                    </span>
                  )}
                  <span className="text-[#6b7280]">›</span>
                </Link>
              ))}

              <button
                onClick={() => void logout().then(() => router.replace("/login"))}
                className="flex w-full items-center gap-3 px-4 py-3 text-left text-sm text-[#d62828]"
                type="button"
              >
                <span className="w-5 text-center">🚪</span>
                <span>Cerrar sesión</span>
              </button>
            </nav>
          </aside>

          <section className="min-w-0">{children}</section>
        </div>
      </div>
    </div>
  );
}

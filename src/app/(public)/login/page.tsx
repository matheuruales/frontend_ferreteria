/**
 * Login page — server component with SEO metadata.
 *
 * Renders the LoginForm client component. Post-login redirect is handled
 * inside LoginForm via the useAuth hook and Next.js router.
 *
 * Route: /login
 */

import type { Metadata } from "next";
import { LoginForm } from "@/components/auth/LoginForm";

export const metadata: Metadata = {
  title: "Iniciar sesión | Multivariedades",
  description:
    "Accede a tu cuenta de Multivariedades para ver tus pedidos y gestionar tu perfil.",
  robots: { index: true, follow: true },
};

export default function LoginPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-[#e8edf3] px-4 py-10">
      <div className="w-full max-w-[440px]">
        <div className="mb-8 text-center">
          <h1 className="font-display text-[32px] font-extrabold tracking-[-0.02em] text-secondary-500">
            Multi<span className="text-primary-500">variedades</span>
          </h1>
        </div>

        <div className="rounded-[20px] border border-neutral-200 bg-white px-8 py-9 shadow-[0_4px_24px_rgba(30,58,95,0.08)]">
          <h2 className="font-display mb-1 text-center text-[28px] font-extrabold text-neutral-900">
            Bienvenido de nuevo
          </h2>
          <p className="mb-7 text-center text-sm text-neutral-500">
            Ingresa a tu cuenta para continuar comprando
          </p>
          <LoginForm />
        </div>
      </div>
    </main>
  );
}

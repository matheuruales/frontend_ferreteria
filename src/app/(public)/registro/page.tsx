/**
 * Registro page — server component with SEO metadata.
 *
 * Renders RegisterForm (client component) and manages the post-registration
 * success state (show email confirmation prompt + resend option).
 *
 * Route: /registro
 */

import type { Metadata } from "next";
import { RegistroPageClient } from "./RegistroPageClient";

export const metadata: Metadata = {
  title: "Crear cuenta | Multivariedades",
  description:
    "Crea tu cuenta en Multivariedades y empieza a comprar productos de ferretería en línea.",
  robots: { index: true, follow: true },
};

export default function RegistroPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-[#e8edf3] px-4 py-10">
      <div className="w-full max-w-[500px]">
        <div className="mb-8 text-center">
          <h1 className="font-display text-[32px] font-extrabold tracking-[-0.02em] text-secondary-500">
            Multi<span className="text-primary-500">variedades</span>
          </h1>
        </div>

        <div className="rounded-[20px] border border-neutral-200 bg-white px-8 py-9 shadow-[0_4px_24px_rgba(30,58,95,0.08)]">
          <RegistroPageClient />
        </div>

        <p className="mt-6 text-center text-sm text-neutral-500">
          ¿Ya tienes cuenta?{" "}
          <a
            href="/login"
            className="font-semibold text-secondary-500 hover:underline"
          >
            Inicia sesión
          </a>
        </p>
      </div>
    </main>
  );
}

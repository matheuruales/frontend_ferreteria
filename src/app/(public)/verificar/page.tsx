/**
 * Verificar page — email verification callback handler.
 *
 * Supabase redirects the user here after clicking the verification link.
 * The URL contains either:
 *   - A valid token_hash + type=signup  (PKCE flow) in query params, OR
 *   - An access_token in the URL hash fragment (implicit flow).
 *
 * This page is a server component for SEO; the actual token processing
 * requires client-side JS to read the URL hash, so it delegates to
 * VerificarPageClient.
 *
 * Route: /verificar
 */

import type { Metadata } from "next";
import { VerificarPageClient } from "./VerificarPageClient";

export const metadata: Metadata = {
  title: "Verificación de cuenta | Multivariedades",
  description: "Confirma tu correo electrónico para activar tu cuenta.",
  robots: { index: false, follow: false },
};

export default function VerificarPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-[#e8edf3] px-4 py-10">
      <div className="w-full max-w-[460px]">
        <div className="mb-8 text-center">
          <h1 className="font-display text-[32px] font-extrabold tracking-[-0.02em] text-secondary-500">
            Multi<span className="text-primary-500">variedades</span>
          </h1>
        </div>

        <div className="rounded-[20px] border border-neutral-200 bg-white px-8 py-9 text-center shadow-[0_4px_24px_rgba(30,58,95,0.08)]">
          <VerificarPageClient />
        </div>
      </div>
    </main>
  );
}

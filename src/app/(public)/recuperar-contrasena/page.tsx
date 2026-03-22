/**
 * Recuperar contraseña page — server component with SEO metadata.
 *
 * This single route handles two distinct states:
 *
 *   1. No token in URL  → shows ForgotPasswordForm (request reset link)
 *   2. Token in URL hash → shows ResetPasswordForm (set new password)
 *
 * Supabase delivers the recovery token in the URL hash fragment after the
 * user clicks the email link:
 *   /recuperar-contrasena#access_token=…&token_type=bearer&type=recovery
 *
 * Since URL hash fragments are only accessible client-side, a client
 * component (RecuperarContrasenaClient) handles the detection and renders
 * the appropriate form.
 *
 * Route: /recuperar-contrasena
 */

import type { Metadata } from "next";
import { RecuperarContrasenaClient } from "./RecuperarContrasenaClient";

export const metadata: Metadata = {
  title: "Recuperar contraseña | Multivariedades",
  description:
    "Restablece el acceso a tu cuenta de Multivariedades.",
  robots: { index: false, follow: false },
};

export default function RecuperarContrasenaPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-[#e8edf3] px-4 py-10">
      <div className="w-full max-w-[460px]">
        <div className="mb-8 text-center">
          <h1 className="font-display text-[32px] font-extrabold tracking-[-0.02em] text-secondary-500">
            Multi<span className="text-primary-500">variedades</span>
          </h1>
        </div>

        <div className="rounded-[20px] border border-neutral-200 bg-white px-8 py-9 shadow-[0_4px_24px_rgba(30,58,95,0.08)]">
          <RecuperarContrasenaClient />
        </div>

        <p className="mt-6 text-center text-sm text-neutral-500">
          <a href="/login" className="font-semibold text-secondary-500 hover:underline">
            Volver al inicio de sesión
          </a>
        </p>
      </div>
    </main>
  );
}

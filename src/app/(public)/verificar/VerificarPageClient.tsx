"use client";

import { useEffect, useState } from "react";

/**
 * Parses the Supabase verification result from the current URL.
 *
 * Supabase can deliver the result in two ways:
 *   1. Query params: ?token_hash=…&type=signup  (server-side PKCE)
 *   2. URL hash:     #access_token=…&type=signup (client-side implicit)
 *
 * We treat the presence of either a valid token or an explicit error as the
 * signal. If neither is found we assume the user arrived without a link.
 */
function parseVerificationResult(): "success" | "error" | "no-token" {
  if (typeof window === "undefined") return "no-token";

  // Check query params first (PKCE flow — Supabase sets error param on failure)
  const params = new URLSearchParams(window.location.search);
  const errorParam = params.get("error");
  const errorDescription = params.get("error_description");

  if (errorParam || errorDescription) return "error";

  const tokenHash = params.get("token_hash");
  const type = params.get("type");
  if (tokenHash && type === "signup") return "success";

  // Check URL hash (implicit flow)
  const hash = window.location.hash.slice(1);
  if (!hash) return "no-token";

  const hashParams = new URLSearchParams(hash);
  const hashError = hashParams.get("error");
  if (hashError) return "error";

  const accessToken = hashParams.get("access_token");
  const hashType = hashParams.get("type");
  if (accessToken && hashType === "signup") return "success";

  return "no-token";
}

type VerifyState = "loading" | "success" | "error" | "no-token";

export function VerificarPageClient() {
  const [state, setState] = useState<VerifyState>("loading");

  useEffect(() => {
    const result = parseVerificationResult();
    setState(result);
  }, []);

  if (state === "loading") {
    return (
      <div aria-live="polite" aria-busy="true">
        <div
          aria-hidden="true"
          className="mx-auto mb-4 h-10 w-10 animate-spin rounded-full border-4 border-neutral-200 border-t-primary-500"
        />
        <p className="text-sm text-neutral-600">Verificando tu cuenta…</p>
      </div>
    );
  }

  if (state === "success") {
    return (
      <div aria-live="polite">
        <div
          aria-hidden="true"
          className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-success-100 text-3xl"
        >
          ✅
        </div>
        <h2 className="text-xl font-semibold text-neutral-900">
          ¡Cuenta verificada!
        </h2>
        <p className="mt-2 text-sm text-neutral-600">
          Tu correo ha sido confirmado. Ya puedes iniciar sesión.
        </p>
        <a
          href="/login"
          className="font-display mt-6 inline-block rounded-[10px] bg-secondary-500 px-6 py-3 text-sm font-bold text-white hover:bg-primary-600 transition"
        >
          Ir a iniciar sesión
        </a>
      </div>
    );
  }

  if (state === "error") {
    return (
      <div aria-live="polite">
        <div
          aria-hidden="true"
          className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-danger-100 text-3xl"
        >
          ❌
        </div>
        <h2 className="text-xl font-semibold text-neutral-900">
          El enlace no es válido
        </h2>
        <p className="mt-2 text-sm text-neutral-600">
          El enlace de verificación expiró o ya fue usado. Solicita uno nuevo
          desde la página de registro.
        </p>
        <a
          href="/registro"
          className="mt-6 inline-block rounded-[10px] border border-neutral-300 px-6 py-3 text-sm font-semibold text-neutral-700 hover:bg-neutral-50 transition"
        >
          Volver al registro
        </a>
      </div>
    );
  }

  // no-token: user arrived without a verification link
  return (
    <div aria-live="polite">
      <div
        aria-hidden="true"
        className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-neutral-100 text-3xl"
      >
        🔗
      </div>
      <h2 className="text-xl font-semibold text-neutral-900">
        Enlace no encontrado
      </h2>
      <p className="mt-2 text-sm text-neutral-600">
        Esta página solo funciona con el enlace que enviamos a tu correo.
        Revisa tu bandeja de entrada o solicita un nuevo enlace.
      </p>
      <a
        href="/registro"
        className="mt-6 inline-block rounded-[10px] border border-neutral-300 px-6 py-3 text-sm font-semibold text-neutral-700 hover:bg-neutral-50 transition"
      >
        Ir al registro
      </a>
    </div>
  );
}

"use client";

/**
 * Client component that detects the recovery token in the URL and renders
 * the correct form:
 *
 *   - Hash contains access_token + type=recovery → ResetPasswordForm
 *   - Otherwise → ForgotPasswordForm
 *
 * On error (bad/expired link) or missing token, it shows ForgotPasswordForm
 * so the user can request a new link without getting stuck.
 */

import { useEffect, useState } from "react";
import { ForgotPasswordForm } from "@/components/auth/ForgotPasswordForm";
import { ResetPasswordForm } from "@/components/auth/ResetPasswordForm";

type PageMode = "checking" | "forgot" | "reset" | "invalid-link";

interface RecoveryToken {
  token: string;
}

/**
 * Parse URL hash fragment for a Supabase recovery token.
 *
 * Expected format (implicit flow):
 *   #access_token=…&token_type=bearer&type=recovery&expires_in=3600
 *
 * Also handles query-param errors that Supabase injects when the link
 * fails (e.g. ?error=access_denied&error_description=…).
 */
function parseRecoveryHash(): { mode: PageMode; token?: string } {
  if (typeof window === "undefined") return { mode: "checking" };

  // Check for error in query params first
  const searchParams = new URLSearchParams(window.location.search);
  if (searchParams.get("error")) {
    return { mode: "invalid-link" };
  }

  // Parse hash fragment
  const hash = window.location.hash.slice(1);
  if (!hash) return { mode: "forgot" };

  const params = new URLSearchParams(hash);
  const accessToken = params.get("access_token");
  const type = params.get("type");

  if (accessToken && type === "recovery") {
    return { mode: "reset", token: accessToken };
  }

  // Hash present but not a recovery token (e.g. stale signup hash)
  if (params.get("error")) {
    return { mode: "invalid-link" };
  }

  return { mode: "forgot" };
}

export function RecuperarContrasenaClient() {
  const [mode, setMode] = useState<PageMode>("checking");
  const [recoveryToken, setRecoveryToken] = useState<RecoveryToken | null>(null);

  useEffect(() => {
    const result = parseRecoveryHash();
    if (result.mode === "reset" && result.token) {
      setRecoveryToken({ token: result.token });
      setMode("reset");
    } else {
      setMode(result.mode === "checking" ? "forgot" : result.mode);
    }
  }, []);

  // Spinner shown during the brief client-side detection
  if (mode === "checking") {
    return (
      <div
        className="flex items-center justify-center py-8"
        aria-live="polite"
        aria-busy="true"
      >
        <div
          aria-hidden="true"
          className="h-8 w-8 animate-spin rounded-full border-4 border-neutral-200 border-t-primary-500"
        />
      </div>
    );
  }

  if (mode === "invalid-link") {
    return (
      <div className="text-center" aria-live="polite">
        <div
          aria-hidden="true"
          className="mx-auto mb-4 flex h-[72px] w-[72px] items-center justify-center rounded-full border-2 border-primary-200 bg-primary-50 text-3xl"
        >
          ❌
        </div>
        <h2 className="font-display text-[26px] font-extrabold text-neutral-900">
          Enlace inválido o expirado
        </h2>
        <p className="mt-2 text-sm text-neutral-600">
          Este enlace de recuperación ya no es válido. Los enlaces expiran en
          60 minutos y solo pueden usarse una vez.
        </p>
        <button
          onClick={() => setMode("forgot")}
          className="font-display mt-6 rounded-[10px] bg-secondary-500 px-6 py-3 text-sm font-bold text-white transition hover:bg-primary-600"
        >
          Solicitar nuevo enlace
        </button>
      </div>
    );
  }

  if (mode === "reset" && recoveryToken) {
    return (
      <>
        <h2 className="font-display mb-1 text-center text-[26px] font-extrabold text-neutral-900">
          Nueva contraseña
        </h2>
        <p className="mb-5 text-center text-sm text-neutral-500">
          Elige una nueva contraseña para tu cuenta
        </p>
        <ResetPasswordForm token={recoveryToken.token} />
      </>
    );
  }

  // Default: forgot mode
  return (
    <>
      <div className="mx-auto mb-4 flex h-[72px] w-[72px] items-center justify-center rounded-full border-2 border-secondary-200 bg-secondary-50 text-3xl">
        🔑
      </div>
      <h2 className="font-display mb-1 text-center text-[26px] font-extrabold text-neutral-900">
        Recuperar contraseña
      </h2>
      <p className="mb-5 text-center text-sm text-neutral-500">
        Ingresa tu correo y te enviaremos instrucciones para restablecerla
      </p>
      <ForgotPasswordForm />
    </>
  );
}

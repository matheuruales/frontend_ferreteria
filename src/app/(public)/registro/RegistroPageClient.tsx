"use client";

import { useState } from "react";
import { RegisterForm } from "@/components/auth/RegisterForm";
import { apiClient } from "@/lib/api-client";

type PageState = "form" | "verify" | "verified";

export function RegistroPageClient() {
  const [state, setState] = useState<PageState>("form");
  const [registeredEmail, setRegisteredEmail] = useState("");
  const [code, setCode] = useState("");
  const [verifyError, setVerifyError] = useState<string | null>(null);
  const [verifyStatus, setVerifyStatus] = useState<"idle" | "verifying">("idle");
  const [resendStatus, setResendStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");

  function handleSuccess(email: string) {
    setRegisteredEmail(email);
    setCode("");
    setVerifyError(null);
    setResendStatus("idle");
    setState("verify");
  }

  function handleCodeChange(value: string) {
    const next = value.replace(/\D/g, "").slice(0, 6);
    setCode(next);
    if (verifyError) setVerifyError(null);
  }

  async function handleResend() {
    setResendStatus("sending");
    const result = await apiClient.auth.resendVerification({
      email: registeredEmail,
    });
    setResendStatus(result.error ? "error" : "sent");
  }

  async function handleVerifyCode() {
    if (code.length !== 6) {
      setVerifyError("Ingresa el código de 6 dígitos.");
      return;
    }
    setVerifyStatus("verifying");
    setVerifyError(null);

    const result = await apiClient.auth.verifyEmailCode({
      email: registeredEmail,
      code,
    });

    setVerifyStatus("idle");
    if (result.error) {
      setVerifyError(result.error.message);
      return;
    }
    setState("verified");
  }

  if (state === "verified") {
    return (
      <div className="text-center">
        <div
          aria-hidden="true"
          className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-success-100 text-3xl"
        >
          ✅
        </div>
        <h2 className="font-display text-[28px] font-extrabold text-neutral-900">
          ¡Cuenta verificada!
        </h2>
        <p className="mt-2 text-sm text-neutral-600">
          Tu correo fue confirmado correctamente. Ya puedes iniciar sesión.
        </p>
        <a
          href="/login"
          className="font-display mt-6 inline-block rounded-[10px] bg-secondary-500 px-6 py-3 text-sm font-bold text-white transition hover:bg-primary-600"
        >
          Ir a iniciar sesión
        </a>
      </div>
    );
  }

  if (state === "verify") {
    return (
      <div className="text-center">
        <div
          aria-hidden="true"
          className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-success-100 text-3xl"
        >
          ✉️
        </div>
        <h2 className="font-display text-[28px] font-extrabold text-neutral-900">
          Verifica tu correo
        </h2>
        <p className="mt-2 text-sm text-neutral-600">
          Enviamos un código de 6 dígitos a{" "}
          <span className="font-medium text-neutral-800">{registeredEmail}</span>.
          Escríbelo para activar tu cuenta.
        </p>

        <div className="mt-5 text-left">
          <label
            htmlFor="verify_code"
            className="mb-2 block text-[13px] font-semibold text-neutral-900"
          >
            Código de verificación
          </label>
          <input
            id="verify_code"
            name="verify_code"
            type="text"
            inputMode="numeric"
            autoComplete="one-time-code"
            value={code}
            onChange={(e) => handleCodeChange(e.target.value)}
            disabled={verifyStatus === "verifying"}
            placeholder="000000"
            className={[
              "h-11 w-full rounded-[10px] border-[1.5px] px-3 text-center text-base tracking-[0.25em] outline-none transition",
              "focus:border-secondary-500",
              verifyError ? "border-danger-400 bg-danger-50" : "border-neutral-200 bg-white",
            ].join(" ")}
          />
          {verifyError && <p className="mt-2 text-xs text-danger-600">{verifyError}</p>}
        </div>

        <button
          type="button"
          onClick={handleVerifyCode}
          disabled={verifyStatus === "verifying"}
          className={[
            "font-display mt-4 h-11 w-full rounded-[10px] px-4 text-[15px] font-bold text-white transition",
            "bg-secondary-500 hover:bg-primary-600",
            "disabled:cursor-not-allowed disabled:opacity-60",
          ].join(" ")}
        >
          {verifyStatus === "verifying" ? "Validando código…" : "Validar código"}
        </button>

        <div className="mt-6 border-t border-neutral-100 pt-5">
          <p className="text-xs text-neutral-500">¿No recibiste el código?</p>

          {resendStatus === "sent" && (
            <p className="mt-2 text-sm text-success-600">
              Código reenviado. Revisa tu bandeja de entrada.
            </p>
          )}

          {resendStatus === "error" && (
            <p className="mt-2 text-sm text-danger-600">
              No se pudo reenviar. Intenta de nuevo en unos minutos.
            </p>
          )}

          {resendStatus !== "sent" && (
            <button
              onClick={handleResend}
              disabled={resendStatus === "sending"}
              className={[
                "mt-2 text-sm font-semibold text-secondary-500 hover:underline",
                "disabled:cursor-not-allowed disabled:opacity-60",
              ].join(" ")}
            >
              {resendStatus === "sending" ? "Enviando…" : "Reenviar código"}
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <>
      <h2 className="font-display mb-1 text-center text-[28px] font-extrabold text-neutral-900">
        Crear cuenta
      </h2>
      <p className="mb-7 text-center text-sm text-neutral-500">
        Únete y accede a precios especiales
      </p>
      <RegisterForm onSuccess={handleSuccess} />
    </>
  );
}

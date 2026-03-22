"use client";

import { useState } from "react";
import { apiClient } from "@/lib/api-client";

type FormState = "idle" | "loading" | "sent";

export function ForgotPasswordForm() {
  const [email, setEmail] = useState("");
  const [emailError, setEmailError] = useState<string | null>(null);
  const [formState, setFormState] = useState<FormState>("idle");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setEmailError(null);

    if (!email.trim()) {
      setEmailError("El correo es obligatorio.");
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setEmailError("Ingresa un correo electrónico válido.");
      return;
    }

    setFormState("loading");
    // Always transitions to "sent" — response is generic regardless of outcome (FR-012)
    await apiClient.auth.forgotPassword({ email: email.trim() });
    setFormState("sent");
  }

  if (formState === "sent") {
    return (
      <div className="text-center" aria-live="polite">
        <div
          aria-hidden="true"
          className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-success-100 text-3xl"
        >
          ✉️
        </div>
        <h2 className="text-xl font-semibold text-neutral-900">
          Revisa tu correo
        </h2>
        <p className="mt-2 text-sm text-neutral-600">
          Si{" "}
          <span className="font-medium text-neutral-800">{email}</span>{" "}
          está registrado, recibirás un enlace para restablecer tu contraseña
          en los próximos minutos.
        </p>
        <p className="mt-4 text-xs text-neutral-400">
          ¿No llegó? Revisa la carpeta de spam o intenta de nuevo en unos
          minutos.
        </p>
        <button
          onClick={() => setFormState("idle")}
          className="mt-5 text-sm font-medium text-primary-600 hover:underline"
        >
          Intentar con otro correo
        </button>
      </div>
    );
  }

  return (
    <>
      <p className="mb-5 text-sm text-neutral-600">
        Ingresa tu correo y te enviaremos un enlace para restablecer tu
        contraseña.
      </p>

      <form onSubmit={handleSubmit} noValidate className="space-y-5">
        <div>
          <label
            htmlFor="email"
            className="mb-1 block text-sm font-medium text-neutral-700"
          >
            Correo electrónico
          </label>
          <input
            id="email"
            type="email"
            autoComplete="email"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              if (emailError) setEmailError(null);
            }}
            disabled={formState === "loading"}
            aria-describedby={emailError ? "email-error" : undefined}
            aria-invalid={!!emailError}
          className={[
              "h-11 w-full rounded-[10px] border-[1.5px] px-3 text-sm shadow-none outline-none transition",
              "focus:border-secondary-500",
              "disabled:cursor-not-allowed disabled:opacity-50",
              emailError
                ? "border-danger-400 bg-danger-50"
                : "border-neutral-200 bg-white",
            ].join(" ")}
            placeholder="tu@correo.com"
          />
          {emailError && (
            <p id="email-error" className="mt-1 text-xs text-danger-600">
              {emailError}
            </p>
          )}
        </div>

        <button
          type="submit"
          disabled={formState === "loading"}
          className={[
            "font-display h-12 w-full rounded-[10px] px-4 text-[15px] font-bold text-white shadow-none transition",
            "bg-secondary-500 hover:bg-primary-600 focus-visible:outline focus-visible:outline-2",
            "focus-visible:outline-offset-2 focus-visible:outline-secondary-500",
            "disabled:cursor-not-allowed disabled:opacity-60",
          ].join(" ")}
        >
          {formState === "loading" ? "Enviando…" : "Enviar enlace de recuperación"}
        </button>

        <p className="text-center text-sm text-neutral-600">
          <a href="/login" className="font-semibold text-secondary-500 hover:underline">
            Volver al inicio de sesión
          </a>
        </p>
      </form>
    </>
  );
}

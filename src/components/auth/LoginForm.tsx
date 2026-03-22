"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";

export function LoginForm() {
  const router = useRouter();
  const { login } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);

    if (!email.trim() || !password) {
      setError("Completa todos los campos.");
      return;
    }

    setLoading(true);
    const result = await login(email.trim(), password);
    setLoading(false);

    if (result.error) {
      // Always display a generic message — never reveal whether the account exists (FR-012)
      setError("Correo o contraseña incorrectos. Verifica tus datos e intenta de nuevo.");
      return;
    }

    // Redirect by business role
    const role = result.data.user.role;
    if (role === "administrador" || role === "gestor_tienda") {
      router.replace("/admin");
    } else {
      router.replace("/cuenta");
    }
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-5">
      {error && (
        <div
          role="alert"
          className="rounded-lg border border-danger-200 bg-danger-50 px-4 py-3 text-sm text-danger-700"
        >
          {error}
        </div>
      )}

      <div>
        <label
          htmlFor="email"
          className="mb-2 block text-[13px] font-semibold text-neutral-900"
        >
          Correo electrónico
        </label>
        <input
          id="email"
          type="email"
          autoComplete="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          disabled={loading}
          aria-invalid={!!error}
          className={[
            "h-11 w-full rounded-[10px] border-[1.5px] px-3 text-sm shadow-none outline-none transition",
            "border-neutral-200 bg-white focus:border-secondary-500",
            "disabled:cursor-not-allowed disabled:opacity-50",
          ].join(" ")}
          placeholder="tu@correo.com"
        />
      </div>

      <div>
        <div className="mb-1 flex items-center justify-between">
          <label
            htmlFor="password"
            className="text-[13px] font-semibold text-neutral-900"
          >
            Contraseña
          </label>
          <a
            href="/recuperar-contrasena"
            className="text-xs font-semibold text-secondary-500 hover:underline"
          >
            ¿Olvidaste tu contraseña?
          </a>
        </div>
        <input
          id="password"
          type="password"
          autoComplete="current-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          disabled={loading}
          aria-invalid={!!error}
          className={[
            "h-11 w-full rounded-[10px] border-[1.5px] px-3 text-sm shadow-none outline-none transition",
            "border-neutral-200 bg-white focus:border-secondary-500",
            "disabled:cursor-not-allowed disabled:opacity-50",
          ].join(" ")}
          placeholder="Tu contraseña"
        />
      </div>

      <label className="flex items-start gap-2 text-[13px] text-neutral-500">
        <input type="checkbox" defaultChecked className="mt-0.5 size-4 accent-secondary-500" />
        Recordar mi sesión en este dispositivo
      </label>

      <button
        type="submit"
        disabled={loading}
        className={[
          "font-display h-12 w-full rounded-[10px] px-4 text-[15px] font-bold text-white shadow-none transition",
          "bg-secondary-500 hover:bg-primary-600 focus-visible:outline focus-visible:outline-2",
          "focus-visible:outline-offset-2 focus-visible:outline-secondary-500",
          "disabled:cursor-not-allowed disabled:opacity-60",
        ].join(" ")}
      >
        {loading ? "Iniciando sesión…" : "Iniciar sesión"}
      </button>

      <div className="flex items-center gap-3">
        <div className="h-px flex-1 bg-neutral-200" />
        <span className="text-xs text-neutral-400">o continúa con</span>
        <div className="h-px flex-1 bg-neutral-200" />
      </div>

      <button
        type="button"
        className="h-12 w-full rounded-[10px] border border-neutral-200 bg-white text-sm font-semibold text-neutral-800"
      >
        🇬 Continuar con Google
      </button>

      <p className="text-center text-sm text-neutral-500">
        ¿No tienes cuenta?{" "}
        <a href="/registro" className="font-semibold text-secondary-500 hover:underline">
          Regístrate gratis
        </a>
      </p>
    </form>
  );
}

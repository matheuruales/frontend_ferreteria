"use client";

import { useState } from "react";
import { apiClient } from "@/lib/api-client";

interface RegisterFormProps {
  onSuccess: (email: string) => void;
}

interface FormState {
  full_name: string;
  email: string;
  password: string;
}

interface FormErrors {
  full_name?: string;
  email?: string;
  password?: string;
  form?: string;
}

function validate(values: FormState): FormErrors {
  const errors: FormErrors = {};

  if (!values.full_name.trim()) {
    errors.full_name = "El nombre es obligatorio.";
  } else if (values.full_name.trim().length < 2) {
    errors.full_name = "El nombre debe tener al menos 2 caracteres.";
  } else if (values.full_name.trim().length > 100) {
    errors.full_name = "El nombre no puede superar los 100 caracteres.";
  }

  if (!values.email.trim()) {
    errors.email = "El correo es obligatorio.";
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email)) {
    errors.email = "Ingresa un correo electrónico válido.";
  }

  if (!values.password) {
    errors.password = "La contraseña es obligatoria.";
  } else if (values.password.length < 8) {
    errors.password = "La contraseña debe tener al menos 8 caracteres.";
  }

  return errors;
}

export function RegisterForm({ onSuccess }: RegisterFormProps) {
  const [values, setValues] = useState<FormState>({
    full_name: "",
    email: "",
    password: "",
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [loading, setLoading] = useState(false);

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const { name, value } = e.target;
    setValues((prev) => ({ ...prev, [name]: value }));
    // Clear field-level error on change
    if (errors[name as keyof FormErrors]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    const validationErrors = validate(values);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setLoading(true);
    setErrors({});

    const result = await apiClient.auth.register({
      full_name: values.full_name.trim(),
      email: values.email.trim(),
      password: values.password,
    });

    setLoading(false);

    if (result.error) {
      setErrors({ form: result.error.message });
      return;
    }

    onSuccess(values.email.trim());
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-5">
      {errors.form && (
        <div
          role="alert"
          className="rounded-lg border border-danger-200 bg-danger-50 px-4 py-3 text-sm text-danger-700"
        >
          {errors.form}
        </div>
      )}

      <div>
        <label
          htmlFor="full_name"
          className="mb-2 block text-[13px] font-semibold text-neutral-900"
        >
          Nombre completo
        </label>
        <input
          id="full_name"
          name="full_name"
          type="text"
          autoComplete="name"
          value={values.full_name}
          onChange={handleChange}
          disabled={loading}
          aria-describedby={errors.full_name ? "full_name-error" : undefined}
          aria-invalid={!!errors.full_name}
          className={[
            "h-11 w-full rounded-[10px] border-[1.5px] px-3 text-sm shadow-none outline-none transition",
            "focus:border-secondary-500",
            "disabled:cursor-not-allowed disabled:opacity-50",
            errors.full_name
              ? "border-danger-400 bg-danger-50"
              : "border-neutral-200 bg-white",
          ].join(" ")}
          placeholder="Tu nombre completo"
        />
        {errors.full_name && (
          <p id="full_name-error" className="mt-1 text-xs text-danger-600">
            {errors.full_name}
          </p>
        )}
      </div>

      <div>
        <label
          htmlFor="email"
          className="mb-2 block text-[13px] font-semibold text-neutral-900"
        >
          Correo electrónico
        </label>
        <input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          value={values.email}
          onChange={handleChange}
          disabled={loading}
          aria-describedby={errors.email ? "email-error" : undefined}
          aria-invalid={!!errors.email}
          className={[
            "h-11 w-full rounded-[10px] border-[1.5px] px-3 text-sm shadow-none outline-none transition",
            "focus:border-secondary-500",
            "disabled:cursor-not-allowed disabled:opacity-50",
            errors.email
              ? "border-danger-400 bg-danger-50"
              : "border-neutral-200 bg-white",
          ].join(" ")}
          placeholder="tu@correo.com"
        />
        {errors.email && (
          <p id="email-error" className="mt-1 text-xs text-danger-600">
            {errors.email}
          </p>
        )}
      </div>

      <div>
        <label
          htmlFor="password"
          className="mb-2 block text-[13px] font-semibold text-neutral-900"
        >
          Contraseña
        </label>
        <input
          id="password"
          name="password"
          type="password"
          autoComplete="new-password"
          value={values.password}
          onChange={handleChange}
          disabled={loading}
          aria-describedby={errors.password ? "password-error" : undefined}
          aria-invalid={!!errors.password}
          className={[
            "h-11 w-full rounded-[10px] border-[1.5px] px-3 text-sm shadow-none outline-none transition",
            "focus:border-secondary-500",
            "disabled:cursor-not-allowed disabled:opacity-50",
            errors.password
              ? "border-danger-400 bg-danger-50"
              : "border-neutral-200 bg-white",
          ].join(" ")}
          placeholder="Mínimo 8 caracteres"
        />
        {errors.password && (
          <p id="password-error" className="mt-1 text-xs text-danger-600">
            {errors.password}
          </p>
        )}
      </div>

      <label className="flex items-start gap-2 text-[13px] text-neutral-500">
        <input type="checkbox" defaultChecked className="mt-0.5 size-4 accent-secondary-500" />
        Acepto los términos y la política de privacidad
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
        {loading ? "Registrando…" : "Crear cuenta"}
      </button>

      <p className="text-center text-xs text-neutral-500">
        Al registrarte aceptas nuestros{" "}
        <a href="/terminos" className="text-secondary-500 hover:underline">
          términos de servicio
        </a>{" "}
        y{" "}
        <a href="/privacidad" className="text-secondary-500 hover:underline">
          política de privacidad
        </a>
        .
      </p>
    </form>
  );
}

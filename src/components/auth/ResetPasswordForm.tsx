"use client";

import { useState } from "react";
import { apiClient } from "@/lib/api-client";

interface ResetPasswordFormProps {
  /** Recovery access_token extracted from the URL hash fragment. */
  token: string;
}

interface FormValues {
  new_password: string;
  confirm_password: string;
}

interface FormErrors {
  new_password?: string;
  confirm_password?: string;
  form?: string;
}

function validate(values: FormValues): FormErrors {
  const errors: FormErrors = {};

  if (!values.new_password) {
    errors.new_password = "La contraseña es obligatoria.";
  } else if (values.new_password.length < 8) {
    errors.new_password = "La contraseña debe tener al menos 8 caracteres.";
  }

  if (!values.confirm_password) {
    errors.confirm_password = "Confirma tu nueva contraseña.";
  } else if (values.confirm_password !== values.new_password) {
    errors.confirm_password = "Las contraseñas no coinciden.";
  }

  return errors;
}

type SubmitState = "idle" | "loading" | "success";

export function ResetPasswordForm({ token }: ResetPasswordFormProps) {
  const [values, setValues] = useState<FormValues>({
    new_password: "",
    confirm_password: "",
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [submitState, setSubmitState] = useState<SubmitState>("idle");

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const { name, value } = e.target;
    setValues((prev) => ({ ...prev, [name]: value }));
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

    setSubmitState("loading");
    setErrors({});

    const result = await apiClient.auth.resetPassword({
      token,
      new_password: values.new_password,
      confirm_password: values.confirm_password,
    });

    if (result.error) {
      setSubmitState("idle");
      setErrors({ form: result.error.message });
      return;
    }

    setSubmitState("success");
  }

  if (submitState === "success") {
    return (
      <div className="text-center" aria-live="polite">
        <div
          aria-hidden="true"
          className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-success-100 text-3xl"
        >
          ✅
        </div>
        <h2 className="text-xl font-semibold text-neutral-900">
          ¡Contraseña restablecida!
        </h2>
        <p className="mt-2 text-sm text-neutral-600">
          Tu contraseña fue actualizada exitosamente. Ya puedes iniciar sesión
          con tu nueva contraseña.
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

  return (
    <>
      <p className="mb-5 text-sm text-neutral-600">
        Elige una nueva contraseña para tu cuenta.
      </p>

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
            htmlFor="new_password"
            className="mb-1 block text-sm font-medium text-neutral-700"
          >
            Nueva contraseña
          </label>
          <input
            id="new_password"
            name="new_password"
            type="password"
            autoComplete="new-password"
            value={values.new_password}
            onChange={handleChange}
            disabled={submitState === "loading"}
            aria-describedby={errors.new_password ? "new_password-error" : undefined}
            aria-invalid={!!errors.new_password}
          className={[
              "h-11 w-full rounded-[10px] border-[1.5px] px-3 text-sm shadow-none outline-none transition",
              "focus:border-secondary-500",
              "disabled:cursor-not-allowed disabled:opacity-50",
              errors.new_password
                ? "border-danger-400 bg-danger-50"
                : "border-neutral-200 bg-white",
            ].join(" ")}
            placeholder="Mínimo 8 caracteres"
          />
          {errors.new_password && (
            <p id="new_password-error" className="mt-1 text-xs text-danger-600">
              {errors.new_password}
            </p>
          )}
        </div>

        <div>
          <label
            htmlFor="confirm_password"
            className="mb-1 block text-sm font-medium text-neutral-700"
          >
            Confirmar nueva contraseña
          </label>
          <input
            id="confirm_password"
            name="confirm_password"
            type="password"
            autoComplete="new-password"
            value={values.confirm_password}
            onChange={handleChange}
            disabled={submitState === "loading"}
            aria-describedby={errors.confirm_password ? "confirm_password-error" : undefined}
            aria-invalid={!!errors.confirm_password}
          className={[
              "h-11 w-full rounded-[10px] border-[1.5px] px-3 text-sm shadow-none outline-none transition",
              "focus:border-secondary-500",
              "disabled:cursor-not-allowed disabled:opacity-50",
              errors.confirm_password
                ? "border-danger-400 bg-danger-50"
                : "border-neutral-200 bg-white",
            ].join(" ")}
            placeholder="Repite tu nueva contraseña"
          />
          {errors.confirm_password && (
            <p id="confirm_password-error" className="mt-1 text-xs text-danger-600">
              {errors.confirm_password}
            </p>
          )}
        </div>

        <button
          type="submit"
          disabled={submitState === "loading"}
        className={[
            "font-display h-12 w-full rounded-[10px] px-4 text-[15px] font-bold text-white shadow-none transition",
            "bg-secondary-500 hover:bg-primary-600 focus-visible:outline focus-visible:outline-2",
            "focus-visible:outline-offset-2 focus-visible:outline-secondary-500",
            "disabled:cursor-not-allowed disabled:opacity-60",
          ].join(" ")}
        >
          {submitState === "loading" ? "Restableciendo…" : "Restablecer contraseña"}
        </button>
      </form>
    </>
  );
}

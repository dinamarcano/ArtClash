"use client";

import { FormEvent, useState } from "react";
import {
  validateEmail,
  validatePassword,
  validateUsername,
} from "@/lib/validation";
import { UserRole } from "@/types/users";

export interface AuthFormValues {
  username: string;
  email: string;
  password: string;
  role: UserRole;
}

type FieldErrors = Partial<Record<keyof AuthFormValues, string>>;

interface AuthFormProps {
  mode: "login" | "register";
  onSubmit: (values: AuthFormValues) => Promise<boolean>;
}

const validate = (mode: AuthFormProps["mode"], values: AuthFormValues): FieldErrors => {
  const isRegister = mode === "register";
  const errors: FieldErrors = {
    username: isRegister ? validateUsername(values.username) : undefined,
    email: validateEmail(values.email),
    password: validatePassword(values.password, isRegister),
  };
  return Object.fromEntries(
    Object.entries(errors).filter(([, message]) => message)
  ) as FieldErrors;
};

const roles: { value: UserRole; label: string; hint: string }[] = [
  { value: "user", label: "SOY FAN", hint: "Vota en las salas" },
  { value: "artist", label: "SOY ARTISTA", hint: "Sube arte y abre votaciones" },
];

export default function AuthForm({ mode, onSubmit }: AuthFormProps) {
  const isRegister = mode === "register";
  const [values, setValues] = useState<AuthFormValues>({
    username: "",
    email: "",
    password: "",
    role: "user",
  });
  const [errors, setErrors] = useState<FieldErrors>({});
  const [attempted, setAttempted] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const update = <K extends keyof AuthFormValues>(field: K, value: AuthFormValues[K]) => {
    const next = { ...values, [field]: value };
    setValues(next);
    if (attempted) setErrors(validate(mode, next));
  };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setAttempted(true);
    const found = validate(mode, values);
    setErrors(found);
    if (Object.keys(found).length > 0) return;

    setSubmitting(true);
    const ok = await onSubmit({
      ...values,
      username: values.username.trim(),
      email: values.email.trim(),
    });
    if (!ok) setSubmitting(false);
  };

  return (
    <form onSubmit={handleSubmit} noValidate className="flex w-full flex-col gap-4">
      {isRegister && (
        <Field
          id="username"
          label="USUARIO"
          value={values.username}
          onChange={(value) => update("username", value)}
          error={errors.username}
          disabled={submitting}
          autoComplete="username"
          placeholder="ArtHunter_99"
        />
      )}
      <Field
        id="email"
        label="EMAIL"
        type="email"
        value={values.email}
        onChange={(value) => update("email", value)}
        error={errors.email}
        disabled={submitting}
        autoComplete="email"
        placeholder="tu@email.com"
      />
      <Field
        id="password"
        label="CONTRASEÑA"
        type="password"
        value={values.password}
        onChange={(value) => update("password", value)}
        error={errors.password}
        disabled={submitting}
        autoComplete={isRegister ? "new-password" : "current-password"}
        placeholder={isRegister ? "Mínimo 8 caracteres" : "••••••••"}
      />

      {isRegister && (
        <fieldset className="flex flex-col gap-2" disabled={submitting}>
          <legend className="mb-2 text-xs tracking-widest text-arena-muted">
            ¿CÓMO VAS A PARTICIPAR?
          </legend>
          <div className="grid grid-cols-2 gap-3">
            {roles.map((role) => {
              const selected = values.role === role.value;
              return (
                <button
                  key={role.value}
                  type="button"
                  aria-pressed={selected}
                  onClick={() => update("role", role.value)}
                  className={`rounded-xl border-2 bg-arena-surface p-3 text-left transition disabled:opacity-40 ${
                    selected ? "border-neon-pink" : "border-arena-border"
                  }`}
                >
                  <p
                    className={`text-xs font-bold tracking-widest ${
                      selected ? "text-neon-pink" : "text-arena-text"
                    }`}
                  >
                    {role.label}
                  </p>
                  <p className="mt-1 text-[11px] text-arena-muted">{role.hint}</p>
                </button>
              );
            })}
          </div>
        </fieldset>
      )}

      <button
        type="submit"
        disabled={submitting}
        className="mt-2 flex items-center justify-center gap-2 rounded-xl bg-neon-pink py-3 font-bold tracking-widest text-black transition disabled:opacity-60"
      >
        {submitting && (
          <span className="h-4 w-4 animate-spin rounded-full border-2 border-black/30 border-t-black" />
        )}
        {submitting
          ? isRegister
            ? "CREANDO CUENTA..."
            : "ENTRANDO..."
          : isRegister
            ? "CREAR CUENTA"
            : "ENTRAR"}
      </button>
    </form>
  );
}

interface FieldProps {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  error?: string;
  disabled: boolean;
  type?: string;
  autoComplete: string;
  placeholder: string;
}

function Field({ id, label, value, onChange, error, disabled, type = "text", autoComplete, placeholder }: FieldProps) {
  const errorId = `${id}-error`;
  return (
    <div className="flex flex-col gap-2">
      <label htmlFor={id} className="text-xs tracking-widest text-arena-muted">
        {label}
      </label>
      <input
        id={id}
        type={type}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        disabled={disabled}
        autoComplete={autoComplete}
        placeholder={placeholder}
        aria-invalid={Boolean(error)}
        aria-describedby={error ? errorId : undefined}
        className={`rounded-xl border bg-arena-surface px-4 py-3 outline-none transition placeholder:text-arena-muted/50 focus:border-neon-pink disabled:opacity-60 ${
          error ? "border-corner-red" : "border-arena-border"
        }`}
      />
      {error && (
        <p id={errorId} className="text-xs text-corner-red">
          {error}
        </p>
      )}
    </div>
  );
}

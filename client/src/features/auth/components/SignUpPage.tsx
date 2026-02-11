import { useState, type FormEvent } from "react";
import { Link } from "react-router";
import { FormInput } from "@/shared/components/FormInput";
import {
  useRegister,
  checkPasswordStrength,
  type RegisterFields,
} from "../hooks/useRegister";
import { useGoogleAuth } from "../hooks/useGoogleAuth";

export function SignUpPage() {
  const [values, setValues] = useState<RegisterFields>({
    email: "",
    password: "",
    confirmPassword: "",
    fullName: "",
  });

  const { submit, fieldErrors, serverError, isLoading } = useRegister();
  const {
    initiateGoogleSignIn,
    error: googleError,
    isLoading: googleLoading,
  } = useGoogleAuth();

  const strength = checkPasswordStrength(values.password);

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    submit(values);
  }

  function handleChange(field: keyof RegisterFields, value: string) {
    setValues((prev) => ({ ...prev, [field]: value }));
  }

  return (
    <main className="flex min-h-dvh flex-col items-center justify-center px-6 py-10">
      <div className="w-full" style={{ maxWidth: 400 }}>
        {/* Header */}
        <h1 className="text-center text-[28px] font-bold text-[var(--text-primary)]">
          Create Account
        </h1>
        <p className="mt-2 text-center text-sm text-[var(--text-secondary)]">
          Start your personalized fitness journey
        </p>

        {/* Server / Google error */}
        {(serverError ?? googleError) && (
          <div className="mt-6 rounded-xl bg-[var(--accent-soft)] px-4 py-3 text-sm text-[var(--negative)]" role="alert">
            {serverError ?? googleError}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="mt-8 flex flex-col gap-5" noValidate>
          <FormInput
            label="Full Name"
            type="text"
            placeholder="John Doe"
            autoComplete="name"
            value={values.fullName}
            onChange={(e) => handleChange("fullName", e.target.value)}
            error={fieldErrors.fullName}
          />

          <FormInput
            label="Email"
            type="email"
            placeholder="you@example.com"
            autoComplete="email"
            value={values.email}
            onChange={(e) => handleChange("email", e.target.value)}
            error={fieldErrors.email}
          />

          <div className="flex flex-col gap-1.5">
            <FormInput
              label="Password"
              type="password"
              placeholder="••••••••"
              autoComplete="new-password"
              value={values.password}
              onChange={(e) => handleChange("password", e.target.value)}
              error={fieldErrors.password}
            />
            {/* Strength indicators */}
            {values.password.length > 0 && (
              <div className="mt-1 flex flex-col gap-1 text-xs">
                <StrengthItem met={strength.hasLength} text="8+ characters" />
                <StrengthItem met={strength.hasUppercase} text="1 uppercase letter" />
                <StrengthItem met={strength.hasNumber} text="1 number" />
              </div>
            )}
          </div>

          <FormInput
            label="Confirm Password"
            type="password"
            placeholder="••••••••"
            autoComplete="new-password"
            value={values.confirmPassword}
            onChange={(e) => handleChange("confirmPassword", e.target.value)}
            error={fieldErrors.confirmPassword}
          />

          <button
            type="submit"
            disabled={isLoading}
            className="flex h-12 items-center justify-center rounded-xl bg-[var(--accent)] text-base font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-50"
          >
            {isLoading ? (
              <span className="inline-block h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
            ) : (
              "Create Account"
            )}
          </button>
        </form>

        {/* Divider */}
        <div className="my-6 flex items-center gap-3">
          <span className="h-px flex-1 bg-[var(--border)]" />
          <span className="text-xs text-[var(--text-muted)]">or</span>
          <span className="h-px flex-1 bg-[var(--border)]" />
        </div>

        {/* Google Sign-In */}
        <button
          type="button"
          onClick={initiateGoogleSignIn}
          disabled={googleLoading}
          className="flex h-12 w-full items-center justify-center gap-3 rounded-xl border border-[var(--border-strong)] bg-transparent text-base font-medium text-[var(--text-primary)] transition-colors hover:bg-[var(--surface)] disabled:opacity-50"
        >
          <svg className="h-5 w-5" viewBox="0 0 24 24">
            <path
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
              fill="#4285F4"
            />
            <path
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              fill="#34A853"
            />
            <path
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              fill="#FBBC05"
            />
            <path
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              fill="#EA4335"
            />
          </svg>
          Sign in with Google
        </button>

        {/* Login link */}
        <p className="mt-8 text-center text-sm text-[var(--text-secondary)]">
          Already have an account?{" "}
          <Link
            to="/login"
            className="font-medium text-[var(--accent)] hover:underline"
          >
            Login
          </Link>
        </p>
      </div>
    </main>
  );
}

function StrengthItem({ met, text }: { met: boolean; text: string }) {
  return (
    <span
      className="flex items-center gap-1.5"
      style={{ color: met ? "var(--positive)" : "var(--text-muted)" }}
    >
      <span>{met ? "✓" : "○"}</span>
      {text}
    </span>
  );
}

import { useState, type FormEvent } from 'react';
import { Link } from 'react-router';
import { FormInput } from '@/shared/components/FormInput';
import { useLogin, type LoginFields } from '../hooks/useLogin';
import { GoogleSignInButton } from './GoogleSignInButton';

export function LoginPage() {
  const [values, setValues] = useState<LoginFields>({
    email: '',
    password: '',
  });

  const { submit, fieldErrors, serverError, isLoading } = useLogin();

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    submit(values);
  }

  function handleChange(field: keyof LoginFields, value: string) {
    setValues((prev) => ({ ...prev, [field]: value }));
  }

  return (
    <main className="flex min-h-dvh flex-col items-center justify-center px-6">
      <div className="w-full" style={{ maxWidth: 400 }}>
        {/* Header */}
        <h1 className="text-center text-[28px] font-bold text-[var(--text-primary)]">
          Welcome Back
        </h1>
        <p className="mt-2 text-center text-sm text-[var(--text-secondary)]">
          Sign in to continue your fitness journey
        </p>

        {/* Server error */}
        {serverError && (
          <div
            className="mt-6 rounded-xl bg-[var(--accent-soft)] px-4 py-3 text-sm text-[var(--negative)]"
            role="alert"
          >
            {serverError}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="mt-8 flex flex-col gap-5" noValidate>
          <FormInput
            label="Email"
            type="email"
            placeholder="you@example.com"
            autoComplete="email"
            value={values.email}
            onChange={(e) => handleChange('email', e.target.value)}
            error={fieldErrors.email}
          />

          <FormInput
            label="Password"
            type="password"
            placeholder="••••••••"
            autoComplete="current-password"
            value={values.password}
            onChange={(e) => handleChange('password', e.target.value)}
            error={fieldErrors.password}
          />

          <div className="flex justify-end">
            <Link
              to="/forgot-password"
              className="text-xs text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
            >
              Forgot Password?
            </Link>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="flex h-12 items-center justify-center rounded-xl bg-[var(--accent)] text-base font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-50"
          >
            {isLoading ? (
              <span className="inline-block h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
            ) : (
              'Login'
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
        <GoogleSignInButton label="Sign in with Google" />

        {/* Sign Up link */}
        <p className="mt-8 text-center text-sm text-[var(--text-secondary)]">
          Don&apos;t have an account?{' '}
          <Link to="/register" className="font-medium text-[var(--accent)] hover:underline">
            Sign Up
          </Link>
        </p>
      </div>
    </main>
  );
}

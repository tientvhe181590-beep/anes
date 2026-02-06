/**
 * LoginForm — Email/password login form with Zod validation.
 * SRS 3.1.1.2 — Validates email format + password min 8 chars.
 *
 * Uses controlled inputs + Zod for validation, TanStack Query mutation for submit.
 * Shows field-level errors on blur and a general error message on 401.
 */
import { type FormEvent, useState, useCallback } from 'react';
import { z } from 'zod';
import { FormInput } from '@/shared/components/FormInput';
import { useLogin, getLoginErrorMessage } from '../hooks/useLogin';
import type { AuthFormErrors } from '../types/auth';

const loginSchema = z.object({
  email: z
    .string()
    .min(1, 'Email is required')
    .max(100, 'Email must be less than 100 characters')
    .email('Please enter a valid email address'),
  password: z
    .string()
    .min(1, 'Password is required')
    .min(8, 'Password must be at least 8 characters'),
});

export function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<AuthFormErrors>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  const loginMutation = useLogin();

  const validateField = useCallback(
    (field: 'email' | 'password', value: string) => {
      const partialData = { email, password, [field]: value };
      const result = loginSchema.safeParse(partialData);

      if (result.success) {
        setErrors((prev) => ({ ...prev, [field]: undefined }));
      } else {
        const fieldError = result.error.issues.find((i) => i.path[0] === field);
        setErrors((prev) => ({
          ...prev,
          [field]: fieldError?.message,
        }));
      }
    },
    [email, password],
  );

  const handleBlur = (field: 'email' | 'password') => {
    setTouched((prev) => ({ ...prev, [field]: true }));
    validateField(field, field === 'email' ? email : password);
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    setErrors({});

    const result = loginSchema.safeParse({ email, password });

    if (!result.success) {
      const fieldErrors: AuthFormErrors = {};
      for (const issue of result.error.issues) {
        const field = issue.path[0] as keyof AuthFormErrors;
        if (!fieldErrors[field]) {
          fieldErrors[field] = issue.message;
        }
      }
      setErrors(fieldErrors);
      setTouched({ email: true, password: true });
      return;
    }

    loginMutation.mutate(
      { email: result.data.email, password: result.data.password },
      {
        onError: (error) => {
          setErrors({ general: getLoginErrorMessage(error) });
        },
      },
    );
  };

  return (
    <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-5">
      {/* General error (401, network, etc.) */}
      {errors.general && (
        <div
          role="alert"
          className="rounded-lg border border-(--accent)/20 bg-(--accent)/10 px-4 py-3 text-sm text-(--accent)"
        >
          {errors.general}
        </div>
      )}

      <FormInput
        label="Email"
        type="email"
        placeholder="you@example.com"
        autoComplete="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        onBlur={() => handleBlur('email')}
        error={touched.email ? errors.email : undefined}
        disabled={loginMutation.isPending}
      />

      <FormInput
        label="Password"
        type="password"
        placeholder="Enter your password"
        autoComplete="current-password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        onBlur={() => handleBlur('password')}
        error={touched.password ? errors.password : undefined}
        disabled={loginMutation.isPending}
      />

      {/* Forgot Password Link */}
      <div className="flex justify-end">
        <a
          href="/forgot-password"
          className="text-sm text-(--text-secondary) transition-colors hover:text-(--accent)"
        >
          Forgot password?
        </a>
      </div>

      {/* Submit Button */}
      <button
        type="submit"
        disabled={loginMutation.isPending}
        className="w-full rounded-lg bg-(--accent) px-4 py-3 font-semibold text-white transition-colors hover:bg-(--accent-hover) disabled:cursor-not-allowed disabled:opacity-50"
      >
        {loginMutation.isPending ? 'Signing in...' : 'Sign In'}
      </button>

      {/* Divider */}
      <div className="flex items-center gap-3">
        <div className="h-px flex-1 bg-(--border)" />
        <span className="text-xs text-(--text-secondary)">or</span>
        <div className="h-px flex-1 bg-(--border)" />
      </div>

      {/* Google Sign-In (placeholder — OAuth not implemented yet) */}
      <button
        type="button"
        disabled={loginMutation.isPending}
        className="flex w-full items-center justify-center gap-3 rounded-lg border border-(--border) bg-(--surface-elevated) px-4 py-3 font-medium text-(--text-primary) transition-colors hover:bg-(--border) disabled:cursor-not-allowed disabled:opacity-50"
      >
        <GoogleIcon />
        Continue with Google
      </button>
    </form>
  );
}

/** Inline Google "G" icon (16x16) to avoid external dependency */
function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
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
  );
}

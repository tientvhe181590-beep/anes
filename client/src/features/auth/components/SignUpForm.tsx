/**
 * SignUpForm — Email/password registration form with Zod validation.
 * SRS 3.1.1.3 — Validates email format, password strength (min 8, 1 uppercase, 1 number),
 * and confirm-password match. Includes TOS checkbox per design spec.
 *
 * Uses controlled inputs + Zod for validation, TanStack Query mutation for submit.
 * Shows field-level errors on blur and a general error message for API failures.
 */
import { type FormEvent, useState, useCallback } from 'react';
import { z } from 'zod';
import { FormInput } from '@/shared/components/FormInput';
import { useRegister, getRegisterErrorMessage } from '../hooks/useRegister';
import type { AuthFormErrors } from '../types/auth';

const signUpSchema = z
  .object({
    email: z
      .string()
      .min(1, 'Email is required')
      .max(150, 'Email must be less than 150 characters')
      .email('Please enter a valid email address'),
    password: z
      .string()
      .min(1, 'Password is required')
      .min(8, 'Password must be at least 8 characters')
      .max(64, 'Password must be less than 64 characters')
      .regex(/[A-Z]/, 'Password must contain at least 1 uppercase letter')
      .regex(/[0-9]/, 'Password must contain at least 1 number'),
    confirmPassword: z.string().min(1, 'Please confirm your password'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword'],
  });

export function SignUpForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [agreedToTos, setAgreedToTos] = useState(false);
  const [errors, setErrors] = useState<AuthFormErrors>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  const registerMutation = useRegister();

  const validateField = useCallback(
    (field: 'email' | 'password' | 'confirmPassword', value: string) => {
      const partialData = { email, password, confirmPassword, [field]: value };
      const result = signUpSchema.safeParse(partialData);

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
    [email, password, confirmPassword],
  );

  const handleBlur = (field: 'email' | 'password' | 'confirmPassword') => {
    setTouched((prev) => ({ ...prev, [field]: true }));
    validateField(
      field,
      field === 'email' ? email : field === 'password' ? password : confirmPassword,
    );
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    setErrors({});

    const result = signUpSchema.safeParse({ email, password, confirmPassword });

    if (!result.success) {
      const fieldErrors: AuthFormErrors = {};
      for (const issue of result.error.issues) {
        const field = issue.path[0] as keyof AuthFormErrors;
        if (!fieldErrors[field]) {
          fieldErrors[field] = issue.message;
        }
      }
      setErrors(fieldErrors);
      setTouched({ email: true, password: true, confirmPassword: true });
      return;
    }

    registerMutation.mutate(
      { email: result.data.email, password: result.data.password },
      {
        onError: (error) => {
          setErrors({ general: getRegisterErrorMessage(error) });
        },
      },
    );
  };

  return (
    <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-3.5">
      {/* General error (409 duplicate, network, etc.) */}
      {errors.general && (
        <div
          role="alert"
          className="rounded-lg border border-(--accent)/20 bg-(--accent)/10 px-4 py-3 text-sm text-(--accent)"
        >
          {errors.general}
        </div>
      )}

      <FormInput
        label="EMAIL"
        type="email"
        placeholder="your@email.com"
        autoComplete="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        onBlur={() => handleBlur('email')}
        error={touched.email ? errors.email : undefined}
        disabled={registerMutation.isPending}
      />

      <FormInput
        label="PASSWORD"
        type="password"
        placeholder="Min 8 characters"
        autoComplete="new-password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        onBlur={() => handleBlur('password')}
        error={touched.password ? errors.password : undefined}
        disabled={registerMutation.isPending}
      />

      <FormInput
        label="CONFIRM PASSWORD"
        type="password"
        placeholder="Re-enter password"
        autoComplete="new-password"
        value={confirmPassword}
        onChange={(e) => setConfirmPassword(e.target.value)}
        onBlur={() => handleBlur('confirmPassword')}
        error={touched.confirmPassword ? errors.confirmPassword : undefined}
        disabled={registerMutation.isPending}
      />

      {/* TOS Checkbox */}
      <label htmlFor="tos" className="flex cursor-pointer items-start gap-2 pt-1">
        <input
          type="checkbox"
          id="tos"
          checked={agreedToTos}
          onChange={(e) => setAgreedToTos(e.target.checked)}
          disabled={registerMutation.isPending}
          className="mt-0.5 h-5 w-5 shrink-0 rounded border-2 border-(--border) bg-transparent accent-(--accent)"
        />
        <span className="text-xs text-(--text-secondary)">I agree to the Terms of Service</span>
      </label>

      {/* Submit Button */}
      <button
        type="submit"
        disabled={registerMutation.isPending || !agreedToTos}
        className="mt-2 w-full rounded-md bg-(--accent) px-4 py-3.5 text-base font-semibold text-white transition-colors hover:bg-(--accent-hover) disabled:cursor-not-allowed disabled:opacity-50"
      >
        {registerMutation.isPending ? 'Creating Account...' : 'Create Account'}
      </button>
    </form>
  );
}
